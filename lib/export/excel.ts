import * as XLSX from "xlsx";

// Exporta filas (objetos plano) a un .xlsx y dispara la descarga en el browser.
export function exportarExcel(
  filas: Record<string, string | number>[],
  nombreArchivo: string,
  nombreHoja = "Datos",
) {
  const ws = XLSX.utils.json_to_sheet(filas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
  XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
}
