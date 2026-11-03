// Subida de archivos segura:
//  - Imágenes: solo JPG/PNG/WEBP, con tamaño máximo. Se re-codifican con sharp
//    (redimensionadas y convertidas a WebP). Re-codificar elimina metadatos
//    (p. ej. el GPS de la foto) y cualquier contenido embebido no deseado.
//  - Excel: solo .xlsx, se procesa en memoria, con tamaño máximo.
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const sharp = require('sharp');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const IMAGE_MIME = /^image\/(jpeg|png|webp)$/;
const XLSX_MIME = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/octet-stream', // algunos navegadores en Windows
]);

const errorArchivo = (message) => Object.assign(new Error(message), { status: 400 });

const imageMemory = (maxMB) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxMB * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) =>
      IMAGE_MIME.test(file.mimetype) ? cb(null, true) : cb(errorArchivo('Formato de imagen no permitido. Usa JPG, PNG o WEBP.')),
  });

const excelMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const okExt = path.extname(file.originalname).toLowerCase() === '.xlsx';
    return okExt && XLSX_MIME.has(file.mimetype) ? cb(null, true) : cb(errorArchivo('Solo se aceptan archivos Excel (.xlsx).'));
  },
});

// Ejecuta multer y traduce sus errores a 400 con mensaje claro
const runMulter = (mw) => (req, res, next) =>
  mw(req, res, (err) => {
    if (!err) return next();
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'El archivo supera el tamaño máximo permitido.'
      : err.code === 'LIMIT_UNEXPECTED_FILE' ? 'Campo de archivo inesperado.'
      : err.status === 400 ? err.message : 'Archivo inválido.';
    res.status(400).json({ error: message, message });
  });

/**
 * Acepta una imagen en `field` (opcional), la optimiza y la guarda en
 * public/uploads/<carpeta>. Deja la ruta relativa en req.savedImage.
 * También procesa los campos de texto multipart (req.body).
 */
const imageUpload = (field, carpeta, { maxMB = 8, maxSize = 1600, quality = 80 } = {}) => {
  const dir = path.join(PUBLIC_DIR, 'uploads', carpeta);
  fs.mkdirSync(dir, { recursive: true });
  const mw = runMulter(imageMemory(maxMB).single(field));

  return (req, res, next) =>
    mw(req, res, async () => {
      if (!req.file) return next();
      try {
        const nombre = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.webp`;
        await sharp(req.file.buffer, { failOn: 'error' })
          .rotate() // respeta la orientación EXIF antes de descartar metadatos
          .resize({ width: maxSize, height: maxSize, fit: 'inside', withoutEnlargement: true })
          .webp({ quality })
          .toFile(path.join(dir, nombre));
        req.savedImage = `uploads/${carpeta}/${nombre}`;
        req.file.buffer = null;
        next();
      } catch (err) {
        console.error('Error procesando imagen:', err.message);
        res.status(400).json({ error: 'La imagen está dañada o no es válida.', message: 'La imagen está dañada o no es válida.' });
      }
    });
};

const excelUpload = runMulter(excelMemory.single('file'));

// Borra un archivo dentro de public/ sin permitir rutas fuera de esa carpeta
const borrarArchivoPublico = (rutaRelativa) => {
  if (!rutaRelativa || /^https?:/i.test(rutaRelativa)) return;
  const filePath = path.resolve(PUBLIC_DIR, rutaRelativa);
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) return;
  fs.promises.unlink(filePath).catch(() => {});
};

module.exports = { imageUpload, excelUpload, borrarArchivoPublico, PUBLIC_DIR };
