// Aplicación Express (sin levantar el servidor: así se puede probar con supertest).
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./lib/config');
const limits = require('./middleware/rateLimits');
const routes = require('./routes');
const shareRoutes = require('./routes/share');
const frontend = require('./lib/frontend');

const app = express();

app.disable('x-powered-by');
// Necesario para leer la IP real detrás de un proxy (rate limit, votos, bitácora)
app.set('trust proxy', /^\d+$/.test(String(config.trustProxy)) ? Number(config.trustProxy) : config.trustProxy);

// Cabeceras de seguridad. Las imágenes pueden servirse a otro origen (frontend
// en desarrollo), por eso la política de recursos es "cross-origin".
// La CSP estricta solo aplica a la API (abajo): la web necesita sus scripts.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
    // OpenStreetMap exige un Referer válido para servir las teselas del mapa
    // (con "no-referrer", el valor por defecto de helmet, bloquea la app).
    // Este valor solo envía el dominio a otros sitios, nunca la ruta completa.
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);
// La API solo devuelve JSON/archivos: no necesita cargar nada
const cspApi = helmet.contentSecurityPolicy({ useDefaults: false, directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } });
app.use(['/api', '/uploads'], cspApi);

app.use(
  cors({
    origin: (origin, cb) => {
      // Peticiones sin Origin (curl, apps, mismo origen) se permiten; CORS solo aplica a navegadores
      if (!origin || config.corsOrigins.includes(origin.replace(/\/$/, ''))) return cb(null, true);
      return cb(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Id'],
    exposedHeaders: ['Content-Disposition'],
    maxAge: 600,
  })
);

// Archivos subidos (solo lectura, sin listados de directorio)
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'public', 'uploads'), {
    index: false,
    dotfiles: 'deny',
    maxAge: '7d',
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  })
);

app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: false, limit: '200kb' }));

// Vistas previas para compartir (WhatsApp/Facebook leen las etiquetas Open Graph)
app.use('/share', limits.general, shareRoutes);

app.use('/api', limits.general, routes);

// 404 de la API
app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada', message: 'Ruta no encontrada' }));

// Web (frontend Next.js exportado): mismo servidor, puerto y dominio que la API
if (config.frontendDir) app.use(frontend(config.frontendDir));

// Manejador global de errores: nunca expone detalles internos al cliente
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'La petición es demasiado grande.', message: 'La petición es demasiado grande.' });
  }
  // PostgreSQL rechaza valores con formato inválido (p. ej. /api/cofradia/abc, fechas imposibles)
  if (['22P02', '22003', '22007', '22008'].includes(err.code)) {
    return res.status(400).json({ error: 'Parámetro inválido.', message: 'Parámetro inválido.' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido.', message: 'JSON inválido.' });
  }
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`, err.stack || err);
  const status = err.status && err.status < 500 ? err.status : 500;
  const message = status < 500 && err.expose !== false && err.message ? err.message : 'Ocurrió un error inesperado';
  res.status(status).json({ error: message, message });
});

module.exports = app;
