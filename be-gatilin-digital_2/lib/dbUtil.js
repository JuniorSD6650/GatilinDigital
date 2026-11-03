// Utilidades específicas de PostgreSQL.

// Códigos de error de PostgreSQL (SQLSTATE)
const esDuplicado = (err) => err?.code === '23505'; // unique_violation
const esReferenciaInvalida = (err) => err?.code === '23503'; // foreign_key_violation
const esTextoMuyLargo = (err) => err?.code === '22001'; // string_data_right_truncation

/** Vacía tablas, reinicia sus contadores de id y arrastra las filas dependientes (CASCADE). */
const vaciarTablas = (knex, tablas) =>
  knex.raw(`TRUNCATE TABLE ${tablas.map(() => '??').join(', ')} RESTART IDENTITY CASCADE`, tablas);

/**
 * Tras insertar filas con id explícito, el contador (secuencia) del id no avanza
 * en PostgreSQL: se ajusta al máximo actual para que los próximos inserts no choquen.
 */
const ajustarSecuencia = (knex, tabla, columna = 'id') =>
  knex.raw(
    `SELECT setval(pg_get_serial_sequence(?, ?), COALESCE((SELECT MAX(??) FROM ??), 0) + 1, false)`,
    [tabla, columna, columna, tabla]
  );

/** Inserta y devuelve el id generado. */
const insertarId = async (query) => {
  const [fila] = await query.returning('id');
  return fila?.id ?? fila;
};

module.exports = { esDuplicado, esReferenciaInvalida, esTextoMuyLargo, vaciarTablas, ajustarSecuencia, insertarId };
