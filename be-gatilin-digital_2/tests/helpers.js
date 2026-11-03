const bcrypt = require('bcryptjs');
const request = require('supertest');
const knex = require('../lib/db');
const app = require('../app');

const crearUsuario = async (username, password, role, cofradia_id = null) => {
  await knex('usuarios').where({ username }).del();
  const [id] = await knex('usuarios').insert({ username, password: await bcrypt.hash(password, 4), role, cofradia_id });
  return id;
};

const login = async (username, password) => {
  const res = await request(app).post('/api/usuarios/login').send({ username, password });
  return res.body.token;
};

module.exports = { app, knex, request, crearUsuario, login };
