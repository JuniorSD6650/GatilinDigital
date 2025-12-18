/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('festival_eventos', function(table) {
    table.increments('id').primary().unsigned();
    table.date('fecha').notNullable();
    table.time('hora_inicio').notNullable(); // Para ordenar (ej: 17:00:00)
    table.string('hora_texto', 50).notNullable(); // Para mostrar (ej: "5:00PM - 5:30PM")
    table.string('nombre_cofradia', 255).notNullable();
    table.string('lugar', 255).defaultTo('Plaza de Armas de Huánuco');
    table.string('tipo_actividad', 100).defaultTo('Presentación'); // Víspera, Presentación, Despedida
    table.string('estado', 50).defaultTo('programado'); // programado, en_curso, finalizado
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('festival_eventos');
};