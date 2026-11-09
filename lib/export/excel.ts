// Exporta filas (objetos plano) a un .xlsx y dispara la descarga en el browser.
export async function exportarExcel(
  filas: Record<string, string | number>[],
  nombreArchivo: string,
  nombreHoja = "Datos",
) {
  // Import dinámico: exceljs es pesado y solo se usa al exportar.
  const { Workbook } = await import("exceljs");
  const wb = new Workbook();
  const ws = wb.addWorksheet(nombreHoja);
  const columnas = Object.keys(filas[0] ?? {});
  ws.addRow(columnas);
  filas.forEach((fila) => ws.addRow(columnas.map((c) => fila[c])));

  const buffer = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer]));
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `${nombreArchivo}.xlsx`;
  enlace.click();
  URL.revokeObjectURL(url);
}
