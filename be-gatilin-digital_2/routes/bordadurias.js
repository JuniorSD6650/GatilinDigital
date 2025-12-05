const express = require('express');
const router = express.Router();
const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig);

const fs = require('fs');
const multer = require('multer');
const ExcelJS = require('exceljs');
const upload = multer({ dest: 'uploads/' });

const BORADURIA_COLUMNS = [
  { header: 'RUC', key: 'ruc', width: 20 },
  { header: 'Razón Social', key: 'razon_social', width: 50 },
  { header: 'Descripción', key: 'descripcion', width: 50 },
  { header: 'Dirección', key: 'direccion', width: 50 },
  { header: 'Web/Facebook', key: 'web_fb', width: 30 },
  { header: 'Representante', key: 'representante', width: 30 },
  { header: 'Celular', key: 'celular', width: 20 }
];

router.get('/template', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Plantilla Bordadurías');

    worksheet.columns = BORADURIA_COLUMNS;
    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Plantilla_Bordadurias.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Error al generar la plantilla', details: error.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const cofradias = await knex('bordadurias')
      .select('id', 'razon_social')
      .orderBy('id', 'asc');

    res.status(200).json(cofradias);
  } catch (err) {
    res.status(500).json({
      error: 'Error obteniendo la lista de bordadurías',
      details: err.message || err,
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const bordadurias = await knex('bordadurias')
      .select('*')
      .orderBy('id', 'desc');

    res.json(bordadurias);
  } catch (err) {
    res.status(500).json({
      error: 'Error obteniendo las bordadurías',
      details: err.message || err
    });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const bordaduria = await knex('bordadurias')
      .where('id', id)
      .first();

    if (!bordaduria) {
      return res.status(404).json({ error: 'Bordaduría no encontrada' });
    }

    res.json(bordaduria);
  } catch (err) {
    res.status(500).json({
      error: 'Error obteniendo la bordaduría',
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
      const record = {
        ruc: row.getCell(1).value?.toString().trim() || null,
        razon_social: row.getCell(2).value?.toString().trim() || null,
        descripcion: row.getCell(3).value?.toString().trim() || null,
        direccion: row.getCell(4).value?.toString().trim() || null,
        web_fb: row.getCell(5).value?.toString().trim() || null,
        representante: row.getCell(6).value?.toString().trim() || null,
        celular: row.getCell(7).value?.toString().trim() || null,
      };

      if (!record.ruc || !record.razon_social || !record.direccion || !record.representante) {
        console.warn(`Fila ${i} ignorada: faltan campos obligatorios.`);
        continue;
      }

      try {
        await knex('bordadurias').insert(record);
      } catch (error) {
        console.error(`Error en fila ${i}:`, error.message);
        failedRecords.push(record);
      }
    }

    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error('Error eliminando archivo temporal:', err.message);
      } else {
        console.log('Archivo temporal eliminado:', req.file.path);
      }
    });

    if (failedRecords.length > 0) {
      const failedWorkbook = new ExcelJS.Workbook();
      const failedWorksheet = failedWorkbook.addWorksheet('Errores');

      failedWorksheet.columns = BORADURIA_COLUMNS;
      failedWorksheet.getRow(1).font = { bold: true };

      failedRecords.forEach((record) => {
        failedWorksheet.addRow(record);
      });

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=Errores_Carga_Bordadurias.xlsx'
      );

      await failedWorkbook.xlsx.write(res);
      return res.end();
    }

    res.status(200).json({ message: 'Datos cargados correctamente.' });
  } catch (err) {
    console.error('Error al procesar el archivo:', err.message);

    fs.unlink(req.file.path, (unlinkErr) => {
      if (unlinkErr) {
        console.error('Error eliminando archivo temporal:', unlinkErr.message);
      }
    });

    res.status(500).json({ error: 'Error al procesar el archivo', details: err.message });
  }
});


router.post('/', async (req, res) => {
  const { ruc, razon_social, descripcion, direccion, web_fb, representante, celular } = req.body;
  try {
    const result = await knex('bordadurias').insert({
      ruc, razon_social, descripcion, direccion, web_fb, representante, celular
    });

    const newBordaduriaId = result[0];
    res.status(201).json({ message: 'Bordaduría creada con éxito', id: newBordaduriaId });
  } catch (err) {
    res.status(500).json({ error: 'Error creando la bordaduría', details: err.message || err });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { ruc, razon_social, descripcion, direccion, web_fb, representante, celular } = req.body;
  try {
    const updatedBordaduria = await knex('bordadurias')
      .where('id', id)
      .update({ ruc, razon_social, descripcion, direccion, web_fb, representante, celular });

    if (updatedBordaduria === 0) {
      return res.status(404).json({ error: 'Bordaduría no encontrada' });
    }

    res.json({ message: 'Bordaduría actualizada con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando la bordaduría', details: err.message || err });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedBordaduria = await knex('bordadurias').where('id', id).del();
    if (deletedBordaduria === 0) {
      return res.status(404).json({ error: 'Bordaduría no encontrada' });
    }
    res.json({ message: 'Bordaduría eliminada con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando la bordaduría', details: err.message || err });
  }
});

module.exports = router;
