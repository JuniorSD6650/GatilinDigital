const express = require('express');
const crypto = require('crypto');
const { format } = require('date-fns');

const knex = require('../lib/db');
const config = require('../lib/config');
const { requireAdmin, requireRole, optionalAuth, isAdmin } = require('../middleware/auth');
const { imageUpload, excelUpload, borrarArchivoPublico } = require('../middleware/upload');
const limits = require('../middleware/rateLimits');
const {
  z, validate, textoOpc, textoReq, enteroOpc, fechaOpc, telefono, color, url, paginacionQuery, fechaISO,
} = require('../middleware/validate');
const { fail, notFound, forbidden, badRequest, asyncH, paginate, searchIn } = require('../lib/http');
const { audit, diff } = require('../lib/audit');
const { sendTemplate, sendXlsx, bulkImport } = require('../lib/excel');
const { slugUnico } = require('../lib/slug');
const { coordsDesdeLink, linkDesdeCoords } = require('../lib/geo');
const push = require('../lib/push');
const { insertarId, esDuplicado } = require('../lib/dbUtil');

const router = express.Router();

// El admin gestiona cualquier cofradía; un localizador solo la suya
const puedeGestionar = (user, cofradiaId) =>
  Boolean(user) && (user.role === 'admin' || Number(user.cofradiaId) === Number(cofradiaId));

const fmtFecha = (d) => (d ? format(new Date(d), 'dd/MM/yyyy') : null);
const fmtFechaHora = (d) => (d ? format(new Date(d), 'dd/MM/yyyy HH:mm:ss') : null);

// Campos que nunca se muestran al público
const PRIVADOS = ['dni_representante'];

const formatear = (c, { publico = true } = {}) => {
  const out = {
    ...c,
    fecha_fundacion: fmtFecha(c.fecha_fundacion),
    ubicacion_link_actualizado: fmtFechaHora(c.ubicacion_link_actualizado),
    ubicacion_actualizado_iso: c.ubicacion_link_actualizado ? new Date(c.ubicacion_link_actualizado).toISOString() : null,
    lat: c.lat === null || c.lat === undefined ? null : Number(c.lat),
    lng: c.lng === null || c.lng === undefined ? null : Number(c.lng),
    compartiendo: Boolean(c.compartiendo),
  };
  if (publico) PRIVADOS.forEach((k) => delete out[k]);
  return out;
};

const COFRADIA_COLUMNS = [
  { header: 'Nickname Cofradía', key: 'nickname_cofradia', width: 30 },
  { header: 'Nombre Cofradía', key: 'nombre_cofradia', width: 50 },
  { header: 'Fecha Fundación', key: 'fecha_fundacion', width: 20 },
  { header: 'Sede Local', key: 'sede_local', width: 50 },
  { header: 'DNI Representante', key: 'dni_representante', width: 20 },
  { header: 'Nombre Representante', key: 'nombre_representante', width: 50 },
  { header: 'Cel Representante', key: 'cel_representante', width: 20 },
  { header: 'Distrito', key: 'distrito', width: 30 },
  { header: 'Descripción', key: 'descripcion', width: 50 },
  { header: 'Color (#hex)', key: 'color', width: 15 },
];

// ---- Esquemas de validación ----
const camposCofradia = {
  nickname_cofradia: textoReq(255),
  nombre_cofradia: textoReq(255),
  fecha_fundacion: fechaOpc,
  sede_local: textoOpc(255),
  dni_representante: z.preprocess((v) => (v === '' || v === null || v === undefined ? null : String(v).trim()),
    z.string().regex(/^\d{8,12}$/, 'DNI inválido').nullable()),
  nombre_representante: textoOpc(255),
  cel_representante: telefono,
  distrito: textoOpc(255),
  color: color,
  descripcion: textoOpc(5000),
  ubicacion_link: url,
  organizacion_id: enteroOpc,
};
const crearSchema = z.object(camposCofradia);
const editarSchema = z.object(camposCofradia).partial();
const importSchema = z.object({
  ...camposCofradia,
  ubicacion_link: url.optional(),
  organizacion_id: enteroOpc.optional(),
});

