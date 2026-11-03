const express = require('express');
const multer = require('multer');
const { format } = require('date-fns');

const knex = require('../lib/db');
const { requireAdmin, optionalAuth, isAdmin } = require('../middleware/auth');
const limits = require('../middleware/rateLimits');
const { z, validate, textoReq, textoOpc, telefono, email, fechaOpc, paginacionQuery } = require('../middleware/validate');
const { notFound, badRequest, asyncH, paginate, searchIn } = require('../lib/http');
const { audit, diff } = require('../lib/audit');
const { sendXlsx } = require('../lib/excel');

const router = express.Router();
const sinArchivos = multer({ limits: { fields: 20, fileSize: 0 } }).none();

const ESTADOS = ['pendiente', 'activo', 'inactivo'];

const campos = {
  nombre: textoReq(255),
  dni: z.preprocess((v) => (v == null ? v : String(v).trim()), z.string({ error: 'Es obligatorio' }).regex(/^[A-Za-z0-9]{6,20}$/, 'Documento inválido')),
  email: email,
  telefono: telefono,
  comentario: textoReq(2000),
};
const registroSchema = z.object(campos);
const editarSchema = z.object({ ...campos, estado: z.enum(ESTADOS).optional(), fecha_registro: fechaOpc.optional() }).partial();

const fmt = (p) => ({ ...p, fecha_registro: p.fecha_registro ? format(new Date(p.fecha_registro), 'yyyy-MM-dd') : null });

// =====================================================================
// PÚBLICO: registro (con límite de envíos)
// =====================================================================
// El admin (desde el panel) no tiene límite de envíos y puede fijar el estado
const limiteSiPublico = (req, res, next) => (isAdmin(req) ? next() : limits.formulario(req, res, next));
const esquemaSegunRol = (req, res, next) =>
  validate(isAdmin(req) ? registroSchema.extend({ estado: z.enum(ESTADOS).optional() }) : registroSchema)(req, res, next);

router.post('/', optionalAuth, limiteSiPublico, esquemaSegunRol, asyncH(async (req, res) => {
  try {
    const [id] = await knex('participantes').insert({
      ...req.body,
      fecha_registro: format(new Date(), 'yyyy-MM-dd'),
      // El público siempre queda "pendiente": el estado lo decide el equipo
      estado: isAdmin(req) && req.body.estado ? req.body.estado : 'pendiente',
    });
    if (isAdmin(req)) await audit(req, 'crear', 'participante', id, { nombre: req.body.nombre });
    res.status(201).json({ message: 'Participante registrado con éxito', id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return badRequest(res, 'Ya existe un registro con ese documento.');
    throw err;
  }
}));

// =====================================================================
// ADMIN
// =====================================================================
router.use(requireAdmin);

const filtros = paginacionQuery.extend({ estado: z.enum(ESTADOS).optional() });
const consulta = (f) => {
  let q = knex('participantes').select('*').orderBy('id', 'desc');
  if (f.estado) q = q.where('estado', f.estado);
  return searchIn(q, f.q, ['nombre', 'dni', 'email', 'telefono']);
};

router.get('/', validate(filtros, 'query'), asyncH(async (req, res) => {
  res.json(await paginate(req, consulta(req.query), { idColumn: 'id', map: fmt }));
}));

router.get('/export', validate(filtros, 'query'), asyncH(async (req, res) => {
  const filas = await consulta(req.query);
  await sendXlsx(res, {
    nombreHoja: 'Participantes',
    filename: `Participantes_${format(new Date(), 'yyyyMMdd')}.xlsx`,
    columns: [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nombre', key: 'nombre', width: 35 },
      { header: 'Documento', key: 'dni', width: 15 },
      { header: 'Correo', key: 'email', width: 30 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Fecha registro', key: 'fecha_registro', width: 15 },
      { header: 'Estado', key: 'estado', width: 12 },
      { header: 'Comentario', key: 'comentario', width: 60 },
    ],
    rows: filas.map(fmt),
  });
}));

router.get('/:id', asyncH(async (req, res) => {
  const participante = await knex('participantes').where('id', req.params.id).first();
  if (!participante) return notFound(res, 'Participante no encontrado');
  res.json(fmt(participante));
}));

// Acepta JSON o FormData (el panel envía FormData)
router.put('/:id', sinArchivos, validate(editarSchema), asyncH(async (req, res) => {
  const participante = await knex('participantes').where('id', req.params.id).first();
  if (!participante) return notFound(res, 'Participante no encontrado');

  const updates = Object.fromEntries(Object.entries(req.body).filter(([, v]) => v !== undefined && v !== null));
  if (Object.keys(updates).length === 0) return badRequest(res, 'No se enviaron datos válidos para actualizar.');
  try {
    await knex('participantes').where('id', participante.id).update(updates);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return badRequest(res, 'Ya existe un participante con ese documento.');
    throw err;
  }
  await audit(req, 'editar', 'participante', participante.id, diff(fmt(participante), updates));
  res.json({ message: 'Participante actualizado con éxito' });
}));

router.delete('/:id', asyncH(async (req, res) => {
  const participante = await knex('participantes').where('id', req.params.id).first();
  if (!participante) return notFound(res, 'Participante no encontrado');
  await knex('participantes').where('id', participante.id).del();
  await audit(req, 'eliminar', 'participante', participante.id, { nombre: participante.nombre });
  res.json({ message: 'Participante eliminado con éxito' });
}));

module.exports = router;
