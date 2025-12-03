exports.up = function(knex) {
    return knex.schema.createTable('bordadurias', function(table) {
      table.increments('id').primary().unsigned();
      table.string('ruc', 20).notNullable();
      table.string('razon_social', 255).notNullable();
      table.text('descripcion').nullable();
      table.string('direccion', 255).notNullable();
      table.string('web_fb', 255).nullable();
      table.string('representante', 255).notNullable();
      table.string('celular', 15).nullable();
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('bordadurias');
  };
  