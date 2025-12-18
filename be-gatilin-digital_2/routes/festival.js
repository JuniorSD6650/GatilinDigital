const express = require('express');
const router = express.Router();
const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig);

// Obtener todo el programa
router.get('/', async (req, res) => {
  try {
    const { fecha } = req.query;
    
    let query = knex('festival_eventos').orderBy('fecha', 'asc').orderBy('hora_inicio', 'asc');

    if (fecha) {
      query = query.where('fecha', fecha);
    }

    const eventos = await query;
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo el festival', details: err.message });
  }
});

// Obtener días disponibles (para hacer un filtro de fechas en el front)
router.get('/dias', async (req, res) => {
  try {
    const dias = await knex('festival_eventos')
      .distinct('fecha')
      .orderBy('fecha', 'asc');
    res.json(dias);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo días', details: err.message });
  }
});

module.exports = router;