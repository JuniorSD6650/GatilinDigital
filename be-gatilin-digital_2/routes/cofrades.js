const express = require('express');
const { format } = require('date-fns');

const knex = require('../lib/db');
const { requireAdmin } = require('../middleware/auth');
const { imageUpload, excelUpload, borrarArchivoPublico } = require('../middleware/upload');
const { z, validate, textoReq, enteroReq, telefono, paginacionQuery } = require('../middleware/validate');
const { notFound, badRequest, asyncH, paginate, searchIn } = require('../lib/http');
const { audit, diff } = require('../lib/audit');
const { sendTemplate, sendXlsx, bulkImport } = require('../lib/excel');
const { insertarId, esDuplicado } = require('../lib/dbUtil');

const router = express.Router();

const COFRADE_COLUMNS = [
  { header: 'DNI Cofrade', key: 'dni_cofrade', width: 20 },
  { header: 'Nombres y Apellidos', key: 'nombres_apellidos', width: 50 },
  { header: 'Celular', key: 'celular', width: 15 },
  { header: 'Personaje Cofradía', key: 'personaje_cofradia', width: 30 },
  { header: 'Cargo Cofrade', key: 'cargo_cofrade', width: 30 },
  { header: 'Código Cofradía', key: 'cod_cofradia', width: 20 },
  { header: 'Año', key: 'anio', width: 10 },
];

// ---- Validación ----
const anioActual = () => new Date().getFullYear();
const conDefecto = (def) => z.preprocess((v) => (v == null || String(v).trim() === '' ? def : String(v).trim()), z.string().max(255));
const campos = {
  dni_cofrade: z.preprocess((v) => (v == null ? v : String(v).trim()), z.string({ error: 'Es obligatorio' }).regex(/^[A-Za-z0-9]{6,20}$/, 'DNI inválido')),
  nombres_apellidos: textoReq(255),
  celular: telefono,
  personaje_cofradia: conDefecto('ninguno'),
  cargo_cofrade: conDefecto('ninguno'),
  cod_cofradia: enteroReq,
  anio: z.preprocess((v) => (v == null || v === '' ? anioActual() : Number(v)), z.number().int().min(1900).max(2100)),
};
const crearSchema = z.object(campos);
const editarSchema = z.object(campos).partial();

const existeCofradia = async (id) => Boolean(await knex('cofradia').where('id', id).first('id'));

// Público: sin DNI
const publico = ({ dni_cofrade, ...c }) => c;

// =====================================================================
// PÚBLICO
// =====================================================================
router.get('/by-cofradia/:cofradiaId', asyncH(async (req, res) => {
  const cofrades = await knex('cofrades')
    .select('cofrades.*', 'cofradia.nickname_cofradia', 'cofradia.color')
    .leftJoin('cofradia', 'cofrades.cod_cofradia', 'cofradia.id')
    .where('cofrades.cod_cofradia', req.params.cofradiaId)
    .orderBy('cofrades.anio', 'desc')
    .orderBy('cofrades.cargo_cofrade', 'asc')
    .orderBy('cofrades.nombres_apellidos', 'asc');
  res.json(cofrades.map(publico));
}));

// =====================================================================
// ADMIN
// =====================================================================
router.use(requireAdmin);

router.get('/template', asyncH(async (req, res) => {
  await sendTemplate(res, {
    nombreHoja: 'Plantilla Cofrades',
    filename: 'Plantilla_Cofrades.xlsx',
    columns: COFRADE_COLUMNS,
    ejemplo: {
      dni_cofrade: '12345678', nombres_apellidos: 'Nombre Apellido', celular: '987654321', personaje_cofradia: 'Caporal',
      cargo_cofrade: 'Integrante', cod_cofradia: 1, anio: anioActual(),
    },
  });
}));

const filtros = paginacionQuery.extend({
  cod_cofradia: z.coerce.number().int().positive().optional(),
  anio: z.coerce.number().int().optional(),
});

const consulta = (f) => {
  let q = knex('cofrades')
    .select('cofrades.*', 'cofradia.nickname_cofradia')
    .leftJoin('cofradia', 'cofrades.cod_cofradia', 'cofradia.id')
    .orderBy('cofrades.anio', 'desc')
    .orderBy('cofrades.id', 'desc');
  if (f.cod_cofradia) q = q.where('cofrades.cod_cofradia', f.cod_cofradia);
  if (f.anio) q = q.where('cofrades.anio', f.anio);
  return searchIn(q, f.q, ['cofrades.nombres_apellidos', 'cofrades.dni_cofrade', 'cofrades.personaje_cofradia', 'cofrades.cargo_cofrade', 'cofradia.nickname_cofradia']);
};

