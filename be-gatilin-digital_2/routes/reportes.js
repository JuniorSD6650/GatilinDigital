const express = require('express');
const { format } = require('date-fns');

const knex = require('../lib/db');
const { requireAdmin } = require('../middleware/auth');
const { imageUpload, borrarArchivoPublico } = require('../middleware/upload');
const limits = require('../middleware/rateLimits');
const { z, validate, textoOpc, textoReq, enteroOpc, telefono, paginacionQuery } = require('../middleware/validate');
const { notFound, badRequest, asyncH, paginate, searchIn } = require('../lib/http');
const { audit } = require('../lib/audit');
const { sendXlsx } = require('../lib/excel');
const { insertarId } = require('../lib/dbUtil');

const router = express.Router();

const ESTADOS = ['pendiente', 'revisado', 'resuelto', 'descartado'];

const crearSchema = z.object({
  nombre_reportante: textoReq(120),
  descripcion: textoReq(2000),
  numero_contacto: telefono,
  cofradia_id: enteroOpc,
});

const estadoSchema = z.object({
  estado: z.enum(ESTADOS, { error: `Estado inválido (${ESTADOS.join(', ')})` }).optional(),
  nota: textoOpc(1000),
  notas_internas: textoOpc(5000).optional(),
}).refine((d) => d.estado || d.notas_internas !== undefined || d.nota, { message: 'No hay cambios para guardar' });

const fmt = (d) => (d ? new Date(d).toISOString() : null);
const formatear = (r) => ({ ...r, created_at: fmt(r.created_at), updated_at: fmt(r.updated_at) });

// =====================================================================
// PÚBLICO: enviar un reporte (con límite de envíos por IP)
// =====================================================================
const limpiarSiFalla = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 400 && req.savedImage) borrarArchivoPublico(req.savedImage);
  });
  next();
};

router.post('/', limits.formulario, imageUpload('foto', 'reportes', { maxMB: 5, maxSize: 1600 }), limpiarSiFalla,
  validate(crearSchema), asyncH(async (req, res) => {
    const { cofradia_id } = req.body;
    if (cofradia_id && !(await knex('cofradia').where('id', cofradia_id).first('id'))) {
      return badRequest(res, 'La cofradía seleccionada no existe.');
    }
    // El estado lo decide el equipo, nunca quien reporta
    const id = await insertarId(knex('reportes').insert({ ...req.body, ruta_foto: req.savedImage || null, estado: 'pendiente' }));
    res.status(201).json({ message: 'Reporte creado con éxito', id });
  })
);

// =====================================================================
// ADMIN
// =====================================================================
router.use(requireAdmin);

const filtros = paginacionQuery.extend({
  estado: z.enum(ESTADOS).optional(),
  cofradia_id: z.coerce.number().int().positive().optional(),
});

const consulta = (f) => {
  let q = knex('reportes')
    .select('reportes.*', 'cofradia.nickname_cofradia', 'usuarios.username as atendido_por_username')
    .leftJoin('cofradia', 'reportes.cofradia_id', 'cofradia.id')
    .leftJoin('usuarios', 'reportes.atendido_por', 'usuarios.id')
    .orderBy('reportes.id', 'desc');
  if (f.estado) q = q.where('reportes.estado', f.estado);
  if (f.cofradia_id) q = q.where('reportes.cofradia_id', f.cofradia_id);
  return searchIn(q, f.q, ['reportes.nombre_reportante', 'reportes.descripcion', 'cofradia.nickname_cofradia']);
};

router.get('/', validate(filtros, 'query'), asyncH(async (req, res) => {
  res.json(await paginate(req, consulta(req.query), { idColumn: 'reportes.id', map: formatear }));
}));

