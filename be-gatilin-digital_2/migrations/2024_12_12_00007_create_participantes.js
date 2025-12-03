exports.up = function (knex) {
  return knex.schema.createTable('participantes', function (table) {
    table.increments('id').primary().unsigned();
    table.string('nombre', 255).notNullable();
    table.string('dni', 20).notNullable().unique();
    table.string('email', 255).nullable();
    table.string('telefono', 15).nullable();
    table.date('fecha_registro').notNullable();
    table.string('estado', 50).defaultTo('pendiente');
    table.text('comentario').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('participantes');
};
