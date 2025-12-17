exports.up = function(knex) {
  return knex.schema.createTable('cofradia', function(table) {
    table.increments('id').primary().unsigned(); 
    table.string('nickname_cofradia', 255).notNullable();
    table.string('nombre_cofradia', 255).notNullable();
    table.date('fecha_fundacion').nullable();
    table.string('sede_local', 255).nullable();
    table.string('dni_representante', 20).nullable();
    table.string('nombre_representante', 255).nullable();
    table.string('cel_representante', 15).nullable();
    table.string('distrito', 255).nullable();
    table.string('color', 20).defaultTo('#000');
    table.text('descripcion').nullable();
    table.string('ubicacion_link', 255).nullable();
    table.timestamp('ubicacion_link_actualizado').nullable(); 
    table.integer('votos').defaultTo(0).unsigned();
    
    table.integer('organizacion_id').unsigned().references('id').inTable('organizacion').onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('cofradia');
};
