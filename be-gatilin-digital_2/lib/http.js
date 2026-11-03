// Utilidades de respuesta HTTP.
// Nunca se envía el mensaje interno de un error al cliente: se registra en el
// servidor y el cliente recibe un mensaje genérico.

const fail = (res, err, message = 'Ocurrió un error inesperado', status = 500) => {
  if (err) console.error(`[${new Date().toISOString()}] ${message}:`, err.message || err);
  return res.status(status).json({ error: message, message });
};

const badRequest = (res, message, extra = {}) => res.status(400).json({ error: message, message, ...extra });
const notFound = (res, message = 'Recurso no encontrado') => res.status(404).json({ error: message, message });
const forbidden = (res, message = 'No tienes permiso para realizar esta acción') =>
  res.status(403).json({ error: message, message });

// Envuelve un handler async: los errores no capturados llegan al errorHandler global
const asyncH = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Paginación opcional en servidor.
 *  - Sin ?page → devuelve el arreglo completo (compatibilidad con selectores).
 *  - Con ?page → { data, total, page, pageSize, totalPages }.
 * `idColumn` es la columna que se cuenta (p. ej. 'eventos.id').
 */
const paginate = async (req, query, { idColumn = 'id', maxPageSize = 100, map = (x) => x } = {}) => {
  if (req.query.page === undefined) {
    const rows = await query;
    return rows.map(map);
  }
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(maxPageSize, Math.max(1, parseInt(req.query.pageSize, 10) || 20));

  const [{ total }] = await query.clone().clearSelect().clearOrder().countDistinct({ total: idColumn });
  const rows = await query.clone().limit(pageSize).offset((page - 1) * pageSize);
  const t = Number(total) || 0;

  return { data: rows.map(map), total: t, page, pageSize, totalPages: Math.max(1, Math.ceil(t / pageSize)) };
};

const CON_TILDE = 'áàäâãéèëêíìïîóòöôõúùüûñç';
const SIN_TILDE = 'aaaaaeeeeiiiiooooouuuunc';
const sinTildes = (s) => s.replace(/[áàäâãéèëêíìïîóòöôõúùüûñç]/g, (c) => SIN_TILDE[CON_TILDE.indexOf(c)]);

// Escapa los comodines de LIKE
const likeTerm = (q) => `%${String(q).replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

// Aplica una búsqueda de texto (sin distinguir mayúsculas) sobre varias columnas
const searchIn = (query, q, columns) => {
  if (!q) return query;
  // Igual que MySQL antes: sin distinguir mayúsculas NI tildes ("cardenas" encuentra "Cárdenas").
  // translate() es estándar en PostgreSQL: no requiere la extensión unaccent.
  const term = likeTerm(sinTildes(String(q).toLowerCase()));
  return query.where((qb) => columns.forEach((c) => qb.orWhereRaw('translate(lower(??), ?, ?) like ?', [c, CON_TILDE, SIN_TILDE, term])));
};

module.exports = { fail, badRequest, notFound, forbidden, asyncH, paginate, likeTerm, searchIn };
