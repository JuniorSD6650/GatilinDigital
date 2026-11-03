// Votos individuales: un voto por dispositivo, por cofradía y por día.
// El contador cofradia.votos se mantiene como total acumulado (para el ranking).
exports.up = function (knex) {
  return knex.schema.createTable('votos', (table) => {
    table.increments('id').primary().unsigned();
    table.integer('cofradia_id').unsigned().notNullable().references('id').inTable('cofradia').onDelete('CASCADE');
    table.string('votante_hash', 64).notNullable(); // hash del identificador del dispositivo
    table.string('ip_hash', 64).notNullable();
    table.date('fecha').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.unique(['cofradia_id', 'votante_hash', 'fecha']);
    table.index(['cofradia_id', 'ip_hash', 'fecha']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('votos');
};
