exports.seed = async function (knex) {
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('cofradia').truncate();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  const cofradias = [
    { id: 1, nickname_cofradia: 'Juventud San Andrés', nombre_cofradia: 'Cofradía de Negritos Niño Jesús Juventud San Andrés', fecha_fundacion: null, sede_local: 'Local institucional Jr. San Isidro (Calle 9) - La Esperanza', dni_representante: null, nombre_representante: 'Paul Briham Capcha Cárdenas', cel_representante: null, distrito: 'La Esperanza, Amarilis', color: '#000', descripcion: 'Patrimonio cultural de la Nación, cultivando la tradición y llevando alegría.', ubicacion_link: null, organizacion_id: 1 }
  ];

  await knex('cofradia').insert(cofradias);
  console.log('✅ Cofradía sembrada.');
};