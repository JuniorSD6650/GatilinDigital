const express = require('express');
const { format } = require('date-fns');

const knex = require('../lib/db');
const config = require('../lib/config');
const { requireAdmin } = require('../middleware/auth');
const { excelUpload } = require('../middleware/upload');
const { z, validate, textoOpc, textoReq, enteroReq, fechaISO, hora, paginacionQuery } = require('../middleware/validate');
const { notFound, badRequest, asyncH, paginate, searchIn } = require('../lib/http');
const { audit, diff } = require('../lib/audit');
const { sendTemplate, sendXlsx, bulkImport } = require('../lib/excel');
const { generarICS } = require('../lib/ics');
const { insertarId } = require('../lib/dbUtil');

const router = express.Router();

const EVENTO_COLUMNS = [
  { header: 'Fecha', key: 'fecha', width: 20 },
  { header: 'Tipo de Día', key: 'tipo_dia', width: 20 },
  { header: 'Tipo de Evento', key: 'tipo_evento', width: 20 },
  { header: 'Hora', key: 'hora', width: 20 },
  { header: 'Dirección Actividad', key: 'direccion_actividad', width: 50 },
  { header: 'Oferente', key: 'oferente', width: 50 },
  { header: 'Tipo Oferente', key: 'tipo_oferente', width: 20 },
  { header: 'Banda', key: 'banda', width: 20 },
  { header: 'Código Cofradía', key: 'cod_cofradia', width: 20 },
];

// Fecha de la base de datos (objeto Date local) → 'YYYY-MM-DD'
const isoLocal = (d) => (d ? format(new Date(d), 'yyyy-MM-dd') : null);
const formatear = (e) => ({ ...e, fecha: e.fecha ? format(new Date(e.fecha), 'dd/MM/yyyy') : null, fecha_iso: isoLocal(e.fecha) });

// ---- Validación ----
const conDefecto = (def, max = 255) => z.preprocess((v) => (v === null || v === undefined || String(v).trim() === '' ? def : String(v).trim()), z.string().max(max));
const campos = {
  fecha: fechaISO,
  tipo_dia: conDefecto('Ninguno'),
  tipo_evento: conDefecto('ninguno'),
  hora: hora,
  direccion_actividad: textoReq(255),
  oferente: textoReq(255),
  tipo_oferente: conDefecto('Oferente'),
  banda: conDefecto('Ninguna'),
  cod_cofradia: enteroReq,
};
const crearSchema = z.object(campos);
const editarSchema = z.object(campos).partial();

const filtrosQuery = paginacionQuery.extend({
  cod_cofradia: z.coerce.number().int().positive().optional(),
  desde: fechaISO.optional(),
  hasta: fechaISO.optional(),
  fecha: fechaISO.optional(),
  tipo_evento: z.string().trim().max(100).optional(),
  orden: z.enum(['agenda', 'recientes']).optional(),
  ids: z.string().regex(/^\d+(,\d+)*$/).optional(),
});

const existeCofradia = async (id) => Boolean(await knex('cofradia').where('id', id).first('id'));

const consultaBase = (f) => {
  let q = knex('eventos')
    .select('eventos.*', 'cofradia.nickname_cofradia', 'cofradia.color', 'cofradia.slug')
    .leftJoin('cofradia', 'eventos.cod_cofradia', 'cofradia.id');

  if (f.cod_cofradia) q = q.where('eventos.cod_cofradia', f.cod_cofradia);
  if (f.fecha) q = q.where('eventos.fecha', f.fecha);
  if (f.desde) q = q.where('eventos.fecha', '>=', f.desde);
  if (f.hasta) q = q.where('eventos.fecha', '<=', f.hasta);
  if (f.tipo_evento) q = q.where('eventos.tipo_evento', f.tipo_evento);
  if (f.ids) q = q.whereIn('eventos.id', f.ids.split(',').map(Number).slice(0, 200));
  q = searchIn(q, f.q, ['eventos.direccion_actividad', 'eventos.oferente', 'eventos.banda', 'cofradia.nickname_cofradia']);

  return f.orden === 'agenda'
    ? q.orderBy('eventos.fecha', 'asc').orderBy('eventos.hora', 'asc')
    : q.orderBy('eventos.id', 'desc');
};

// =====================================================================
// PÚBLICO
// =====================================================================

// Listado con filtros (agenda pública y panel)
router.get('/', validate(filtrosQuery, 'query'), asyncH(async (req, res) => {
  res.json(await paginate(req, consultaBase(req.query), { idColumn: 'eventos.id', map: formatear }));
}));

// Tipos de evento distintos (para filtros)
router.get('/tipos', asyncH(async (req, res) => {
  const filas = await knex('eventos').distinct('tipo_evento').whereNotNull('tipo_evento').orderBy('tipo_evento');
  res.json(filas.map((f) => f.tipo_evento).filter((t) => t && t.toLowerCase() !== 'ninguno'));
}));

