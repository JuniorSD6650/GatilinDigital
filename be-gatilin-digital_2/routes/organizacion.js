const express = require('express');
const router = express.Router();
const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig);

const fs = require('fs');
const multer = require('multer');
const ExcelJS = require('exceljs');
const upload = multer({ dest: 'uploads/' });

const ORGANIZACION_COLUMNS = [
  { header: 'Nombre', key: 'nombre', width: 30 },
  { header: 'Descripción', key: 'descripcion', width: 50 },
  { header: 'Link de Stream', key: 'streaming_link', width: 30 },
];

// Descargar plantilla
router.get('/template', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Plantilla');

    worksheet.columns = ORGANIZACION_COLUMNS;
    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Plantilla_Organizaciones.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error al generar la plantilla', details: error.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const organizaciones = await knex('organizacion')
      .select('id', 'nombre')
      .orderBy('id', 'asc');

    res.status(200).json(organizaciones);
  } catch (err) {
    res.status(500).json({
      error: 'Error obteniendo la lista de organizaciones',
      details: err.message || err,
    });
  }
});


// Obtener todas las organizaciones
router.get('/', async (req, res) => {
  try {
    const organizaciones = await knex('organizacion')
      .select('*')
      .orderBy('id', 'desc');

    res.json(organizaciones);
  } catch (err) {
    res.status(500).json({
      error: 'Error obteniendo las organizaciones',
      details: err.message || err
    });
  }
});


// Obtener una organización por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const organizacion = await knex('organizacion').where('id', id).first();
    if (!organizacion) {
      return res.status(404).json({ error: 'Organización no encontrada' });
    }
    res.json(organizacion);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo la organización', details: err.message || err });
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
        nombre: row.getCell(1).value?.toString().trim() || null,
        descripcion: row.getCell(2).value?.toString().trim() || null,
        streaming_link: row.getCell(3).value?.toString().trim() || null,
      };

      if (!record.nombre) {
        console.warn(`Fila ${i} ignorada: campo "nombre" está vacío.`);
        continue;
      }

      try {
        await knex('organizacion').insert(record);
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

      failedWorksheet.columns = ORGANIZACION_COLUMNS;
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
        'attachment; filename=Errores_Carga.xlsx'
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

    res
      .status(500)
      .json({ error: 'Error al procesar el archivo', details: err.message });
  }
});

// Crear una nueva organización
router.post('/', async (req, res) => {
  const { nombre, descripcion, streaming_link } = req.body;
  try {
    const result = await knex('organizacion').insert({
      nombre, descripcion, streaming_link
    });

    const newOrganizacion = await knex('organizacion').where('id', result[0]).first();

    res.status(201).json({ message: 'Organización creada con éxito', id: newOrganizacion.id });
  } catch (err) {
    res.status(500).json({ error: 'Error creando la organización', details: err.message || err });
  }
});

// Actualizar una organización por ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, streaming_link } = req.body;
  try {
    const updatedOrganizacion = await knex('organizacion')
      .where('id', id)
      .update({ nombre, descripcion, streaming_link });

    if (updatedOrganizacion === 0) {
      return res.status(404).json({ error: 'Organización no encontrada' });
    }

    res.json({ message: 'Organización actualizada con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando la organización', details: err.message || err });
  }
});

// Eliminar una organización por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedOrganizacion = await knex('organizacion').where('id', id).del();
    if (deletedOrganizacion === 0) {
      return res.status(404).json({ error: 'Organización no encontrada' });
    }
    res.json({ message: 'Organización eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando la organización', details: err.message || err });
  }
});

module.exports = router;
