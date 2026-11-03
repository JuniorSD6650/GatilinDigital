// Datos de demostración para presentaciones con clientes.
//
// ATENCIÓN: reinicia la base de datos. Ejecuta las migraciones, vuelve a sembrar
// el catálogo base (seeds/) y reemplaza usuarios, reportes, inscripciones,
// bordadurías, votos, fotos y bitácora por datos ficticios.
//
// Lo usan:
//   - scripts/seedDemo.js  (npm run db:seed:demo)
//   - server.js            (DEMO_DATA=true al arrancar, solo si la demo no está cargada)
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sharp = require('sharp');
const { PUBLIC_DIR } = require('../middleware/upload');
const { insertarId, vaciarTablas, ajustarSecuencia } = require('./dbUtil');

const ROOT = path.join(__dirname, '..');
const DEMO_PASSWORD_DEFAULT = 'Demo2026!';

// Snapshot de la base local (npm run db:export:demo). Si existe, la demo carga
// TODOS esos datos y solo completa con ejemplos las tablas que estén vacías.
const SNAPSHOT_DIR = path.join(ROOT, 'demo');
const SNAPSHOT_FILE = path.join(SNAPSHOT_DIR, 'snapshot.json');
// Orden de inserción (padres antes que hijos)
const TABLAS_SNAPSHOT = [
  'organizacion', 'cofradia', 'cofrades', 'eventos', 'festival_eventos', 'bordadurias',
  'participantes', 'usuarios', 'reportes', 'reportes_historial', 'fotos_cuadrilla', 'votos',
];
// Datos personales que NUNCA salen de la base local ni entran a la demo:
// DNIs y teléfonos/correos de personas reales. Los DNIs obligatorios (NOT NULL
// y únicos) se reemplazan por valores ficticios derivados del id.
const anonimizarFila = (tabla, fila) => {
  const f = { ...fila };
  switch (tabla) {
    case 'cofradia':
      f.dni_representante = null;
      f.cel_representante = null;
      break;
    case 'cofrades':
      f.dni_cofrade = String(f.id).padStart(8, '0');
      f.celular = null;
      break;
    case 'participantes':
      f.dni = `DEMO${String(f.id).padStart(6, '0')}`;
      f.email = null;
      f.telefono = null;
      break;
    case 'reportes':
      f.numero_contacto = null;
      break;
    case 'usuarios':
      delete f.password;
      break;
    default:
  }
  return f;
};

// Columnas booleanas: un snapshot exportado desde MySQL las trae como 0/1
const BOOLEANAS = { cofradia: ['compartiendo'] };
const normalizarFila = (tabla, fila) => {
  const cols = BOOLEANAS[tabla];
  if (!cols) return fila;
  const out = { ...fila };
  for (const c of cols) if (c in out && out[c] !== null) out[c] = Boolean(Number(out[c]) || out[c] === true);
  return out;
};
const leerSnapshot = () => (fs.existsSync(SNAPSHOT_FILE) ? JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8')) : null);
const DOMINIO = 'demo.gatilin.pe';
const PREFIJO_ARCHIVO = 'demo-';

// Cuentas demo. La app solo tiene dos roles: "admin" (panel completo) y
// "localizador" (operador de una cofradía: comparte ubicación y sube fotos).
// El público (visitantes) no necesita cuenta.
const CUENTAS = [
  { username: `admin@${DOMINIO}`, role: 'admin', cofradia_id: null, descripcion: 'Administrador (panel completo)' },
  { username: `coordinador@${DOMINIO}`, role: 'admin', cofradia_id: null, descripcion: 'Coordinador de la organización' },
  { username: `sanandres@${DOMINIO}`, role: 'localizador', cofradia_id: 1, descripcion: 'Operador · Juventud San Andrés' },
  { username: `universitario@${DOMINIO}`, role: 'localizador', cofradia_id: 2, descripcion: 'Operador · Divino Niño Universitario' },
  { username: `ingeniero@${DOMINIO}`, role: 'localizador', cofradia_id: 3, descripcion: 'Operador · Niño Jesús Ingeniero' },
];

// Generador pseudoaleatorio con semilla: la demo sale igual en cada ejecución
const crearRandom = (semilla = 2026) => {
  let s = semilla >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const hace = (dias, horas = 0) => new Date(Date.now() - (dias * 24 + horas) * 3600 * 1000);
const fechaISO = (d) => d.toISOString().slice(0, 10);
const escaparXml = (s) => String(s).replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));

