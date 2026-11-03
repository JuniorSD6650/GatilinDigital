require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

module.exports = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: isTest ? process.env.DB_NAME_TEST || 'gatilin_test' : process.env.DB_NAME || 'gatilin_db',
    port: Number(process.env.DB_PORT) || 3306,
  },
  pool: { min: 0, max: 10 },
  migrations: {
    directory: './migrations'
  },
  seeds: {
    directory: './seeds'
  }
};
