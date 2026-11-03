// Bitácora de auditoría: quién cambió qué y cuándo.
const knex = require('./db');

// Nunca guardar contraseñas en la bitácora
const sanitizar = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const copia = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const k of Object.keys(copia)) {
    if (/password|contrase/i.test(k)) copia[k] = '***';
  }
  return copia;
};

/**
 * Registra una acción. Nunca lanza: un fallo en la bitácora no debe romper la operación.
 * accion: 'crear' | 'editar' | 'eliminar' | 'carga_masiva' | 'login' | 'login_fallido' | 'ubicacion' | 'estado'
 */
const audit = async (req, accion, entidad, entidadId = null, detalle = null) => {
  try {
    await knex('audit_log').insert({
      usuario_id: req.user?.id ?? null,
      username: req.user?.username ?? null,
      accion,
      entidad,
      entidad_id: entidadId === null || entidadId === undefined ? null : String(entidadId),
      detalle: detalle ? JSON.stringify(sanitizar(detalle)).slice(0, 4000) : null,
      ip: req.ip ? String(req.ip).slice(0, 64) : null,
    });
  } catch (err) {
    console.error('No se pudo registrar en la bitácora:', err.message);
  }
};

// Devuelve solo los campos que cambiaron: { campo: [antes, después] }
const diff = (antes = {}, despues = {}) => {
  const norm = (v) => (v instanceof Date ? v.toISOString() : v ?? null);
  const cambios = {};
  for (const [k, v] of Object.entries(despues)) {
    if (v === undefined) continue;
    if (String(norm(antes[k]) ?? '') !== String(norm(v) ?? '')) cambios[k] = [norm(antes[k]), norm(v)];
  }
  return cambios;
};

module.exports = { audit, diff };
