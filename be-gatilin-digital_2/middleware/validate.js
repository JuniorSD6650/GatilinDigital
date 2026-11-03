// Validación de entrada con zod. Reemplaza req.body / req.query por los datos
// ya validados y normalizados.
const { z } = require('zod');

const formatear = (error) =>
  error.issues.map((i) => ({ campo: i.path.join('.') || '(general)', mensaje: i.message }));

const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source] ?? {});
  if (!result.success) {
    const errores = formatear(result.error);
    const message = `Datos inválidos: ${errores.map((e) => `${e.campo} (${e.mensaje})`).join(', ')}`;
    return res.status(400).json({ error: message, message, errores });
  }
  if (source === 'query') {
    Object.defineProperty(req, 'query', { value: result.data, writable: true, configurable: true });
  } else {
    req[source] = result.data;
  }
  next();
};

// ---- Piezas reutilizables ----
const vacioANull = (v) => (v === '' || v === undefined || v === 'null' ? null : v);
const trimONull = (v) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === '' || s === 'null' ? null : s;
};

const textoOpc = (max = 255) => z.preprocess(trimONull, z.string().max(max, `Máximo ${max} caracteres`).nullable());
const textoReq = (max = 255) =>
  z.preprocess(trimONull, z.string({ error: 'Es obligatorio' }).min(1, 'Es obligatorio').max(max, `Máximo ${max} caracteres`));
const enteroOpc = z.preprocess((v) => (vacioANull(v) === null ? null : Number(v)), z.number().int().positive().nullable());
const enteroReq = z.coerce.number({ error: 'Debe ser un número' }).int('Debe ser entero').positive('Debe ser positivo');

const normalizarFecha = (v) => {
  if (v instanceof Date && !isNaN(v)) return v.toISOString().slice(0, 10);
  if (typeof v !== 'string') return v;
  const s = v.trim();
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  return s.slice(0, 10);
};
const fechaISO = z.preprocess(normalizarFecha, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (usa AAAA-MM-DD)'));
const fechaOpc = z.preprocess((v) => (vacioANull(v) === null ? null : normalizarFecha(v)),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (usa AAAA-MM-DD)').nullable());

const normalizarHora = (v) => {
  if (v instanceof Date && !isNaN(v)) {
    // Excel guarda horas como fecha 1899-12-30 en UTC
    return `${String(v.getUTCHours()).padStart(2, '0')}:${String(v.getUTCMinutes()).padStart(2, '0')}:00`;
  }
  if (typeof v === 'number' && v >= 0 && v < 1) {
    const mins = Math.round(v * 24 * 60);
    return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}:00`;
  }
  if (typeof v !== 'string') return v;
  const s = v.trim();
  return /^\d{1,2}:\d{2}$/.test(s) ? `${s}:00` : s;
};
const hora = z.preprocess(normalizarHora, z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d:[0-5]\d$/, 'Hora inválida (usa HH:MM)'));

const telefono = z.preprocess(
  (v) => (trimONull(v) === null ? null : String(v).replace(/[\s()-]/g, '')),
  z.string().regex(/^\+?\d{6,15}$/, 'Teléfono inválido').nullable()
);
const color = z.preprocess(trimONull, z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'Color inválido').nullable());
const url = z.preprocess(trimONull, z.string().max(255).url('URL inválida').nullable());
const email = z.preprocess(trimONull, z.string().max(255).email('Correo inválido').nullable());

const paginacionQuery = z.looseObject({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().trim().max(100).optional(),
});

module.exports = {
  z, validate, textoOpc, textoReq, enteroOpc, enteroReq, fechaISO, fechaOpc, hora, telefono, color, url, email,
  paginacionQuery, normalizarFecha, normalizarHora,
};
