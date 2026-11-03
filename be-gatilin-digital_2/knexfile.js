require('dotenv').config();

// Conexión única: DATABASE_URL=postgresql://usuario:password@host:5432/base_datos
// Pruebas (npm test): DATABASE_URL_TEST, o la misma URL con la base "<nombre>_test".
const isTest = process.env.NODE_ENV === 'test';

const urlDePruebas = (url) => {
  if (process.env.DATABASE_URL_TEST) return process.env.DATABASE_URL_TEST;
  if (!url) return url;
  const u = new URL(url);
  u.pathname = `/${decodeURIComponent(u.pathname.slice(1) || 'gatilin')}_test`;
  return u.toString();
};

const connectionString = isTest ? urlDePruebas(process.env.DATABASE_URL) : process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL no está definida. Ejemplo: postgresql://usuario:password@localhost:5432/gatilin_db');
}

module.exports = {
  client: 'pg',
  connection: {
    connectionString,
    // DATABASE_SSL=true para proveedores que exigen SSL (no hace falta en la red interna de Coolify)
    ...(process.env.DATABASE_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
  },
  pool: { min: 0, max: 10 },
  migrations: {
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
};
