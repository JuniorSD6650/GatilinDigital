const express = require('express');
const { format } = require('date-fns');

const knex = require('../lib/db');
const { asyncH, badRequest } = require('../lib/http');
const { fechaISO } = require('../middleware/validate');

const router = express.Router();

// Programa completo (opcionalmente de un día)
router.get('/', asyncH(async (req, res) => {
  let query = knex('festival_eventos').orderBy('fecha', 'asc').orderBy('hora_inicio', 'asc');
  if (req.query.fecha) {
    const parsed = fechaISO.safeParse(req.query.fecha);
    if (!parsed.success) return badRequest(res, 'Fecha inválida (usa AAAA-MM-DD)');
    query = query.whereRaw('CAST(fecha AS DATE) = ?', [parsed.data]);
  }
  res.json(await query);
}));

// Días disponibles (filtro de fechas en el front)
router.get('/dias', asyncH(async (req, res) => {
  const dias = await knex('festival_eventos').distinct(knex.raw('CAST(fecha AS DATE) as fecha')).orderBy('fecha', 'asc');
  res.json(dias.map((d) => ({ fecha: format(new Date(d.fecha), 'yyyy-MM-dd') })));
}));

module.exports = router;
