// Exporta los datos de la base de datos LOCAL para usarlos como demo:
//   npm run db:export:demo
// Genera demo/snapshot.json (todas las tablas de datos) y copia a demo/uploads/
// las imágenes que esos datos usan. Luego haz commit de la carpeta demo/.
//
// No se exportan datos personales: DNIs, teléfonos y correos se anonimizan, y las
// contraseñas se omiten (en la demo todas usan DEMO_PASSWORD). Tampoco se exportan
// las suscripciones push (datos del navegador de cada persona) ni la bitácora (IPs).
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const base = require('../knexfile');
const { TABLAS_SNAPSHOT, SNAPSHOT_DIR, SNAPSHOT_FILE, anonimizarFila } = require('../lib/demoSeed');
const { PUBLIC_DIR } = require('../middleware/upload');

// Las fechas salen tal cual ('2025-12-24'), sin convertirlas a Date (evita desfases de zona horaria)
const { types } = require('pg');
for (const oid of [1082, 1114, 1184]) types.setTypeParser(oid, (v) => v); // date, timestamp, timestamptz
const knex = require('knex')(base);
const nombreBase = decodeURIComponent(new URL(base.connection.connectionString).pathname.slice(1));

const COLUMNAS_FOTO = { cofrades: 'ruta_foto', reportes: 'ruta_foto', fotos_cuadrilla: 'ruta_foto' };

const main = async () => {
  console.log(`📤 Exportando base de datos "${nombreBase}"...`);
  const tablas = {};
  for (const t of TABLAS_SNAPSHOT) {
    if (!(await knex.schema.hasTable(t))) continue;
    // Sin DNIs, teléfonos, correos ni contraseñas (ver anonimizarFila)
    const filas = (await knex(t).select('*').orderBy('id')).map((f) => anonimizarFila(t, f));
    tablas[t] = filas;
    console.log(`   ${t.padEnd(20)} ${filas.length}`);
  }

  // Imágenes referenciadas por los datos
  const destinoUploads = path.join(SNAPSHOT_DIR, 'uploads');
  fs.rmSync(destinoUploads, { recursive: true, force: true });
  let copiadas = 0;
  const faltantes = [];
  for (const [t, col] of Object.entries(COLUMNAS_FOTO)) {
    for (const fila of tablas[t] || []) {
      const ruta = fila[col];
      if (!ruta || /^https?:/i.test(ruta) || !ruta.startsWith('uploads/')) continue;
      const origen = path.resolve(PUBLIC_DIR, ruta);
      if (!origen.startsWith(PUBLIC_DIR + path.sep)) continue;
      if (!fs.existsSync(origen)) { faltantes.push(ruta); continue; }
      const destino = path.join(SNAPSHOT_DIR, ruta);
      fs.mkdirSync(path.dirname(destino), { recursive: true });
      fs.copyFileSync(origen, destino);
      copiadas++;
    }
  }

  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify({ exportado: new Date().toISOString(), base: nombreBase, tablas }, null, 1));
  console.log(`🖼️  Imágenes copiadas: ${copiadas}${faltantes.length ? ` (no encontradas: ${faltantes.length})` : ''}`);
  console.log(`✅ Snapshot guardado en ${path.relative(process.cwd(), SNAPSHOT_FILE)}. Haz commit de la carpeta demo/ para usarlo en Coolify.`);
};

main()
  .catch((err) => {
    console.error('❌ Error exportando:', err.message || err.code || err);
    process.exitCode = 1;
  })
  .finally(() => knex.destroy());
