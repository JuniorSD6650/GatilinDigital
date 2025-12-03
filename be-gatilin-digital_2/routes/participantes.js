const express = require('express');
const router = express.Router();
const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig);
const multer = require('multer');
const upload = multer();

// Obtener todos los participantes
router.get('/', async (req, res) => {
  try {
    const participantes = await knex('participantes')
      .select('*')
      .orderBy('id', 'desc');

    res.json(participantes);
  } catch (err) {
    res.status(500).json({
      error: 'Error obteniendo los participantes',
      details: err.message || err
    });
  }
});

// Obtener un participante por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const participante = await knex('participantes').where('id', id).first();
    if (!participante) {
      return res.status(404).json({ error: 'Participante no encontrado' });
    }
    res.json(participante);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo el participante', details: err.message || err });
  }
});

// Crear un nuevo participante
router.post('/', async (req, res) => {
  const { nombre, dni, email, telefono, fecha_registro, estado, comentario } = req.body;
  try {
    const result = await knex('participantes').insert({
      nombre, dni, email, telefono, fecha_registro, estado, comentario
    });

    const newParticipanteId = result[0];  // Knex devuelve un array con el ID del registro insertado

    res.status(201).json({ message: 'Participante registrado con éxito', id: newParticipanteId });
  } catch (err) {
    res.status(500).json({ error: 'Error creando el participante', details: err.message || err });
  }
});

// Actualizar un participante por ID
router.put('/:id', upload.none(), async (req, res) => {
  // El middleware "upload.none()" habilita el parsing de FormData sin archivos
  const { id } = req.params;
  const { nombre, dni, email, telefono, fecha_registro, estado, comentario } = req.body;

  // Filtrar datos válidos (ignorar campos no definidos o vacíos)
  const updateData = {};
  if (nombre) updateData.nombre = nombre;
  if (dni) updateData.dni = dni;
  if (email) updateData.email = email;
  if (telefono) updateData.telefono = telefono;
  if (fecha_registro) updateData.fecha_registro = fecha_registro;
  if (estado) updateData.estado = estado;
  if (comentario) updateData.comentario = comentario;

  // Validar si hay datos para actualizar
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      error: 'No se enviaron datos válidos para actualizar.'
    });
  }

  try {
    const updatedParticipante = await knex('participantes')
      .where('id', id)
      .update(updateData);

    if (updatedParticipante === 0) {
      return res.status(404).json({ error: 'Participante no encontrado' });
    }

    res.json({ message: 'Participante actualizado con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando el participante', details: err.message || err });
  }
});

// Eliminar un participante por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedParticipante = await knex('participantes').where('id', id).del();
    if (deletedParticipante === 0) {
      return res.status(404).json({ error: 'Participante no encontrado' });
    }
    res.json({ message: 'Participante eliminado con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando el participante', details: err.message || err });
  }
});

module.exports = router;
