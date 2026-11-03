const express = require('express');

const knex = require('../lib/db');
const { requireAdmin } = require('../middleware/auth');
const { excelUpload } = require('../middleware/upload');
const { z, validate, textoReq, textoOpc, telefono, paginacionQuery } = require('../middleware/validate');
const { notFound, badRequest, asyncH, paginate, searchIn } = require('../lib/http');
const { audit, diff } = require('../lib/audit');
const { sendTemplate, bulkImport } = require('../lib/excel');

const router = express.Router();

const BORDADURIA_COLUMNS = [
  { header: 'RUC', key: 'ruc', width: 20 },
  { header: 'Razón Social', key: 'razon_social', width: 50 },
  { header: 'Descripción', key: 'descripcion', width: 50 },
  { header: 'Dirección', key: 'direccion', width: 50 },
  { header: 'Web/Facebook', key: 'web_fb', width: 30 },
  { header: 'Representante', key: 'representante', width: 30 },
  { header: 'Celular', key: 'celular', width: 20 },
];

const campos = {
  ruc: z.preprocess((v) => (v == null ? v : String(v).trim()), z.string({ error: 'Es obligatorio' }).regex(/^\d{11}$/, 'El RUC debe tener 11 dígitos')),
  razon_social: textoReq(255),
  descripcion: textoOpc(5000),
  direccion: textoReq(255),
  web_fb: textoOpc(255),
  representante: textoReq(255),
  celular: telefono,
};
const crearSchema = z.object(campos);
const editarSchema = z.object(campos).partial();

// ---- Público ----
router.get('/list', asyncH(async (req, res) => {
  res.json(await knex('bordadurias').select('id', 'razon_social').orderBy('id', 'asc'));
}));

router.get('/template', requireAdmin, asyncH(async (req, res) => {
  await sendTemplate(res, {
    nombreHoja: 'Plantilla Bordadurías',
    filename: 'Plantilla_Bordadurias.xlsx',
    columns: BORDADURIA_COLUMNS,
    ejemplo: {
      ruc: '20123456789', razon_social: 'Bordados Ejemplo SAC', descripcion: 'Trajes de negritos', direccion: 'Jr. Ejemplo 123',
      web_fb: 'https://facebook.com/ejemplo', representante: 'Nombre Apellido', celular: '987654321',
    },
  });
}));

router.get('/', validate(paginacionQuery, 'query'), asyncH(async (req, res) => {
  const query = searchIn(knex('bordadurias').select('*').orderBy('id', 'desc'), req.query.q, ['razon_social', 'ruc', 'representante', 'direccion']);
  res.json(await paginate(req, query));
}));

router.get('/:id', asyncH(async (req, res) => {
  const bordaduria = await knex('bordadurias').where('id', req.params.id).first();
  if (!bordaduria) return notFound(res, 'Bordaduría no encontrada');
  res.json(bordaduria);
}));

// ---- Admin ----
router.post('/bulk-upload', requireAdmin, excelUpload, (req, res) =>
  bulkImport(req, res, {
    entidad: 'bordaduria',
    columns: BORDADURIA_COLUMNS,
    schema: crearSchema,
    insert: (rec, db) => db('bordadurias').insert(rec),
  })
);

router.post('/', requireAdmin, validate(crearSchema), asyncH(async (req, res) => {
  const [id] = await knex('bordadurias').insert(req.body);
  await audit(req, 'crear', 'bordaduria', id, { razon_social: req.body.razon_social });
  res.status(201).json({ message: 'Bordaduría creada con éxito', id });
}));

router.put('/:id', requireAdmin, validate(editarSchema), asyncH(async (req, res) => {
  const actual = await knex('bordadurias').where('id', req.params.id).first();
  if (!actual) return notFound(res, 'Bordaduría no encontrada');
  const updates = Object.fromEntries(Object.entries(req.body).filter(([, v]) => v !== undefined));
  if (Object.keys(updates).length === 0) return badRequest(res, 'No se enviaron datos para actualizar.');
  await knex('bordadurias').where('id', actual.id).update(updates);
  await audit(req, 'editar', 'bordaduria', actual.id, diff(actual, updates));
  res.json({ message: 'Bordaduría actualizada con éxito' });
}));

router.delete('/:id', requireAdmin, asyncH(async (req, res) => {
  const actual = await knex('bordadurias').where('id', req.params.id).first();
  if (!actual) return notFound(res, 'Bordaduría no encontrada');
  await knex('bordadurias').where('id', actual.id).del();
  await audit(req, 'eliminar', 'bordaduria', actual.id, { razon_social: actual.razon_social });
  res.json({ message: 'Bordaduría eliminada con éxito' });
}));

module.exports = router;
