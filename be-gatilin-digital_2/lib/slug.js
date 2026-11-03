// Genera slugs legibles para URLs: "Negritos Niño Jesús" -> "negritos-nino-jesus"
const slugify = (texto) =>
  String(texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'cofradia';

/** Devuelve un slug único en la tabla (añade -2, -3... si ya existe) */
const slugUnico = async (knex, tabla, texto, excluirId = null) => {
  const base = slugify(texto);
  let slug = base;
  for (let n = 2; ; n++) {
    const q = knex(tabla).where('slug', slug).first('id');
    if (excluirId) q.whereNot('id', excluirId);
    if (!(await q)) return slug;
    slug = `${base}-${n}`;
  }
};

module.exports = { slugify, slugUnico };
