const express = require('express');
const router = express.Router();
const knex = require('../lib/db');
const { requireAdmin } = require('../middleware/auth');

/**
 * GET /estadisticas
 * Obtiene estadísticas generales del sistema para el dashboard
 */
router.get('/', requireAdmin, async (req, res) => {
  try {
    // Obtener conteos de todas las tablas principales
    const [
      cofradiasCount,
      cofradesCount,
      eventosCount,
      reportesCount,
      participantesCount,
      bordaduriasCount,
      localizadoresCount,
      reportesPendientesCount,
      eventosProximosCount
    ] = await Promise.all([
      // Total de cofradías
      knex('cofradia').count('* as count').first(),
      
      // Total de cofrades
      knex('cofrades').count('* as count').first(),
      
      // Total de eventos
      knex('eventos').count('* as count').first(),
      
      // Total de reportes
      knex('reportes').count('* as count').first(),
      
      // Total de participantes
      knex('participantes').count('* as count').first(),
      
      // Total de bordadurías
      knex('bordadurias').count('* as count').first(),
      
      // Total de usuarios localizadores (excluyendo admin)
      knex('usuarios')
        .where('role', 'localizador')
        .count('* as count')
        .first(),
      
      // Reportes pendientes
      knex('reportes')
        .where('estado', 'pendiente')
        .count('* as count')
        .first(),
      
      // Eventos próximos (próximos 30 días desde hoy)
      knex('eventos')
        .where('fecha', '>=', knex.raw('CURDATE()'))
        .where('fecha', '<=', knex.raw('DATE_ADD(CURDATE(), INTERVAL 30 DAY)'))
        .count('* as count')
        .first()
    ]);

    const estadisticas = {
      totalCofradias: parseInt(cofradiasCount?.count || 0),
      totalCofrades: parseInt(cofradesCount?.count || 0),
      totalEventos: parseInt(eventosCount?.count || 0),
      totalReportes: parseInt(reportesCount?.count || 0),
      totalParticipantes: parseInt(participantesCount?.count || 0),
      totalBordadurias: parseInt(bordaduriasCount?.count || 0),
      totalLocalizadores: parseInt(localizadoresCount?.count || 0),
      reportesPendientes: parseInt(reportesPendientesCount?.count || 0),
      eventosProximos: parseInt(eventosProximosCount?.count || 0)
    };

    res.json(estadisticas);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas', message: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
