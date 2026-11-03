// Foto grupal de la cuadrilla: una por cofradía y por temporada (año).
// Reemplaza la necesidad de subir una foto por cada integrante.
exports.up = function (knex) {
  return knex.schema.createTable('fotos_cuadrilla', function (table) {
    table.increments('id').primary().unsigned();
    table.integer('cod_cofradia').unsigned().notNullable()
      .references('id').inTable('cofradia').onDelete('CASCADE');
    table.integer('anio').notNullable();
    table.string('ruta_foto', 255).notNullable();
    table.timestamp('actualizado').defaultTo(knex.fn.now());

    table.unique(['cod_cofradia', 'anio']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('fotos_cuadrilla');
};
