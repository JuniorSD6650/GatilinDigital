exports.seed = async function (knex) {
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('cofradia').truncate();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  const cofradias = [
    { id: 1, nickname_cofradia: 'Negritos Niño Jesús Juventud San Andrés', nombre_cofradia: 'Cofradía de Negritos Niño Jesús Juventud San Andrés', fecha_fundacion: '2019-01-01', sede_local: 'Jr. San Isidro (Calle 9) - La Esperanza', dni_representante: null, nombre_representante: 'Paul Briham Capcha Cárdenas', cel_representante: null, distrito: 'La Esperanza, Amarilis', color: '#39e1ffff', descripcion: 'Patrimonio cultural de la Nación, cultivando la tradición y llevando alegría.', ubicacion_link: null, organizacion_id: 1 },
    { id: 2, nickname_cofradia: 'Negritos Divino Niño Universitario', nombre_cofradia: 'Cofradía de Negritos Divino Niño Universitario', fecha_fundacion: '2010-01-01', sede_local: 'Cayhuayna - Pillco Marca (Referencial)', dni_representante: null, nombre_representante: 'Junta Directiva 2025', cel_representante: null, distrito: 'Pillco Marca, Huánuco', color: '#003366ff', descripcion: 'Integrada por estudiantes y profesionales universitarios, promoviendo la fe y tradición.', ubicacion_link: null, organizacion_id: 1 }
  ];

  await knex('cofradia').insert(cofradias);
  console.log('✅ Cofradía sembrada.');
};