require('dotenv').config();
const knex = require('knex');

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

// Validamos solo variables obligatorias.
// NOTA: DB_PASSWORD puede ser vacío, y eso es válido.
if (!DB_HOST || !DB_USER || DB_NAME === undefined) {
  console.error("❌ Faltan variables de entorno necesarias (DB_HOST, DB_USER o DB_NAME).");
  process.exit(1);
}

console.log("🔧 Configuración de conexión:");
console.log("Host:", DB_HOST);
console.log("Usuario:", DB_USER);
console.log("Password:", DB_PASSWORD === "" ? "(vacío)" : "(oculto)");
console.log("Base de datos:", DB_NAME);
console.log("Puerto:", DB_PORT || "(por defecto)");

const db = knex({
  client: 'mysql2',
  connection: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD || "", // Aceptar password vacío
    port: DB_PORT ? Number(DB_PORT) : 3306
  }
});

async function recreateDatabase() {
  try {
    console.log(`🔍 Verificando existencia de "${DB_NAME}"...`);

    const result = await db.raw(`SHOW DATABASES LIKE '${DB_NAME}'`);

    if (result[0].length > 0) {
      console.log(`⚠️ La base de datos "${DB_NAME}" ya existe. Eliminando...`);
      await db.raw(`DROP DATABASE ${DB_NAME}`);
      console.log(`🗑️ Base de datos eliminada.`);
    }

    await db.raw(`CREATE DATABASE ${DB_NAME}`);
    console.log(`✅ Base de datos "${DB_NAME}" creada exitosamente.`);
    
  } catch (err) {
    console.error("❌ Error al recrear la base de datos:", err);
  } finally {
    await db.destroy();
  }
}

recreateDatabase();
