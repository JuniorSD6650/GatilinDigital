require('dotenv').config();
const bcrypt = require('bcryptjs');
const knex = require('knex')(require('./knexfile.js'));

const createAdmin = async () => {
  try {
    const username = 'admin';
    const password = 'adminpassword';

    const existingAdmin = await knex('usuarios').where({ username }).first();
    if (existingAdmin) {
      console.log('El usuario administrador ya existe.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await knex('usuarios').insert({
      username: username,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Administrador creado exitosamente');
  } catch (error) {
    console.error('Error creando el administrador:', error);
  } finally {
    knex.destroy();
  }
};

createAdmin();
