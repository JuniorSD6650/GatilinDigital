const express = require('express');
const router = express.Router();
const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig);
const { parse, format } = require('date-fns');

const fs = require('fs');
const multer = require('multer');
const ExcelJS = require('exceljs');
const upload = multer({ dest: 'uploads/' });

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
];

// Descargar plantilla
router.get('/template', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Plantilla Cofradías');

    worksheet.columns = COFRADIA_COLUMNS;
    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Plantilla_Cofradias.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Error al generar la plantilla', details: error.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const cofradias = await knex('cofradia')
      .select('id', 'nombre_cofradia')
      .orderBy('id', 'asc');

    res.status(200).json(cofradias);
  } catch (err) {
    res.status(500).json({
      error: 'Error obteniendo la lista de cofradías',
      details: err.message || err,
    });
  }
});

router.get('/', async (req, res) => {
  let { fecha } = req.query;

  try {
    let query;

    if (fecha) {
      const parsedDate = parse(fecha, 'dd/MM/yyyy', new Date());
      const formattedDate = format(parsedDate, 'yyyy-MM-dd');

      query = knex('cofradia')
        .select('cofradia.*')
        .leftJoin('eventos', 'cofradia.id', 'eventos.cod_cofradia')
        .where('eventos.fecha', formattedDate)
        .groupBy('cofradia.id')
        .orderBy('cofradia.id', 'desc');
    } else {
      query = knex('cofradia')
        .select('*')
        .orderBy('id', 'desc');
    }

    const cofradias = await query;

    const formattedCofradias = cofradias.map(cofradia => ({
      ...cofradia,
      fecha_fundacion: cofradia.fecha_fundacion
        ? format(new Date(cofradia.fecha_fundacion), 'dd/MM/yyyy')
        : null,
      ubicacion_link_actualizado: cofradia.ubicacion_link_actualizado
        ? format(new Date(cofradia.ubicacion_link_actualizado), 'dd/MM/yyyy HH:mm:ss')
        : null,
    }));

    res.json(formattedCofradias);
  } catch (err) {
    res.status(500).json({
      error: 'Error obteniendo las cofradías',
      details: err.message || err
    });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const cofradia = await knex('cofradia').where('id', id).first();

    if (!cofradia) {
      return res.status(404).json({ error: 'Cofradía no encontrada' });
    }

    const formattedCofradia = {
      ...cofradia,
      fecha_fundacion: cofradia.fecha_fundacion
        ? format(new Date(cofradia.fecha_fundacion), 'dd/MM/yyyy')
        : null,
      ubicacion_link_actualizado: cofradia.ubicacion_link_actualizado
        ? format(new Date(cofradia.ubicacion_link_actualizado), 'dd/MM/yyyy HH:mm:ss')
        : null,
    };

    res.json(formattedCofradia);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo la cofradía', details: err.message || err });
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
        nickname_cofradia: row.getCell(1).value?.toString().trim() || null,
        nombre_cofradia: row.getCell(2).value?.toString().trim() || null,
        fecha_fundacion: row.getCell(3).value ? row.getCell(3).value.toISOString().split('T')[0] : null,
        sede_local: row.getCell(4).value?.toString().trim() || null,
        dni_representante: row.getCell(5).value?.toString().trim() || null,
        nombre_representante: row.getCell(6).value?.toString().trim() || null,
        cel_representante: row.getCell(7).value?.toString().trim() || null,
        distrito: row.getCell(8).value?.toString().trim() || null,
        descripcion: row.getCell(10).value?.toString().trim() || null,
        organizacion_id: 1,
      };

      if (!record.nickname_cofradia || !record.nombre_cofradia || !record.organizacion_id) {
        console.warn(`Fila ${i} ignorada: faltan campos obligatorios.`);
        continue;
      }

      try {
        await knex('cofradia').insert(record);
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

      failedWorksheet.columns = COFRADIA_COLUMNS;
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
        'attachment; filename=Errores_Carga_Cofradias.xlsx'
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
  const {
    nickname_cofradia,
    nombre_cofradia,
    fecha_fundacion,
    sede_local,
    dni_representante,
    nombre_representante,
    cel_representante,
    distrito,
    color,
    descripcion,
    ubicacion_link,
    ubicacion_link_actualizado,
    organizacion_id
  } = req.body;

  try {
    const result = await knex('cofradia').insert({
      nickname_cofradia,
      nombre_cofradia,
      fecha_fundacion,
      sede_local,
      dni_representante,
      nombre_representante,
      cel_representante,
      distrito,
      color,
      descripcion,
      ubicacion_link,
      ubicacion_link_actualizado,
      organizacion_id
    });

    const newCofradiaId = result[0];

    res.status(201).json({
      message: 'Cofradía creada con éxito',
      id: newCofradiaId
    });

  } catch (err) {
    res.status(500).json({
      error: 'Error creando la cofradía',
      details: err.message || err
    });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    nickname_cofradia,
    nombre_cofradia,
    fecha_fundacion,
    sede_local,
    dni_representante,
    nombre_representante,
    cel_representante,
    distrito,
    color,
    descripcion,
    ubicacion_link,
    organizacion_id
  } = req.body;

  try {
    const cofradia = await knex('cofradia').where('id', id).first();

    if (!cofradia) {
      return res.status(404).json({ error: 'Cofradía no encontrada' });
    }

    const updates = {
      nickname_cofradia,
      nombre_cofradia,
      fecha_fundacion,
      sede_local,
      dni_representante,
      nombre_representante,
      cel_representante,
      distrito,
      color,
      descripcion,
      ubicacion_link,
      organizacion_id
    };

    if (ubicacion_link && ubicacion_link !== cofradia.ubicacion_link) {
      updates.ubicacion_link_actualizado = knex.fn.now();
    }

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    const updatedCofradia = await knex('cofradia')
      .where('id', id)
      .update(filteredUpdates);

    if (updatedCofradia === 0) {
      return res.status(404).json({ error: 'Cofradía no encontrada' });
    }

    res.json({ message: 'Cofradía actualizada con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando la cofradía', details: err.message || err });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCofradia = await knex('cofradia').where('id', id).del();
    if (deletedCofradia === 0) {
      return res.status(404).json({ error: 'Cofradía no encontrada' });
    }
    res.json({ message: 'Cofradía eliminada con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando la cofradía', details: err.message || err });
  }
});

module.exports = router;
