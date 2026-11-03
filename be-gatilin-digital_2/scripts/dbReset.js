// Reinicia la base de datos: BORRA todas las tablas y vuelve a migrar.
//   npm run db:reset              -> base vacía (estructura nueva)
//   npm run db:reset -- --demo    -> además carga los datos de demostración
//                                    (también si DEMO_DATA=true)
// En producción exige --force.
require('dotenv').config();
const knex = require('../lib/db');
const demo = require('../lib/demoSeed');

const main = async () => {
  const args = process.argv.slice(2);
  const conDemo = args.includes('--demo') || process.env.DEMO_DATA === 'true';
  if (process.env.NODE_ENV === 'production' && !args.includes('--force')) {
    console.error('❌ Esto BORRA TODAS las tablas de la base de datos.');
    console.error('   En producción ejecuta: npm run db:reset -- --force');
    process.exitCode = 1;
    return;
  }

  await demo.resetearBaseDeDatos(knex);

  if (conDemo) {
    const password = process.env.DEMO_PASSWORD || demo.DEMO_PASSWORD_DEFAULT;
    if (!process.env.DEMO_PASSWORD) console.log('ℹ️  DEMO_PASSWORD no definida: se usa la clave por defecto.');
    demo.imprimirCredenciales(await demo.runDemoSeed(knex, { password }));
  } else {
    console.log('✅ Base de datos reiniciada (vacía). Siguiente paso: npm run db:setup  o  npm run db:seed:demo');
  }
};

main()
  .catch((err) => {
    console.error('❌ Error reiniciando la base de datos:', err.message || err.code || err);
    process.exitCode = 1;
  })
  .finally(() => knex.destroy());
