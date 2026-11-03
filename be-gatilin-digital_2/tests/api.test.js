const path = require('path');
const { spawnSync } = require('child_process');
const ExcelJS = require('exceljs');
const sharp = require('sharp');
const { app, knex, request, crearUsuario, login } = require('./helpers');
const { coordsDesdeLink } = require('../lib/geo');

let adminToken;
let locToken; // localizador de la cofradía 1
const DEVICE_A = 'device-aaaaaaaaaaaaaaaa';
const DEVICE_B = 'device-bbbbbbbbbbbbbbbb';

beforeAll(async () => {
  await crearUsuario('admin_test', 'AdminClave123', 'admin');
  await crearUsuario('loc_test', 'LocClave1234', 'localizador', 1);
  adminToken = await login('admin_test', 'AdminClave123');
  locToken = await login('loc_test', 'LocClave1234');
});

afterAll(() => knex.destroy());

const auth = (t) => ({ Authorization: `Bearer ${t}` });

// ---------------------------------------------------------------------
describe('Configuración', () => {
  test('el servidor no arranca sin JWT_SECRET', () => {
    const r = spawnSync(process.execPath, ['-e', "require('./lib/config')"], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, NODE_ENV: 'development', JWT_SECRET: '' },
      encoding: 'utf8',
    });
    expect(r.status).not.toBe(0);
    expect(r.stderr).toMatch(/JWT_SECRET/);
  });

  test('health check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('cabeceras de seguridad (helmet)', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

// ---------------------------------------------------------------------
describe('Autenticación y permisos', () => {
  test('login correcto devuelve token', () => {
    expect(adminToken).toBeTruthy();
    expect(locToken).toBeTruthy();
  });

  test('usuario inexistente y contraseña incorrecta dan el mismo mensaje', async () => {
    const a = await request(app).post('/api/usuarios/login').send({ username: 'no_existe', password: 'x' });
    const b = await request(app).post('/api/usuarios/login').send({ username: 'admin_test', password: 'mala' });
    expect(a.status).toBe(401);
    expect(b.status).toBe(401);
    expect(a.body.message).toBe(b.body.message);
  });

  const rutasAdmin = [
    ['post', '/api/cofradia'],
    ['put', '/api/cofradia/1'],
    ['delete', '/api/cofradia/1'],
    ['post', '/api/cofradia/bulk-upload'],
    ['get', '/api/cofradia/template'],
    ['get', '/api/usuarios'],
    ['get', '/api/usuarios/admin'],
    ['put', '/api/usuarios/1'],
    ['delete', '/api/usuarios/1'],
    ['post', '/api/usuarios'],
    ['post', '/api/eventos'],
    ['put', '/api/eventos/1'],
    ['delete', '/api/eventos/1'],
    ['post', '/api/eventos/bulk-upload'],
    ['get', '/api/cofrades'],
    ['post', '/api/cofrades'],
    ['delete', '/api/cofrades/1'],
    ['post', '/api/bordadurias'],
    ['delete', '/api/bordadurias/1'],
    ['get', '/api/participantes'],
    ['delete', '/api/participantes/1'],
    ['get', '/api/reportes'],
    ['put', '/api/reportes/1'],
    ['delete', '/api/reportes/1'],
    ['post', '/api/organizacion'],
    ['get', '/api/estadisticas'],
    ['get', '/api/auditoria'],
  ];

  test.each(rutasAdmin)('%s %s sin token → 401', async (method, url) => {
    const res = await request(app)[method](url).send({});
    expect(res.status).toBe(401);
  });

  test.each(rutasAdmin)('%s %s con token de localizador → 403', async (method, url) => {
    const res = await request(app)[method](url).set(auth(locToken)).send({});
    expect(res.status).toBe(403);
  });

  test('un token con firma falsa es rechazado', async () => {
    const jwt = require('jsonwebtoken');
    const falso = jwt.sign({ id: 1, role: 'admin' }, 'secretkey');
    const res = await request(app).get('/api/usuarios').set(auth(falso));
    expect(res.status).toBe(401);
  });

  test('GET /usuarios/admin nunca devuelve la contraseña', async () => {
    const res = await request(app).get('/api/usuarios/admin').set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.password).toBeUndefined();
  });

  test('crear usuario guarda la contraseña con hash', async () => {
    const res = await request(app).post('/api/usuarios').set(auth(adminToken))
      .send({ username: 'nuevo.loc', password: 'ClaveSegura99', cofradia_id: 2 });
    expect(res.status).toBe(201);
    const u = await knex('usuarios').where('username', 'nuevo.loc').first();
    expect(u.password).not.toBe('ClaveSegura99');
    expect(u.password).toMatch(/^\$2[aby]\$/);
    expect(u.role).toBe('localizador');
  });

  test('rol inválido es rechazado', async () => {
    const u = await knex('usuarios').where('username', 'nuevo.loc').first();
    const res = await request(app).put(`/api/usuarios/${u.id}`).set(auth(adminToken)).send({ role: 'superadmin' });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------
describe('Datos personales', () => {
  beforeAll(() => knex('cofradia').where('id', 1).update({ dni_representante: '12345678' }));

  test('el público no ve el DNI del representante', async () => {
    const res = await request(app).get('/api/cofradia/1');
    expect(res.status).toBe(200);
    expect(res.body.dni_representante).toBeUndefined();
  });

  test('el admin sí ve el DNI del representante', async () => {
    const res = await request(app).get('/api/cofradia/1').set(auth(adminToken));
    expect(res.body.dni_representante).toBe('12345678');
  });

  test('los errores no exponen detalles internos', async () => {
    const res = await request(app).get('/api/cofradia/abc').set(auth(adminToken));
    expect(res.body.details).toBeUndefined();
  });
});

// ---------------------------------------------------------------------
describe('Ubicación en vivo', () => {
  test('el localizador actualiza su cofradía con GPS', async () => {
    const res = await request(app).patch('/api/cofradia/mi-ubicacion').set(auth(locToken))
      .send({ lat: -9.9306, lng: -76.2422, precision: 12 });
    expect(res.status).toBe(200);
    const c = await knex('cofradia').where('id', 1).first();
    expect(Number(c.lat)).toBeCloseTo(-9.9306, 4);
    expect(Boolean(c.compartiendo)).toBe(true);
    expect(c.ubicacion_link).toContain('-9.930600,-76.242200');
  });

  test('el localizador NO puede tocar otra cofradía', async () => {
    const res = await request(app).patch('/api/cofradia/2/ubicacion').set(auth(locToken)).send({ lat: -9.9, lng: -76.2 });
    expect(res.status).toBe(403);
  });

  test('el localizador NO puede usar el PUT general', async () => {
    const res = await request(app).put('/api/cofradia/1').set(auth(locToken)).send({ nickname_cofradia: 'Hackeada' });
    expect(res.status).toBe(403);
  });

  test('coordenadas fuera de rango → 400', async () => {
    const res = await request(app).patch('/api/cofradia/mi-ubicacion').set(auth(locToken)).send({ lat: 200, lng: 0 });
    expect(res.status).toBe(400);
  });

  test('el mapa público incluye la cofradía en recorrido', async () => {
    const res = await request(app).get('/api/cofradia/mapa');
    const c = res.body.find((x) => x.id === 1);
    expect(c.compartiendo).toBe(true);
    expect(c.lat).toBeCloseTo(-9.9306, 4);
  });

  test('dejar de compartir', async () => {
    const res = await request(app).delete('/api/cofradia/mi-ubicacion').set(auth(locToken));
    expect(res.status).toBe(200);
    const c = await knex('cofradia').where('id', 1).first();
    expect(Boolean(c.compartiendo)).toBe(false);
  });

  test('extrae coordenadas de enlaces de Google Maps', () => {
    expect(coordsDesdeLink('https://www.google.com/maps/@-9.9306,-76.2422,17z')).toEqual({ lat: -9.9306, lng: -76.2422 });
    expect(coordsDesdeLink('https://maps.google.com/?q=-9.93,-76.24')).toEqual({ lat: -9.93, lng: -76.24 });
    expect(coordsDesdeLink('https://www.google.com/maps/place/X/data=!3d-9.92!4d-76.23')).toEqual({ lat: -9.92, lng: -76.23 });
    expect(coordsDesdeLink('https://maps.app.goo.gl/abc123')).toBeNull();
  });
});

// ---------------------------------------------------------------------
describe('Votos', () => {
  const votos = async () => (await knex('cofradia').where('id', 3).first('votos')).votos;

  test('sin identificador de dispositivo → 400', async () => {
    const res = await request(app).post('/api/cofradia/3/votar');
    expect(res.status).toBe(400);
  });

  test('un voto por dispositivo y por día', async () => {
    const antes = await votos();
    const r1 = await request(app).post('/api/cofradia/3/votar').set('X-Device-Id', DEVICE_A);
    expect(r1.status).toBe(200);
    expect(r1.body.votos).toBe(antes + 1);

    const r2 = await request(app).post('/api/cofradia/3/votar').set('X-Device-Id', DEVICE_A);
    expect(r2.status).toBe(409);
    expect(await votos()).toBe(antes + 1);

    const estado = await request(app).get('/api/cofradia/3/voto').set('X-Device-Id', DEVICE_A);
    expect(estado.body.yaVotaste).toBe(true);
  });

  test('otro dispositivo no puede quitar votos ajenos', async () => {
    const antes = await votos();
    const res = await request(app).delete('/api/cofradia/3/votar').set('X-Device-Id', DEVICE_B);
    expect(res.status).toBe(200);
    expect(await votos()).toBe(antes);
  });

  test('el mismo dispositivo puede quitar su voto una sola vez', async () => {
    const antes = await votos();
    await request(app).delete('/api/cofradia/3/votar').set('X-Device-Id', DEVICE_A);
    await request(app).delete('/api/cofradia/3/votar').set('X-Device-Id', DEVICE_A);
    expect(await votos()).toBe(antes - 1);
  });
});

// ---------------------------------------------------------------------
describe('Validación y eventos', () => {
  let eventoId;

  test('hora inválida → 400 con errores por campo', async () => {
    const res = await request(app).post('/api/eventos').set(auth(adminToken)).send({
      fecha: '2026-12-25', hora: '25:99', direccion_actividad: 'Jr. A', oferente: 'X', cod_cofradia: 1,
    });
    expect(res.status).toBe(400);
    expect(res.body.errores.some((e) => e.campo === 'hora')).toBe(true);
  });

  test('cofradía inexistente → 400', async () => {
    const res = await request(app).post('/api/eventos').set(auth(adminToken)).send({
      fecha: '2026-12-25', hora: '17:00', direccion_actividad: 'Jr. A', oferente: 'X', cod_cofradia: 99999,
    });
    expect(res.status).toBe(400);
  });

  test('crear evento válido (acepta DD/MM/AAAA y HH:MM)', async () => {
    const res = await request(app).post('/api/eventos').set(auth(adminToken)).send({
      fecha: '25/12/2026', hora: '17:00', direccion_actividad: 'Jr. Dos de Mayo 123', oferente: 'Familia Pérez', cod_cofradia: 1,
    });
    expect(res.status).toBe(201);
    eventoId = res.body.id;
    const ev = await knex('eventos').where('id', eventoId).first();
    expect(String(ev.hora)).toBe('17:00:00');
  });

  test('agenda filtrada y paginada', async () => {
    const res = await request(app).get('/api/eventos?page=1&pageSize=5&orden=agenda&cod_cofradia=1');
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
    expect(res.body.data.every((e) => e.cod_cofradia === 1)).toBe(true);
  });

  test('sin ?page devuelve arreglo (compatibilidad)', async () => {
    const res = await request(app).get('/api/eventos');
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('descarga .ics de un evento', async () => {
    const res = await request(app).get(`/api/eventos/ics?id=${eventoId}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/calendar/);
    expect(res.text).toContain('BEGIN:VCALENDAR');
    expect(res.text).toContain('DTSTART;TZID=America/Lima:20261225T170000');
  });

  test('la auditoría registra la creación', async () => {
    const res = await request(app).get(`/api/auditoria?page=1&entidad=evento&entidad_id=${eventoId}`).set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toMatchObject({ accion: 'crear', entidad: 'evento', username: 'admin_test' });
  });
});

// ---------------------------------------------------------------------
describe('Carga masiva con vista previa', () => {
  const crearExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Hoja');
    ws.addRow(['Fecha', 'Tipo Día', 'Tipo Evento', 'Hora', 'Dirección', 'Oferente', 'Tipo Oferente', 'Banda', 'Cofradía']);
    ws.addRow([new Date(Date.UTC(2026, 11, 26)), 'Víspera', 'Misa', '18:30', 'Plaza de Armas', 'Fam. Ruiz', '', '', 1]);
    ws.addRow([new Date(Date.UTC(2026, 11, 27)), '', '', 'no-es-hora', 'Jr. X', 'Fam. Y', '', '', 1]);
    ws.addRow(['2026-12-28', '', '', '10:00', 'Jr. Z', 'Fam. Z', '', '', 99999]);
    return Buffer.from(await wb.xlsx.writeBuffer());
  };

  test('dryRun valida sin guardar', async () => {
    const antes = (await knex('eventos').count({ n: '*' }))[0].n;
    const res = await request(app).post('/api/eventos/bulk-upload?dryRun=1').set(auth(adminToken))
      .attach('file', await crearExcel(), { filename: 'eventos.xlsx', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ dryRun: true, total: 3, validos: 1, invalidos: 2 });
    expect(res.body.errores.map((e) => e.fila)).toEqual([3, 4]);
    expect((await knex('eventos').count({ n: '*' }))[0].n).toBe(antes);
  });

  test('la carga real inserta solo las filas válidas', async () => {
    const res = await request(app).post('/api/eventos/bulk-upload').set(auth(adminToken))
      .attach('file', await crearExcel(), { filename: 'eventos.xlsx', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ total: 3, insertados: 1, fallidos: 2 });
    const ev = await knex('eventos').where('direccion_actividad', 'Plaza de Armas').first();
    expect(String(ev.hora)).toBe('18:30:00');
  });

  test('archivos que no son .xlsx son rechazados', async () => {
    const res = await request(app).post('/api/eventos/bulk-upload').set(auth(adminToken))
      .attach('file', Buffer.from('hola'), { filename: 'virus.exe', contentType: 'application/octet-stream' });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------
describe('Reportes y subida de imágenes', () => {
  let reporteId;

  test('reporte público con foto: se guarda como WebP y siempre como pendiente', async () => {
    const png = await sharp({ create: { width: 3000, height: 2000, channels: 3, background: '#c33' } }).png().toBuffer();
    const res = await request(app).post('/api/reportes')
      .field('nombre_reportante', 'Ana')
      .field('descripcion', 'Cofradía bloqueando la vía')
      .field('numero_contacto', '987 654 321')
      .field('cofradia_id', '1')
      .field('estado', 'resuelto')
      .attach('foto', png, { filename: 'foto.png', contentType: 'image/png' });
    expect(res.status).toBe(201);
    reporteId = res.body.id;
    const r = await knex('reportes').where('id', reporteId).first();
    expect(r.estado).toBe('pendiente');
    expect(r.numero_contacto).toBe('987654321');
    expect(r.ruta_foto).toMatch(/^uploads\/reportes\/.+\.webp$/);
    const meta = await sharp(path.join(__dirname, '..', 'public', r.ruta_foto)).metadata();
    expect(meta.format).toBe('webp');
    expect(Math.max(meta.width, meta.height)).toBeLessThanOrEqual(1600);
  });

  test('un archivo que no es imagen es rechazado', async () => {
    const res = await request(app).post('/api/reportes')
      .field('nombre_reportante', 'Ana').field('descripcion', 'x')
      .attach('foto', Buffer.from('<script>alert(1)</script>'), { filename: 'x.html', contentType: 'text/html' });
    expect(res.status).toBe(400);
  });

  test('una "imagen" falsa (mimetype mentiroso) es rechazada', async () => {
    const res = await request(app).post('/api/reportes')
      .field('nombre_reportante', 'Ana').field('descripcion', 'x')
      .attach('foto', Buffer.from('esto no es un png'), { filename: 'x.png', contentType: 'image/png' });
    expect(res.status).toBe(400);
  });

  test('cambio de estado deja historial y quién lo atendió', async () => {
    const res = await request(app).patch(`/api/reportes/${reporteId}/estado`).set(auth(adminToken))
      .send({ estado: 'revisado', nota: 'Se avisó a la cofradía', notas_internas: 'Llamar mañana' });
    expect(res.status).toBe(200);
    const det = await request(app).get(`/api/reportes/${reporteId}`).set(auth(adminToken));
    expect(det.body).toMatchObject({ estado: 'revisado', atendido_por_username: 'admin_test', notas_internas: 'Llamar mañana' });
    expect(det.body.created_at).toBeTruthy();
    expect(det.body.historial[0]).toMatchObject({ estado_anterior: 'pendiente', estado_nuevo: 'revisado', nota: 'Se avisó a la cofradía' });
  });

  test('filtro por estado', async () => {
    const res = await request(app).get('/api/reportes?page=1&estado=revisado').set(auth(adminToken));
    expect(res.body.data.every((r) => r.estado === 'revisado')).toBe(true);
  });

  test('exportar reportes a Excel', async () => {
    const res = await request(app).get('/api/reportes/export').set(auth(adminToken)).buffer().parse((r, cb) => {
      const chunks = [];
      r.on('data', (c) => chunks.push(c));
      r.on('end', () => cb(null, Buffer.concat(chunks)));
    });
    expect(res.status).toBe(200);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(res.body);
    expect(wb.worksheets[0].rowCount).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------
describe('Páginas públicas por slug y vista previa para compartir', () => {
  test('GET /cofradia/slug/:slug', async () => {
    const c = await knex('cofradia').where('id', 1).first();
    const res = await request(app).get(`/api/cofradia/slug/${c.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  test('/share/cofradia/:slug devuelve etiquetas Open Graph escapadas', async () => {
    const c = await knex('cofradia').where('id', 1).first();
    const res = await request(app).get(`/share/cofradia/${c.slug}`);
    expect(res.status).toBe(200);
    expect(res.text).toContain('og:title');
    expect(res.text).toContain(`/cofradia?slug=${c.slug}`);
    expect(res.text).not.toMatch(/<script>(?!location)/);
  });
});

// ---------------------------------------------------------------------
describe('Participantes, cofrades y otros', () => {
  test('registro público siempre queda pendiente', async () => {
    const res = await request(app).post('/api/participantes').send({
      nombre: 'Luis', dni: '44556677', email: 'luis@example.com', telefono: '999888777', comentario: 'Quiero participar', estado: 'activo',
    });
    expect(res.status).toBe(201);
    const p = await knex('participantes').where('id', res.body.id).first();
    expect(p.estado).toBe('pendiente');
  });

  test('el admin puede crear participantes con estado', async () => {
    const res = await request(app).post('/api/participantes').set(auth(adminToken)).send({
      nombre: 'Rosa', dni: '11223344', comentario: 'Alta desde el panel', estado: 'activo',
    });
    expect(res.status).toBe(201);
    const p = await knex('participantes').where('id', res.body.id).first();
    expect(p.estado).toBe('activo');
  });

  test('correo inválido → 400', async () => {
    const res = await request(app).post('/api/participantes').send({ nombre: 'X', dni: '55667788', email: 'no-es-correo', comentario: 'x' });
    expect(res.status).toBe(400);
  });

  test('cofrades públicos sin DNI; listado admin paginado con búsqueda', async () => {
    const crear = await request(app).post('/api/cofrades').set(auth(adminToken))
      .field('dni_cofrade', '70707070').field('nombres_apellidos', 'Pedro Quispe').field('cod_cofradia', '1').field('anio', '2026');
    expect(crear.status).toBe(201);

    const pub = await request(app).get('/api/cofrades/by-cofradia/1');
    expect(pub.body.length).toBeGreaterThan(0);
    expect(pub.body.every((c) => c.dni_cofrade === undefined)).toBe(true);

    const adm = await request(app).get('/api/cofrades?page=1&q=Quispe').set(auth(adminToken));
    expect(adm.body.total).toBe(1);
    expect(adm.body.data[0].dni_cofrade).toBe('70707070');
  });

  test('push: clave pública disponible', async () => {
    const res = await request(app).get('/api/push/public-key');
    expect(res.status).toBe(200);
    expect(typeof res.body.habilitado).toBe('boolean');
  });

  test('festival público responde', async () => {
    const res = await request(app).get('/api/festival/dias');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('ruta inexistente → 404 JSON', async () => {
    const res = await request(app).get('/api/no-existe');
    expect(res.status).toBe(404);
    expect(res.body.message).toBeTruthy();
  });
});

// ---------------------------------------------------------------------
describe('Límite de intentos de login', () => {
  test('bloquea tras 10 intentos fallidos', async () => {
    process.env.TEST_RATE_LIMIT = '1';
    let ultimo;
    for (let i = 0; i < 11; i++) {
      ultimo = await request(app).post('/api/usuarios/login').send({ username: 'admin_test', password: `mala${i}` });
    }
    delete process.env.TEST_RATE_LIMIT;
    expect(ultimo.status).toBe(429);
  });
});
