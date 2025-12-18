exports.seed = async function(knex) {
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('eventos').truncate();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  const eventos = [
    { id: 1, fecha: '2025-12-24', tipo_dia: 'Víspera', tipo_evento: 'Concentración', hora: '16:00:00', direccion: 'Local institucional Jr. San Isidro (Calle 9)', of: 'Junta Directiva', tipo_of: 'Cofradía', banda: 'Ninguna', cofradia: 1 },
    { id: 2, fecha: '2025-12-24', tipo_dia: 'Víspera', tipo_evento: 'Misa y Cena', hora: '16:45:00', direccion: 'Carretera Central, Calle 6 (Frente a la UDH)', of: 'Familia Cárdenas Huamán', tipo_of: 'Familia', banda: 'Ninguna', cofradia: 1 },
    { id: 3, fecha: '2025-12-24', tipo_dia: 'Víspera', tipo_evento: 'Ingreso de Banda', hora: '18:00:00', direccion: 'Carretera Central, Calle 6 (Frente a la UDH)', of: 'Cofradía', tipo_of: 'Organización', banda: 'Espectacular Banda Juventud San Andrés', cofradia: 1 },
    { id: 4, fecha: '2025-12-24', tipo_dia: 'Víspera', tipo_evento: 'Baile de adoración', hora: '19:00:00', direccion: 'Local institucional Jr. San Isidro (Calle 9)', of: 'Cofradía', tipo_of: 'Organización', banda: 'Espectacular Banda Juventud San Andrés', cofradia: 1 },
    { id: 5, fecha: '2025-12-24', tipo_dia: 'Víspera', tipo_evento: 'Chocolatada', hora: '20:00:00', direccion: 'Local institucional Jr. San Isidro (Calle 9)', of: 'Anatolio Valdivia Cierto y esposa Susana Borja', tipo_of: 'Familia', banda: 'Ninguna', cofradia: 1 },
    { id: 6, fecha: '2025-12-24', tipo_dia: 'Víspera', tipo_evento: 'Quema de castillo', hora: '23:59:00', direccion: 'Local institucional Jr. San Isidro (Calle 9)', of: 'Carlos Laveriano, Luis Laveriano y Jhon Mejía', tipo_of: 'Devotos', banda: 'Ninguna', cofradia: 1 },
    { id: 7, fecha: '2025-12-25', tipo_dia: 'Primer Día', tipo_evento: 'Desayuno', hora: '07:00:00', direccion: 'Local institucional Jr. San Isidro (Calle 9)', of: 'Mayordomos 2025 (Zevallos, Domínguez, Falcón, et al.)', tipo_of: 'Mayordomos', banda: 'Ninguna', cofradia: 1 },
    { id: 8, fecha: '2025-12-25', tipo_dia: 'Primer Día', tipo_evento: 'Misa', hora: '09:00:00', direccion: 'Cochera Sra. Milagros Domínguez, Jr. San Isidro (Calle 9)', of: 'Familia Fabian Cárdenas y familia Falcon Cueva', tipo_of: 'Familia', banda: 'Ninguna', cofradia: 1 },
    { id: 9, fecha: '2025-12-25', tipo_dia: 'Primer Día', tipo_evento: 'Visita', hora: '10:30:00', direccion: 'Jr. Santa Isabel N°195', of: 'Jofree Espinoza Gonzales y familia', tipo_of: 'Familia', banda: 'Espectacular Banda Juventud San Andrés', cofradia: 1 },
    { id: 10, fecha: '2025-12-25', tipo_dia: 'Primer Día', tipo_evento: 'Almuerzo', hora: '13:00:00', direccion: 'Local institucional Jr. San Isidro (Calle 9)', of: 'Mayordomos 2025', tipo_of: 'Mayordomos', banda: 'Ninguna', cofradia: 1 },
    { id: 11, fecha: '2025-12-25', tipo_dia: 'Primer Día', tipo_evento: 'Baile y Fiesta', hora: '14:00:00', direccion: 'Local institucional Jr. San Isidro (Calle 9)', of: 'Cofradía', tipo_of: 'Organización', banda: 'Espectacular Banda Juventud San Andrés', cofradia: 1 },
    { id: 12, fecha: '2025-12-25', tipo_dia: 'Primer Día', tipo_evento: 'Entrega de cambio', hora: '18:00:00', direccion: 'Local institucional Jr. San Isidro (Calle 9)', of: 'Mayordomos salientes', tipo_of: 'Mayordomos', banda: 'Espectacular Banda Juventud San Andrés', cofradia: 1 },
    { id: 13, fecha: '2025-12-25', tipo_dia: 'Primer Día', tipo_evento: 'Locreada', hora: '20:00:00', direccion: 'Jr. San Isidro (Calle 9)', of: 'Mayordomos 2025', tipo_of: 'Mayordomos', banda: 'Ninguna', cofradia: 1 },
    { id: 14, fecha: '2025-12-26', tipo_dia: 'Segundo Día', tipo_evento: 'Desayuno', hora: '07:00:00', direccion: 'Jr. San Isidro (Calle 9)', of: 'Mayordomo Omar Zevallos Salas y familia', tipo_of: 'Mayordomo', banda: 'Ninguna', cofradia: 1 },
    { id: 15, fecha: '2025-12-26', tipo_dia: 'Segundo Día', tipo_evento: 'Misa', hora: '09:00:00', direccion: 'Cochera Sra. Milagros Domínguez, Jr. San Isidro (Calle 9)', of: 'Maruja Goñe Espinoza', tipo_of: 'Devoto', banda: 'Ninguna', cofradia: 1 },
    { id: 16, fecha: '2025-12-26', tipo_dia: 'Segundo Día', tipo_evento: 'Visita', hora: '10:30:00', direccion: 'Campo Sintético el Futbolero', of: 'Marcos Cárdenas Malpartida y Edwin Sánchez Pérez', tipo_of: 'Devotos', banda: 'Espectacular Banda Juventud San Andrés', cofradia: 1 },
    { id: 17, fecha: '2025-12-26', tipo_dia: 'Segundo Día', tipo_evento: 'Almuerzo', hora: '13:00:00', direccion: 'Jr. San Isidro (Calle 9)', of: 'Mayordomo Omar Zevallos Salas y familia', tipo_of: 'Mayordomo', banda: 'Ninguna', cofradia: 1 },
    { id: 18, fecha: '2025-12-26', tipo_dia: 'Segundo Día', tipo_evento: 'Baile y Fiesta', hora: '14:00:00', direccion: 'Jr. San Isidro (Calle 9)', of: 'Cofradía', tipo_of: 'Organización', banda: 'Espectacular Banda Juventud San Andrés', cofradia: 1 },
    { id: 19, fecha: '2025-12-26', tipo_dia: 'Segundo Día', tipo_evento: 'Entrega de cambio', hora: '18:00:00', direccion: 'Jr. San Isidro (Calle 9)', of: 'Mayordomos salientes', tipo_of: 'Mayordomos', banda: 'Ninguna', cofradia: 1 },
    { id: 20, fecha: '2025-12-26', tipo_dia: 'Segundo Día', tipo_evento: 'Locreada', hora: '20:00:00', direccion: 'Jr. San Isidro (Calle 9)', of: 'Mayordomo Omar Zevallos Salas y familia', tipo_of: 'Mayordomo', banda: 'Ninguna', cofradia: 1 },
    { id: 21, fecha: '2025-12-27', tipo_dia: 'Tercer Día', tipo_evento: 'Desayuno', hora: '07:00:00', direccion: 'Jr. San Isidro (Calle 9)', of: 'Clarisa Pamela Cárdenas Arce y Ronald Mantilla', tipo_of: 'Devotos', banda: 'Ninguna', cofradia: 1 },
    { id: 22, fecha: '2025-12-27', tipo_dia: 'Tercer Día', tipo_evento: 'Misa', hora: '09:00:00', direccion: 'Cochera Sra. Milagros Domínguez, Jr. San Isidro (Calle 9)', of: 'Pascuala Huanca Huerto', tipo_of: 'Devoto', banda: 'Ninguna', cofradia: 1 },
    { id: 23, fecha: '2025-12-27', tipo_dia: 'Tercer Día', tipo_evento: 'Visita', hora: '10:30:00', direccion: 'Jr. San Isidro (Calle 9)', of: 'María Milena Tolentino Ávila y familia', tipo_of: 'Familia', banda: 'Espectacular Banda Juventud San Andrés', cofradia: 1 },
    { id: 24, fecha: '2025-12-27', tipo_dia: 'Tercer Día', tipo_evento: 'Almuerzo', hora: '12:30:00', direccion: 'Jr. San Isidro (Calle 9)', of: 'Juan Celenciano Cárdenas Pérez y familia', tipo_of: 'Familia', banda: 'Ninguna', cofradia: 1 },
    { id: 25, fecha: '2025-12-27', tipo_dia: 'Tercer Día', tipo_evento: 'Visita', hora: '14:30:00', direccion: 'Campo Sintético el Futbolero', of: 'Justo Brancacho Ordoñez y familia', tipo_of: 'Familia', banda: 'Espectacular Banda Juventud San Andrés', cofradia: 1 },
    { id: 26, fecha: '2025-12-27', tipo_dia: 'Tercer Día', tipo_evento: 'Baile y Fiesta', hora: '17:00:00', direccion: 'Local institucional Jr. San Isidro (Calle 9)', of: 'Cofradía', tipo_of: 'Organización', banda: 'Espectacular Banda Juventud San Andrés', cofradia: 1 },
    { id: 27, fecha: '2025-12-27', tipo_dia: 'Tercer Día', tipo_evento: 'Entrega de cambio', hora: '18:00:00', direccion: 'Local institucional Jr. San Isidro (Calle 9)', of: 'Mayordomos salientes', tipo_of: 'Mayordomos', banda: 'Ninguna', cofradia: 1 },
    { id: 28, fecha: '2025-12-27', tipo_dia: 'Tercer Día', tipo_evento: 'Locreada', hora: '19:00:00', direccion: 'Jr. San Isidro (Calle 9)', of: 'Ever Grandez Centurión y familia', tipo_of: 'Familia', banda: 'Ninguna', cofradia: 1 },
    { id: 29, fecha: '2025-12-27', tipo_dia: 'Tercer Día', tipo_evento: 'Gran Despedida', hora: '20:00:00', direccion: 'Local institucional Jr. San Isidro (Calle 9)', of: 'Cofradía', tipo_of: 'Organización', banda: 'Espectacular Banda Juventud San Andrés', cofradia: 1 },
    { id: 30, fecha: '2025-12-27', tipo_dia: 'Tercer Día', tipo_evento: 'Gran Fiesta (Los Malcriados del Perú)', hora: '22:00:00', direccion: 'Local institucional Jr. San Isidro (Calle 9)', of: 'Junta Directiva', tipo_of: 'Organización', banda: 'Grupo: Los Malcriados del Perú', cofradia: 1 }
  ];

  await knex('eventos').insert(eventos.map(e => ({
    id: e.id,
    fecha: e.fecha,
    tipo_dia: e.tipo_dia,
    tipo_evento: e.tipo_evento,
    hora: e.hora,
    direccion_actividad: e.direccion,
    oferente: e.of,
    tipo_oferente: e.tipo_of,
    banda: e.banda,
    cod_cofradia: e.cofradia
  })));
  console.log('✅ Eventos sembrados.');
};