const ubicacionSchema = z
  .object({
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    precision: z.coerce.number().min(0).max(100000).optional(),
    ubicacion_link: url.optional(),
  })
  .refine((d) => (d.lat !== undefined && d.lng !== undefined) || d.ubicacion_link, {
    message: 'Envía lat y lng, o un enlace de Google Maps',
  });

// =====================================================================
// RUTAS PÚBLICAS
// =====================================================================

// Lista pública para el Sigueteo (filtros por zona y fecha)
router.get('/list', asyncH(async (req, res) => {
  const cofradias = await knex('cofradia')
    .select('id', 'slug', 'nickname_cofradia', 'nombre_cofradia', 'color', 'distrito', 'sede_local', 'votos',
      'ubicacion_link', 'ubicacion_link_actualizado', 'compartiendo')
    .orderBy('id', 'asc');

  const actividades = await knex('eventos').distinct('cod_cofradia', 'fecha', 'direccion_actividad');
  const porCofradia = {};
  for (const a of actividades) {
    (porCofradia[a.cod_cofradia] ||= []).push({ fecha: fmtFecha(a.fecha), direccion: a.direccion_actividad });
  }

  const ahora = Date.now();
  res.json(cofradias.map(({ ubicacion_link, ubicacion_link_actualizado, compartiendo, ...c }) => ({
    ...c,
    tiene_ubicacion: Boolean(ubicacion_link),
    compartiendo: Boolean(compartiendo),
    ubicacion_link_actualizado: fmtFechaHora(ubicacion_link_actualizado),
    // Mismo cálculo que /mapa: el front decide "en vivo" con una sola regla
    minutos_desde_actualizacion: ubicacion_link_actualizado
      ? Math.max(0, Math.round((ahora - new Date(ubicacion_link_actualizado).getTime()) / 60000))
      : null,
    actividades: porCofradia[c.id] || [],
  })));
}));

// Mapa público: cofradías con coordenadas conocidas
router.get('/mapa', asyncH(async (req, res) => {
  const filas = await knex('cofradia')
    .select('id', 'slug', 'nickname_cofradia', 'color', 'distrito', 'sede_local', 'lat', 'lng',
      'ubicacion_precision', 'ubicacion_link', 'ubicacion_link_actualizado', 'compartiendo')
    .orderBy('nickname_cofradia', 'asc');

  const ahora = Date.now();
  res.json(filas.map((c) => {
    let lat = c.lat === null ? null : Number(c.lat);
    let lng = c.lng === null ? null : Number(c.lng);
    if (lat === null && c.ubicacion_link) {
      const coords = coordsDesdeLink(c.ubicacion_link);
      if (coords) ({ lat, lng } = coords);
    }
    const act = c.ubicacion_link_actualizado ? new Date(c.ubicacion_link_actualizado) : null;
    return {
      id: c.id,
      slug: c.slug,
      nickname_cofradia: c.nickname_cofradia,
      color: c.color,
      distrito: c.distrito,
      sede_local: c.sede_local,
      lat,
      lng,
      precision: c.ubicacion_precision,
      ubicacion_link: c.ubicacion_link,
      compartiendo: Boolean(c.compartiendo),
      actualizado: act ? act.toISOString() : null,
      minutos_desde_actualizacion: act ? Math.max(0, Math.round((ahora - act.getTime()) / 60000)) : null,
    };
  }));
}));

// Ranking de cofradías por votos
router.get('/ranking/votos', asyncH(async (req, res) => {
  const cofradias = await knex('cofradia')
    .select('id', 'slug', 'nickname_cofradia', 'color', 'votos')
    .orderBy('votos', 'desc')
    .orderBy('nickname_cofradia', 'asc');
  res.json(cofradias);
}));

// Exportar ranking (admin)
router.get('/ranking/export', requireAdmin, asyncH(async (req, res) => {
  const filas = await knex('cofradia').select('nickname_cofradia', 'distrito', 'votos').orderBy('votos', 'desc');
  await sendXlsx(res, {
    nombreHoja: 'Ranking',
    filename: `Ranking_Votos_${format(new Date(), 'yyyyMMdd')}.xlsx`,
    columns: [
      { header: 'Puesto', key: 'puesto', width: 10 },
      { header: 'Cofradía', key: 'nickname_cofradia', width: 50 },
      { header: 'Distrito', key: 'distrito', width: 30 },
      { header: 'Votos', key: 'votos', width: 12 },
    ],
    rows: filas.map((f, i) => ({ puesto: i + 1, ...f })),
  });
}));

