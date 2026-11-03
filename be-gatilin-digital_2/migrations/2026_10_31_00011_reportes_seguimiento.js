// Seguimiento de reportes: fechas, quién lo atendió, notas internas e historial de estados.
exports.up = async function (knex) {
  await knex.schema.alterTable('reportes', (table) => {
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').nullable();
    table.integer('atendido_por').unsigned().nullable().references('id').inTable('usuarios').onDelete('SET NULL');
    table.text('notas_internas').nullable();
    table.index(['estado']);
  });

  await knex.schema.createTable('reportes_historial', (table) => {
    table.increments('id').primary().unsigned();
    table.integer('reporte_id').unsigned().notNullable().references('id').inTable('reportes').onDelete('CASCADE');
    table.string('estado_anterior', 50).nullable();
    table.string('estado_nuevo', 50).notNullable();
    table.text('nota').nullable();
    table.integer('usuario_id').unsigned().nullable().references('id').inTable('usuarios').onDelete('SET NULL');
    table.string('username', 255).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['reporte_id']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('reportes_historial');
  await knex.schema.alterTable('reportes', (table) => {
    table.dropForeign(['atendido_por']);
    table.dropIndex(['estado']);
    table.dropColumns('created_at', 'updated_at', 'atendido_por', 'notas_internas');
  });
};
