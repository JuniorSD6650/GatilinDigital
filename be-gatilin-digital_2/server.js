const path = require('path');
const config = require('./lib/config');
const knex = require('./lib/db');
const app = require('./app');
const push = require('./lib/push');

const start = async () => {
  // Verifica la conexión con la base de datos (Knex es la única conexión de la app)
  try {
    await knex.raw('select 1');
    console.log('Conectado a la base de datos MySQL');
  } catch (err) {
    console.error('Error conectando a la base de datos:', err.message);
    process.exit(1);
  }

  // Migraciones automáticas al arrancar (desactivar con MIGRATE_ON_START=false)
  if (process.env.MIGRATE_ON_START !== 'false') {
    try {
      const [, aplicadas] = await knex.migrate.latest({ directory: path.join(__dirname, 'migrations') });
      console.log(aplicadas.length ? `Migraciones aplicadas: ${aplicadas.length}` : 'Base de datos al día (sin migraciones pendientes)');
    } catch (err) {
      console.error('Error aplicando migraciones:', err.message || err.code || err);
      process.exit(1);
    }
  }

  // DEMO_DATA=true: carga la demo SOLO si la base de datos está vacía
  // (un reinicio no borra lo hecho en la presentación, ni datos reales).
  if (process.env.DEMO_DATA === 'true') {
    const demo = require('./lib/demoSeed');
    try {
      if (await demo.baseDeDatosVacia(knex)) {
        const resultado = await demo.runDemoSeed(knex, { password: process.env.DEMO_PASSWORD || demo.DEMO_PASSWORD_DEFAULT });
        demo.imprimirCredenciales(resultado);
      } else {
        console.log('DEMO_DATA=true: la base de datos ya tiene datos, no se modifica. Para reiniciar la demo: npm run db:reset -- --force');
      }
    } catch (err) {
      console.error('Error cargando los datos de demostración:', err.message || err.code || err);
      process.exit(1);
    }
  }

  const server = app
    .listen(config.port, () => {
      console.log(`Servidor corriendo en el puerto ${config.port}`);
      console.log(config.frontendDir ? `Web servida desde ${config.frontendDir}` : 'Web no encontrada (FRONTEND_DIR): solo API');
      if (!push.habilitado) console.log('Notificaciones push desactivadas (faltan VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY).');
      push.iniciarProgramador();
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`El puerto ${config.port} está en uso. Por favor, intenta con otro puerto.`);
      } else {
        console.error(`Error al iniciar el servidor: ${err.message}`);
      }
      process.exit(1);
    });

  const cerrar = () => {
    server.close(() => knex.destroy().finally(() => process.exit(0)));
  };
  process.on('SIGTERM', cerrar);
  process.on('SIGINT', cerrar);
};

start();
