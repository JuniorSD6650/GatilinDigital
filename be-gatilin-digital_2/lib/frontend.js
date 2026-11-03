// Sirve el frontend Next.js exportado (out/) desde este mismo servidor Express.
// Rutas del export: /agenda -> agenda.html, / -> index.html, assets en /_next/static.
const path = require('path');
const fs = require('fs');
const express = require('express');

const frontend = (dir) => {
  const raiz = path.resolve(dir);
  const pagina404 = path.join(raiz, '404.html');
  const router = express.Router();

  // HTML: siempre revalidar (para que un nuevo despliegue se vea al instante)
  const cabecerasHtml = (res) => res.setHeader('Cache-Control', 'no-cache');

  // Archivos reales (JS/CSS con hash, imágenes, sw.js, manifest, index.html)
  router.use(
    express.static(raiz, {
      index: 'index.html',
      redirect: false,
      dotfiles: 'ignore',
      setHeaders: (res, ruta) => {
        if (ruta.includes(`${path.sep}_next${path.sep}static${path.sep}`)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (ruta.endsWith('.html') || ruta.endsWith('sw.js')) {
          cabecerasHtml(res);
        }
      },
    })
  );

  // Páginas sin extensión: /agenda -> agenda.html, /admin/ -> admin.html
  router.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    let ruta;
    try {
      ruta = decodeURIComponent(req.path).replace(/\/+$/, '');
    } catch {
      return next();
    }
    if (!ruta || path.extname(ruta)) return next();
    const archivo = path.resolve(raiz, `.${ruta}.html`);
    if (!archivo.startsWith(raiz + path.sep)) return next();
    fs.stat(archivo, (err, st) => {
      if (err || !st.isFile()) return next();
      cabecerasHtml(res);
      res.sendFile(archivo);
    });
  });

  // Cualquier otra ruta de la web: página 404 del frontend
  router.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (!fs.existsSync(pagina404)) return next();
    cabecerasHtml(res);
    res.status(404).sendFile(pagina404);
  });

  return router;
};

module.exports = frontend;
