// Generador mínimo de calendarios iCalendar (.ics), compatible con
// Google Calendar, Apple Calendar y Outlook.

const escapar = (s) =>
  String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

// Las líneas de más de 75 octetos se "pliegan" según RFC 5545
const plegar = (linea) => {
  const bytes = Buffer.from(linea, 'utf8');
  if (bytes.length <= 75) return linea;
  const partes = [];
  let actual = '';
  for (const ch of linea) {
    if (Buffer.byteLength(actual + ch, 'utf8') > (partes.length ? 74 : 75)) {
      partes.push(actual);
      actual = '';
    }
    actual += ch;
  }
  partes.push(actual);
  return partes.join('\r\n ');
};

const fechaHoraLocal = (fecha, hora) => `${fecha.replace(/-/g, '')}T${hora.replace(/:/g, '').padEnd(6, '0').slice(0, 6)}`;

const sumarMinutos = (fecha, hora, minutos) => {
  const [y, mo, d] = fecha.split('-').map(Number);
  const [h, mi] = hora.split(':').map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d, h, mi + minutos));
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00`;
};

/**
 * @param {{ uid:string, fecha:string(YYYY-MM-DD), hora:string(HH:MM:SS), duracionMin?:number,
 *           titulo:string, descripcion?:string, lugar?:string, url?:string }[]} eventos
 */
const generarICS = (eventos, { nombre = 'Gatilín Digital', tz = 'America/Lima' } = {}) => {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gatilin Digital//Agenda//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapar(nombre)}`,
    `X-WR-TIMEZONE:${tz}`,
    // Perú no usa horario de verano: UTC-5 todo el año
    'BEGIN:VTIMEZONE',
    `TZID:${tz}`,
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:-0500',
    'TZOFFSETTO:-0500',
    'TZNAME:-05',
    'END:STANDARD',
    'END:VTIMEZONE',
  ];
  for (const ev of eventos) {
    lineas.push(
      'BEGIN:VEVENT',
      `UID:${ev.uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=${tz}:${fechaHoraLocal(ev.fecha, ev.hora)}`,
      `DTEND;TZID=${tz}:${sumarMinutos(ev.fecha, ev.hora, ev.duracionMin || 60)}`,
      `SUMMARY:${escapar(ev.titulo)}`,
      ...(ev.descripcion ? [`DESCRIPTION:${escapar(ev.descripcion)}`] : []),
      ...(ev.lugar ? [`LOCATION:${escapar(ev.lugar)}`] : []),
      ...(ev.url ? [`URL:${ev.url}`] : []),
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Recordatorio',
      'TRIGGER:-PT30M',
      'END:VALARM',
      'END:VEVENT'
    );
  }
  lineas.push('END:VCALENDAR');
  return lineas.map(plegar).join('\r\n') + '\r\n';
};

module.exports = { generarICS };
