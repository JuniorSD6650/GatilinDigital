/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpiamos la tabla usuarios
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('usuarios').truncate();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  console.log('🌱 Sembrando Usuarios...');

  const usuarios = [
    { id: 1, username: 'JuventudSanAndres', password: 'N3eYWx5zne', role: 'localizador', cofradia_id: 1 },
  ];

  await knex('usuarios').insert(usuarios.map(u => ({
    id: u.id,
    username: u.username,
    password: u.password,
    role: u.role,
    created_at: new Date(), 
    cofradia_id: u.cofradia_id
  })));

  console.log('✅ Usuarios sembrados.');
};