const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { format } = require('date-fns');

const knex = require('../lib/db');
const config = require('../lib/config');
const { protect, requireAdmin } = require('../middleware/auth');
const { excelUpload } = require('../middleware/upload');
const limits = require('../middleware/rateLimits');
const { z, validate, enteroOpc, paginacionQuery } = require('../middleware/validate');
const { notFound, badRequest, asyncH, paginate, searchIn } = require('../lib/http');
const { audit } = require('../lib/audit');
const { sendTemplate, bulkImport } = require('../lib/excel');

const router = express.Router();

const USUARIO_COLUMNS = [
  { header: 'Username', key: 'username', width: 30 },
  { header: 'Password', key: 'password', width: 30 },
  { header: 'Cofradía ID', key: 'cofradia_id', width: 20 },
];

// ---- Validación ----
const username = z.preprocess((v) => (v == null ? v : String(v).trim()),
  z.string({ error: 'Es obligatorio' }).min(3, 'Mínimo 3 caracteres').max(50, 'Máximo 50 caracteres')
    .regex(/^[A-Za-z0-9._-]+$/, 'Solo letras, números, punto, guion y guion bajo'));
const password = z.preprocess((v) => (v == null ? v : String(v)),
  z.string({ error: 'Es obligatoria' }).min(8, 'La contraseña debe tener al menos 8 caracteres').max(128));

const loginSchema = z.object({
  username: z.string({ error: 'Es obligatorio' }).trim().min(1, 'Es obligatorio').max(255),
  password: z.string({ error: 'Es obligatoria' }).min(1, 'Es obligatoria').max(128),
});
const crearSchema = z.object({ username, password, cofradia_id: enteroOpc });
const editarSchema = z.object({
  username: username.optional(),
  password: z.preprocess((v) => (v === '' ? undefined : v), password.optional()),
  role: z.enum(['admin', 'localizador']).optional(),
  cofradia_id: enteroOpc.optional(),
});
const importSchema = z.object({ username, password, cofradia_id: enteroOpc });

const existeCofradia = async (id) => !id || Boolean(await knex('cofradia').where('id', id).first('id'));

// Hash ficticio para que un usuario inexistente tarde lo mismo que uno real (evita adivinar usuarios)
const HASH_FICTICIO = bcrypt.hashSync('contraseña-ficticia-para-tiempo-constante', 10);

// =====================================================================
// LOGIN (público, con límite de intentos)
// =====================================================================
router.post('/login', limits.login, validate(loginSchema), asyncH(async (req, res) => {
  const { username: user, password: pass } = req.body;

  const usuario = await knex('usuarios')
    .select('usuarios.id', 'usuarios.username', 'usuarios.password', 'usuarios.role', 'usuarios.cofradia_id', 'cofradia.nickname_cofradia')
    .leftJoin('cofradia', 'usuarios.cofradia_id', 'cofradia.id')
    .where('usuarios.username', user)
    .first();

  const ok = await bcrypt.compare(pass, usuario?.password || HASH_FICTICIO);
  if (!usuario || !ok) {
    await audit({ ip: req.ip, user: { username: user } }, 'login_fallido', 'usuario', usuario?.id ?? null);
    // Mismo mensaje para usuario inexistente y contraseña incorrecta
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.', message: 'Usuario o contraseña incorrectos.' });
  }

  const payload = {
    id: usuario.id,
    username: usuario.username,
    role: usuario.role,
    cofradiaId: usuario.cofradia_id,
    cofradia_nombre: usuario.nickname_cofradia,
  };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  await audit({ ip: req.ip, user: payload }, 'login', 'usuario', usuario.id);

  res.json({ message: 'Login exitoso', token });
}));

// Perfil del usuario autenticado
router.get('/perfil', protect, asyncH(async (req, res) => {
  const user = await knex('usuarios')
    .select('usuarios.id', 'usuarios.username', 'usuarios.role', 'usuarios.cofradia_id', 'cofradia.nickname_cofradia')
    .leftJoin('cofradia', 'usuarios.cofradia_id', 'cofradia.id')
    .where('usuarios.id', req.user.id)
    .first();
  if (!user) return notFound(res, 'Usuario no encontrado.');
  res.json(user);
}));

// =====================================================================
// GESTIÓN (solo admin)
// =====================================================================
router.use(requireAdmin);

router.get('/template', asyncH(async (req, res) => {
  await sendTemplate(res, {
    nombreHoja: 'Plantilla Usuarios',
    filename: 'Plantilla_Usuarios.xlsx',
    columns: USUARIO_COLUMNS,
    ejemplo: { username: 'localizador.ejemplo', password: 'ClaveSegura123', cofradia_id: 1 },
  });
}));

