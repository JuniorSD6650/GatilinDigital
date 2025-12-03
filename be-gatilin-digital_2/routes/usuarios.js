const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const knex = require('knex')(require('../knexfile'));
const router = express.Router();
const { format } = require('date-fns');
const protect = require('../middleware/auth');

const fs = require('fs');
const multer = require('multer');
const ExcelJS = require('exceljs');
const upload = multer({ dest: 'uploads/' });

const USUARIO_COLUMNS = [
  { header: 'Username', key: 'username', width: 30 },
  { header: 'Password', key: 'password', width: 30 },
  { header: 'Cofradía ID', key: 'cofradia_id', width: 20 },
];

// Descargar plantilla
router.get('/template', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Plantilla Usuarios');

    worksheet.columns = USUARIO_COLUMNS;
    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Plantilla_Usuarios.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Error al generar la plantilla', details: error.message });
  }
});

// Ruta para obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    let usuarios = await knex('usuarios')
      .select(
        'usuarios.id',
        'usuarios.username',
        'usuarios.role',
        'usuarios.created_at',
        'usuarios.cofradia_id',
        'cofradia.nickname_cofradia'
      )
      .leftJoin('cofradia', 'usuarios.cofradia_id', 'cofradia.id')
      .where('usuarios.role', 'localizador')
      .orderBy('usuarios.id', 'desc');

    usuarios = usuarios.map(usuario => ({
      ...usuario,
      created_at: usuario.created_at
        ? format(new Date(usuario.created_at), 'dd/MM/yyyy HH:mm:ss')
        : null
    }));

    res.status(200).json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo los usuarios.', details: error.message || error });
  }
});

// Ruta para obtener el administrador
router.get('/admin', async (req, res) => {
  try {
    const admin = await knex('usuarios').where('role', 'admin').first();
    if (!admin) {
      return res.status(404).json({ message: 'Administrador no encontrado.' });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo el administrador.' });
  }
});

// Ruta protegida para obtener el perfil del usuario
router.get('/perfil', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: 'ID de usuario no encontrado en el token.' });
    }

    const user = await knex('usuarios')
      .select(
        'usuarios.username',
        'usuarios.role',
        'usuarios.cofradia_id',
        'cofradia.nickname_cofradia'
      )
      .leftJoin('cofradia', 'usuarios.cofradia_id', 'cofradia.id')
      .where('usuarios.id', userId)
      .first();

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.json(user);
  } catch (error) {
    console.error("Error al obtener el perfil del usuario:", error);
    res.status(500).json({ message: 'Error al obtener el perfil del usuario.' });
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
        username: row.getCell(1).value?.toString().trim() || null,
        password: row.getCell(2).value?.toString().trim() || null,
        cofradia_id: row.getCell(3).value ? parseInt(row.getCell(3).value) : null,
        created_at: row.getCell(4).value ? row.getCell(4).value.toISOString() : knex.fn.now(),
      };

      if (!record.username || !record.password) {
        console.warn(`Fila ${i} ignorada: faltan campos obligatorios.`);
        continue;
      }

      try {
        await knex('usuarios').insert(record);
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

      failedWorksheet.columns = USUARIO_COLUMNS;
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
        'attachment; filename=Errores_Carga_Usuarios.xlsx'
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

// Ruta para crear un administrador
router.post('/admin', async (req, res) => {
  const { username, password, email, phone } = req.body;

  try {
    const existingAdmin = await knex('usuarios').where('role', 'admin').first();
    if (existingAdmin) {
      return res.status(400).json({ message: 'Ya existe un administrador.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await knex('usuarios').insert({
      username,
      password: hashedPassword,
      role: 'admin',
      email,
      phone,
      created_at: knex.fn.now()
    });

    res.status(201).json({ message: 'Administrador creado exitosamente', adminId: newAdmin[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creando el administrador.' });
  }
});

// Ruta para el login del administrador
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Buscar el usuario en la base de datos
    const admin = await knex('usuarios').where('username', username).first();

    if (!admin) {
      return res.status(404).json({ message: 'Administrador no encontrado.' });
    }

    // Verificar si la contraseña es correcta
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta.' });
    }

    // Generar el token JWT
    const payload = {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      cofradiaId: admin.cofradia_id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "secretkey", {
      expiresIn: "30d",
    });

    res.status(200).json({ message: 'Login exitoso', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el login del administrador.' });
  }
});

// Ruta para añadir usuarios
router.post('/', async (req, res) => {
  const { username, password, cofradia_id } = req.body;

  try {
    // Validar si cofradia_id existe en la tabla cofradia
    if (cofradia_id) {
      const cofradia = await knex('cofradia').where('id', cofradia_id).first();
      if (!cofradia) {
        return res.status(400).json({ message: 'El cofradia_id proporcionado no es válido.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await knex('usuarios').insert({
      username,
      password: hashedPassword,
      role: 'localizador',
      cofradia_id: cofradia_id || null,
      created_at: knex.fn.now()
    });

    res.status(201).json({ message: 'Usuario creado exitosamente', userId: newUser[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creando el usuario.', details: error.message || error });
  }
});

// Ruta para editar usuarios
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, role, cofradia_id } = req.body;

  try {
    const user = await knex('usuarios').where('id', id).first();
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const updatedUser = {
      username: username || user.username,
      role: role || user.role,
      cofradia_id: role === 'localizador' ? cofradia_id : null
    };

    if (password) {
      updatedUser.password = await bcrypt.hash(password, 10);
    }

    await knex('usuarios').where('id', id).update(updatedUser);

    res.status(200).json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando el usuario.' });
  }
});

// Ruta para eliminar un usuario
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await knex('usuarios').where('id', id).first();

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    await knex('usuarios').where('id', id).del();

    res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error eliminando el usuario.' });
  }
});

module.exports = router;
