// ATENCIÓN: BORRA y vuelve a crear la base de datos de DATABASE_URL (solo para instalación local).
// No se incluye en la imagen Docker. En Coolify la base la crea el servicio de PostgreSQL.
require('dotenv').config();
const knex = require('knex');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('❌ Falta DATABASE_URL (ej. postgresql://postgres:clave@localhost:5432/gatilin_db).');
  process.exit(1);
}

const destino = new URL(url);
const nombre = decodeURIComponent(destino.pathname.slice(1));
if (!/^[A-Za-z0-9_]+$/.test(nombre)) {
  console.error(`❌ Nombre de base de datos no válido: "${nombre}"`);
  process.exit(1);
}

// Para crear/borrar una base hay que conectarse a otra: la base de mantenimiento "postgres"
const mantenimiento = new URL(url);
mantenimiento.pathname = '/postgres';
const db = knex({ client: 'pg', connection: { connectionString: mantenimiento.toString() } });

(async () => {
  try {
    console.log(`🔧 Host: ${destino.hostname}:${destino.port || 5432} · Usuario: ${decodeURIComponent(destino.username)} · Base: ${nombre}`);
    await db.raw('DROP DATABASE IF EXISTS ?? WITH (FORCE)', [nombre]);
    await db.raw("CREATE DATABASE ?? ENCODING 'UTF8' TEMPLATE template0", [nombre]);
    console.log(`✅ Base de datos "${nombre}" creada.`);
  } catch (err) {
    console.error('❌ Error al recrear la base de datos:', err.message || err.code);
    process.exitCode = 1;
  } finally {
    await db.destroy();
  }
})();