// Página pública por slug
router.get('/slug/:slug', asyncH(async (req, res) => {
  const slug = String(req.params.slug).slice(0, 140);
  const cofradia = await knex('cofradia').where('slug', slug).first();
  if (!cofradia) return notFound(res, 'Cofradía no encontrada');
  res.json(formatear(cofradia));
}));

// =====================================================================
// ADMIN: plantilla, exportación y carga masiva
// =====================================================================

router.get('/template', requireAdmin, asyncH(async (req, res) => {
  await sendTemplate(res, {
    nombreHoja: 'Plantilla Cofradías',
    filename: 'Plantilla_Cofradias.xlsx',
    columns: COFRADIA_COLUMNS,
    ejemplo: {
      nickname_cofradia: 'Negritos Ejemplo', nombre_cofradia: 'Cofradía de Negritos Ejemplo', fecha_fundacion: '2010-01-15',
      sede_local: 'Jr. Ejemplo 123', nombre_representante: 'Nombre Apellido', cel_representante: '987654321',
      distrito: 'Huánuco', descripcion: 'Descripción breve', color: '#D4AF37',
    },
  });
}));

router.get('/export', requireAdmin, asyncH(async (req, res) => {
  const filas = await knex('cofradia').select('*').orderBy('nickname_cofradia', 'asc');
  await sendXlsx(res, {
    nombreHoja: 'Cofradías',
    filename: `Cofradias_${format(new Date(), 'yyyyMMdd')}.xlsx`,
    columns: [{ header: 'ID', key: 'id', width: 8 }, ...COFRADIA_COLUMNS, { header: 'Votos', key: 'votos', width: 10 }],
    rows: filas.map((f) => ({ ...f, fecha_fundacion: fmtFecha(f.fecha_fundacion) })),
  });
}));

router.post('/bulk-upload', requireAdmin, excelUpload, (req, res) =>
  bulkImport(req, res, {
    entidad: 'cofradia',
    columns: COFRADIA_COLUMNS,
    schema: importSchema,
    insert: async (rec, db) => {
      const slug = await slugUnico(db, 'cofradia', rec.nickname_cofradia);
      await db('cofradia').insert({ ...rec, organizacion_id: rec.organizacion_id || 1, color: rec.color || '#000', slug });
    },
  })
);

// =====================================================================
// LISTADO Y DETALLE
// =====================================================================

router.get('/', optionalAuth, validate(paginacionQuery.extend({ fecha: z.string().optional() }), 'query'), asyncH(async (req, res) => {
  const { fecha, q } = req.query;
  let query = knex('cofradia').select('cofradia.*').orderBy('cofradia.id', 'desc');

  if (fecha) {
    const parsed = fechaISO.safeParse(fecha);
    if (!parsed.success) return badRequest(res, 'Fecha inválida (usa DD/MM/AAAA)');
    query = query.whereExists(
      knex('eventos').select(knex.raw('1')).whereRaw('eventos.cod_cofradia = cofradia.id').where('eventos.fecha', parsed.data)
    );
  }
  query = searchIn(query, q, ['cofradia.nickname_cofradia', 'cofradia.nombre_cofradia', 'cofradia.distrito']);

  const publico = !isAdmin(req);
  res.json(await paginate(req, query, { idColumn: 'cofradia.id', map: (c) => formatear(c, { publico }) }));
}));

// Estado del voto de este dispositivo
router.get('/:id/voto', asyncH(async (req, res) => {
  const id = Number(req.params.id);
  const cofradia = await knex('cofradia').where('id', id).first('id', 'votos');
  if (!cofradia) return notFound(res, 'Cofradía no encontrada');
  const votante = hashVotante(req);
  const voto = votante
    ? await knex('votos').where({ cofradia_id: id, votante_hash: votante, fecha: hoy() }).first('id')
    : null;
  res.json({ votos: cofradia.votos, yaVotaste: Boolean(voto) });
}));

