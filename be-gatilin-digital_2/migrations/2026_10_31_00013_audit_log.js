// Bitácora de auditoría de cambios hechos desde el panel y el localizador.
exports.up = function (knex) {
  return knex.schema.createTable('audit_log', (table) => {
    table.increments('id').primary().unsigned();
    table.integer('usuario_id').unsigned().nullable(); // sin FK: el registro debe sobrevivir al usuario
    table.string('username', 255).nullable();
    table.string('accion', 50).notNullable();
    table.string('entidad', 50).notNullable();
    table.string('entidad_id', 50).nullable();
    table.text('detalle').nullable();
    table.string('ip', 64).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['entidad', 'entidad_id']);
    table.index(['created_at']);
    table.index(['usuario_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('audit_log');
};
