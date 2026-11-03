// Páginas para compartir con vista previa (Open Graph).
// El frontend es un sitio estático, así que no puede generar etiquetas OG por
// cofradía. Este endpoint devuelve un HTML mínimo con las etiquetas correctas
// (lo que leen WhatsApp/Facebook) y redirige a las personas al frontend.
const express = require('express');
const knex = require('../lib/db');
const config = require('../lib/config');
const { asyncH } = require('../lib/http');

const router = express.Router();

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const pagina = ({ titulo, descripcion, imagen, destino }) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Gatilín Digital">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta property="og:url" content="${esc(destino)}">
${imagen ? `<meta property="og:image" content="${esc(imagen)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${esc(destino)}">
<meta http-equiv="refresh" content="0;url=${esc(destino)}">
<style>body{font-family:system-ui,sans-serif;background:#0c0812;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0}a{color:#f4c542}</style>
</head>
<body>
<p>Abriendo <a href="${esc(destino)}">${esc(titulo)}</a>…</p>
<script>location.replace(${JSON.stringify(destino)})</script>
</body>
</html>`;

router.get('/cofradia/:slug', asyncH(async (req, res) => {
  const slug = String(req.params.slug).slice(0, 140);
  const c = await knex('cofradia').where('slug', slug).orWhere('id', /^\d+$/.test(slug) ? Number(slug) : 0).first();
  if (!c) {
    return res.redirect(302, `${config.frontendUrl}/sigueteo`);
  }
  const foto = await knex('fotos_cuadrilla').where('cod_cofradia', c.id).orderBy('anio', 'desc').first('ruta_foto');
  const destino = `${config.frontendUrl}/cofradia?slug=${encodeURIComponent(c.slug || c.id)}`;
  res.setHeader('Cache-Control', 'public, max-age=300');
  // Esta página sí necesita su estilo y su script de redirección en línea
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src * data:; frame-ancestors 'none'");
  res.type('html').send(
    pagina({
      titulo: `${c.nickname_cofradia} · Gatilín Digital`,
      descripcion: c.descripcion || `Sigue a ${c.nickname_cofradia} en la Festividad de los Negritos de Huánuco.`,
      imagen: foto ? `${config.publicApiUrl}/${foto.ruta_foto}` : `${config.frontendUrl}/images/og-default.jpg`,
      destino,
    })
  );
}));

module.exports = router;