router.get('/:id/fotos', asyncH(async (req, res) => {
  const fotos = await knex('fotos_cuadrilla')
    .select('id', 'anio', 'ruta_foto', 'actualizado')
    .where('cod_cofradia', req.params.id)
    .orderBy('anio', 'desc');
  res.json(fotos);
}));

router.get('/:id', optionalAuth, asyncH(async (req, res) => {
  const cofradia = await knex('cofradia').where('id', req.params.id).first();
  if (!cofradia) return notFound(res, 'Cofradía no encontrada');
  res.json(formatear(cofradia, { publico: !puedeGestionar(req.user, cofradia.id) }));
}));

// =====================================================================
// CRUD (solo admin)
// =====================================================================

router.post('/', requireAdmin, validate(crearSchema), asyncH(async (req, res) => {
  const datos = { ...req.body, organizacion_id: req.body.organizacion_id || 1, color: req.body.color || '#000' };
  if (datos.ubicacion_link) {
    datos.ubicacion_link_actualizado = knex.fn.now();
    const coords = coordsDesdeLink(datos.ubicacion_link);
    if (coords) Object.assign(datos, coords);
  }
  datos.slug = await slugUnico(knex, 'cofradia', datos.nickname_cofradia);

  const id = await insertarId(knex('cofradia').insert(datos));
  await audit(req, 'crear', 'cofradia', id, { nickname_cofradia: datos.nickname_cofradia });
  res.status(201).json({ message: 'Cofradía creada con éxito', id, slug: datos.slug });
}));

router.put('/:id', requireAdmin, validate(editarSchema), asyncH(async (req, res) => {
  const { id } = req.params;
  const cofradia = await knex('cofradia').where('id', id).first();
  if (!cofradia) return notFound(res, 'Cofradía no encontrada');

  const updates = Object.fromEntries(Object.entries(req.body).filter(([, v]) => v !== undefined));
  if ('ubicacion_link' in updates && updates.ubicacion_link !== cofradia.ubicacion_link) {
    updates.ubicacion_link_actualizado = knex.fn.now();
    const coords = coordsDesdeLink(updates.ubicacion_link);
    Object.assign(updates, coords || { lat: null, lng: null, ubicacion_precision: null });
  }
  if (!cofradia.slug) updates.slug = await slugUnico(knex, 'cofradia', updates.nickname_cofradia || cofradia.nickname_cofradia, id);
  if (Object.keys(updates).length === 0) return badRequest(res, 'No se enviaron datos para actualizar.');

  await knex('cofradia').where('id', id).update(updates);
  await audit(req, 'editar', 'cofradia', id, diff(cofradia, req.body));
  res.json({ message: 'Cofradía actualizada con éxito' });
}));

// =====================================================================
// UBICACIÓN EN VIVO (localizador de la cofradía o admin)
// =====================================================================

const actualizarUbicacion = async (req, res, cofradiaId) => {
  if (!cofradiaId) return badRequest(res, 'Tu usuario no tiene una cofradía asignada.');
  if (!puedeGestionar(req.user, cofradiaId)) return forbidden(res, 'Solo puedes actualizar la ubicación de tu cofradía.');

  const cofradia = await knex('cofradia').where('id', cofradiaId).first();
  if (!cofradia) return notFound(res, 'Cofradía no encontrada');

  const { lat, lng, precision, ubicacion_link } = req.body;
  const updates = { ubicacion_link_actualizado: knex.fn.now(), compartiendo: true };
  if (lat !== undefined && lng !== undefined) {
    Object.assign(updates, {
      lat, lng, ubicacion_precision: precision === undefined ? null : Math.round(precision), ubicacion_link: linkDesdeCoords(lat, lng),
    });
  } else {
    const coords = coordsDesdeLink(ubicacion_link);
    Object.assign(updates, { ubicacion_link, lat: coords?.lat ?? null, lng: coords?.lng ?? null, ubicacion_precision: null });
  }

  await knex('cofradia').where('id', cofradiaId).update(updates);

  // Solo se audita y notifica al INICIAR el recorrido (no en cada actualización periódica)
  if (!cofradia.compartiendo) {
    await audit(req, 'ubicacion', 'cofradia', cofradiaId, { evento: 'inicio_recorrido' });
    push.notificarSeguidores(cofradiaId, {
      title: `${cofradia.nickname_cofradia} está en recorrido`,
      body: 'Toca para ver dónde está ahora en el mapa.',
      url: `/sigueteo?vista=mapa&cofradia_mapa=${cofradia.slug || cofradiaId}`,
      tag: `recorrido-${cofradiaId}`,
    }).catch((e) => console.warn('Push recorrido:', e.message));
  }

  res.json({ message: 'Ubicación actualizada', ubicacion_link: updates.ubicacion_link, lat: updates.lat, lng: updates.lng });
};

