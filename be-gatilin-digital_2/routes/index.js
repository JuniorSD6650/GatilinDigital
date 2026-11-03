const express = require('express');
const knex = require('../lib/db');

const router = express.Router();

router.use('/usuarios', require('./usuarios'));
router.use('/bordadurias', require('./bordadurias'));
router.use('/participantes', require('./participantes'));
router.use('/organizacion', require('./organizacion'));
router.use('/cofradia', require('./cofradia'));
router.use('/cofrades', require('./cofrades'));
router.use('/eventos', require('./eventos'));
router.use('/reportes', require('./reportes'));
router.use('/festival', require('./festival'));
router.use('/estadisticas', require('./estadisticas'));
router.use('/auditoria', require('./auditoria'));
router.use('/push', require('./push'));

// Estado del servicio (monitoreo)
router.get('/health', async (req, res) => {
  try {
    await knex.raw('select 1');
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
});

module.exports = router;
