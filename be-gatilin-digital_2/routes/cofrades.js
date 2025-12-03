const express = require('express');
const router = express.Router();
const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig);
const path = require('path');

const fs = require('fs');
const multer = require('multer');
const ExcelJS = require('exceljs');
const upload = multer({ dest: 'uploads/' });

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

const COFRADE_COLUMNS = [
  { header: 'DNI Cofrade', key: 'dni_cofrade', width: 20 },
  { header: 'Nombres y Apellidos', key: 'nombres_apellidos', width: 50 },
  { header: 'Celular', key: 'celular', width: 15 },
  { header: 'Personaje Cofradía', key: 'personaje_cofradia', width: 30 },
  { header: 'Cargo Cofrade', key: 'cargo_cofrade', width: 30 },
  { header: 'Código Cofradía', key: 'cod_cofradia', width: 20 }
];

// Descargar plantilla
router.get('/template', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Plantilla Cofrades');

    worksheet.columns = COFRADE_COLUMNS;
    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Plantilla_Cofrades.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Error al generar la plantilla', details: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const cofrades = await knex('cofrades')
      .select(
        'cofrades.*',
        'cofradia.nickname_cofradia'
      )
      .leftJoin('cofradia', 'cofrades.cod_cofradia', 'cofradia.id')
      .orderBy('cofrades.id', 'desc');

    res.json(cofrades);
  } catch (err) {
    res.status(500).json({
      error: 'Error obteniendo los cofrades',
      details: err.message || err
    });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const cofrade = await knex('cofrades')
      .select(
        'cofrades.*',
        'cofradia.nickname_cofradia'
      )
      .leftJoin('cofradia', 'cofrades.cod_cofradia', 'cofradia.id')
      .where('cofrades.id', id)
      .first();

    if (!cofrade) {
      return res.status(404).json({ error: 'Cofrade no encontrado' });
    }

    res.json(cofrade);
  } catch (err) {
    res.status(500).json({
      error: 'Error obteniendo el cofrade',
      details: err.message || err
    });
  }
});

// Cargar datos por excel
router.post('/bulk-upload', upload.single('file'), async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.getWorksheet(1);
    const failedRecords = [];

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);

      // Leer valores de las celdas
      const dni_cofrade = row.getCell(1).value ? row.getCell(1).value.toString().trim() : null;
      const nombres_apellidos = row.getCell(2).value ? row.getCell(2).value.toString().trim() : null;
      const celular = row.getCell(3).value ? row.getCell(3).value.toString().trim() : null;
      const personaje_cofradia = row.getCell(4).value ? row.getCell(4).value.toString().trim() : 'ninguno';
      const cargo_cofrade = row.getCell(5).value ? row.getCell(5).value.toString().trim() : 'ninguno';
      const ruta_foto = row.getCell(7).value ? row.getCell(7).value.toString().trim() : null;

      // 🔹 SOLUCIÓN: Convertimos cod_cofradia correctamente
      let cod_cofradia = row.getCell(6).value;

      if (cod_cofradia) {
        if (typeof cod_cofradia === 'object' && cod_cofradia.result) {
          cod_cofradia = cod_cofradia.result; // Si ExcelJS detecta una fórmula, obtenemos el resultado
        }

        cod_cofradia = cod_cofradia.toString().trim(); // Convertimos a String y eliminamos espacios
        cod_cofradia = parseInt(cod_cofradia, 10); // Convertimos a número entero
      }

      // Verificar si la cofradía existe en la BD antes de insertar
      const cofradiaExists = await knex('cofradia').where('id', cod_cofradia).first();
      if (!cofradiaExists) {
        console.warn(`Fila ${i} ignorada: Cofradía con ID ${cod_cofradia} no existe.`);
        continue;
      }

      // Insertar el registro
      try {
        await knex('cofrades').insert({
          dni_cofrade,
          nombres_apellidos,
          celular,
          personaje_cofradia,
          cargo_cofrade,
          ruta_foto,
          cod_cofradia,
        });
      } catch (error) {
        console.error(`Error en fila ${i}:`, error.message);
        failedRecords.push({ dni_cofrade, nombres_apellidos, celular, cod_cofradia });
      }
    }

    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error eliminando archivo temporal:', err.message);
    });

    if (failedRecords.length > 0) {
      const failedWorkbook = new ExcelJS.Workbook();
      const failedWorksheet = failedWorkbook.addWorksheet('Errores');

      failedWorksheet.columns = COFRADE_COLUMNS;
      failedWorksheet.getRow(1).font = { bold: true };

      failedRecords.forEach((record) => {
        failedWorksheet.addRow(record);
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=Errores_Carga_Cofrades.xlsx');

      await failedWorkbook.xlsx.write(res);
      return res.end();
    }

    res.status(200).json({ message: 'Datos cargados correctamente.' });

  } catch (err) {
    console.error('Error al procesar el archivo:', err.message);
    res.status(500).json({ error: 'Error al procesar el archivo', details: err.message });
  }
});

