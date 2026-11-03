// Consulta de la bitácora de auditoría (solo admin)
const express = require('express');
const { format } = require('date-fns');

const knex = require('../lib/db');
const { requireAdmin } = require('../middleware/auth');
const { z, validate, paginacionQuery, fechaISO } = require('../middleware/validate');
const { asyncH, paginate, searchIn } = require('../lib/http');
const { sendXlsx } = require('../lib/excel');

const router = express.Router();
router.use(requireAdmin);

const filtros = paginacionQuery.extend({
  entidad: z.string().trim().max(50).optional(),
  accion: z.string().trim().max(50).optional(),
  usuario_id: z.coerce.number().int().positive().optional(),
  entidad_id: z.string().trim().max(50).optional(),
  desde: fechaISO.optional(),
  hasta: fechaISO.optional(),
});

const consulta = (f) => {
  let q = knex('audit_log').select('*').orderBy('id', 'desc');
  if (f.entidad) q = q.where('entidad', f.entidad);
  if (f.accion) q = q.where('accion', f.accion);
  if (f.usuario_id) q = q.where('usuario_id', f.usuario_id);
  if (f.entidad_id) q = q.where('entidad_id', f.entidad_id);
  if (f.desde) q = q.where('created_at', '>=', `${f.desde} 00:00:00`);
  if (f.hasta) q = q.where('created_at', '<=', `${f.hasta} 23:59:59`);
  return searchIn(q, f.q, ['username', 'detalle', 'entidad_id']);
};

const formatear = (r) => {
  let detalle = r.detalle;
  try {
    detalle = r.detalle ? JSON.parse(r.detalle) : null;
  } catch {
    /* texto plano */
  }
  return { ...r, detalle, created_at: r.created_at ? new Date(r.created_at).toISOString() : null };
};

router.get('/', validate(filtros, 'query'), asyncH(async (req, res) => {
  res.json(await paginate(req, consulta(req.query), { map: formatear }));
}));

// Valores distintos para los filtros
router.get('/filtros', asyncH(async (req, res) => {
  const [entidades, acciones, usuarios] = await Promise.all([
    knex('audit_log').distinct('entidad').orderBy('entidad'),
    knex('audit_log').distinct('accion').orderBy('accion'),
    knex('audit_log').distinct('usuario_id', 'username').whereNotNull('usuario_id').orderBy('username'),
  ]);
  res.json({
    entidades: entidades.map((e) => e.entidad),
    acciones: acciones.map((a) => a.accion),
    usuarios: usuarios.map((u) => ({ id: u.usuario_id, username: u.username })),
  });
}));

router.get('/export', validate(filtros, 'query'), asyncH(async (req, res) => {
  const filas = await consulta(req.query).limit(10000);
  await sendXlsx(res, {
    nombreHoja: 'Auditoría',
    filename: `Auditoria_${format(new Date(), 'yyyyMMdd')}.xlsx`,
    columns: [
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Usuario', key: 'username', width: 22 },
      { header: 'Acción', key: 'accion', width: 15 },
      { header: 'Entidad', key: 'entidad', width: 15 },
      { header: 'ID', key: 'entidad_id', width: 10 },
      { header: 'Detalle', key: 'detalle', width: 80 },
      { header: 'IP', key: 'ip', width: 18 },
    ],
    rows: filas.map((r) => ({ ...r, fecha: r.created_at ? format(new Date(r.created_at), 'dd/MM/yyyy HH:mm:ss') : '' })),
  });
}));

module.exports = router;
