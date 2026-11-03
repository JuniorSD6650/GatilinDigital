'use client';

// Exportación de tablas a PDF (jsPDF, sin dependencias extra).
export interface PdfColumna<T> {
  titulo: string;
  /** Ancho relativo de la columna */
  ancho: number;
  valor: (fila: T) => string | number | null | undefined;
}

export async function exportarTablaPDF<T>({
  titulo,
  subtitulo,
  columnas,
  filas,
  archivo,
  horizontal = false,
}: {
  titulo: string;
  subtitulo?: string;
  columnas: PdfColumna<T>[];
  filas: T[];
  archivo: string;
  horizontal?: boolean;
}) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: horizontal ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 12;
  const util = W - M * 2;
  const totalAncho = columnas.reduce((s, c) => s + c.ancho, 0);
  const anchos = columnas.map((c) => (c.ancho / totalAncho) * util);
  const LINEA = 4.2;

  let y = M;
  const encabezado = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setFillColor(242, 193, 78);
    doc.rect(M, y, util, 7, 'F');
    doc.setTextColor(20, 12, 26);
    let x = M;
    columnas.forEach((c, i) => {
      doc.text(c.titulo, x + 1.5, y + 4.8, { maxWidth: anchos[i] - 3 });
      x += anchos[i];
    });
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
  };

  // Título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(titulo, M, y + 5);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text(subtitulo || `Generado el ${new Date().toLocaleString('es-PE')} · Gatilín Digital`, M, y + 3);
  y += 8;
  encabezado();

  doc.setFontSize(8.5);
  filas.forEach((fila, idx) => {
    const celdas = columnas.map((c, i) => doc.splitTextToSize(String(c.valor(fila) ?? ''), anchos[i] - 3) as string[]);
    const alto = Math.max(...celdas.map((l) => l.length)) * LINEA + 2.5;
    if (y + alto > H - M) {
      doc.addPage();
      y = M;
      encabezado();
    }
    if (idx % 2 === 1) {
      doc.setFillColor(246, 243, 249);
      doc.rect(M, y - 0.5, util, alto, 'F');
    }
    let x = M;
    celdas.forEach((lineas, i) => {
      doc.text(lineas, x + 1.5, y + 3.5);
      x += anchos[i];
    });
    y += alto;
  });

  // Numeración de páginas
  const paginas = doc.getNumberOfPages();
  for (let p = 1; p <= paginas; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(`Página ${p} de ${paginas}`, W - M, H - 5, { align: 'right' });
  }

  doc.save(archivo);
}
