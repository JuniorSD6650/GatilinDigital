require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const knex = require('knex')(require('./knexfile.js'));

// Crea el administrador inicial. La contraseña se toma de ADMIN_PASSWORD;
// si no está definida se genera una aleatoria y se muestra UNA sola vez.
const createAdmin = async () => {
  try {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const generada = !process.env.ADMIN_PASSWORD;
    const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url');

    if (password.length < 8) {
      console.error('ADMIN_PASSWORD debe tener al menos 8 caracteres.');
      process.exitCode = 1;
      return;
    }

    const existingAdmin = await knex('usuarios').where({ username }).first();
    if (existingAdmin) {
      console.log('El usuario administrador ya existe.');
      return;
    }

    await knex('usuarios').insert({
      username,
      password: await bcrypt.hash(password, 10),
      role: 'admin',
    });

    console.log('Administrador creado exitosamente');
    console.log(`  Usuario:    ${username}`);
    if (generada) {
      console.log(`  Contraseña: ${password}`);
      console.log('  (Guárdala ahora: no se volverá a mostrar. Para fijarla tú, define ADMIN_PASSWORD en .env)');
    } else {
      console.log('  Contraseña: la definida en ADMIN_PASSWORD');
    }
  } catch (error) {
    console.error('Error creando el administrador:', error.message);
    process.exitCode = 1;
  } finally {
    await knex.destroy();
  }
};

createAdmin();
