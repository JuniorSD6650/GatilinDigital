exports.up = function (knex) {
  return knex.schema.createTable('eventos', function (table) {
    table.increments('id').primary().unsigned();
    table.date('fecha').notNullable();
    table.string('tipo_dia').defaultTo('Ninguno').notNullable();
    table.string('tipo_evento').defaultTo('ninguno').notNullable();
    table.time('hora').notNullable();
    table.string('direccion_actividad', 255).notNullable();
    table.string('oferente', 255).notNullable();
    table.string('tipo_oferente', 255).defaultTo('Oferente').notNullable();
    table.string('banda', 255).defaultTo('Ninguna').notNullable();

    table.integer('cod_cofradia').unsigned().references('id').inTable('cofradia').onDelete('CASCADE');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('eventos');
};