// ---------- Imágenes de ejemplo (generadas, sin archivos externos) ----------

const guardarImagen = async (carpeta, nombre, svg) => {
  const dir = path.join(PUBLIC_DIR, 'uploads', carpeta);
  fs.mkdirSync(dir, { recursive: true });
  await sharp(Buffer.from(svg)).webp({ quality: 82 }).toFile(path.join(dir, nombre));
  return `uploads/${carpeta}/${nombre}`;
};

const limpiarImagenesDemo = () => {
  for (const carpeta of ['cofrades', 'cuadrillas', 'reportes']) {
    const dir = path.join(PUBLIC_DIR, 'uploads', carpeta);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.startsWith(PREFIJO_ARCHIVO)) fs.rmSync(path.join(dir, f), { force: true });
    }
  }
};

const svgCuadrilla = (titulo, color, anio) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#1a1a2e"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#g)"/>
  ${Array.from({ length: 9 }, (_, i) => `
    <g transform="translate(${190 + i * 150}, ${470 + (i % 2) * 40})">
      <circle cx="0" cy="-120" r="42" fill="#2b2b2b" stroke="#f5d76e" stroke-width="6"/>
      <rect x="-45" y="-75" width="90" height="190" rx="22" fill="#f5f5f5" opacity="0.92"/>
      <rect x="-45" y="-10" width="90" height="16" fill="${color}"/>
      <path d="M-30 -160 L0 -205 L30 -160 Z" fill="#f5d76e"/>
    </g>`).join('')}
  <rect x="0" y="720" width="1600" height="180" fill="#000" opacity="0.45"/>
  <text x="80" y="800" font-family="Georgia, serif" font-size="58" fill="#fff" font-weight="bold">${escaparXml(titulo)}</text>
  <text x="80" y="860" font-family="Arial, sans-serif" font-size="34" fill="#f5d76e">Cuadrilla ${anio} · Foto de demostración</text>
</svg>`;

const svgAvatar = (nombre, color) => {
  const iniciales = nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="${color}"/>
  <circle cx="300" cy="235" r="120" fill="#ffffff" opacity="0.25"/>
  <rect x="120" y="390" width="360" height="260" rx="180" fill="#ffffff" opacity="0.25"/>
  <text x="300" y="285" text-anchor="middle" font-family="Arial, sans-serif" font-size="150" font-weight="bold" fill="#fff">${escaparXml(iniciales)}</text>
</svg>`;
};

const svgReporte = (texto) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="1200" height="800" fill="#d9d4c7"/>
  <rect x="0" y="520" width="1200" height="280" fill="#7a7a7a"/>
  <rect x="140" y="220" width="320" height="300" fill="#b5651d"/>
  <rect x="620" y="160" width="420" height="360" fill="#e8e1d1"/>
  <circle cx="1020" cy="120" r="70" fill="#f2c94c"/>
  <rect x="0" y="0" width="1200" height="80" fill="#000" opacity="0.55"/>
  <text x="40" y="54" font-family="Arial, sans-serif" font-size="36" fill="#fff">${escaparXml(texto)}</text>
