// Convierte a bcrypt las contraseñas que quedaron en texto plano (semillas y
// cargas masivas antiguas). La contraseña de cada usuario NO cambia: solo se
// guarda de forma segura. Sin esto esos usuarios no podían iniciar sesión.
const bcrypt = require('bcryptjs');

exports.up = async function (knex) {
  const usuarios = await knex('usuarios').select('id', 'password');
  for (const u of usuarios) {
    if (u.password && !/^\$2[aby]\$\d{2}\$/.test(u.password)) {
      await knex('usuarios').where('id', u.id).update({ password: await bcrypt.hash(u.password, 10) });
    }
  }
};

// Irreversible a propósito: no se puede (ni se debe) recuperar el texto plano
exports.down = async function () {};
