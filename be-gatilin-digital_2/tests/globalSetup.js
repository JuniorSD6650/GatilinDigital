// Prepara una base de datos de pruebas limpia (NUNCA la de desarrollo).
process.env.NODE_ENV = 'test';
require('dotenv').config();
const knexLib = require('knex');

module.exports = async () => {
  const config = require('../knexfile');
  const url = new URL(config.connection.connectionString);
  const dbName = decodeURIComponent(url.pathname.slice(1));
  if (!/test/i.test(dbName)) throw new Error(`Por seguridad, la BD de pruebas debe contener "test" en su nombre (actual: ${dbName})`);

  const mantenimiento = new URL(url);
  mantenimiento.pathname = '/postgres';
  const admin = knexLib({ client: 'pg', connection: { connectionString: mantenimiento.toString() } });
  await admin.raw('DROP DATABASE IF EXISTS ?? WITH (FORCE)', [dbName]);
  await admin.raw("CREATE DATABASE ?? ENCODING 'UTF8' TEMPLATE template0", [dbName]);
  await admin.destroy();

  const db = knexLib(config);
  await db.migrate.latest();
  await db.seed.run({ specific: '01_organizacion.js' });
  await db.seed.run({ specific: '02_cofradias.js' });
  await db.destroy();
};
