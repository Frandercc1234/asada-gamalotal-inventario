import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Genera un PDF con título, fecha y una tabla; dispara la descarga en el browser.
export function exportarPDF(
  titulo: string,
  columnas: string[],
  filas: (string | number)[][],
  nombreArchivo: string,
) {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text(titulo, 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generado: ${new Date().toLocaleString("es-CR")}`, 14, 22);

  autoTable(doc, {
    head: [columnas],
    body: filas,
    startY: 28,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [2, 132, 199] },
  });

  doc.save(`${nombreArchivo}.pdf`);
}