router.post('/', upload_storage.single('foto'), async (req, res) => {
  const {
    dni_cofrade,
    nombres_apellidos,
    celular,
    personaje_cofradia,
    cargo_cofrade,
    cod_cofradia
  } = req.body;

  const ruta_foto = req.file ? `uploads/cofrades/${req.file.filename}` : null;

  try {
    const result = await knex('cofrades').insert({
      dni_cofrade,
      nombres_apellidos,
      celular,
      personaje_cofradia,
      cargo_cofrade,
      ruta_foto,
      cod_cofradia
    });

    const newCofradeId = result[0];

    res.status(201).json({
      message: 'Cofrade registrado con éxito',
      id: newCofradeId
    });

  } catch (err) {
    res.status(500).json({
      error: 'Error registrando al cofrade',
      details: err.message || err
    });
  }
});

router.put('/:id', upload_storage.single('foto'), async (req, res) => {
  const { id } = req.params;
  const {
    dni_cofrade,
    nombres_apellidos,
    celular,
    personaje_cofradia,
    cargo_cofrade,
    cod_cofradia
  } = req.body;

  try {
    const cofrade = await knex('cofrades').where('id', id).first();
    const oldFotoRuta = cofrade ? cofrade.ruta_foto : null;

    if (oldFotoRuta) {
      const oldFilePath = path.join(__dirname, '..', 'public', oldFotoRuta);

      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const ruta_foto = req.file ? `uploads/cofrades/${req.file.filename}` : null;

    const updatedCofrade = await knex('cofrades')
      .where('id', id)
      .update({
        dni_cofrade,
        nombres_apellidos,
        celular,
        personaje_cofradia,
        cargo_cofrade,
        ruta_foto: ruta_foto || knex.raw('ruta_foto'),
        cod_cofradia
      });

    if (updatedCofrade === 0) {
      return res.status(404).json({ error: 'Cofrade no encontrado' });
    }

    res.json({ message: 'Cofrade actualizado con éxito' });
  } catch (err) {
    res.status(500).json({
      error: 'Error actualizando al cofrade',
      details: err.message || err
    });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const cofrade = await knex('cofrades').where('id', id).first();
    const ruta_foto = cofrade ? cofrade.ruta_foto : null;

    if (ruta_foto) {
      const filePath = path.join(__dirname, '..', 'public', ruta_foto);

      try {
        // Intentamos eliminar el archivo
        await fs.promises.unlink(filePath);
      } catch (err) {
        return res.status(500).json({ error: "Error eliminando el archivo", details: err.message || err });
      }
    }

    const deletedCofrade = await knex('cofrades').where('id', id).del();

    if (deletedCofrade === 0) {
      return res.status(404).json({ error: 'Cofrade no encontrado' });
    }

    res.json({ message: 'Cofrade eliminado con éxito' });
  } catch (err) {
    res.status(500).json({
      error: 'Error eliminando al cofrade',
      details: err.message || err
    });
  }
});

module.exports = router;
