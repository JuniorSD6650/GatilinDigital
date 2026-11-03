// Límites de peticiones (protección contra abuso y fuerza bruta).
const { rateLimit } = require('express-rate-limit');
const { isTest } = require('../lib/config');

const crear = (opts) =>
  rateLimit({
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => isTest && !process.env.TEST_RATE_LIMIT,
    handler: (req, res, next, options) =>
      res.status(options.statusCode).json({ error: options.message, message: options.message }),
    ...opts,
  });

module.exports = {
  // Toda la API
  general: crear({ windowMs: 60 * 1000, limit: 300, message: 'Demasiadas peticiones. Intenta de nuevo en un minuto.' }),
  // Login: 10 intentos fallidos cada 15 minutos por IP
  login: crear({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    message: 'Demasiados intentos de inicio de sesión. Espera 15 minutos.',
  }),
  // Formularios públicos (reportes, registro de participantes)
  formulario: crear({ windowMs: 10 * 60 * 1000, limit: 5, message: 'Has enviado demasiados formularios. Intenta en unos minutos.' }),
  // Votos
  voto: crear({ windowMs: 60 * 60 * 1000, limit: 60, message: 'Demasiados votos desde esta conexión. Intenta más tarde.' }),
  // Actualizaciones de ubicación del localizador (una cada ~10 s es suficiente)
  ubicacion: crear({ windowMs: 60 * 1000, limit: 20, message: 'Estás enviando la ubicación demasiado seguido.' }),
  // Suscripciones push
  push: crear({ windowMs: 10 * 60 * 1000, limit: 30, message: 'Demasiadas solicitudes de notificaciones.' }),
};
