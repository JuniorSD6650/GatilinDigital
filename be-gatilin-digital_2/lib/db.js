// Una sola instancia de Knex (un pool de conexiones) para toda la aplicación.
const config = require('../knexfile');
const knex = require('knex')(config);

module.exports = knex;
