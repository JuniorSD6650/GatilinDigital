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
      // Usar whereRaw para comparar solo la parte de fecha (ignorando timestamp)
      query = query.whereRaw('DATE(fecha) = ?', [fecha]);
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
      .distinct(knex.raw('DATE(fecha) as fecha'))
      .orderBy('fecha', 'asc');
    
    // Formatear las fechas a YYYY-MM-DD
    const diasFormateados = dias.map(d => {
      const fecha = new Date(d.fecha);
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      return { fecha: `${year}-${month}-${day}` };
    });
    
    res.json(diasFormateados);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo días', details: err.message });
  }
});

module.exports = router;