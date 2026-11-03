require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// El backend NO arranca sin un secreto JWT propio: con un valor por defecto
// cualquiera podría firmar tokens de administrador.
const PLACEHOLDERS = ['secretkey', 'cambia_esto_por_un_secreto_largo'];
const jwtSecret = isTest ? 'test-secret-solo-para-pruebas-1234567890' : process.env.JWT_SECRET || '';

if (!jwtSecret || jwtSecret.length < 16) {
  throw new Error('JWT_SECRET no está definido o es muy corto (mínimo 16 caracteres). Configúralo en .env');
}
if (isProd && PLACEHOLDERS.includes(jwtSecret)) {
  throw new Error('JWT_SECRET usa el valor de ejemplo. Define un secreto propio antes de publicar.');
}

const port = Number(process.env.PORT) || 5000;
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

module.exports = {
  isProd,
  isTest,
  port,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigins,
  // URL pública del frontend (enlaces para compartir y redirecciones)
  frontendUrl: (process.env.FRONTEND_URL || corsOrigins[0]).replace(/\/$/, ''),
  // URL pública de este backend (imágenes en vistas previas de WhatsApp)
  publicApiUrl: (process.env.PUBLIC_API_URL || `http://localhost:${port}`).replace(/\/$/, ''),
  // Detrás de un proxy (Nginx, cPanel...) la IP real llega en X-Forwarded-For
  trustProxy: process.env.TRUST_PROXY ?? (isProd ? '1' : '0'),
  vapid: {
    publicKey: process.env.VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || '',
    subject: process.env.VAPID_SUBJECT || 'mailto:admin@gatilin.digital',
  },
  voteSalt: process.env.VOTE_SALT || jwtSecret,
  // Votos máximos por IP, por cofradía y por día (redes compartidas: familias, wifi público)
  votosPorIpDia: Number(process.env.VOTOS_POR_IP_DIA) || 15,
  timezone: process.env.TZ_FESTIVIDAD || 'America/Lima',
};
