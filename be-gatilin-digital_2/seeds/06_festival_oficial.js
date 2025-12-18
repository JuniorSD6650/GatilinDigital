/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpieza de tabla
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('festival_eventos').truncate();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  console.log('🌱 Sembrando Festival Oficial (Edición 2025-2026)...');

  const eventos = [
    // ==========================================
    // DICIEMBRE 2025 (Según PRESEN. PLAZA DE ARMAS)
    // ==========================================
    
    // --- 24 DIC ---
    { fecha: '2025-12-24', hora_t: '4:30 PM', hora: '16:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS SAN CRISTOBAL DE ROSAVERO (VÍSPERA)' },
    { fecha: '2025-12-24', hora_t: '6:30 PM', hora: '18:30:00', cofradia: 'COFRADÍA DE NEGRITOS REAL SAN ANDRÉS' },
    { fecha: '2025-12-24', hora_t: '7:00 PM', hora: '19:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE LA CAPILLA EX CASA HACIENDA DE CAYHUAYNA (VÍSPERA)' },
    { fecha: '2025-12-24', hora_t: '8:00 PM', hora: '20:00:00', cofradia: 'COFRADÍA DE NEGRITOS REAL HUALLAYCO DEL 25 DE DICIEMBRE (VÍSPERA)' },
    { fecha: '2025-12-24', hora_t: '8:30 PM', hora: '20:30:00', cofradia: 'COFRADÍA DE NEGRITOS CASA HACIENDA DE CAYHUAYNA' },

    // --- 26 DIC ---
    { fecha: '2025-12-26', hora_t: '10:30 AM', hora: '10:30:00', cofradia: 'ASOCIACIÓN COFRADÍA DE NEGRITOS NIÑO JESÚS DE CAYHUAYNA - PILLCOMARCA' },
    { fecha: '2025-12-26', hora_t: '11:00 AM', hora: '11:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO REY DE ANDABAMBA' },
    { fecha: '2025-12-26', hora_t: '8:00 PM', hora: '20:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESUS DE LA JUSTICIA' },
    { fecha: '2025-12-26', hora_t: '9:00 PM', hora: '21:00:00', cofradia: 'COFRADIA DE NEGRITOS NIÑO JESUS DEL PATROCINIO BARRIO LA ALAMEDA (VÍSPERA)' },

    // --- 27 DIC ---
    { fecha: '2025-12-27', hora_t: '11:00 AM', hora: '11:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE LA JUSTICIA' },
    { fecha: '2025-12-27', hora_t: '8:30 PM', hora: '20:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS REY DE REYES SANTO DOMINGO (VÍSPERA)' },
    { fecha: '2025-12-27', hora_t: '9:45 PM', hora: '21:45:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS AMIGO (VÍSPERA)' },

    // --- 28 DIC ---
    { fecha: '2025-12-28', hora_t: '9:30 AM', hora: '09:30:00', cofradia: 'COFRADÍA DE NEGRITOS DIVINO NIÑO UNIVERSITARIO' },
    { fecha: '2025-12-28', hora_t: '10:30 AM', hora: '10:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DEL 25 DE DICIEMBRE - QUICACÁN' },
    { fecha: '2025-12-28', hora_t: '11:00 AM', hora: '11:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE LA CAPILLA EX CASA HACIENDA DE CAYHUAYNA (VÍSPERA)' },
    { fecha: '2025-12-28', hora_t: '8:00 PM', hora: '20:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE LA JUSTICIA' },

    // --- 29 DIC ---
    { fecha: '2025-12-29', hora_t: '11:00 AM', hora: '11:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS REY DE REYES SANTO DOMINGO (VÍSPERA)' },
    { fecha: '2025-12-29', hora_t: '11:30 AM', hora: '11:30:00', cofradia: 'COFRADÍA DE NEGRITOS DE LA PROMOCIÓN DE LA UNHEVAL AUREUM LEGATUM 2025' },

    // --- 30 DIC ---
    { fecha: '2025-12-30', hora_t: '10:30 AM', hora: '10:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS AMIGO' },
    { fecha: '2025-12-30', hora_t: '12:00 M', hora: '12:00:00', cofradia: 'COFRADÍA DE NEGRITOS REAL CAYHUAYNA' },

    // --- 31 DIC ---
    { fecha: '2025-12-31', hora_t: '6:00 PM', hora: '18:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS REAL CORAZÓN DE JANCAO (VÍSPERA)' },
    { fecha: '2025-12-31', hora_t: '7:30 PM', hora: '19:30:00', cofradia: 'COFRADÍA DE NEGRITOS NUESTRA SEÑORA DEL PATROCINIO HUALLAYCO 1 DE ENERO (VÍSPERA)' },
    { fecha: '2025-12-31', hora_t: '8:00 PM', hora: '20:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS SAN FRANCISCO (VÍSPERA)' },
    { fecha: '2025-12-31', hora_t: '8:30 PM', hora: '20:30:00', cofradia: 'COFRADÍA DE NEGRITOS SAN CRISTOBAL CALICANTO' },
    { fecha: '2025-12-31', hora_t: '8:30 PM', hora: '20:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS CRUZ VERDE (VÍSPERA)' },
    { fecha: '2025-12-31', hora_t: '9:30 PM', hora: '21:30:00', cofradia: 'COFRADÍA DE NEGRITOS HUALLAYCO 1ERO DE ENERO TRADICIÓN' },

    // ==========================================
    // ENERO 2026 
    // ==========================================

    // --- 01 ENE ---
    { fecha: '2026-01-01', hora_t: '7:00 PM', hora: '19:00:00', cofradia: 'COFRADÍA DE NEGRITOS DEL NIÑO JESÚS DE LA MISERICORDIA (VÍSPERA)' },

    // --- 02 ENE ---
    { fecha: '2026-01-02', hora_t: '9:30 AM', hora: '09:30:00', cofradia: 'COFRADÍA DE NEGRITOS REY DE REYES NIÑO JESÚS DE LA DESPENSA' },
    { fecha: '2026-01-02', hora_t: '10:00 AM', hora: '10:00:00', cofradia: 'COFRADÍA DE NEGRITOS DEL NIÑO JESÚS DE LA MISERICORDIA' },
    { fecha: '2026-01-02', hora_t: '11:30 AM', hora: '11:30:00', cofradia: 'COFRADÍA DE NEGRITOS NUESTRA SEÑORA DEL PATROCINIO HUALLAYCO 1 DE ENERO' },
    { fecha: '2026-01-02', hora_t: '1:30 PM', hora: '13:30:00', cofradia: 'COFRADÍA DE NEGRITOS HUALLAYCO VIDA POR SIEMPRE' },
    { fecha: '2026-01-02', hora_t: '4:30 PM', hora: '16:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS SALVADOR DE AÑO NUEVO DE ACOMAYO' },

    // --- 03 ENE ---
    { fecha: '2026-01-03', hora_t: '10:00 AM', hora: '10:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS SAN FRANCISCO' },
    { fecha: '2026-01-03', hora_t: '7:00 PM', hora: '19:00:00', cofradia: 'COFRADÍA DE NEGRITOS CRUZ BLANCA CUNA DE BAILANTES (VÍSPERA)' },

    // --- 04 ENE ---
    { fecha: '2026-01-04', hora_t: '8:30 AM', hora: '08:30:00', cofradia: 'COFRADÍA DE NEGRITOS SAN CRISTOBAL CALICANTO' },
    { fecha: '2026-01-04', hora_t: '10:30 AM', hora: '10:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS CRUZ VERDE' },
    { fecha: '2026-01-04', hora_t: '6:30 PM', hora: '18:30:00', cofradia: 'COFRADÍA DE NEGRITOS CRUZ BLANCA CUNA DE BAILANTES' },

    // --- 05 ENE (VÍSPERA GRANDE - Fuente: VISPERA...DOCX) ---
    { fecha: '2026-01-05', hora_t: '5:00 PM', hora: '17:00:00', cofradia: 'COFRADÍA DE NEGRITOS DIVINO REY DE CASTILLA (VÍSPERA)' },
    { fecha: '2026-01-05', hora_t: '5:30 PM', hora: '17:30:00', cofradia: 'COFRADIA DE NEGRITOS EL DOCTORCITO (VÍSPERA)' },
    { fecha: '2026-01-05', hora_t: '6:00 PM', hora: '18:00:00', cofradia: 'COFRADÍA DE NEGRITOS HERMANDAD Y COFRADÍA NIÑO JESÚS DE LA CATEDRAL (VÍSPERA)' },
    { fecha: '2026-01-05', hora_t: '6:30 PM', hora: '18:30:00', cofradia: 'COFRADÍA DE NEGRITOS EL DOCTORCITO SAGRARIO LA MERCED (VÍSPERA)' },
    { fecha: '2026-01-05', hora_t: '7:00 PM', hora: '19:00:00', cofradia: 'COFRADIA DE NEGRITOS CESAR GUERRA (VÍSPERA)' },
    { fecha: '2026-01-05', hora_t: '7:30 PM', hora: '19:30:00', cofradia: 'COFRADÍA DE NEGRITOS CHACÓN DE BEATERIO (VÍSPERA)' },
    { fecha: '2026-01-05', hora_t: '8:00 PM', hora: '20:00:00', cofradia: 'ASOCIACIÓN FOLKLORICA COFRADIA DE NEGRITOS MIGUEL GUERRA GARAY' },
    { fecha: '2026-01-05', hora_t: '8:30 PM', hora: '20:30:00', cofradia: 'COFRADÍA DE NEGRITOS REAL CRUZ VERDE' },
    { fecha: '2026-01-05', hora_t: '8:30 PM', hora: '20:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS CABALLEROS DEL PILLCO (VÍSPERA)' },
    { fecha: '2026-01-05', hora_t: '9:00 PM', hora: '21:00:00', cofradia: 'ASOCIACIÓN FOLKLÓRICA NIÑO JESÚS DE SAN PEDRO 1989 (VÍSPERA)' },
    { fecha: '2026-01-05', hora_t: '9:30 PM', hora: '21:30:00', cofradia: 'COFRADIA DE NEGRITOS NIÑO JESÚS COPACABANA' },
    { fecha: '2026-01-05', hora_t: '10:00 PM', hora: '22:00:00', cofradia: 'COFRADÍA DE NEGRITOS BARRIO SAN SEBASTIAN 6 ESQUINAS POR SIEMPRE' },
    { fecha: '2026-01-05', hora_t: '10:30 PM', hora: '22:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE SEICHI IZUMI' },

    // --- 06 ENE (DÍA CENTRAL - Fuente: VISPERA...DOCX) ---
    { fecha: '2026-01-06', hora_t: '8:00 AM', hora: '08:00:00', cofradia: 'COFRADÍA DE NEGRITOS MUNICIPALIDAD PROVINCIAL DE HUÁNUCO' },
    { fecha: '2026-01-06', hora_t: '8:30 AM', hora: '08:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESUS HUALLAYCO FLORES' },
    { fecha: '2026-01-06', hora_t: '9:00 AM', hora: '09:00:00', cofradia: 'COFRADÍA DE NEGRITOS HERMANDAD Y COFRADÍA NIÑO JESÚS DE LA CATEDRAL' },
    { fecha: '2026-01-06', hora_t: '9:30 AM', hora: '09:30:00', cofradia: 'COFRADÍA DE NEGRITOS SAN CRISTÓBAL – LOS FUNDADORES' },
    { fecha: '2026-01-06', hora_t: '10:00 AM', hora: '10:00:00', cofradia: 'COFRADÍA DE NEGRITOS LEÓN DE HUÁNUCO' },
    { fecha: '2026-01-06', hora_t: '10:00 AM', hora: '10:00:00', cofradia: 'COFRADÍA DE NEGRITOS NUEVA ESPERANZA DE VILCAR' },
    { fecha: '2026-01-06', hora_t: '10:30 AM', hora: '10:30:00', cofradia: 'COFRADÍA DE NEGRITOS EL DOCTORCITO (SAGRARIO LA MERCED)' },
    { fecha: '2026-01-06', hora_t: '11:00 AM', hora: '11:00:00', cofradia: 'COFRADÍA DE NEGRITOS CHACÓN DE BEATERIO' },
    { fecha: '2026-01-06', hora_t: '11:30 AM', hora: '11:30:00', cofradia: 'CEREMONIA ENTREGA DE MEDALLA (MUNICIPALIDAD)' },
    { fecha: '2026-01-06', hora_t: '12:00 M', hora: '12:00:00', cofradia: 'COFRADÍA DE NEGRITOS EL DOCTORCITO' },
    { fecha: '2026-01-06', hora_t: '12:30 PM', hora: '12:30:00', cofradia: 'ASOCIACIÓN FOLKLORICA COFRADIA DE NEGRITOS MIGUEL GUERRA GARAY' },
    { fecha: '2026-01-06', hora_t: '1:00 PM', hora: '13:00:00', cofradia: 'COFRADÍA DE NEGRITOS REAL CRUZ VERDE' },
    { fecha: '2026-01-06', hora_t: '1:30 PM', hora: '13:30:00', cofradia: 'COFRADIA DE NEGRITOS CESAR GUERRA' },
    { fecha: '2026-01-06', hora_t: '2:00 PM', hora: '14:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS COPACABANA' },
    { fecha: '2026-01-06', hora_t: '4:00 PM', hora: '16:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE LA SANTA CRUZ' },
    { fecha: '2026-01-06', hora_t: '5:30 PM', hora: '17:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE SEICHI IZUMI' },
    { fecha: '2026-01-06', hora_t: '6:00 PM', hora: '18:00:00', cofradia: 'COFRADÍA DE NEGRITOS DIVINO PATRÓN JIRÓN HUÁNUCO PRIMERA CUADRA' },
    { fecha: '2026-01-06', hora_t: '8:30 PM', hora: '20:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DANIEL COMBONI (VÍSPERA)' },

    // --- 07 ENE (FESTIVAL - Fuente: VISPERA...DOCX) ---
    { fecha: '2026-01-07', hora_t: '9:00 AM', hora: '09:00:00', cofradia: 'ASOCIACIÓN FOLKLÓRICA NIÑO JESÚS DE SAN PEDRO 1989' },
    { fecha: '2026-01-07', hora_t: '9:30 AM', hora: '09:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS CAYHUAYNA 06 DE ENERO' },
    { fecha: '2026-01-07', hora_t: '10:00 AM', hora: '10:00:00', cofradia: 'COFRADIA DE NEGRITOS NIÑO JESUS HUALLAYCO FLORES' },
    { fecha: '2026-01-07', hora_t: '10:30 AM', hora: '10:30:00', cofradia: 'COFRADÍA DE NEGRITOS DE LA IGLESIA SAN CRISTÓBAL 06 DE ENERO' },
    { fecha: '2026-01-07', hora_t: '11:00 AM', hora: '11:00:00', cofradia: 'COFRADÍA DE NEGRITOS ESTUDIANTES UNIDOS DEL PATROCINIO 06 DE ENERO' },
    { fecha: '2026-01-07', hora_t: '11:30 AM', hora: '11:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE LA HERMANDAD SEÑOR DE BURGOS' },
    { fecha: '2026-01-07', hora_t: '12:00 M', hora: '12:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO REAL CELESTIAL DEL BARRIO PEDRO BARROSO' },
    { fecha: '2026-01-07', hora_t: '1:00 PM', hora: '13:00:00', cofradia: 'COFRADÍA DE NEGRITOS BARRIO SAN SEBASTIAN 6 ESQUINAS POR SIEMPRE' },
    { fecha: '2026-01-07', hora_t: '1:30 PM', hora: '13:30:00', cofradia: 'COFRADÍA DE NEGRITOS DEL TEMPLO DE CRISTO REY DE HUÁNUCO' },
    { fecha: '2026-01-07', hora_t: '4:00 PM', hora: '16:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DEL PARQUE TABACO' },
    { fecha: '2026-01-07', hora_t: '4:30 PM', hora: '16:30:00', cofradia: 'COFRADIA DE NEGRITOS DIVINO NIÑO JESUS BARRIO TARMA' },
    { fecha: '2026-01-07', hora_t: '5:00 PM', hora: '17:00:00', cofradia: 'COFRADÍA DE NEGRITOS DIVINO REY DE CASTILLA' },
    { fecha: '2026-01-07', hora_t: '5:30 PM', hora: '17:30:00', cofradia: 'COFRADÍA DE NEGRITOS EL GRAN PEQUEÑO' },
    { fecha: '2026-01-07', hora_t: '6:00 PM', hora: '18:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESUS DEL COLEGIO DE ARQUITECTOS' },
    { fecha: '2026-01-07', hora_t: '8:30 PM', hora: '20:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESUS DIVINO REY DE JACTAY (VÍSPERA)' },

    // --- 08 ENE ---
    { fecha: '2026-01-08', hora_t: '8:30 AM', hora: '08:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE SANTA ROSA' },
    { fecha: '2026-01-08', hora_t: '10:00 AM', hora: '10:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS INGENIERO' },
    { fecha: '2026-01-08', hora_t: '10:30 AM', hora: '10:30:00', cofradia: 'COFRADIA DE NEGRITOS NIÑO JESUS DE SAN SEBASTIÁN' },
    { fecha: '2026-01-08', hora_t: '11:00 AM', hora: '11:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE LA HERMANDAD LOS COROCHANOS' },
    { fecha: '2026-01-08', hora_t: '11:30 AM', hora: '11:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE LA NOVENA CUADRILLA' },
    { fecha: '2026-01-08', hora_t: '12:00 M', hora: '12:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESUS DEL COLEGIO DE ARQUITECTOS' },
    { fecha: '2026-01-08', hora_t: '12:30 PM', hora: '12:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS CORAZÓN DE PUELLES' },
    { fecha: '2026-01-08', hora_t: '5:00 PM', hora: '17:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS CABALLEROS DEL PILLCO' },
    { fecha: '2026-01-08', hora_t: '8:00 PM', hora: '20:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO REY CORAZÓN DE BELÉN (VÍSPERA)' },
    { fecha: '2026-01-08', hora_t: '9:00 PM', hora: '21:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO DIVINO JESUS Y SUS AMIGOS (VÍSPERA)' },

    // --- 09 ENE ---
    { fecha: '2026-01-09', hora_t: '11:30 AM', hora: '11:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO REY CORAZÓN DE BELÉN' },
    { fecha: '2026-01-09', hora_t: '12:00 M', hora: '12:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DANIEL COMBONI' },
    { fecha: '2026-01-09', hora_t: '12:30 PM', hora: '12:30:00', cofradia: 'ASOCIACIÓN CULTURAL SOL ANDINO' },
    { fecha: '2026-01-09', hora_t: '4:00 PM', hora: '16:00:00', cofradia: 'Cofradía de Negritos Cruz Blanca de niñitos' },
    { fecha: '2026-01-09', hora_t: '5:30 PM', hora: '17:30:00', cofradia: 'COFRADÍA NIÑO JESÚS REDENTOR DE SAN LUIS SECTOR II (VÍSPERA)' },
    { fecha: '2026-01-09', hora_t: '8:30 PM', hora: '20:30:00', cofradia: 'COFRADÍA REAL SOCIEDAD DEL BARRIO SECTOR 1 SAN LUIS (VÍSPERA)' },
    { fecha: '2026-01-09', hora_t: '9:00 PM', hora: '21:00:00', cofradia: 'ASOCIACIÓN FLOCLÓRICA NIÑO JESÚS DE LA ESPINA (VÍSPERA)' },
    { fecha: '2026-01-09', hora_t: '10:00 PM', hora: '22:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO DIOS (VÍSPERA)' },

    // --- 10 ENE ---
    { fecha: '2026-01-10', hora_t: '10:00 AM', hora: '10:00:00', cofradia: 'COFRADÍA DE NEGRITOS REAL SOCIEDAD DEL BARRIO SECTOR 1 SAN LUIS' },
    { fecha: '2026-01-10', hora_t: '10:30 AM', hora: '10:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE LA PARROQUÍA SAN FRANCISCO' },
    { fecha: '2026-01-10', hora_t: '11:00 AM', hora: '11:00:00', cofradia: 'COFRADÍA DE NEGRITOS DEL DIVINO NIÑO JESÚS DE LOS ADMINISTRADORES' },
    { fecha: '2026-01-10', hora_t: '11:30 AM', hora: '11:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DEL CÓMITE 12 – APARICIO POMARES' },
    { fecha: '2026-01-10', hora_t: '4:00 PM', hora: '16:00:00', cofradia: 'COFRADÍA DE NEGRITOS VIRGEN DE LAS NIEVES (VÍSPERA)' },
    { fecha: '2026-01-10', hora_t: '5:00 PM', hora: '17:00:00', cofradia: 'COFRADÍA NIÑO JESÚS REDENTOR DE SAN LUIS SECTOR II' },
    { fecha: '2026-01-10', hora_t: '5:30 PM', hora: '17:30:00', cofradia: 'COFRADÍA DE NEGRITOS DIVINO NIÑO JESÚS MAYTA CAPAC' },
    { fecha: '2026-01-10', hora_t: '6:00 PM', hora: '18:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO DIOS' },
    { fecha: '2026-01-10', hora_t: '6:30 PM', hora: '18:30:00', cofradia: 'COFRADÍA NIÑO JESÚS SEÑOR DE PUELLES' },

    // --- 11 ENE ---
    { fecha: '2026-01-11', hora_t: '10:00 AM', hora: '10:00:00', cofradia: 'ASOCIACIÓN FLOCLÓRICA DE NEGRITOS NIÑO JESÚS DE LA ESPINA' },
    { fecha: '2026-01-11', hora_t: '10:30 AM', hora: '10:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESUS DE PUCUCHINCHI' },
    { fecha: '2026-01-11', hora_t: '11:00 AM', hora: '11:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE LA FLORIDA' },
    { fecha: '2026-01-11', hora_t: '11:30 AM', hora: '11:30:00', cofradia: 'COFRADÍA DE NEGRITOS SAN JUAN I LEALTAD DEL BARRIO DE SAN JUAN CUCHILLO' },
    { fecha: '2026-01-11', hora_t: '12:00 M', hora: '12:00:00', cofradia: 'COFRADÍA DE NEGRITOS DEL BARRIO LA CORDOVITA' },
    { fecha: '2026-01-11', hora_t: '1:00 PM', hora: '13:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESUS DE LA COOP. SAN FRANCISCO' },
    { fecha: '2026-01-11', hora_t: '7:00 PM', hora: '19:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO DIVINO JESUS Y SUS AMIGOS' },

    // --- 12 ENE ---
    { fecha: '2026-01-12', hora_t: '10:00 AM', hora: '10:00:00', cofradia: 'COFRADÍA DE NEGRITOS REY DE REYES DEL JIRÓN JUNÍN' },
    { fecha: '2026-01-12', hora_t: '10:30 AM', hora: '10:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DEL BARRIO PUELLES' },
    { fecha: '2026-01-12', hora_t: '11:00 AM', hora: '11:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DEL FUNDO ZEVALLOS' },
    { fecha: '2026-01-12', hora_t: '11:30 AM', hora: '11:30:00', cofradia: 'COFRADÍA DE NEGRITOS REAL SAN LUIS – SECTOR 1' },
    { fecha: '2026-01-12', hora_t: '12:00 M', hora: '12:00:00', cofradia: 'COFRADÍA DE NEGRITOS AMISTAD REAL DE PINZÁS' },
    { fecha: '2026-01-12', hora_t: '12:30 M', hora: '12:30:00', cofradia: 'COFRADÍA DE NEGRITOS INPE' },
    { fecha: '2026-01-12', hora_t: '8:30 PM', hora: '20:30:00', cofradia: 'COFRADÍA DE NEGRITOS DIVINO NIÑO JESUS REY DE REYES' },
    { fecha: '2026-01-12', hora_t: '9:00 PM', hora: '21:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS REY DE BELÉN (VÍSPÉRA)' },

    // --- 13 ENE ---
    { fecha: '2026-01-13', hora_t: '10:30 AM', hora: '10:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESUS SALVADOR' },
    { fecha: '2026-01-13', hora_t: '11:30 AM', hora: '11:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS APARICIO POMARES' },
    { fecha: '2026-01-13', hora_t: '5:00 PM', hora: '17:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS PRINCIPITO SECTOR 4 -SAN LUIS' },
    { fecha: '2026-01-13', hora_t: '8:30 PM', hora: '20:30:00', cofradia: 'COFRADÍA DE NEGRITOS SAN CRISTÓBAL DE LLICUA' },

    // --- 14 ENE ---
    { fecha: '2026-01-14', hora_t: '11:00 AM', hora: '11:00:00', cofradia: 'COFRADÍA DE NEGRITOS ESCENCIA HUANUQUEÑA RESIDENTES DE LIMA' },
    { fecha: '2026-01-14', hora_t: '12:00 M', hora: '12:00:00', cofradia: 'COFRADÍA DE NEGRITOS LOS ÁNGELES NIÑO JESÚS DEL BARRIO COLONES' },
    { fecha: '2026-01-14', hora_t: '3:30 PM', hora: '15:30:00', cofradia: 'COFRADÍA DE NEGRITOS VIRGEN DE LAS NIEVES' },
    { fecha: '2026-01-14', hora_t: '4:00 PM', hora: '16:00:00', cofradia: 'COFRADÍA DE NEGRITOS SAN CRISTÓBAL DE LLICUA' },
    { fecha: '2026-01-14', hora_t: '6:00 PM', hora: '18:00:00', cofradia: 'COFRADÍA DE NEGRITOS DIVINO NIÑO JESÚS REY DE REYES' },
    { fecha: '2026-01-14', hora_t: '8:30 PM', hora: '20:30:00', cofradia: 'COFRADÍA DE NEGRITOS GLORIOSO NIÑO JESUS (VÍSPERA)' },

    // --- 15 ENE ---
    { fecha: '2026-01-15', hora_t: '10:30 AM', hora: '10:30:00', cofradia: 'COFRADÍA DE NEGRITOS DE LAS 5 ESQUINAS LA LAGUNA' },
    { fecha: '2026-01-15', hora_t: '12:30 M', hora: '12:30:00', cofradia: 'COFRADÍA DE NEGRITOS DE MENORES DEL NIÑO JESÚS DE LA CRUZ VERDE' },
    { fecha: '2026-01-15', hora_t: '5:00 PM', hora: '17:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS REY SEÑOR DE HUAYOPAMPA' },
    { fecha: '2026-01-15', hora_t: '7:30 PM', hora: '19:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS EL GRAN PEQUEÑO (VÍSPERA)' },
    { fecha: '2026-01-15', hora_t: '8:00 PM', hora: '20:00:00', cofradia: 'COFRADÍA DE NEGRITOS DIVINO REDENTOR DE HUÁNUCO (VÍSPERA)' },

    // --- 16 ENE ---
    { fecha: '2026-01-16', hora_t: '10:00 AM', hora: '10:00:00', cofradia: 'COFRADÍA DE NEGRITOS DIVINO REDENTOR DE HUÁNUCO' },
    { fecha: '2026-01-16', hora_t: '7:00 PM', hora: '19:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS REY DE BELÉN' },
    { fecha: '2026-01-16', hora_t: '8:00 PM', hora: '20:00:00', cofradia: 'COFRADÍA DE NEGRITOS DEL NIÑO JESÚS REDENTOR LOS MÚSICOS (VÍSPERA)' },
    { fecha: '2026-01-16', hora_t: '8:30 PM', hora: '20:30:00', cofradia: 'COFRADÍA DE NEGRITOS FAM. BENANCIO MARCELO' },

    // --- 17 ENE ---
    { fecha: '2026-01-17', hora_t: '09:30 AM', hora: '09:30:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE FONAVI III' },
    { fecha: '2026-01-17', hora_t: '11:00 AM', hora: '11:00:00', cofradia: 'COFRADÍA DE NEGRITOS DEL NIÑO JESÚS REDENTOR LOS MÚSICOS' },
    { fecha: '2026-01-17', hora_t: '11:30 AM', hora: '11:30:00', cofradia: 'COFRADÍA DE NEGRITOS GLORIOSO NIÑO JESUS' },
    { fecha: '2026-01-17', hora_t: '12:00 M', hora: '12:00:00', cofradia: 'COFRADÍA DE NEGRITOS NIÑO JESÚS DE NUESTRA SEÑORA VIRGEN DEL CARMEN FONAVI II' },
    { fecha: '2026-01-17', hora_t: '5:00 PM', hora: '17:00:00', cofradia: 'COFRADÍA DE NEGRITOS INFANTIL NIÑO JESÚS DE SAN JUAN' },
    { fecha: '2026-01-17', hora_t: '8:00 PM', hora: '20:00:00', cofradia: 'COFRADÍA DE NEGRITOS DIVINO REDENTOR DE HUÁNUCO (DESPEDIDA)' },

    // --- 18 ENE ---
    { fecha: '2026-01-18', hora_t: '10:00 AM', hora: '10:00:00', cofradia: 'COFRADÍA DE NEGRITOS SEMILLEROS HUALLAYCO VIDA' },

    // --- 19 ENE ---
    { fecha: '2026-01-19', hora_t: '8:00 PM', hora: '20:00:00', cofradia: 'COFRADÍA DE NEGRITOS DEL NIÑO JESÚS REDENTOR LOS MÚSICOS (DESPEDIDA)' },
  ];

  await knex('festival_eventos').insert(eventos.map(e => ({
    fecha: e.fecha,
    hora_inicio: e.hora,
    hora_texto: e.hora_t,
    nombre_cofradia: e.cofradia,
    tipo_actividad: e.cofradia.toLowerCase().includes('víspera') ? 'Víspera' : 
                    e.cofradia.toLowerCase().includes('despedida') ? 'Despedida' : 'Presentación'
  })));

  console.log('✅ Festival Oficial sembrado.');
};