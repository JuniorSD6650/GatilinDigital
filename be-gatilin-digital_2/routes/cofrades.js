const express = require('express');
const router = express.Router();
const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig);
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const ExcelJS = require('exceljs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/cofrades');
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${Date.now()}${fileExtension}`;
    cb(null, fileName);
  }
});

const upload_storage = multer({ storage: storage });
const upload = multer({ dest: 'uploads/' }); // Para archivos temporales de excel

// Columnas del Excel (Agregamos AÑO)
const COFRADE_COLUMNS = [
  { header: 'DNI Cofrade', key: 'dni_cofrade', width: 20 },
  { header: 'Nombres y Apellidos', key: 'nombres_apellidos', width: 50 },
  { header: 'Celular', key: 'celular', width: 15 },
  { header: 'Personaje Cofradía', key: 'personaje_cofradia', width: 30 },
  { header: 'Cargo Cofrade', key: 'cargo_cofrade', width: 30 },
  { header: 'Código Cofradía', key: 'cod_cofradia', width: 20 },
  { header: 'Año', key: 'anio', width: 10 } // Nueva columna
];

// Descargar plantilla
router.get('/template', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Plantilla Cofrades');

    worksheet.columns = COFRADE_COLUMNS;
    worksheet.getRow(1).font = { bold: true };

    // Ejemplo de año
    worksheet.getCell('G2').value = new Date().getFullYear();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Plantilla_Cofrades.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Error al generar la plantilla', details: error.message });
  }
});

// Listar cofrades por cofradía (para frontend público)
router.get('/by-cofradia/:cofradiaId', async (req, res) => {
  const { cofradiaId } = req.params;
  try {
    const cofrades = await knex('cofrades')
      .select('cofrades.*', 'cofradia.nickname_cofradia', 'cofradia.color')
      .leftJoin('cofradia', 'cofrades.cod_cofradia', 'cofradia.id')
      .where('cofrades.cod_cofradia', cofradiaId)
      .orderBy('cofrades.anio', 'desc')
      .orderBy('cofrades.cargo_cofrade', 'asc')
      .orderBy('cofrades.nombres_apellidos', 'asc');

    res.json(cofrades);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo cofrades de la cofradía', details: err.message });
  }
});

// Listar todos
router.get('/', async (req, res) => {
  try {
    const cofrades = await knex('cofrades')
      .select('cofrades.*', 'cofradia.nickname_cofradia')
      .leftJoin('cofradia', 'cofrades.cod_cofradia', 'cofradia.id')
      .orderBy('cofrades.anio', 'desc') // Ordenar por año primero
      .orderBy('cofrades.id', 'desc');

    res.json(cofrades);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo los cofrades', details: err.message });
  }
});

// Obtener uno
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const cofrade = await knex('cofrades')
      .select('cofrades.*', 'cofradia.nickname_cofradia')
      .leftJoin('cofradia', 'cofrades.cod_cofradia', 'cofradia.id')
      .where('cofrades.id', id)
      .first();

    if (!cofrade) return res.status(404).json({ error: 'Cofrade no encontrado' });
    res.json(cofrade);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo el cofrade', details: err.message });
  }
});

// Cargar datos por excel (Bulk Upload)
router.post('/bulk-upload', upload.single('file'), async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.getWorksheet(1);
    const failedRecords = [];
    const currentYear = new Date().getFullYear();

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      
      // Si la fila está vacía, saltar
      if (!row.getCell(1).value && !row.getCell(2).value) continue;

      const dni_cofrade = row.getCell(1).value ? row.getCell(1).value.toString().trim() : null;
      const nombres_apellidos = row.getCell(2).value ? row.getCell(2).value.toString().trim() : null;
      const celular = row.getCell(3).value ? row.getCell(3).value.toString().trim() : null;
      const personaje_cofradia = row.getCell(4).value ? row.getCell(4).value.toString().trim() : 'ninguno';
      const cargo_cofrade = row.getCell(5).value ? row.getCell(5).value.toString().trim() : 'ninguno';
      
      // Manejo de cod_cofradia
      let cod_cofradia = row.getCell(6).value;
      if (cod_cofradia && typeof cod_cofradia === 'object') cod_cofradia = cod_cofradia.result;
      cod_cofradia = cod_cofradia ? parseInt(cod_cofradia.toString().trim(), 10) : null;

      // Manejo de AÑO (Columna 7 en el orden visual de lectura, asumiendo foto va al final o se omite en excel simple)
      // Ajuste: En la plantilla definimos Anio como ultima columna.
      // Celda 7 era Foto en tu código anterior, ahora Anio es la 7 según COFRADE_COLUMNS arriba.
      // Si usas la plantilla nueva: 1:DNI, 2:Nom, 3:Cel, 4:Pers, 5:Cargo, 6:Cod, 7:ANIO
      let anio = row.getCell(7).value;
      if (anio && typeof anio === 'object') anio = anio.result;
      anio = anio ? parseInt(anio.toString().trim(), 10) : currentYear;

      // Validar cofradía
      const cofradiaExists = await knex('cofradia').where('id', cod_cofradia).first();
      if (!cofradiaExists) {
        failedRecords.push({ dni_cofrade, nombres_apellidos, error: `Cofradía ID ${cod_cofradia} no existe` });
        continue;
      }

      try {
        await knex('cofrades').insert({
          dni_cofrade,
          nombres_apellidos,
          celular,
          personaje_cofradia,
          cargo_cofrade,
          cod_cofradia,
          anio: anio, // Insertamos el año
          ruta_foto: null // Por excel no subimos foto binaria
        });
      } catch (error) {
        console.error(`Error fila ${i}:`, error.message);
        failedRecords.push({ dni_cofrade, nombres_apellidos, error: error.message });
      }
    }

    fs.unlink(req.file.path, () => {}); // Borrar temporal

    if (failedRecords.length > 0) {
      return res.status(207).json({ 
        message: 'Carga completada con errores', 
        failedRecords 
      });
    }

    res.status(200).json({ message: 'Datos cargados correctamente.' });

  } catch (err) {
    console.error('Error procesando archivo:', err);
    res.status(500).json({ error: 'Error procesando archivo', details: err.message });
  }
});

// Crear Cofrade (POST)
router.post('/', upload_storage.single('foto'), async (req, res) => {
  const { dni_cofrade, nombres_apellidos, celular, personaje_cofradia, cargo_cofrade, cod_cofradia, anio } = req.body;
  const ruta_foto = req.file ? `uploads/cofrades/${req.file.filename}` : null;

  try {
    const result = await knex('cofrades').insert({
      dni_cofrade,
      nombres_apellidos,
      celular,
      personaje_cofradia,
      cargo_cofrade,
      ruta_foto,
      cod_cofradia,
      anio: anio || new Date().getFullYear() // Default año actual
    });

    res.status(201).json({ message: 'Cofrade registrado', id: result[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error registrando', details: err.message });
  }
});

// Editar Cofrade (PUT)
router.put('/:id', upload_storage.single('foto'), async (req, res) => {
  const { id } = req.params;
  const { dni_cofrade, nombres_apellidos, celular, personaje_cofradia, cargo_cofrade, cod_cofradia, anio } = req.body;

  try {
    const cofrade = await knex('cofrades').where('id', id).first();
    if (!cofrade) return res.status(404).json({ error: 'No encontrado' });

    // Manejo de foto (borrar anterior si hay nueva)
    let ruta_foto = undefined;
    if (req.file) {
      ruta_foto = `uploads/cofrades/${req.file.filename}`;
      if (cofrade.ruta_foto) {
        const oldPath = path.join(__dirname, '..', 'public', cofrade.ruta_foto);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    await knex('cofrades').where('id', id).update({
      dni_cofrade,
      nombres_apellidos,
      celular,
      personaje_cofradia,
      cargo_cofrade,
      cod_cofradia,
      anio,
      ...(ruta_foto && { ruta_foto }) // Solo actualiza foto si se envió una nueva
    });

    res.json({ message: 'Cofrade actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando', details: err.message });
  }
});

// Eliminar Cofrade (DELETE)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const cofrade = await knex('cofrades').where('id', id).first();
    if (!cofrade) return res.status(404).json({ error: 'No encontrado' });

    if (cofrade.ruta_foto) {
      const filePath = path.join(__dirname, '..', 'public', cofrade.ruta_foto);
      if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
    }

    await knex('cofrades').where('id', id).del();
    res.json({ message: 'Cofrade eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando', details: err.message });
  }
});

module.exports = router;