// Suscripciones a notificaciones push (Web Push) y avisos ya enviados.
exports.up = async function (knex) {
  await knex.schema.createTable('push_subscriptions', (table) => {
    table.increments('id').primary().unsigned();
    table.string('endpoint', 500).notNullable().unique();
    table.string('p256dh', 255).notNullable();
    table.string('auth', 255).notNullable();
    table.text('favoritas').nullable(); // JSON: ids de cofradías favoritas
    table.boolean('avisos_eventos').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').nullable();
  });

  // Evita enviar dos veces el mismo recordatorio de evento
  await knex.schema.createTable('push_enviados', (table) => {
    table.increments('id').primary().unsigned();
    table.string('clave', 120).notNullable().unique();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('push_enviados');
  await knex.schema.dropTableIfExists('push_subscriptions');
};
