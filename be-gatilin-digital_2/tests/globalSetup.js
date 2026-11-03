// Prepara una base de datos de pruebas limpia (NUNCA la de desarrollo).
process.env.NODE_ENV = 'test';
require('dotenv').config();
const knexLib = require('knex');

module.exports = async () => {
  const config = require('../knexfile');
  const dbName = config.connection.database;
  if (!/test/i.test(dbName)) throw new Error(`Por seguridad, la BD de pruebas debe contener "test" en su nombre (actual: ${dbName})`);

  const admin = knexLib({ client: 'mysql2', connection: { ...config.connection, database: undefined } });
  await admin.raw(`DROP DATABASE IF EXISTS \`${dbName}\``);
  await admin.raw(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await admin.destroy();

  const db = knexLib(config);
  await db.migrate.latest();
  await db.seed.run({ specific: '01_organizacion.js' });
  await db.seed.run({ specific: '02_cofradias.js' });
  await db.destroy();
};
