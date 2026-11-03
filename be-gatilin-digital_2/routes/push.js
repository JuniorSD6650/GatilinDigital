// Suscripción a notificaciones push (público)
const express = require('express');

const knex = require('../lib/db');
const push = require('../lib/push');
const limits = require('../middleware/rateLimits');
const { requireAdmin } = require('../middleware/auth');
const { z, validate } = require('../middleware/validate');
const { asyncH } = require('../lib/http');

const router = express.Router();

const subSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url().max(500).refine((u) => u.startsWith('https://'), 'El endpoint debe ser https'),
    keys: z.object({ p256dh: z.string().min(10).max(255), auth: z.string().min(4).max(255) }),
  }),
  favoritas: z.array(z.coerce.number().int().positive()).max(100).default([]),
  avisos_eventos: z.boolean().default(true),
});

router.get('/public-key', (req, res) => {
  res.json({ habilitado: push.habilitado, publicKey: push.habilitado ? push.publicKey : null });
});

// Crea o actualiza la suscripción (y sus cofradías favoritas)
router.post('/subscribe', limits.push, validate(subSchema), asyncH(async (req, res) => {
  if (!push.habilitado) return res.status(503).json({ error: 'Las notificaciones no están disponibles.', message: 'Las notificaciones no están disponibles.' });
  const { subscription, favoritas, avisos_eventos } = req.body;
  const datos = {
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
    favoritas: JSON.stringify([...new Set(favoritas)]),
    avisos_eventos,
    updated_at: knex.fn.now(),
  };
  await knex('push_subscriptions').insert(datos).onConflict('endpoint').merge();
  res.json({ message: 'Notificaciones activadas' });
}));

router.post('/unsubscribe', limits.push, validate(z.object({ endpoint: z.string().url().max(500) })), asyncH(async (req, res) => {
  await knex('push_subscriptions').where('endpoint', req.body.endpoint).del();
  res.json({ message: 'Notificaciones desactivadas' });
}));

// Admin: cuántos suscriptores hay y envío de prueba a los seguidores de una cofradía
router.get('/stats', requireAdmin, asyncH(async (req, res) => {
  const [{ n }] = await knex('push_subscriptions').count({ n: '*' });
  res.json({ habilitado: push.habilitado, suscriptores: Number(n) });
}));

module.exports = router;
