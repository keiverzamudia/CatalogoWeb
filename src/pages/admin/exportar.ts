/* ============================================================================
   EXPORTACION A PDF Y EXCEL (solo en /admin)
   Los dos paquetes se cargan con `import()` bajo demanda: el visitante del QR
   y el propio admin nunca descargan estos ~400 KB salvo que pulse el boton.
   ========================================================================== */

export interface Columna<T> {
  titulo: string;
  /** Ancho de columna en Excel (caracteres aproximados). */
  ancho: number;
  valor: (fila: T) => string;
}

function descargar(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** jsPDF usa WinAnsi: fuera de Latin-1 hay que normalizar o sale un glifo raro. */
function pdfSeguro(s: string): string {
  return s
    .replace(/[•·]/g, '-')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[“”«»]/g, '"')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ');
}

export async function exportarExcel<T>(
  nombre: string,
  columnas: Columna<T>[],
  filas: T[],
): Promise<void> {
  // El paquete NO exporta la raiz: hay que pedir la entrada de navegador.
  const writeXlsxFile = (await import('write-excel-file/browser')).default;
  const blob = await writeXlsxFile(filas, {
    columns: columnas.map((c) => ({
      header: c.titulo,
      width: c.ancho,
      cell: (fila: T) => ({ value: c.valor(fila) }),
    })),
  }).toBlob();
  descargar(blob, nombre);
}

export async function exportarPdf<T>(
  titulo: string,
  subtitulo: string,
  columnas: Columna<T>[],
  filas: T[],
  nombre: string,
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const apaisado = columnas.length > 4;
  const doc = new jsPDF({
    orientation: apaisado ? 'landscape' : 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const ancho = doc.internal.pageSize.getWidth();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(0, 51, 102);
  doc.text(pdfSeguro(titulo), 40, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(pdfSeguro(subtitulo), 40, 58);
  doc.text(
    pdfSeguro(`Generado: ${new Date().toLocaleString('es-VE')}`),
    40,
    72,
  );

  autoTable(doc, {
    startY: 88,
    head: [columnas.map((c) => pdfSeguro(c.titulo))],
    body: filas.map((f) => columnas.map((c) => pdfSeguro(c.valor(f)))),
    styles: { fontSize: 8, cellPadding: 5, overflow: 'linebreak' },
    headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    margin: { left: 40, right: 40, top: 88 },
    didDrawPage: () => {
      const alto = doc.internal.pageSize.getHeight();
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('Grupo San Luis · panel interno · no es un documento fiscal', 40, alto - 18);
      const pag = `Página ${doc.getNumberOfPages()}`;
      doc.text(pag, ancho - 40, alto - 18, { align: 'right' });
    },
  });

  doc.save(nombre);
}