const detenerUbicacion = async (req, res, cofradiaId) => {
  if (!cofradiaId) return badRequest(res, 'Tu usuario no tiene una cofradía asignada.');
  if (!puedeGestionar(req.user, cofradiaId)) return forbidden(res, 'Solo puedes gestionar la ubicación de tu cofradía.');
  const n = await knex('cofradia').where('id', cofradiaId).update({ compartiendo: false });
  if (!n) return notFound(res, 'Cofradía no encontrada');
  await audit(req, 'ubicacion', 'cofradia', cofradiaId, { evento: 'fin_recorrido' });
  res.json({ message: 'Dejaste de compartir la ubicación en vivo' });
};

const localizadorOAdmin = requireRole('admin', 'localizador');

// El id de la cofradía se toma del token: un localizador no puede tocar otra cofradía
router.patch('/mi-ubicacion', localizadorOAdmin, limits.ubicacion, validate(ubicacionSchema),
  asyncH((req, res) => actualizarUbicacion(req, res, req.user.cofradiaId)));
router.delete('/mi-ubicacion', localizadorOAdmin,
  asyncH((req, res) => detenerUbicacion(req, res, req.user.cofradiaId)));
// Variante con id explícito (admin, o el localizador de esa misma cofradía)
router.patch('/:id/ubicacion', localizadorOAdmin, limits.ubicacion, validate(ubicacionSchema),
  asyncH((req, res) => actualizarUbicacion(req, res, Number(req.params.id))));
router.delete('/:id/ubicacion', localizadorOAdmin,
  asyncH((req, res) => detenerUbicacion(req, res, Number(req.params.id))));

// =====================================================================
// VOTOS: un voto por dispositivo, por cofradía y por día
// =====================================================================

const sha = (s) => crypto.createHash('sha256').update(`${config.voteSalt}:${s}`).digest('hex');
const hoy = () => push.ahoraLocal().fecha;

// El frontend envía un identificador aleatorio del dispositivo (X-Device-Id)
const hashVotante = (req) => {
  const deviceId = String(req.get('X-Device-Id') || '');
  return /^[A-Za-z0-9-]{16,64}$/.test(deviceId) ? sha(`dev:${deviceId}`) : null;
};

router.post('/:id/votar', limits.voto, asyncH(async (req, res) => {
  const id = Number(req.params.id);
  const votante = hashVotante(req);
  if (!votante) return badRequest(res, 'No se pudo identificar el dispositivo. Recarga la página e intenta de nuevo.');

  const cofradia = await knex('cofradia').where('id', id).first('id');
  if (!cofradia) return notFound(res, 'Cofradía no encontrada');

  const fecha = hoy();
  const ipHash = sha(`ip:${req.ip}`);
  const [{ n }] = await knex('votos').where({ cofradia_id: id, ip_hash: ipHash, fecha }).count({ n: '*' });
  if (Number(n) >= config.votosPorIpDia) {
    return res.status(429).json({ error: 'Se alcanzó el límite de votos para esta conexión hoy.', message: 'Se alcanzó el límite de votos para esta conexión hoy.' });
  }

  try {
    await knex.transaction(async (trx) => {
      await trx('votos').insert({ cofradia_id: id, votante_hash: votante, ip_hash: ipHash, fecha });
      await trx('cofradia').where('id', id).increment('votos', 1);
    });
  } catch (err) {
    if (!esDuplicado(err)) throw err;
    const { votos } = await knex('cofradia').where('id', id).first('votos');
    return res.status(409).json({ error: 'Ya votaste por esta cofradía hoy.', message: 'Ya votaste por esta cofradía hoy.', votos, yaVotaste: true });
  }

  const { votos } = await knex('cofradia').where('id', id).first('votos');
  res.json({ message: 'Voto registrado con éxito', votos, yaVotaste: true });
}));