</svg>`;

// ---------- Datos ----------

const BORDADURIAS = [
  { ruc: '20601234567', razon_social: 'Bordados Leoncio Prado E.I.R.L.', descripcion: 'Pecheras, banderas y mantas bordadas a mano con hilo de oro y lentejuelas. Más de 30 años vistiendo cuadrillas.', direccion: 'Jr. Huallayco 845, Huánuco', web_fb: 'https://facebook.com/bordadosleonciopradodemo', representante: 'Leoncio Prado Rivera', celular: '900020201' },
  { ruc: '20609876543', razon_social: 'Arte Negrito Huanuqueño S.A.C.', descripcion: 'Máscaras, campanillas y trajes completos de Negrito y Corochano. Envíos a todo el Perú.', direccion: 'Jr. Dos de Mayo 1120, Huánuco', web_fb: 'https://facebook.com/artenegritodemo', representante: 'Marisol Tucto Espinoza', celular: '900020202' },
  { ruc: '10456789012', razon_social: 'Taller de Bordado Doña Rosa', descripcion: 'Bordado artesanal de pañuelos, banderas y estandartes. Restauración de trajes antiguos.', direccion: 'Av. Universitaria 560, Pillco Marca', web_fb: null, representante: 'Rosa Ambrosio Céspedes', celular: '900020203' },
  { ruc: '20612345098', razon_social: 'Confecciones El Abanderado E.I.R.L.', descripcion: 'Confección de trajes de Abanderado, Dama y Turco. Alquiler para presentaciones.', direccion: 'Jr. Abtao 333, Amarilis', web_fb: 'https://facebook.com/elabanderadodemo', representante: 'Julio César Berrospi', celular: '900020204' },
  { ruc: '10423456781', razon_social: 'Bordados y Pedrería Santa Rosa', descripcion: 'Especialistas en pedrería y bordado en alto relieve para pecheras de gala.', direccion: 'Jr. Ayacucho 715, Huánuco', web_fb: null, representante: 'Elena Santa Cruz Pérez', celular: '900020205' },
];

const PARTICIPANTES = [
  { nombre: 'Lucía Fernández Ramos', dni: 'DEMO000001', email: 'lucia.fernandez@example.com', telefono: '900000001', estado: 'activo', comentario: 'Quiero bailar como Dama en la cuadrilla de mi barrio.' },
  { nombre: 'Carlos Huamán Tarazona', dni: 'DEMO000002', email: 'carlos.huaman@example.com', telefono: '900000002', estado: 'activo', comentario: 'Bailo desde niño, me interesa ser Caporal.' },
  { nombre: 'Andrea Soto Villanueva', dni: 'DEMO000003', email: 'andrea.soto@example.com', telefono: '900000003', estado: 'pendiente', comentario: 'Primera vez, me gustaría participar como Negrito.' },
  { nombre: 'Miguel Ángel Rojas Cuéllar', dni: 'DEMO000004', email: 'miguel.rojas@example.com', telefono: '900000004', estado: 'pendiente', comentario: 'Toco el violín, puedo apoyar en la banda.' },
  { nombre: 'Valeria Tucto Espíritu', dni: 'DEMO000005', email: 'valeria.tucto@example.com', telefono: '900000005', estado: 'activo', comentario: 'Participé el año pasado, quiero repetir.' },
  { nombre: 'José Luis Ponce Albornoz', dni: 'DEMO000006', email: null, telefono: '900000006', estado: 'inactivo', comentario: 'Este año no podré participar por viaje.' },
  { nombre: 'Daniela Ramírez Falcón', dni: 'DEMO000007', email: 'daniela.ramirez@example.com', telefono: '900000007', estado: 'pendiente', comentario: 'Me interesa el personaje de Turco.' },
  { nombre: 'Renzo Valdivia Trujillo', dni: 'DEMO000008', email: 'renzo.valdivia@example.com', telefono: null, estado: 'activo', comentario: 'Puedo apoyar con la logística de la cuadrilla.' },
  { nombre: 'Kiara Espinoza Mallqui', dni: 'DEMO000009', email: 'kiara.espinoza@example.com', telefono: '900000009', estado: 'pendiente', comentario: 'Quiero inscribir a mi hijo como Pastorcito.' },
  { nombre: 'Fernando Chávez Ayala', dni: 'DEMO000010', email: 'fernando.chavez@example.com', telefono: '900000010', estado: 'activo', comentario: 'Soy músico de la banda, quiero registrarme.' },
];

const REPORTES = [
  { nombre: 'Vecino del Jr. Huánuco', descripcion: 'Cuadrilla bloqueando la vía principal por más de 40 minutos sin coordinación con tránsito.', contacto: '900010001', cofradia: 1, estado: 'pendiente', dias: 0.2, foto: 'Jr. Huánuco · vía bloqueada' },
  { nombre: 'María P.', descripcion: 'Uso de pirotecnia muy cerca de niños durante la quema de castillo.', contacto: '900010002', cofradia: 2, estado: 'pendiente', dias: 0.6 },
  { nombre: 'Anónimo', descripcion: 'Música a alto volumen pasada la medianoche en zona residencial.', contacto: null, cofradia: 4, estado: 'revisado', dias: 1.5, nota: 'Se contactó al presidente de la cofradía.' },
  { nombre: 'Jorge Céspedes', descripcion: 'Residuos y botellas abandonados en la Plaza de Armas tras la presentación.', contacto: '900010004', cofradia: 5, estado: 'resuelto', dias: 3, nota: 'La cofradía realizó la limpieza al día siguiente.', foto: 'Plaza de Armas · residuos' },
  { nombre: 'Rosa M.', descripcion: 'Se reporta un menor perdido cerca del pasacalle; fue ubicado gracias a los organizadores.', contacto: '900010005', cofradia: 3, estado: 'resuelto', dias: 4, nota: 'Caso cerrado, el menor fue entregado a su familia.' },
  { nombre: 'Comerciante del Mercado', descripcion: 'Bailantes en estado de ebriedad causando desorden frente al mercado.', contacto: '900010006', cofradia: 7, estado: 'revisado', dias: 2, nota: 'Se derivó a la junta directiva para sanción interna.', foto: 'Mercado Modelo · incidente' },
  { nombre: 'Anónimo', descripcion: 'Reporte duplicado de un incidente ya atendido.', contacto: null, cofradia: 1, estado: 'descartado', dias: 5, nota: 'Duplicado del reporte anterior.' },
  { nombre: 'Luis Alberto', descripcion: 'Felicito a la cofradía por la organización y el orden durante el recorrido.', contacto: '900010008', cofradia: 2, estado: 'resuelto', dias: 6, nota: 'Comentario positivo, se compartió con la cofradía.' },
];

// Cerca de la Plaza de Armas de Huánuco
const UBICACIONES = [
  { id: 1, lat: -9.9297, lng: -76.2399, precision: 12 },
  { id: 2, lat: -9.9318, lng: -76.2418, precision: 20 },
  { id: 3, lat: -9.9276, lng: -76.2381, precision: 15 },
];

// ---------- Ejecución ----------

// "Vacía" = sin usuarios ni cofradías (o sin tablas todavía)
const baseDeDatosVacia = async (knex) => {
  for (const tabla of ['usuarios', 'cofradia']) {
    if (!(await knex.schema.hasTable(tabla))) continue;
    const [{ n }] = await knex(tabla).count({ n: '*' });
    if (Number(n) > 0) return false;
  }
  return true;
};

// Borra TODAS las tablas de la base de datos configurada y vuelve a migrar
const resetearBaseDeDatos = async (knex, { log = console.log } = {}) => {
  const { rows } = await knex.raw('SELECT tablename FROM pg_tables WHERE schemaname = current_schema()');
  const tablas = rows.map((f) => f.tablename);
  log(`🗑️  Eliminando ${tablas.length} tablas...`);
  if (tablas.length) await knex.raw(`DROP TABLE IF EXISTS ${tablas.map(() => '??').join(', ')} CASCADE`, tablas);
  log('🔧 Aplicando migraciones...');
  await knex.migrate.latest({ directory: path.join(ROOT, 'migrations') });
};

const runDemoSeed = async (knex, { password = DEMO_PASSWORD_DEFAULT, log = console.log } = {}) => {
  if (!password || password.length < 8) throw new Error('DEMO_PASSWORD debe tener al menos 8 caracteres.');
  const random = crearRandom();
  const anio = new Date().getFullYear();

  log('🔧 Aplicando migraciones...');
  await knex.migrate.latest({ directory: path.join(ROOT, 'migrations') });

  const vacia = async (t) => Number((await knex(t).count({ n: '*' }))[0].n) === 0;
  const hash = await bcrypt.hash(password, 10);
  const snapshot = leerSnapshot();

  log('🧹 Limpiando datos previos...');
  await vaciarTablas(knex, [...TABLAS_SNAPSHOT, 'audit_log']);
  limpiarImagenesDemo();

  if (snapshot) {
    // Datos reales exportados de la base local (npm run db:export:demo).
    // TABLAS_SNAPSHOT va de padres a hijos, así las llaves foráneas siempre se cumplen.
    log(`📥 Cargando TODOS los datos exportados de "${snapshot.base}" (${snapshot.exportado.slice(0, 10)})...`);
    for (const t of TABLAS_SNAPSHOT) {
      let filas = (snapshot.tablas[t] || []).map((f) => normalizarFila(t, anonimizarFila(t, f)));
      if (t === 'usuarios') filas = filas.map((u) => ({ ...u, password: hash }));
      for (let i = 0; i < filas.length; i += 300) await knex(t).insert(filas.slice(i, i + 300));
      await ajustarSecuencia(knex, t);
      if (filas.length) log(`   ${t.padEnd(20)} ${filas.length}`);
    }
    const uploadsSnapshot = path.join(SNAPSHOT_DIR, 'uploads');
    if (fs.existsSync(uploadsSnapshot)) fs.cpSync(uploadsSnapshot, path.join(PUBLIC_DIR, 'uploads'), { recursive: true });
  } else {
    log('🌱 Sembrando catálogo base (organización, cofradías, cofrades, eventos, festival)...');
    await knex.seed.run({ directory: path.join(ROOT, 'seeds') });
    // El seed base trae un usuario con clave fija: en la demo se reemplaza por las cuentas demo
    await vaciarTablas(knex, ['usuarios']);
    await knex('cofrades').update({ anio });
  }

  // Las fechas de la agenda se mueven a la temporada actual (24 dic - fines de ene)
  const temporada = new Date().getMonth() >= 2 ? anio : anio - 1;
  for (const tabla of ['eventos', 'festival_eventos']) {
    const [{ minAnio }] = await knex(tabla).min({ minAnio: knex.raw('EXTRACT(YEAR FROM fecha)') });
    const salto = minAnio ? temporada - Number(minAnio) : 0;
    if (salto) await knex(tabla).update({ fecha: knex.raw('CAST(fecha + make_interval(years => ?) AS DATE)', [salto]) });
  }

  const cofradias = await knex('cofradia').select('id', 'nickname_cofradia', 'color', 'lat').orderBy('id');
  const existeCofradia = (id) => cofradias.some((c) => c.id === id);
  const colorDe = (id) => cofradias.find((c) => c.id === id)?.color || '#8b0000';

  log('👤 Cuentas demo...');
  for (const c of CUENTAS) {
    if (await knex('usuarios').where('username', c.username).first('id')) continue;
    await knex('usuarios').insert({
      username: c.username, password: hash, role: c.role,
      cofradia_id: c.cofradia_id && existeCofradia(c.cofradia_id) ? c.cofradia_id : null, created_at: hace(20),
    });
  }
  const usuarios = Object.fromEntries((await knex('usuarios').select('id', 'username')).map((u) => [u.username, u.id]));
  const adminId = usuarios[CUENTAS[0].username];

  // A partir de aquí solo se rellenan tablas que quedaron vacías: nunca se
  // reemplazan datos reales del snapshot.
  log('📍 Ubicaciones en vivo y fotos de cuadrilla...');
  for (const u of UBICACIONES) {
    if (!existeCofradia(u.id) || cofradias.find((c) => c.id === u.id).lat !== null) continue;
    await knex('cofradia').where('id', u.id).update({
      lat: u.lat, lng: u.lng, ubicacion_precision: u.precision, compartiendo: true,
      ubicacion_link: `https://www.google.com/maps?q=${u.lat},${u.lng}`,
      ubicacion_link_actualizado: hace(0, 0.1),
    });
  }
  if (await vacia('fotos_cuadrilla')) {
    for (const c of cofradias.slice(0, 8)) {
      const ruta = await guardarImagen('cuadrillas', `${PREFIJO_ARCHIVO}cuadrilla-${c.id}-${anio}.webp`, svgCuadrilla(c.nickname_cofradia, c.color || '#8b0000', anio));
      await knex('fotos_cuadrilla').insert({ cod_cofradia: c.id, anio, ruta_foto: ruta });
    }
  }

  // Solo dirigentes sin foto propia
  const dirigentes = await knex('cofrades').select('id', 'nombres_apellidos', 'cod_cofradia')
    .whereIn('cargo_cofrade', ['Presidente', 'Presidenta', 'Vicepresidente', 'Vicepresidenta']).whereNull('ruta_foto').limit(12);
  for (const d of dirigentes) {
    const ruta = await guardarImagen('cofrades', `${PREFIJO_ARCHIVO}cofrade-${d.id}.webp`, svgAvatar(d.nombres_apellidos, colorDe(d.cod_cofradia)));
    await knex('cofrades').where('id', d.id).update({ ruta_foto: ruta });
  }

  log('🧵 Bordadurías e inscripciones...');
  if (await vacia('bordadurias')) await knex('bordadurias').insert(BORDADURIAS);
  if (await vacia('participantes')) await knex('participantes').insert(PARTICIPANTES.map((p, i) => ({ ...p, fecha_registro: fechaISO(hace(i * 2 + 1)) })));

  log('📝 Reportes ciudadanos con seguimiento...');
  const reportesDemo = (await vacia('reportes')) && cofradias.length
    ? REPORTES.map((r) => ({ ...r, cofradia: existeCofradia(r.cofradia) ? r.cofradia : cofradias[0].id }))
    : [];
  for (const [i, r] of reportesDemo.entries()) {
    const creado = hace(r.dias);
    const ruta_foto = r.foto ? await guardarImagen('reportes', `${PREFIJO_ARCHIVO}reporte-${i + 1}.webp`, svgReporte(r.foto)) : null;
    const atendido = r.estado !== 'pendiente';
    const id = await insertarId(knex('reportes').insert({
      nombre_reportante: r.nombre, descripcion: r.descripcion, numero_contacto: r.contacto, ruta_foto,
      estado: r.estado, cofradia_id: r.cofradia, created_at: creado,
      updated_at: atendido ? new Date(creado.getTime() + 3 * 3600 * 1000) : null,
      atendido_por: atendido ? adminId : null,
      notas_internas: r.nota || null,
    }));
    if (atendido) {
      await knex('reportes_historial').insert({
        reporte_id: id, estado_anterior: 'pendiente', estado_nuevo: r.estado, nota: r.nota || null,
        usuario_id: adminId, username: CUENTAS[0].username, created_at: new Date(creado.getTime() + 3 * 3600 * 1000),
      });
    }
  }

  log('🗳️  Votos del público (últimos 7 días)...');
  const votos = [];
  const generarVotos = await vacia('votos');
  for (const c of generarVotos ? cofradias : []) {
    const total = 15 + Math.floor(random() * 220);
    for (let v = 0; v < total; v++) {
      votos.push({
        cofradia_id: c.id,
        votante_hash: crypto.createHash('sha256').update(`demo-votante-${c.id}-${v}`).digest('hex'),
        ip_hash: crypto.createHash('sha256').update(`demo-ip-${Math.floor(random() * 400)}`).digest('hex'),
        fecha: fechaISO(hace(Math.floor(random() * 7))),
      });
    }
  }
  // La clave única es (cofradía, votante, fecha): cada votante demo es distinto
  for (let i = 0; i < votos.length; i += 500) await knex('votos').insert(votos.slice(i, i + 500));
  if (generarVotos) await knex.raw('UPDATE cofradia c SET votos = (SELECT COUNT(*) FROM votos v WHERE v.cofradia_id = c.id)');

  log('📒 Bitácora de actividad...');
  const loc = CUENTAS[2];
  await knex('audit_log').insert([
    { usuario_id: adminId, username: CUENTAS[0].username, accion: 'login', entidad: 'usuario', entidad_id: String(adminId), ip: '190.42.10.15', created_at: hace(0, 1) },
    { usuario_id: usuarios[loc.username], username: loc.username, accion: 'login', entidad: 'usuario', entidad_id: String(usuarios[loc.username]), ip: '179.6.20.33', created_at: hace(0, 0.5) },
    { usuario_id: usuarios[loc.username], username: loc.username, accion: 'ubicacion', entidad: 'cofradia', entidad_id: '1', detalle: JSON.stringify({ compartiendo: true }), ip: '179.6.20.33', created_at: hace(0, 0.1) },
    { usuario_id: adminId, username: CUENTAS[0].username, accion: 'crear', entidad: 'bordaduria', entidad_id: '1', detalle: JSON.stringify({ razon_social: BORDADURIAS[0].razon_social }), ip: '190.42.10.15', created_at: hace(2) },
    { usuario_id: adminId, username: CUENTAS[0].username, accion: 'estado', entidad: 'reporte', entidad_id: '4', detalle: JSON.stringify({ estado: ['pendiente', 'resuelto'] }), ip: '190.42.10.15', created_at: hace(3) },
    { usuario_id: null, username: 'desconocido', accion: 'login_fallido', entidad: 'usuario', entidad_id: null, ip: '45.70.1.9', created_at: hace(1) },
  ]);

  const resumen = { origen: snapshot ? `snapshot de "${snapshot.base}" (${snapshot.exportado.slice(0, 10)})` : 'seeds/ + datos de ejemplo' };
  for (const t of TABLAS_SNAPSHOT) resumen[t] = Number((await knex(t).count({ n: '*' }))[0].n);

  // Todas las cuentas (las de la base local y las demo) usan la misma contraseña
  const todas = await knex('usuarios').leftJoin('cofradia', 'usuarios.cofradia_id', 'cofradia.id')
    .select('usuarios.username', 'usuarios.role', 'cofradia.nickname_cofradia').orderBy('usuarios.id');
  const perfilDemo = Object.fromEntries(CUENTAS.map((c) => [c.username, c.descripcion]));
  return {
    credenciales: todas.map((u) => ({
      Usuario: u.username,
      Rol: u.role,
      Perfil: perfilDemo[u.username] || (u.role === 'admin' ? 'Administrador (tu base local)' : `Operador · ${u.nickname_cofradia || 'sin cofradía'} (tu base local)`),
      'Contraseña': password,
    })),
    resumen,
  };
};

const imprimirCredenciales = ({ credenciales, resumen }, log = console.log) => {
  log('\n✅ Datos de demostración cargados:');
  log(Object.entries(resumen).map(([k, v]) => `   ${k}: ${v}`).join('\n'));
  log('\n🔑 Credenciales demo (inicia sesión en /login con el "Usuario"):');
  console.table(credenciales);
};

module.exports = {
  runDemoSeed, baseDeDatosVacia, resetearBaseDeDatos, imprimirCredenciales,
  DEMO_PASSWORD_DEFAULT, CUENTAS, TABLAS_SNAPSHOT, SNAPSHOT_DIR, SNAPSHOT_FILE, anonimizarFila,
};