router.get('/', validate(filtros, 'query'), asyncH(async (req, res) => {
  res.json(await paginate(req, consulta(req.query), { idColumn: 'cofrades.id' }));
}));

// Años distintos (para el filtro del panel)
router.get('/anios', asyncH(async (req, res) => {
  const filas = await knex('cofrades').distinct('anio').orderBy('anio', 'desc');
  res.json(filas.map((f) => f.anio));
}));

router.get('/export', validate(filtros, 'query'), asyncH(async (req, res) => {
  const filas = await consulta(req.query);
  await sendXlsx(res, {
    nombreHoja: 'Cofrades',
    filename: `Cofrades_${format(new Date(), 'yyyyMMdd')}.xlsx`,
    columns: [...COFRADE_COLUMNS, { header: 'Cofradía', key: 'nickname_cofradia', width: 40 }],
    rows: filas,
  });
}));

router.post('/bulk-upload', excelUpload, (req, res) =>
  bulkImport(req, res, {
    entidad: 'cofrade',
    columns: COFRADE_COLUMNS,
    schema: crearSchema,
    check: async (rec) => ((await existeCofradia(rec.cod_cofradia)) ? null : `La cofradía ${rec.cod_cofradia} no existe.`),
    insert: (rec, db) => db('cofrades').insert(rec),
  })
);

router.get('/:id', asyncH(async (req, res) => {
  const cofrade = await knex('cofrades')
    .select('cofrades.*', 'cofradia.nickname_cofradia')
    .leftJoin('cofradia', 'cofrades.cod_cofradia', 'cofradia.id')
    .where('cofrades.id', req.params.id)
    .first();
  if (!cofrade) return notFound(res, 'Cofrade no encontrado');
  res.json(cofrade);
}));

// Si la validación falla después de guardar la imagen, se borra
const limpiarSiFalla = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 400 && req.savedImage) borrarArchivoPublico(req.savedImage);
  });
  next();
};

router.post('/', imageUpload('foto', 'cofrades', { maxMB: 5, maxSize: 900 }), limpiarSiFalla, validate(crearSchema), asyncH(async (req, res) => {
  if (!(await existeCofradia(req.body.cod_cofradia))) return badRequest(res, 'La cofradía seleccionada no existe.');
  try {
    const id = await insertarId(knex('cofrades').insert({ ...req.body, ruta_foto: req.savedImage || null }));
    await audit(req, 'crear', 'cofrade', id, { nombres_apellidos: req.body.nombres_apellidos, cod_cofradia: req.body.cod_cofradia });
    res.status(201).json({ message: 'Cofrade registrado', id });
  } catch (err) {
    if (esDuplicado(err)) return badRequest(res, 'Este cofrade ya está registrado en esa cofradía para ese año.');
    throw err;
  }
}));

router.put('/:id', imageUpload('foto', 'cofrades', { maxMB: 5, maxSize: 900 }), limpiarSiFalla, validate(editarSchema), asyncH(async (req, res) => {
  const cofrade = await knex('cofrades').where('id', req.params.id).first();
  if (!cofrade) return notFound(res, 'Cofrade no encontrado');
  if (req.body.cod_cofradia && !(await existeCofradia(req.body.cod_cofradia))) return badRequest(res, 'La cofradía seleccionada no existe.');

  const updates = Object.fromEntries(Object.entries(req.body).filter(([, v]) => v !== undefined));
  if (req.savedImage) updates.ruta_foto = req.savedImage;
  if (Object.keys(updates).length === 0) return badRequest(res, 'No se enviaron datos para actualizar.');

  try {
    await knex('cofrades').where('id', cofrade.id).update(updates);
  } catch (err) {
    if (esDuplicado(err)) return badRequest(res, 'Ya existe un cofrade con ese DNI en esa cofradía para ese año.');
    throw err;
  }
  if (req.savedImage && cofrade.ruta_foto) borrarArchivoPublico(cofrade.ruta_foto);
  await audit(req, 'editar', 'cofrade', cofrade.id, diff(cofrade, updates));
  res.json({ message: 'Cofrade actualizado' });
}));

router.delete('/:id', asyncH(async (req, res) => {
  const cofrade = await knex('cofrades').where('id', req.params.id).first();
  if (!cofrade) return notFound(res, 'Cofrade no encontrado');
  await knex('cofrades').where('id', cofrade.id).del();
  borrarArchivoPublico(cofrade.ruta_foto);
  await audit(req, 'eliminar', 'cofrade', cofrade.id, { nombres_apellidos: cofrade.nombres_apellidos });
  res.json({ message: 'Cofrade eliminado' });
}));

module.exports = router;