// Localizadores
router.get('/', validate(paginacionQuery, 'query'), asyncH(async (req, res) => {
  let query = knex('usuarios')
    .select('usuarios.id', 'usuarios.username', 'usuarios.role', 'usuarios.created_at', 'usuarios.cofradia_id', 'cofradia.nickname_cofradia')
    .leftJoin('cofradia', 'usuarios.cofradia_id', 'cofradia.id')
    .where('usuarios.role', 'localizador')
    .orderBy('usuarios.id', 'desc');
  query = searchIn(query, req.query.q, ['usuarios.username', 'cofradia.nickname_cofradia']);

  res.json(await paginate(req, query, {
    idColumn: 'usuarios.id',
    map: (u) => ({ ...u, created_at: u.created_at ? format(new Date(u.created_at), 'dd/MM/yyyy HH:mm:ss') : null }),
  }));
}));

// Datos del administrador (sin contraseña)
router.get('/admin', asyncH(async (req, res) => {
  const admin = await knex('usuarios').select('id', 'username', 'role', 'created_at').where('role', 'admin').first();
  if (!admin) return notFound(res, 'Administrador no encontrado.');
  res.json(admin);
}));

router.post('/bulk-upload', excelUpload, (req, res) =>
  bulkImport(req, res, {
    entidad: 'usuario',
    columns: USUARIO_COLUMNS,
    schema: importSchema,
    check: async (rec) => ((await existeCofradia(rec.cofradia_id)) ? null : `La cofradía ${rec.cofradia_id} no existe.`),
    insert: async (rec, db) => {
      await db('usuarios').insert({
        username: rec.username,
        password: await bcrypt.hash(rec.password, 10), // antes se guardaba en texto plano
        role: 'localizador',
        cofradia_id: rec.cofradia_id,
        created_at: db.fn.now(),
      });
    },
  })
);

router.post('/', validate(crearSchema), asyncH(async (req, res) => {
  const { username: user, password: pass, cofradia_id } = req.body;
  if (!(await existeCofradia(cofradia_id))) return badRequest(res, 'La cofradía seleccionada no existe.');
  if (await knex('usuarios').where('username', user).first('id')) return badRequest(res, 'Ese nombre de usuario ya existe.');

  const [id] = await knex('usuarios').insert({
    username: user,
    password: await bcrypt.hash(pass, 10),
    role: 'localizador',
    cofradia_id: cofradia_id || null,
    created_at: knex.fn.now(),
  });
  await audit(req, 'crear', 'usuario', id, { username: user, cofradia_id });
  res.status(201).json({ message: 'Usuario creado exitosamente', userId: id });
}));

router.put('/:id', validate(editarSchema), asyncH(async (req, res) => {
  const { id } = req.params;
  const user = await knex('usuarios').where('id', id).first();
  if (!user) return notFound(res, 'Usuario no encontrado.');

  const { username: nuevoNombre, password: pass, role, cofradia_id } = req.body;
  const updates = {};
  if (nuevoNombre && nuevoNombre !== user.username) {
    if (await knex('usuarios').where('username', nuevoNombre).whereNot('id', id).first('id')) {
      return badRequest(res, 'Ese nombre de usuario ya existe.');
    }
    updates.username = nuevoNombre;
  }
  if (role && role !== user.role) {
    if (Number(id) === Number(req.user.id)) return badRequest(res, 'No puedes cambiar tu propio rol.');
    updates.role = role;
  }
  if (cofradia_id !== undefined) {
    if (!(await existeCofradia(cofradia_id))) return badRequest(res, 'La cofradía seleccionada no existe.');
    updates.cofradia_id = cofradia_id;
  }
  if (pass) updates.password = await bcrypt.hash(pass, 10);
  if (Object.keys(updates).length === 0) return res.json({ message: 'Sin cambios' });

  await knex('usuarios').where('id', id).update(updates);
  await audit(req, 'editar', 'usuario', id, {
    campos: Object.keys(updates).map((k) => (k === 'password' ? 'contraseña' : k)),
    ...(updates.role ? { role: [user.role, updates.role] } : {}),
  });
  res.json({ message: 'Usuario actualizado exitosamente' });
}));

router.delete('/:id', asyncH(async (req, res) => {
  const { id } = req.params;
  const user = await knex('usuarios').where('id', id).first();
  if (!user) return notFound(res, 'Usuario no encontrado.');
  if (Number(id) === Number(req.user.id)) return badRequest(res, 'No puedes eliminar tu propio usuario.');
  if (user.role === 'admin') {
    const [{ n }] = await knex('usuarios').where('role', 'admin').count({ n: '*' });
    if (Number(n) <= 1) return badRequest(res, 'No se puede eliminar el único administrador.');
  }
  await knex('usuarios').where('id', id).del();
  await audit(req, 'eliminar', 'usuario', id, { username: user.username });
  res.json({ message: 'Usuario eliminado exitosamente.' });
}));

module.exports = router;
