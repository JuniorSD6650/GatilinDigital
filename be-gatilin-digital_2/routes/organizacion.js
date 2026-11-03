const express = require('express');

const knex = require('../lib/db');
const { requireAdmin } = require('../middleware/auth');
const { excelUpload } = require('../middleware/upload');
const { z, validate, textoReq, textoOpc, url } = require('../middleware/validate');
const { notFound, badRequest, asyncH } = require('../lib/http');
const { audit, diff } = require('../lib/audit');
const { sendTemplate, bulkImport } = require('../lib/excel');

const router = express.Router();

const ORGANIZACION_COLUMNS = [
  { header: 'Nombre', key: 'nombre', width: 30 },
  { header: 'Descripción', key: 'descripcion', width: 50 },
  { header: 'Link de Stream', key: 'streaming_link', width: 30 },
];

const campos = { nombre: textoReq(255), descripcion: textoOpc(5000), streaming_link: url };
const crearSchema = z.object(campos);
const editarSchema = z.object(campos).partial();

// ---- Público (la configuración del sitio y el enlace de transmisión) ----
router.get('/list', asyncH(async (req, res) => {
  res.json(await knex('organizacion').select('id', 'nombre').orderBy('id', 'asc'));
}));

router.get('/template', requireAdmin, asyncH(async (req, res) => {
  await sendTemplate(res, { nombreHoja: 'Plantilla', filename: 'Plantilla_Organizaciones.xlsx', columns: ORGANIZACION_COLUMNS });
}));

router.get('/', asyncH(async (req, res) => {
  res.json(await knex('organizacion').select('*').orderBy('id', 'desc'));
}));

router.get('/:id', asyncH(async (req, res) => {
  const organizacion = await knex('organizacion').where('id', req.params.id).first();
  if (!organizacion) return notFound(res, 'Organización no encontrada');
  res.json(organizacion);
}));

// ---- Admin ----
router.post('/bulk-upload', requireAdmin, excelUpload, (req, res) =>
  bulkImport(req, res, {
    entidad: 'organizacion',
    columns: ORGANIZACION_COLUMNS,
    schema: crearSchema,
    insert: (rec, db) => db('organizacion').insert(rec),
  })
);

router.post('/', requireAdmin, validate(crearSchema), asyncH(async (req, res) => {
  const [id] = await knex('organizacion').insert(req.body);
  await audit(req, 'crear', 'organizacion', id, { nombre: req.body.nombre });
  res.status(201).json({ message: 'Organización creada con éxito', id });
}));

router.put('/:id', requireAdmin, validate(editarSchema), asyncH(async (req, res) => {
  const actual = await knex('organizacion').where('id', req.params.id).first();
  if (!actual) return notFound(res, 'Organización no encontrada');
  const updates = Object.fromEntries(Object.entries(req.body).filter(([, v]) => v !== undefined));
  if (Object.keys(updates).length === 0) return badRequest(res, 'No se enviaron datos para actualizar.');
  await knex('organizacion').where('id', actual.id).update(updates);
  await audit(req, 'editar', 'organizacion', actual.id, diff(actual, updates));
  res.json({ message: 'Organización actualizada con éxito' });
}));

router.delete('/:id', requireAdmin, asyncH(async (req, res) => {
  const actual = await knex('organizacion').where('id', req.params.id).first();
  if (!actual) return notFound(res, 'Organización no encontrada');
  await knex('organizacion').where('id', actual.id).del();
  await audit(req, 'eliminar', 'organizacion', actual.id, { nombre: actual.nombre });
  res.json({ message: 'Organización eliminada con éxito' });
}));

module.exports = router;
