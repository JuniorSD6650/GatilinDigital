require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');
const routes = require('./routes');

const app = express();

// Habilitar CORS para permitir solicitudes desde otros dominios
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));

// Configurar la ruta para los archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.use(express.json());

app.use('/api', routes);

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gatilin_db'
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos: ' + err.stack);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} está en uso. Por favor, intenta con otro puerto.`);
  } else {
    console.error(`Error al iniciar el servidor: ${err.message}`);
  }
});