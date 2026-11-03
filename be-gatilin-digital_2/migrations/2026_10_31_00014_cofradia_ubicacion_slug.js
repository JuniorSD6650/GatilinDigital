// Ubicación GPS en vivo (lat/lng) y slug para la página pública de cada cofradía.
const { slugify } = require('../lib/slug');

exports.up = async function (knex) {
  await knex.schema.alterTable('cofradia', (table) => {
    table.string('slug', 140).nullable();
    table.decimal('lat', 10, 7).nullable();
    table.decimal('lng', 10, 7).nullable();
    table.integer('ubicacion_precision').unsigned().nullable(); // metros
    table.boolean('compartiendo').notNullable().defaultTo(false);
  });

  // Rellenar slugs de las cofradías existentes
  const filas = await knex('cofradia').select('id', 'nickname_cofradia');
  const usados = new Set();
  for (const f of filas) {
    const base = slugify(f.nickname_cofradia);
    let slug = base;
    for (let n = 2; usados.has(slug); n++) slug = `${base}-${n}`;
    usados.add(slug);
    await knex('cofradia').where('id', f.id).update({ slug });
  }

  await knex.schema.alterTable('cofradia', (table) => {
    table.unique(['slug']);
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('cofradia', (table) => {
    table.dropUnique(['slug']);
    table.dropColumns('slug', 'lat', 'lng', 'ubicacion_precision', 'compartiendo');
  });
};
