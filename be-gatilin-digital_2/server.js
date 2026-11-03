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

  // DEMO_DATA=true: carga la demo al arrancar, solo si aún no está cargada
  // (así un reinicio del contenedor no borra lo que se haga durante la presentación).
  if (process.env.DEMO_DATA === 'true') {
    const demo = require('./lib/demoSeed');
    try {
      if (await demo.demoYaCargada(knex)) {
        console.log('DEMO_DATA=true: la demo ya está cargada, no se modifica. Para reiniciarla: npm run db:seed:demo');
      } else {
        const resultado = await demo.runDemoSeed(knex, { password: process.env.DEMO_PASSWORD || demo.DEMO_PASSWORD_DEFAULT });
        demo.imprimirCredenciales(resultado);
      }
    } catch (err) {
      console.error('Error cargando los datos de demostración:', err.message || err.code || err);
      process.exit(1);
    }
  }

  const server = app
    .listen(config.port, () => {
      console.log(`Servidor backend corriendo en el puerto ${config.port}`);
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
