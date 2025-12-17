exports.up = function(knex) {
  return knex.schema.createTable('cofrades', function(table) {
    table.increments('id').primary().unsigned();
    table.string('dni_cofrade', 20).notNullable(); 
    table.string('nombres_apellidos', 255).notNullable();
    table.string('celular', 15).nullable(); 
    table.string('personaje_cofradia', 255).defaultTo('ninguno'); 
    table.string('cargo_cofrade', 255).defaultTo('ninguno'); 
    table.string('ruta_foto', 255).nullable();
    
    table.integer('anio').notNullable().defaultTo(new Date().getFullYear());

    table.integer('cod_cofradia').unsigned().references('id').inTable('cofradia').onDelete('CASCADE');

    table.unique(['dni_cofrade', 'cod_cofradia', 'anio']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('cofrades');
};