exports.seed = async function (knex) {
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('cofrades').truncate();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  const cofrades = [
    { id: 1, dni: '00000001', nombre: 'Paul Briham Capcha Cárdenas', cargo: 'Presidente', pers: 'Guiador', cofradia: 1 },
    { id: 2, dni: '00000002', nombre: 'María Milena Tolentino Ávila', cargo: 'Vicepresidenta', pers: 'Ninguno', cofradia: 1 },
    { id: 3, dni: '00000003', nombre: 'Helen Melissa Cárdenas', cargo: 'Secretaria', pers: 'Ninguno', cofradia: 1 },
    { id: 4, dni: '00000004', nombre: 'Alejandrina Valdivia de Grandez', cargo: 'Tesorera', pers: 'Ninguno', cofradia: 1 },
    { id: 5, dni: '00000005', nombre: 'Elio Domínguez Cárdenas', cargo: 'Vocal', pers: 'Ninguno', cofradia: 1 },
    { id: 6, dni: '00000006', nombre: 'Oliveriano Cárdenas Pérez', cargo: 'Vocal', pers: 'Ninguno', cofradia: 1 },
    { id: 7, dni: '00000007', nombre: 'Yesmin Almendra Cárdenas Arce', cargo: 'Vocal', pers: 'Ninguno', cofradia: 1 },
    { id: 8, dni: '00000008', nombre: 'Horacio Wilfredo Leandro Pardave', cargo: 'Vocal', pers: 'Corochano', cofradia: 1 },
    { id: 9, dni: '00000009', nombre: 'Zoila Salas Ramírez', cargo: 'Vocal', pers: 'Ninguno', cofradia: 1 },
    { id: 10, dni: '00000010', nombre: 'Jorge Luis Cárdenas Huamán', cargo: 'Integrante', pers: 'Ninguno', cofradia: 1 },
    { id: 11, dni: '00000011', nombre: 'Yakelin Valerio Zevallos', cargo: 'Integrante', pers: 'Ninguno', cofradia: 1 },
    { id: 12, dni: '00000012', nombre: 'Elsa Cárdenas Malpartida', cargo: 'Integrante', pers: 'Ninguno', cofradia: 1 },
    { id: 13, dni: '00000013', nombre: 'Susana Velázquez Codina', cargo: 'Integrante', pers: 'Ninguno', cofradia: 1 },
    { id: 14, dni: '00000014', nombre: 'Yoisy Atencia Crizanto', cargo: 'Integrante', pers: 'Ninguno', cofradia: 1 },
    { id: 15, dni: '00000015', nombre: 'Juan Carlos Minaya Gamarra', cargo: 'Bailante', pers: 'Turco', cofradia: 1 },
    { id: 16, dni: '00000016', nombre: 'Yeferson Jesús Cárdenas Rojas', cargo: 'Bailante', pers: 'Abanderado', cofradia: 1 },
    { id: 17, dni: '00000017', nombre: 'Yajaira Venturo Cárdenas', cargo: 'Socia', pers: 'Cargadora', cofradia: 1 },
    { id: 18, dni: '00000018', nombre: 'Karen Arratea Salvador', cargo: 'Socia', pers: 'Cargadora', cofradia: 1 },
    { id: 19, dni: '00000019', nombre: 'Anaiz Mauricio Villanueva', cargo: 'Socia', pers: 'Cargadora', cofradia: 1 },
    { id: 20, dni: '00000020', nombre: 'Luciana Estefanny Malpartida Rios', cargo: 'Socia', pers: 'Cargadora', cofradia: 1 },
    { id: 21, dni: '00000021', nombre: 'Erik Grandez Centurión', cargo: 'Bailante', pers: 'Caporal', cofradia: 1 },
    { id: 22, dni: '00000022', nombre: 'Romel Stiven Salvador Espíritu', cargo: 'Bailante', pers: 'Guiador', cofradia: 1 },
    { id: 23, dni: '00000023', nombre: 'Kenllyi Kennedy Cárdenas Ramírez', cargo: 'Bailante', pers: 'Pampa', cofradia: 1 },
    { id: 24, dni: '00000024', nombre: 'Alejandro Manuel Mendoza Espinoza', cargo: 'Bailante', pers: 'Pampa', cofradia: 1 },
    { id: 25, dni: '00000025', nombre: 'Andy Julio Salgado Sánchez', cargo: 'Bailante', pers: 'Pampa', cofradia: 1 },
    { id: 26, dni: '00000026', nombre: 'José Luis Patricio Pio', cargo: 'Bailante', pers: 'Pampa', cofradia: 1 },
    { id: 27, dni: '00000027', nombre: 'Hensly Bryan Espíritu Tolentino', cargo: 'Bailante', pers: 'Pampa', cofradia: 1 },
    { id: 28, dni: '00000028', nombre: 'Saulo Cárdenas Espíritu', cargo: 'Bailante', pers: 'Pampa', cofradia: 1 },
    { id: 29, dni: '00000029', nombre: 'Stiven Domínguez Velásquez', cargo: 'Bailante', pers: 'Pampa', cofradia: 1 },
    { id: 30, dni: '00000030', nombre: 'Giancarlos Minchan Ávila', cargo: 'Bailante', pers: 'Pampa', cofradia: 1 },
    { id: 31, dni: '00000031', nombre: 'Alain Suarez Salas', cargo: 'Bailante', pers: 'Pampa', cofradia: 1 },
    { id: 32, dni: '00000032', nombre: 'Dennilson Domínguez Tuanama', cargo: 'Bailante', pers: 'Pampa', cofradia: 1 },
    { id: 33, dni: '00000033', nombre: 'Wilfredo Brancacho Purisaca', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 34, dni: '00000034', nombre: 'Alexi Thalía Espíritu Tolentino', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 35, dni: '00000035', nombre: 'Juan Luis Aliaga Cueva', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 36, dni: '00000036', nombre: 'Nallely Higinio Cecilio', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 37, dni: '00000037', nombre: 'Mell Brillit Santamaria Cárdenas', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 38, dni: '00000038', nombre: 'Mayori Danitza Cotrina Salvador', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 39, dni: '00000039', nombre: 'Luana Jared Reyes Ávila', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 40, dni: '00000040', nombre: 'Henry Deyviz Cárdenas Bravo', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 41, dni: '00000041', nombre: 'Joseph Lincoln Tafur Ávila', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 42, dni: '00000042', nombre: 'Ademir Cárdenas Rivera', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 43, dni: '00000043', nombre: 'Abrahan Robert Cámara Alvarado', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 44, dni: '00000044', nombre: 'Jim Augusto Antonio Mendoza Espinoza', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 45, dni: '00000045', nombre: 'Jack Ventura Espinoza', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 46, dni: '00000046', nombre: 'Ronald Mantilla Angeles', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 47, dni: '00000047', nombre: 'Jairo Alexander Ávila Espíritu', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 48, dni: '00000048', nombre: 'Eduardo Domínguez Ventura', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 49, dni: '00000049', nombre: 'Jhonpio Domínguez Velásquez', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 50, dni: '00000050', nombre: 'Rafael Mattiaz Asca Valerio', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 51, dni: '00000051', nombre: 'Brandon Piero Caldas Ayala', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 52, dni: '00000052', nombre: 'Maykel Erik Grández Valdivia', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 53, dni: '00000053', nombre: 'José Ivan Leandro Córdova', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 },
    { id: 54, dni: '00000054', nombre: 'Dylan Suarez Salas', cargo: 'Bailante', pers: 'Corochano', cofradia: 1 }
  ];

  await knex('cofrades').insert(cofrades.map(c => ({
    id: c.id,
    dni_cofrade: c.dni,
    nombres_apellidos: c.nombre,
    celular: null,
    personaje_cofradia: c.pers,
    cargo_cofrade: c.cargo,
    cod_cofradia: c.cofradia
  })));
  console.log('✅ Cofrades sembrados.');
};