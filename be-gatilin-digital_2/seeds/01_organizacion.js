/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpiamos la tabla organizacion (y cofradias por dependencia, si fuera necesario resetear todo)
  // Nota: Si solo quieres limpiar organizacion, asegúrate de que no haya cofradías apuntando a ella o desactiva FK.
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('organizacion').truncate();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  console.log('🌱 Sembrando Organización...');

  await knex('organizacion').insert([
    {
      id: 1, 
      nombre: 'Municipalidad Provincial de Huánuco',
      descripcion: 'Entidad gubernamental encargada de la gestión, promoción y difusión de eventos culturales, preservando las tradiciones y el patrimonio histórico de la ciudad.',
      streaming_link: 'https://www.facebook.com/municipalidadhuanuco'
    }
  ]);
  
  console.log('✅ Organización sembrada.');
};