/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpiamos la tabla cofradia
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('cofradia').truncate();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  console.log('🌱 Sembrando Cofradías...');

  // Datos de las cofradías (Tal cual los proporcionaste)
  const cofradias = [
    { id: 1, nickname: 'ASOCIACIÓN CULTURAL FOLKLÓRICA DE NEGRITOS NIÑO JESÚS CORAZÓN DE AMARILIS', nombre: 'ASOCIACIÓN CULTURAL FOLKLÓRICA DE NEGRITOS NIÑO JESÚS CORAZÓN DE AMARILIS', color: '#dd01b8ff', org_id: 1 },
    { id: 2, nickname: 'COFRADÍA DE NEGRITOS NIÑO JESÚS REY DE REYES JUANA MORENO', nombre: 'COFRADÍA DE NEGRITOS NIÑO JESÚS REY DE REYES JUANA MORENO', color: '#da0000ff', org_id: 1 },
    { id: 3, nickname: 'COFRADÍA DE NEGRITOS NIÑO JESÚS VIRGEN DE LAS NIEVES', nombre: 'COFRADÍA DE NEGRITOS NIÑO JESÚS VIRGEN DE LAS NIEVES', fecha: '2011-01-13', sede: 'AV. PERÚ MZ. H LT. 5 SAN LUIS SECTOR 2 AMARILIS', rep_dni: '45607683', rep_nom: 'DINO REYFORDT DE LA CRUZ LASTRA', rep_cel: '954938048', distrito: 'AMARILIS', color: '#000', org_id: 1 },
    { id: 4, nickname: 'COFRADÍA DE NEGRITOS NIÑO JESÚS TODAS LAS SANGRES DEL BARRIO SEÑOR DE HUALLAGA-LLICUA', nombre: 'COFRADÍA DE NEGRITOS NIÑO JESÚS TODAS LAS SANGRES DEL BARRIO SEÑOR DE HUALLAGA-LLICUA', color: '#000', org_id: 1 },
    { id: 5, nickname: 'COFRADÍA DE NEGRITOS NIÑO JESÚS REY Y PATRÓN DE AMARILIS', nombre: 'COFRADÍA DE NEGRITOS NIÑO JESÚS REY Y PATRÓN DE AMARILIS', color: '#00c03aff', org_id: 1 },
    { id: 6, nickname: 'COFRADÍA DE NEGRITOS NIÑO JESÚS REAL CABALLEROS DE LEÓN', nombre: 'COFRADÍA DE NEGRITOS NIÑO JESÚS REAL CABALLEROS DE LEÓN', color: '#00b1a2ff', org_id: 1 },
    { id: 7, nickname: 'COFRADÍA DE NEGRITOS DIVINO NIÑO JESÚS REDENTOR ZONA CERO', nombre: 'COFRADÍA DE NEGRITOS DIVINO NIÑO JESÚS REDENTOR ZONA CERO', color: '#00b4b4ff', org_id: 1 },
    { id: 8, nickname: 'ASOCIACIÓN CULTURAL FOLKLÓRICA DE LA COFRADÍA DE NEGRITOS', nombre: 'ASOCIACIÓN CULTURAL FOLKLÓRICA DE LA COFRADÍA DE NEGRITOS', color: '#4700a5ff', org_id: 1 },
    { id: 9, nickname: 'NIÑO JESÚS CORAZÓN DE SAN LUIS SECTOR 1', nombre: 'NIÑO JESÚS CORAZÓN DE SAN LUIS SECTOR 1', color: '#9100bdff', org_id: 1 },
    { id: 10, nickname: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE LA AMISTAD - SECTOR 1', nombre: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE LA AMISTAD - SECTOR 1', color: '#c5004cff', org_id: 1 },
    { id: 11, nickname: 'ASOCIACIÓN COFRADÍA DE NEGRITOS NIÑO JESÚS DE PAUCARBAMBILLA', nombre: 'ASOCIACIÓN COFRADÍA DE NEGRITOS NIÑO JESÚS DE PAUCARBAMBILLA', color: '#e0ca04ff', org_id: 1 },
    { id: 12, nickname: 'COFRADÍA DE NEGRITOS NIÑO JESÚS CRUZ DEL HUALLAGA', nombre: 'COFRADÍA DE NEGRITOS NIÑO JESÚS CRUZ DEL HUALLAGA', color: '#e90000ff', org_id: 1 },
    { id: 13, nickname: 'COFRADÍA DE NEGRITOS NIÑO JESÚS INGENIERO', nombre: 'COFRADÍA DE NEGRITOS NIÑO JESÚS INGENIERO', color: '#000', org_id: 1 },
    { id: 14, nickname: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE NAZARET REAL ZONA CERO', nombre: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE NAZARET REAL ZONA CERO', color: '#17cf06ff', org_id: 1 },
    { id: 15, nickname: 'COFRADÍA DE NEGRITOS NIÑO JESÚS SANTA ROSA DE AMARILIS', nombre: 'COFRADÍA DE NEGRITOS NIÑO JESÚS SANTA ROSA DE AMARILIS', rep_nom: 'Plider Vasquez Ramón', distrito: 'AMARILIS', color: '#c7a200ff', org_id: 1 },
    { id: 16, nickname: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE SAN LUIS SECTOR 2', nombre: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE SAN LUIS SECTOR 2', color: '#cab600ff', org_id: 1 },
    { id: 17, nickname: 'COFRADÍA DE NEGRITOS DIVINO NIÑO DE LA NUEVA GENERACIÓN', nombre: 'COFRADÍA DE NEGRITOS DIVINO NIÑO DE LA NUEVA GENERACIÓN', color: '#db00a4ff', org_id: 1 },
    { id: 18, nickname: 'COFRADÍA DE NEGRITOS LOS ÁNGELES DEL NIÑO JESÚS BARRIO COLONES', nombre: 'COFRADÍA DE NEGRITOS LOS ÁNGELES DEL NIÑO JESÚS BARRIO COLONES', color: '#007addff', org_id: 1 },
    { id: 19, nickname: 'COFRADIA DE NEGRITOS NIÑO JESÚS PRINCIPITO SECTOR 4 SAN LUIS', nombre: 'COFRADIA DE NEGRITOS NIÑO JESÚS PRINCIPITO SECTOR 4 SAN LUIS', color: '#6dcc00ff', org_id: 1 },
    { id: 20, nickname: 'ASOCIACIÓN FOLKLÓRICA DE NEGRITOS DEL NIÑO JESÚS SAN JOSÉ', nombre: 'ASOCIACIÓN FOLKLÓRICA DE NEGRITOS DEL NIÑO JESÚS SAN JOSÉ', color: '#ffffffff', org_id: 1 },
    { id: 21, nickname: 'COFRADÍA DE NEGRITOS NIÑO JESÚS - HUALLAYCO SUR', nombre: 'COFRADÍA DE NEGRITOS NIÑO JESÚS - HUALLAYCO SUR', color: '#aedf00ff', org_id: 1 },
    { id: 22, nickname: 'COFRADIA DE NEGRITOS REY DE REYES DEL JR. JUNÍN', nombre: 'COFRADIA DE NEGRITOS REY DE REYES DEL JR. JUNÍN', color: '#3900d6ff', org_id: 1 },
    { id: 23, nickname: 'CUADRILLA DE NEGRITOS DEL NIÑO JESÚS DE LA SAGRADA FAMILIA', nombre: 'CUADRILLA DE NEGRITOS DEL NIÑO JESÚS DE LA SAGRADA FAMILIA', color: '#00a7d1ff', org_id: 1 },
    { id: 24, nickname: 'COFRADIA DE NEGRITOS NIÑO JESÚS REAL ALFONSO UGARTE', nombre: 'COFRADIA DE NEGRITOS NIÑO JESÚS REAL ALFONSO UGARTE', color: '#b400e0ff', org_id: 1 },
    { id: 25, nickname: 'COFRADÍA DE NEGRITOS AMISTAD REAL DE PINZÁS', nombre: 'COFRADÍA DE NEGRITOS AMISTAD REAL DE PINZÁS', color: '#87db00ff', org_id: 1 },
    { id: 26, nickname: 'COFRADÍA DE NEGRITOS DIVINO NIÑO JESÚS Y SUS AMIGOS', nombre: 'COFRADÍA DE NEGRITOS DIVINO NIÑO JESÚS Y SUS AMIGOS', color: '#19da00ff', org_id: 1 },
    { id: 27, nickname: 'COFRADÍA DE NEGRITOS NIÑO JESÚS COPACABANA', nombre: 'COFRADÍA DE NEGRITOS NIÑO JESÚS COPACABANA', color: '#dbcd00ff', org_id: 1 },
    { id: 28, nickname: 'COFRADIA DE NEGRITOS DIVINO NIÑO TARMA', nombre: 'COFRADIA DE NEGRITOS DIVINO NIÑO TARMA', color: '#00d8d8ff', org_id: 1 },
    { id: 29, nickname: 'COFRADÍA DE NEGRITOS NIÑO JESÚS EL DOCTORCITO DEL SAGRARIO LA MERCED', nombre: 'COFRADÍA DE NEGRITOS NIÑO JESÚS EL DOCTORCITO DEL SAGRARIO LA MERCED', color: '#cc03aaff', org_id: 1 },
    { id: 30, nickname: 'COFRADÍA CESAR GUERRA', nombre: 'COFRADÍA DE NEGRITOS CÉSAR GUERRA DEL 6 DE ENERO DE 1939 DEL BARRIO SAN PEDRO', fecha: '2025-02-05', sede: 'JR AYANCOCHA 283', rep_dni: '73486572', rep_nom: 'FRETEL CASTILLO ANDERSON', rep_cel: '965717239', distrito: 'HUÁNUCO', color: '#11ff00', org_id: 1 },
    { id: 31, nickname: 'COFRADÍA DE NEGRITOS DEL NIÑO JESÚS DEL BARRIO DE PUELLES', nombre: 'COFRADÍA DE NEGRITOS DEL NIÑO JESÚS DEL BARRIO DE PUELLES', color: '#00e426ff', org_id: 1 },
    { id: 32, nickname: 'COFRADÍA DE NEGRITOS DEL NIÑO JESÚS REY DE REYES SAN AGUSTÍN', nombre: 'COFRADÍA DE NEGRITOS DEL NIÑO JESÚS REY DE REYES SAN AGUSTÍN', rep_nom: 'Albert Junior Segundo Gonzales', distrito: 'HUÁNUCO', color: '#00ce11ff', org_id: 1 },
    { id: 33, nickname: 'COFRADÍA DE NEGRITOS SANTA MARíA DE FÁTIMA', nombre: 'COFRADÍA DE NEGRITOS SANTA MARíA DE FÁTIMA', fecha: '2025-01-16', color: '#0040ff', org_id: 1 },
    { id: 34, nickname: 'COFRADÍA DE NEGRITOS DIVINO NIÑO JESÚS DEL BARRIO MAYTA CÁPAC', nombre: 'COFRADÍA DE NEGRITOS DIVINO NIÑO JESÚS DEL BARRIO MAYTA CÁPAC', fecha: '2025-01-13', sede: 'casa', rep_dni: '75128463', rep_nom: 'dsdasdsadsa', rep_cel: '926553985', distrito: 'Amrilis', color: '#d30f0fff', org_id: 1 },
    { id: 35, nickname: 'Cofradia extra', nombre: 'Cofradia extra', fecha: '2025-01-14', rep_nom: 'Manuel', rep_cel: '99553532', color: '#da00bdff', org_id: 1 }
  ];

  // Mapeamos los datos al formato de la tabla SQL
  const cofradiasInsert = cofradias.map(c => ({
    id: c.id, // Forzamos el ID para mantener la relación con tu script de usuarios
    nickname_cofradia: c.nickname,
    nombre_cofradia: c.nombre,
    fecha_fundacion: c.fecha || null,
    sede_local: c.sede || null,
    dni_representante: c.rep_dni || null,
    nombre_representante: c.rep_nom || null,
    cel_representante: c.rep_cel || null,
    distrito: c.distrito || null,
    color: c.color,
    organizacion_id: c.org_id
  }));

  await knex('cofradia').insert(cofradiasInsert);
  
  console.log('✅ Cofradías sembradas.');
};