// Utilidades de Excel compartidas: plantillas, exportación y carga masiva
// con vista previa (dry run) y errores por fila.
const ExcelJS = require('exceljs');
const knex = require('./db');
const { audit } = require('./audit');
const { badRequest, fail } = require('./http');

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

// Convierte el valor de una celda (texto enriquecido, hipervínculo, fórmula...) a un valor plano
const cellValue = (v) => {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'object') {
    if (Array.isArray(v.richText)) return v.richText.map((t) => t.text).join('');
    if ('result' in v) return cellValue(v.result);
    if ('text' in v) return cellValue(v.text);
    if ('hyperlink' in v) return v.hyperlink;
    return null;
  }
  if (typeof v === 'string') {
    const s = v.trim();
    return s === '' ? null : s;
  }
  return v;
};

const workbookConHoja = (nombreHoja, columns) => {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet(nombreHoja);
  ws.columns = columns.map(({ header, key, width }) => ({ header, key, width: width || 20 }));
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4E3B1' } };
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  return { workbook, ws };
};

const enviarWorkbook = async (res, workbook, filename) => {
  res.setHeader('Content-Type', XLSX_TYPE);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
};

/** Descarga una plantilla con una fila de ejemplo opcional */
const sendTemplate = async (res, { nombreHoja, filename, columns, ejemplo }) => {
  const { workbook, ws } = workbookConHoja(nombreHoja, columns);
  if (ejemplo) {
    const row = ws.addRow(ejemplo);
    row.font = { italic: true, color: { argb: 'FF888888' } };
  }
  await enviarWorkbook(res, workbook, filename);
};

/** Exporta filas a .xlsx */
const sendXlsx = async (res, { nombreHoja, filename, columns, rows }) => {
  const { workbook, ws } = workbookConHoja(nombreHoja, columns);
  rows.forEach((r) => ws.addRow(r));
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
  await enviarWorkbook(res, workbook, filename);
};

const mensajeDb = (err) => {
  if (err.code === 'ER_DUP_ENTRY') return 'Registro duplicado (ya existe).';
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') return 'Hace referencia a un registro que no existe (revisa el código de cofradía).';
  if (err.code === 'ER_DATA_TOO_LONG') return 'Algún texto es demasiado largo.';
  return 'No se pudo guardar la fila.';
};

/**
 * Carga masiva desde Excel.
 *  - ?dryRun=1 → solo valida y devuelve vista previa + errores por fila, sin guardar.
 *  - sin dryRun → inserta las filas válidas y devuelve el resumen con errores por fila.
 *
 * @param {object} opts
 * @param {string} opts.entidad        nombre para la bitácora
 * @param {{key:string}[]} opts.columns columnas en el orden del Excel
 * @param {import('zod').ZodType} opts.schema esquema de validación de cada fila
 * @param {(rec:object, trx:any)=>Promise<void>} opts.insert inserta un registro validado
 * @param {(rec:object)=>Promise<string|null>} [opts.check] validación extra (p. ej. existencia de FK)
 */
const bulkImport = async (req, res, { entidad, columns, schema, insert, check }) => {
  if (!req.file?.buffer) return badRequest(res, 'Debes adjuntar un archivo Excel (.xlsx).');
  const dryRun = req.query.dryRun === '1' || req.query.dryRun === 'true';

  let ws;
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    ws = workbook.worksheets[0];
  } catch (err) {
    return badRequest(res, 'No se pudo leer el archivo. Asegúrate de usar la plantilla en formato .xlsx.');
  }
  if (!ws) return badRequest(res, 'El archivo no tiene hojas.');
  if (ws.rowCount > 5001) return badRequest(res, 'El archivo tiene demasiadas filas (máximo 5000).');

  try {
    const validos = [];
    const errores = [];
    let total = 0;

    for (let i = 2; i <= ws.rowCount; i++) {
      const row = ws.getRow(i);
      const raw = {};
      columns.forEach((c, idx) => {
        raw[c.key] = cellValue(row.getCell(idx + 1).value);
      });
      if (Object.values(raw).every((v) => v === null)) continue; // fila vacía
      total++;

      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        errores.push({
          fila: i,
          errores: parsed.error.issues.map((iss) => `${iss.path.join('.') || 'fila'}: ${iss.message}`),
          datos: raw,
        });
        continue;
      }
      const extra = check ? await check(parsed.data) : null;
      if (extra) {
        errores.push({ fila: i, errores: [extra], datos: raw });
        continue;
      }
      validos.push({ fila: i, datos: parsed.data });
    }

    if (dryRun) {
      return res.json({
        dryRun: true,
        total,
        validos: validos.length,
        invalidos: errores.length,
        preview: validos.slice(0, 50).map((v) => ({ fila: v.fila, ...v.datos })),
        errores: errores.slice(0, 200),
      });
    }

    let insertados = 0;
    for (const v of validos) {
      try {
        await insert(v.datos, knex);
        insertados++;
      } catch (err) {
        errores.push({ fila: v.fila, errores: [mensajeDb(err)], datos: v.datos });
      }
    }
    errores.sort((a, b) => a.fila - b.fila);

    await audit(req, 'carga_masiva', entidad, null, { total, insertados, fallidos: errores.length });

    res.json({
      message: insertados === total ? 'Datos cargados correctamente.' : `Se cargaron ${insertados} de ${total} filas.`,
      total,
      insertados,
      fallidos: errores.length,
      errores: errores.slice(0, 200),
    });
  } catch (err) {
    return fail(res, err, 'Error al procesar el archivo');
  }
};

module.exports = { sendTemplate, sendXlsx, bulkImport, cellValue };
