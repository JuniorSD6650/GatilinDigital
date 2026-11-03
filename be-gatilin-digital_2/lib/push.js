// Notificaciones push (Web Push / VAPID).
// Si no hay claves VAPID configuradas, todo queda desactivado sin romper nada.
const webpush = require('web-push');
const knex = require('./db');
const { vapid, timezone, isTest } = require('./config');

const habilitado = Boolean(vapid.publicKey && vapid.privateKey);
if (habilitado) webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

const parseFavoritas = (txt) => {
  try {
    const arr = JSON.parse(txt || '[]');
    return Array.isArray(arr) ? arr.map(Number).filter(Number.isFinite) : [];
  } catch {
    return [];
  }
};

const enviarA = async (sub, payload) => {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
      { TTL: 60 * 30 }
    );
  } catch (err) {
    // 404/410: la suscripción ya no existe en el navegador → se elimina
    if (err.statusCode === 404 || err.statusCode === 410) {
      await knex('push_subscriptions').where('id', sub.id).del().catch(() => {});
    } else {
      console.warn('Push fallido:', err.statusCode || err.message);
    }
  }
};

/** Envía a quienes siguen una cofradía */
const notificarSeguidores = async (cofradiaId, payload, { soloAvisosEventos = false } = {}) => {
  if (!habilitado) return 0;
  const q = knex('push_subscriptions').select('*');
  if (soloAvisosEventos) q.where('avisos_eventos', true);
  const subs = (await q).filter((s) => parseFavoritas(s.favoritas).includes(Number(cofradiaId)));
  await Promise.all(subs.map((s) => enviarA(s, payload)));
  return subs.length;
};

/** Marca una clave como enviada; devuelve false si ya se había enviado */
const marcarEnviado = async (clave) => {
  try {
    await knex('push_enviados').insert({ clave });
    return true;
  } catch {
    return false;
  }
};

// Fecha y hora actuales en la zona horaria de la festividad
const ahoraLocal = (date = new Date()) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(date).map((p) => [p.type, p.value])
  );
  return { fecha: `${parts.year}-${parts.month}-${parts.day}`, minutos: Number(parts.hour) * 60 + Number(parts.minute) };
};

/** Recordatorios: avisa 30 minutos antes de cada actividad de las cofradías favoritas */
const revisarRecordatorios = async () => {
  if (!habilitado) return;
  const { fecha, minutos } = ahoraLocal();
  const eventos = await knex('eventos')
    .select('eventos.*', 'cofradia.nickname_cofradia', 'cofradia.slug')
    .leftJoin('cofradia', 'eventos.cod_cofradia', 'cofradia.id')
    .where('eventos.fecha', fecha);

  for (const ev of eventos) {
    const [h, m] = String(ev.hora).split(':').map(Number);
    const faltan = h * 60 + m - minutos;
    if (faltan < 0 || faltan > 30) continue;
    if (!(await marcarEnviado(`evento-${ev.id}-${fecha}`))) continue;

    const tipo = ev.tipo_evento && ev.tipo_evento !== 'ninguno' ? ev.tipo_evento : 'Actividad';
    await notificarSeguidores(ev.cod_cofradia, {
      title: `${ev.nickname_cofradia}: ${tipo} en ${faltan} min`,
      body: `${String(ev.hora).slice(0, 5)} · ${ev.direccion_actividad}`,
      url: `/agenda?cofradia=${ev.cod_cofradia}`,
      tag: `evento-${ev.id}`,
    }, { soloAvisosEventos: true });
  }
};

let timer = null;
const iniciarProgramador = () => {
  if (!habilitado || isTest || timer) return;
  timer = setInterval(() => revisarRecordatorios().catch((e) => console.warn('Recordatorios:', e.message)), 60 * 1000);
  timer.unref();
  console.log('Notificaciones push activas (recordatorios cada minuto).');
};

module.exports = { habilitado, notificarSeguidores, iniciarProgramador, revisarRecordatorios, parseFavoritas, ahoraLocal, publicKey: vapid.publicKey };
