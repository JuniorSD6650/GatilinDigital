const { vaciarTablas, ajustarSecuencia } = require('../lib/dbUtil');
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Limpiamos la tabla usuarios
  await vaciarTablas(knex, ['usuarios']);

  console.log('🌱 Sembrando Usuarios...');

  const usuarios = [
    { id: 1, username: 'JuventudSanAndres', password: 'N3eYWx5zne', role: 'localizador', cofradia_id: 1 },
  ];

  // Las contraseñas se guardan siempre con hash (bcrypt): el login no acepta texto plano
  await knex('usuarios').insert(await Promise.all(usuarios.map(async u => ({
    id: u.id,
    username: u.username,
    password: await bcrypt.hash(u.password, 10),
    role: u.role,
    created_at: new Date(), 
    cofradia_id: u.cofradia_id
  }))));

  await ajustarSecuencia(knex, 'usuarios');
  console.log('✅ Usuarios sembrados.');
};