/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpiamos la tabla usuarios
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('usuarios').truncate();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  console.log('🌱 Sembrando Usuarios...');

  const usuarios = [
    { id: 1, username: 'CorazonAmarilis', password: 'N3eYWx5zne', role: 'localizador', cofradia_id: 1 },
    { id: 2, username: 'ReyReyesJuanaMoreno', password: 'N3eYWx5zne', role: 'localizador', cofradia_id: 2 },
    { id: 3, username: 'VirgenNieves', password: 'HBG6K7BRRR', role: 'localizador', cofradia_id: 3 },
    { id: 4, username: 'TodasSangresSeñorHuallaga', password: '4mb5xCDEsm', role: 'localizador', cofradia_id: 4 },
    { id: 5, username: 'ReyPatronAmarilis', password: 'ql2fWRUjGJ', role: 'localizador', cofradia_id: 5 },
    { id: 6, username: 'CaballerosLeon', password: 'iIE2dDTRvs', role: 'localizador', cofradia_id: 6 },
    { id: 7, username: 'DivinoRedentorZonaCero', password: 'LGWNpqqArt', role: 'localizador', cofradia_id: 7 },
    { id: 8, username: 'AsoCulturalFolklorica', password: 'GFfYq3ZYPh', role: 'localizador', cofradia_id: 8 },
    { id: 9, username: 'CorazonSanLuis', password: 'K8SG9WK5NQ', role: 'localizador', cofradia_id: 9 },
    { id: 10, username: 'AmistadSector1', password: 'u9LZ2TNDHK', role: 'localizador', cofradia_id: 10 },
    { id: 11, username: 'Paucarbambilla', password: '56rwFWASJ5', role: 'localizador', cofradia_id: 11 },
    { id: 12, username: 'CruzHuallaga', password: 'tx4Lo3rvl6', role: 'localizador', cofradia_id: 12 },
    { id: 13, username: 'NinoJesusIngeniero', password: 'N3eYWx5zne', role: 'localizador', cofradia_id: 13 },
    { id: 14, username: 'NazaretZonaCero', password: 'CHa4Or5FxI', role: 'localizador', cofradia_id: 14 },
    { id: 15, username: 'SantaRosaAmarilis', password: 'jDQBkf8WB0', role: 'localizador', cofradia_id: 15 },
    { id: 16, username: 'SanLuisSector2', password: 'bah7pdpAsN', role: 'localizador', cofradia_id: 16 },
    { id: 17, username: 'NuevaGeneracion', password: 'jSBhiK2zy1', role: 'localizador', cofradia_id: 17 },
    { id: 18, username: 'BarrioColones', password: 'Xg563Tn1kw', role: 'localizador', cofradia_id: 18 },
    { id: 19, username: 'PrincipitoSanLuis', password: 'LCBstZPbBX', role: 'localizador', cofradia_id: 19 },
    { id: 20, username: 'SanJose', password: 'oNGFuLqjEw', role: 'localizador', cofradia_id: 20 },
    { id: 21, username: 'HuallaycoSur', password: '4R1OR1DCHT', role: 'localizador', cofradia_id: 21 },
    { id: 22, username: 'CofradiaReyReyesJr', password: 'aQfRSwdchf', role: 'localizador', cofradia_id: 22 },
    { id: 23, username: 'CuadrillaSagradaFamilia', password: 'V5IH7JUpU7', role: 'localizador', cofradia_id: 23 },
    { id: 24, username: 'CofradiaAlfonsoUgarte', password: '70Y0zAQwUA', role: 'localizador', cofradia_id: 24 },
    { id: 25, username: 'AmistadRealPinzas', password: '8chB8GjiSG', role: 'localizador', cofradia_id: 25 },
    { id: 26, username: 'JesusSusAmigos', password: '84bbTm8B0f', role: 'localizador', cofradia_id: 26 },
    { id: 27, username: 'Copacabana', password: 'OrPLRcGNpt', role: 'localizador', cofradia_id: 27 },
    { id: 28, username: 'CofradiaTarma', password: 'MAWwuqhDc8', role: 'localizador', cofradia_id: 28 },
    { id: 29, username: 'DoctorcitoSagrarioMerced', password: 'vdEKEHDNKq', role: 'localizador', cofradia_id: 29 },
    { id: 30, username: 'CesarGuerra', password: 'RLcmEvpaMg', role: 'localizador', cofradia_id: 30 },
    { id: 31, username: 'BarrioPuelles', password: 'rhCvvTHctQ', role: 'localizador', cofradia_id: 31 },
    { id: 32, username: 'ReyReyesAgustin', password: 'zoc4NbpKZ2', role: 'localizador', cofradia_id: 32 },
    { id: 33, username: 'MariaFatima', password: 'WewfLo1DQm', role: 'localizador', cofradia_id: 33 },
    { id: 34, username: 'DivinoMaytaCapac', password: 'N3eYWx5zne', role: 'localizador', cofradia_id: 34 },
    { id: 35, username: 'CofradiaExtra', password: 'N3eYWx5zne', role: 'localizador', cofradia_id: 35 },
  ];

  await knex('usuarios').insert(usuarios.map(u => ({
    id: u.id,
    username: u.username,
    password: u.password,
    role: u.role,
    created_at: new Date(), 
    cofradia_id: u.cofradia_id
  })));

  console.log('✅ Usuarios sembrados.');
};