// Solo quita el voto que ESTE dispositivo dio hoy
router.delete('/:id/votar', limits.voto, asyncH(async (req, res) => {
  const id = Number(req.params.id);
  const votante = hashVotante(req);
  if (!votante) return badRequest(res, 'No se pudo identificar el dispositivo.');

  const cofradia = await knex('cofradia').where('id', id).first('id');
  if (!cofradia) return notFound(res, 'Cofradía no encontrada');

  await knex.transaction(async (trx) => {
    const borrados = await trx('votos').where({ cofradia_id: id, votante_hash: votante, fecha: hoy() }).del();
    if (borrados) await trx('cofradia').where('id', id).where('votos', '>', 0).decrement('votos', 1);
  });

  const { votos } = await knex('cofradia').where('id', id).first('votos');
  res.json({ message: 'Voto removido con éxito', votos, yaVotaste: false });
}));

// =====================================================================
// FOTOS GRUPALES DE CUADRILLA (una por año)
// =====================================================================

const permisoCofradia = (req, res, next) =>
  puedeGestionar(req.user, req.params.id) ? next() : forbidden(res, 'No tienes permiso para gestionar esta cofradía.');

router.post('/:id/fotos', localizadorOAdmin, permisoCofradia, imageUpload('foto', 'cuadrillas', { maxMB: 8, maxSize: 2000 }),
  asyncH(async (req, res) => {
    if (!req.savedImage) return badRequest(res, 'Debes adjuntar una imagen.');
    const { id } = req.params;
    const ruta_foto = req.savedImage;
    const anio = parseInt(req.body.anio, 10);

    if (!anio || anio < 2000 || anio > 2100) {
      borrarArchivoPublico(ruta_foto);
      return badRequest(res, 'Año inválido.');
    }

    try {
      const cofradia = await knex('cofradia').where('id', id).first('id');
      if (!cofradia) {
        borrarArchivoPublico(ruta_foto);
        return notFound(res, 'Cofradía no encontrada');
      }
      const existente = await knex('fotos_cuadrilla').where({ cod_cofradia: id, anio }).first();
      if (existente) {
        await knex('fotos_cuadrilla').where('id', existente.id).update({ ruta_foto, actualizado: knex.fn.now() });
        borrarArchivoPublico(existente.ruta_foto);
      } else {
        await knex('fotos_cuadrilla').insert({ cod_cofradia: id, anio, ruta_foto });
      }
      await audit(req, existente ? 'editar' : 'crear', 'foto_cuadrilla', id, { anio });
      res.status(201).json({ message: 'Foto de la cuadrilla guardada', anio, ruta_foto });
    } catch (err) {
      borrarArchivoPublico(ruta_foto);
      return fail(res, err, 'Error guardando la foto');
    }
  })
);

router.delete('/fotos/:fotoId', localizadorOAdmin, asyncH(async (req, res) => {
  const foto = await knex('fotos_cuadrilla').where('id', req.params.fotoId).first();
  if (!foto) return notFound(res, 'Foto no encontrada');
  if (!puedeGestionar(req.user, foto.cod_cofradia)) return forbidden(res, 'No tienes permiso para gestionar esta cofradía.');

  await knex('fotos_cuadrilla').where('id', foto.id).del();
  borrarArchivoPublico(foto.ruta_foto);
  await audit(req, 'eliminar', 'foto_cuadrilla', foto.cod_cofradia, { anio: foto.anio });
  res.json({ message: 'Foto eliminada' });
}));

// Va al final para que /mi-ubicacion y /fotos/:id no caigan en esta ruta
router.delete('/:id', requireAdmin, asyncH(async (req, res) => {
  const cofradia = await knex('cofradia').where('id', req.params.id).first();
  if (!cofradia) return notFound(res, 'Cofradía no encontrada');
  await knex('cofradia').where('id', cofradia.id).del();
  await audit(req, 'eliminar', 'cofradia', cofradia.id, { nickname_cofradia: cofradia.nickname_cofradia });
  res.json({ message: 'Cofradía eliminada con éxito' });
}));

module.exports = router;