// Calendario .ics: un evento (?id=) o la agenda filtrada (?cod_cofradia=, ?desde=...)
router.get('/ics', validate(filtrosQuery.extend({ id: z.coerce.number().int().positive().optional() }), 'query'), asyncH(async (req, res) => {
  const f = { ...req.query, orden: 'agenda' };
  if (req.query.id) f.ids = String(req.query.id);
  const eventos = await consultaBase(f).limit(500);
  if (req.query.id && eventos.length === 0) return notFound(res, 'Evento no encontrado');

  const ics = generarICS(
    eventos.map((e) => {
      const tipo = e.tipo_evento && e.tipo_evento.toLowerCase() !== 'ninguno' ? e.tipo_evento : 'Actividad';
      return {
        uid: `evento-${e.id}@gatilin.digital`,
        fecha: isoLocal(e.fecha),
        hora: String(e.hora),
        titulo: `${tipo} · ${e.nickname_cofradia || 'Cofradía'}`,
        descripcion: [
          e.oferente && `Oferente: ${e.oferente}`,
          e.banda && e.banda !== 'Ninguna' && `Banda: ${e.banda}`,
          e.tipo_dia && e.tipo_dia !== 'Ninguno' && `Día: ${e.tipo_dia}`,
        ].filter(Boolean).join('\n'),
        lugar: e.direccion_actividad ? `${e.direccion_actividad}, Huánuco` : undefined,
        url: e.slug ? `${config.frontendUrl}/cofradia?slug=${encodeURIComponent(e.slug)}` : undefined,
      };
    }),
    { nombre: eventos.length === 1 ? 'Gatilín Digital' : 'Agenda Gatilín Digital', tz: config.timezone }
  );

  const nombre = req.query.id ? `evento-${req.query.id}.ics` : 'agenda-gatilin.ics';
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
  res.send(ics);
}));

// =====================================================================
// ADMIN: plantilla, exportación y carga masiva
// =====================================================================

router.get('/template', requireAdmin, asyncH(async (req, res) => {
  await sendTemplate(res, {
    nombreHoja: 'Plantilla Eventos',
    filename: 'Plantilla_Eventos.xlsx',
    columns: EVENTO_COLUMNS,
    ejemplo: {
      fecha: '2026-12-25', tipo_dia: 'Víspera', tipo_evento: 'Misa', hora: '17:00', direccion_actividad: 'Jr. Ejemplo 123',
      oferente: 'Familia Ejemplo', tipo_oferente: 'Oferente', banda: 'Banda Ejemplo', cod_cofradia: 1,
    },
  });
}));

router.get('/export', requireAdmin, validate(filtrosQuery, 'query'), asyncH(async (req, res) => {
  const filas = await consultaBase({ ...req.query, orden: 'agenda' });
  await sendXlsx(res, {
    nombreHoja: 'Agenda',
    filename: `Agenda_Eventos_${format(new Date(), 'yyyyMMdd')}.xlsx`,
    columns: [...EVENTO_COLUMNS.slice(0, 8), { header: 'Cofradía', key: 'nickname_cofradia', width: 40 }],
    rows: filas.map(formatear).map((e) => ({ ...e, hora: String(e.hora).slice(0, 5) })),
  });
}));

router.post('/bulk-upload', requireAdmin, excelUpload, (req, res) =>
  bulkImport(req, res, {
    entidad: 'evento',
    columns: EVENTO_COLUMNS,
    schema: crearSchema,
    check: async (rec) => ((await existeCofradia(rec.cod_cofradia)) ? null : `La cofradía ${rec.cod_cofradia} no existe.`),
    insert: (rec, db) => db('eventos').insert(rec),
  })
);

router.get('/:id', asyncH(async (req, res) => {
  const evento = await knex('eventos')
    .select('eventos.*', 'cofradia.nickname_cofradia', 'cofradia.color', 'cofradia.slug')
    .leftJoin('cofradia', 'eventos.cod_cofradia', 'cofradia.id')
    .where('eventos.id', req.params.id)
    .first();
  if (!evento) return notFound(res, 'Evento no encontrado');
  res.json(formatear(evento));
}));

// =====================================================================
// CRUD (solo admin)
// =====================================================================

router.post('/', requireAdmin, validate(crearSchema), asyncH(async (req, res) => {
  if (!(await existeCofradia(req.body.cod_cofradia))) return badRequest(res, 'La cofradía seleccionada no existe.');
  const id = await insertarId(knex('eventos').insert(req.body));
  await audit(req, 'crear', 'evento', id, { fecha: req.body.fecha, cod_cofradia: req.body.cod_cofradia });
  res.status(201).json({ message: 'Evento creado con éxito', id });
}));

router.put('/:id', requireAdmin, validate(editarSchema), asyncH(async (req, res) => {
  const evento = await knex('eventos').where('id', req.params.id).first();
  if (!evento) return notFound(res, 'Evento no encontrado');
  if (req.body.cod_cofradia && !(await existeCofradia(req.body.cod_cofradia))) return badRequest(res, 'La cofradía seleccionada no existe.');

  const updates = Object.fromEntries(Object.entries(req.body).filter(([, v]) => v !== undefined));
  if (Object.keys(updates).length === 0) return badRequest(res, 'No se enviaron datos para actualizar.');
  await knex('eventos').where('id', evento.id).update(updates);
  await audit(req, 'editar', 'evento', evento.id, diff({ ...evento, fecha: isoLocal(evento.fecha) }, updates));
  res.json({ message: 'Evento actualizado con éxito' });
}));

router.delete('/:id', requireAdmin, asyncH(async (req, res) => {
  const evento = await knex('eventos').where('id', req.params.id).first();
  if (!evento) return notFound(res, 'Evento no encontrado');
  await knex('eventos').where('id', evento.id).del();
  await audit(req, 'eliminar', 'evento', evento.id, { fecha: isoLocal(evento.fecha), cod_cofradia: evento.cod_cofradia });
  res.json({ message: 'Evento eliminado' });
}));

module.exports = router;
