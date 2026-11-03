// Carga los datos de demostración: npm run db:seed:demo
// BORRA los datos actuales. En producción exige DEMO_DATA=true o --force.
require('dotenv').config();
const knex = require('../lib/db');
const { runDemoSeed, imprimirCredenciales, DEMO_PASSWORD_DEFAULT } = require('../lib/demoSeed');

const main = async () => {
  const forzado = process.argv.includes('--force') || process.env.DEMO_DATA === 'true';
  if (process.env.NODE_ENV === 'production' && !forzado) {
    console.error('❌ Esto BORRA la base de datos actual y la reemplaza por datos de demostración.');
    console.error('   En producción ejecuta: npm run db:seed:demo -- --force   (o define DEMO_DATA=true)');
    process.exitCode = 1;
    return;
  }

  const password = process.env.DEMO_PASSWORD || DEMO_PASSWORD_DEFAULT;
  if (!process.env.DEMO_PASSWORD) console.log(`ℹ️  DEMO_PASSWORD no definida: se usa la clave por defecto.`);

  const resultado = await runDemoSeed(knex, { password });
  imprimirCredenciales(resultado);
};

main()
  .catch((err) => {
    console.error('❌ Error cargando la demo:', err.message || err.code || err);
    process.exitCode = 1;
  })
  .finally(() => knex.destroy());
