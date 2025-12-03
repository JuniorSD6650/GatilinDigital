exports.up = function (knex) {
  return knex.schema.createTable('reportes', function (table) {
    table.increments('id').primary().unsigned();
    table.text('nombre_reportante').notNullable();
    table.text('descripcion').notNullable();
    table.string('numero_contacto', 15).nullable();
    table.string('ruta_foto', 255).nullable();
    table.string('estado', 50).defaultTo('pendiente');

    table.integer('cofradia_id').unsigned().references('id').inTable('cofradia').onDelete('CASCADE');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('reportes');
};