// Conteo por estado (para las pestañas del panel)
router.get('/resumen', asyncH(async (req, res) => {
  const filas = await knex('reportes').select('estado').count({ n: '*' }).groupBy('estado');
  const resumen = Object.fromEntries(ESTADOS.map((e) => [e, 0]));
  filas.forEach((f) => { resumen[f.estado] = Number(f.n); });
  res.json(resumen);
}));

router.get('/export', validate(filtros, 'query'), asyncH(async (req, res) => {
  const filas = await consulta(req.query);
  await sendXlsx(res, {
    nombreHoja: 'Reportes',
    filename: `Reportes_${format(new Date(), 'yyyyMMdd')}.xlsx`,
    columns: [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Fecha', key: 'fecha', width: 18 },
      { header: 'Estado', key: 'estado', width: 14 },
      { header: 'Reportante', key: 'nombre_reportante', width: 30 },
      { header: 'Contacto', key: 'numero_contacto', width: 15 },
      { header: 'Cofradía', key: 'nickname_cofradia', width: 35 },
      { header: 'Descripción', key: 'descripcion', width: 60 },
      { header: 'Atendido por', key: 'atendido_por_username', width: 20 },
      { header: 'Notas internas', key: 'notas_internas', width: 50 },
    ],
    rows: filas.map((r) => ({ ...r, fecha: r.created_at ? format(new Date(r.created_at), 'dd/MM/yyyy HH:mm') : '' })),
  });
}));

router.get('/:id', asyncH(async (req, res) => {
  const reporte = await consulta({}).where('reportes.id', req.params.id).first();
  if (!reporte) return notFound(res, 'Reporte no encontrado');
  const historial = await knex('reportes_historial').where('reporte_id', reporte.id).orderBy('id', 'desc');
  res.json({ ...formatear(reporte), historial: historial.map((h) => ({ ...h, created_at: fmt(h.created_at) })) });
}));

// Cambiar estado / notas (deja historial y quién lo atendió)
const cambiarEstado = asyncH(async (req, res) => {
  const reporte = await knex('reportes').where('id', req.params.id).first();
  if (!reporte) return notFound(res, 'Reporte no encontrado');

  const { estado, nota, notas_internas } = req.body;
  const updates = { updated_at: knex.fn.now() };
  if (notas_internas !== undefined) updates.notas_internas = notas_internas;
  const cambiaEstado = estado && estado !== reporte.estado;
  if (cambiaEstado) {
    updates.estado = estado;
    updates.atendido_por = req.user.id;
  }

  await knex.transaction(async (trx) => {
    await trx('reportes').where('id', reporte.id).update(updates);
    if (cambiaEstado || nota) {
      await trx('reportes_historial').insert({
        reporte_id: reporte.id,
        estado_anterior: reporte.estado,
        estado_nuevo: estado || reporte.estado,
        nota: nota || null,
        usuario_id: req.user.id,
        username: req.user.username,
      });
    }
  });

  if (cambiaEstado) await audit(req, 'estado', 'reporte', reporte.id, { estado: [reporte.estado, estado] });
  res.json({ message: 'Reporte actualizado con éxito' });
});

router.patch('/:id/estado', validate(estadoSchema), cambiarEstado);
// Compatibilidad: el panel anterior enviaba PUT con FormData { estado }
router.put('/:id', imageUpload('foto', 'reportes'), (req, res, next) => {
  if (req.savedImage) borrarArchivoPublico(req.savedImage); // la foto la envía el público, no se reemplaza
  next();
}, validate(estadoSchema), cambiarEstado);

router.delete('/:id', asyncH(async (req, res) => {
  const reporte = await knex('reportes').where('id', req.params.id).first();
  if (!reporte) return notFound(res, 'Reporte no encontrado');
  await knex('reportes').where('id', reporte.id).del();
  borrarArchivoPublico(reporte.ruta_foto);
  await audit(req, 'eliminar', 'reporte', reporte.id, { nombre_reportante: reporte.nombre_reportante });
  res.json({ message: 'Reporte eliminado con éxito' });
}));

module.exports = router;
