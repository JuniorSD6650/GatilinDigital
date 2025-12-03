const express = require('express');
const router = express.Router();
const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig);
const { format } = require('date-fns');

const fs = require('fs');
const multer = require('multer');
const ExcelJS = require('exceljs');
const upload = multer({ dest: 'uploads/' });

const EVENTO_COLUMNS = [
  { header: 'Fecha', key: 'fecha', width: 20 },
  { header: 'Tipo de Día', key: 'tipo_dia', width: 20 },
  { header: 'Tipo de Evento', key: 'tipo_evento', width: 20 },
  { header: 'Hora', key: 'hora', width: 20 },
  { header: 'Dirección Actividad', key: 'direccion_actividad', width: 50 },
  { header: 'Oferente', key: 'oferente', width: 50 },
  { header: 'Tipo Oferente', key: 'tipo_oferente', width: 20 },
  { header: 'Banda', key: 'banda', width: 20 },
  { header: 'Código Cofradía', key: 'cod_cofradia', width: 20 }
];

// Descargar plantilla
router.get('/template', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Plantilla Eventos');

    worksheet.columns = EVENTO_COLUMNS;
    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Plantilla_Eventos.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Error al generar la plantilla', details: error.message });
  }
});


// Obtener todos los eventos
router.get('/', async (req, res) => {
  const { cod_cofradia } = req.query;

  try {
    let query = knex('eventos')
      .select(
        'eventos.*',
        'cofradia.nickname_cofradia'
      )
      .leftJoin('cofradia', 'eventos.cod_cofradia', 'cofradia.id')
      .orderBy('eventos.id', 'desc');

    // Si se envía cod_cofradia, aplicar el filtro
    if (cod_cofradia) {
      query = query.where('eventos.cod_cofradia', cod_cofradia);
    }

    let eventos = await query;

    // Formatear la fecha
    eventos = eventos.map(evento => ({
      ...evento,
      fecha: evento.fecha ? format(new Date(evento.fecha), 'dd/MM/yyyy') : null
    }));

    res.json(eventos);
  } catch (err) {
    res.status(500).json({
      error: 'Error obteniendo los eventos',
      details: err.message || err
    });
  }
});

// Obtener un evento por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    let evento = await knex('eventos')
      .select(
        'eventos.*',
        'cofradia.nickname_cofradia'
      )
      .leftJoin('cofradia', 'eventos.cod_cofradia', 'cofradia.id')
      .where('eventos.id', id)
      .first();

    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Formatear la fecha
    evento.fecha = evento.fecha ? format(new Date(evento.fecha), 'dd/MM/yyyy') : null;

    res.json(evento);
  } catch (err) {
    res.status(500).json({
      error: 'Error obteniendo el evento',
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

      // Procesamos la fecha (formato 'yyyy-mm-dd')
      let fecha = null;
      if (row.getCell(1).value instanceof Date) {
        fecha = row.getCell(1).value.toISOString().split('T')[0]; // Convertir a 'yyyy-mm-dd'
      }

      // Procesamos la hora (debe ser cadena 'HH:MM:SS')
      let hora = null;
      const horaValue = row.getCell(4).value;

      if (typeof horaValue === 'string') {
        // Si la hora ya está en formato 'HH:MM:SS', la usamos tal cual
        hora = horaValue.trim();
      } else if (horaValue instanceof Date) {
        // Si la celda contiene un objeto Date, extraemos la hora
        let [hour, minute, second] = [horaValue.getHours(), horaValue.getMinutes(), horaValue.getSeconds()];

        // Ajuste: sumamos el desfase de 5 horas, 8 minutos y 36 segundos
        hour += 5;      // Sumamos 5 horas
        minute += 8;    // Sumamos 8 minutos
        second += 36;   // Sumamos 36 segundos

        // Si los segundos superan 60, ajustamos los minutos
        if (second >= 60) {
          minute += Math.floor(second / 60); // Sumamos los minutos extra
          second = second % 60;              // Ajustamos los segundos
        }

        // Si los minutos superan 60, ajustamos las horas
        if (minute >= 60) {
          hour += Math.floor(minute / 60);   // Sumamos las horas extra
          minute = minute % 60;              // Ajustamos los minutos
        }

        // Aseguramos que la hora esté en formato 'HH:MM:SS'
        hour = hour.toString().padStart(2, '0');
        minute = minute.toString().padStart(2, '0');
        second = second.toString().padStart(2, '0');

        // Guardamos la hora ajustada
        hora = `${hour}:${minute}:${second}`;
      }

      // Verificamos que la hora esté en formato 'HH:MM:SS'
      if (!/^([01]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/.test(hora)) {
        console.warn(`Fila ${i} ignorada: la hora ${hora} no tiene el formato correcto.`);
        continue;
      }

      const record = {
        fecha: fecha || null,
        tipo_dia: row.getCell(2).value?.toString().trim() || 'Ninguno',
        tipo_evento: row.getCell(3).value?.toString().trim() || 'ninguno',
        hora: hora || null, // Asegúrate de que la hora es una cadena en formato 'HH:MM:SS'
        direccion_actividad: row.getCell(5).value?.toString().trim() || null,
        oferente: row.getCell(6).value?.toString().trim() || null,
        tipo_oferente: row.getCell(7).value?.toString().trim() || 'Oferente',
        banda: row.getCell(8).value?.toString().trim() || 'Ninguna',
        cod_cofradia: row.getCell(9).value ? parseInt(row.getCell(9).value) : null,
      };

      // Verificamos si los campos obligatorios están presentes
      if (!record.fecha || !record.hora || !record.direccion_actividad || !record.oferente || !record.cod_cofradia) {
        console.warn(`Fila ${i} ignorada: faltan campos obligatorios.`);
        continue;
      }

      try {
        await knex('eventos').insert(record);
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

    // Si hay filas con errores, las procesamos
    if (failedRecords.length > 0) {
      const failedWorkbook = new ExcelJS.Workbook();
      const failedWorksheet = failedWorkbook.addWorksheet('Errores');

      failedWorksheet.columns = EVENTO_COLUMNS;
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
        'attachment; filename=Errores_Carga_Eventos.xlsx'
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


// Crear un nuevo evento
router.post('/', async (req, res) => {
  const { fecha, tipo_dia, tipo_evento, hora, direccion_actividad, oferente, tipo_oferente, banda, cod_cofradia } = req.body;
  try {
    const result = await knex('eventos').insert({
      fecha, tipo_dia, tipo_evento, hora, direccion_actividad, oferente, tipo_oferente, banda, cod_cofradia
    });

    const newEventoId = result[0]; // El ID del nuevo registro

    res.status(201).json({ message: 'Evento creado con éxito', id: newEventoId });
  } catch (err) {
    res.status(500).json({ error: 'Error creando el evento', details: err.message || err });
  }
});

// Actualizar un evento por ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { fecha, tipo_dia, tipo_evento, hora, direccion_actividad, oferente, tipo_oferente, banda, cod_cofradia } = req.body;
  try {
    const updatedEvento = await knex('eventos')
      .where('id', id)
      .update({
        fecha,
        tipo_dia,
        tipo_evento,
        hora,
        direccion_actividad,
        oferente,
        tipo_oferente,
        banda,
        cod_cofradia
      });

    if (updatedEvento === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json({ message: 'Evento actualizado con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando el evento', details: err.message || err });
  }
});

// Eliminar un evento por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedEvento = await knex('eventos').where('id', id).del();
    if (deletedEvento === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    res.json({ message: 'Evento eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando el evento', details: err.message || err });
  }
});

module.exports = router;
