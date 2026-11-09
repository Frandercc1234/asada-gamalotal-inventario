"use client";

import { useState } from "react";
import { FileBarChart } from "lucide-react";
import { FiltroFechas } from "@/components/admin/filtro-fechas";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Select, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { exportarPDF } from "@/lib/export/pdf";
import { exportarExcel } from "@/lib/export/excel";
import { Paginacion } from "@/components/ui/pagination";
import { formatColones, formatFecha, paginar } from "@/lib/utils";

type ProductoRow = {
  codigo: string;
  nombre: string;
  unidad: string;
  stock_actual: number;
  stock_minimo: number;
  precio: number;
  categorias: { nombre: string } | null;
};

export type MovimientoRow = {
  created_at: string;
  tipo: string;
  cantidad: number;
  stock_resultante: number;
  motivo: string | null;
  productos: { nombre: string; codigo: string } | null;
};

type Reporte = "inventario" | "movimientos";

export function ReportesClient({
  productos,
  movimientos,
  reporteInicial,
  desde,
  hasta,
}: {
  productos: ProductoRow[];
  movimientos: MovimientoRow[];
  reporteInicial: Reporte;
  desde: string;
  hasta: string;
}) {
  const [reporte, setReporte] = useState<Reporte>(reporteInicial);
  const [pagina, setPagina] = useState(1);

  const columnasInv = [
    "Código",
    "Producto",
    "Categoría",
    "Stock",
    "Mínimo",
    "Precio",
  ];
  const filasInv = productos.map((p) => [
    p.codigo,
    p.nombre,
    p.categorias?.nombre ?? "—",
    `${p.stock_actual} ${p.unidad}`,
    String(p.stock_minimo),
    formatColones(p.precio),
  ]);

  const columnasMov = [
    "Fecha",
    "Producto",
    "Tipo",
    "Cantidad",
    "Stock resultante",
    "Motivo",
  ];
  const filasMov = movimientos.map((m) => [
    formatFecha(m.created_at),
    m.productos?.nombre ?? "—",
    m.tipo,
    String(m.cantidad),
    String(m.stock_resultante),
    m.motivo ?? "—",
  ]);

  const esInv = reporte === "inventario";
  const rangoTexto = desde || hasta ? ` (${desde || "inicio"} a ${hasta || "hoy"})` : "";
  const titulo = esInv ? "Reporte de inventario" : `Reporte de movimientos${rangoTexto}`;
  const columnas = esInv ? columnasInv : columnasMov;
  const filas = esInv ? filasInv : filasMov;
  const archivo = esInv ? "inventario" : "movimientos";
  // La tabla se pagina; las exportaciones siguen usando todas las filas.
  const paginados = paginar(filas, pagina);

  function descargarPDF() {
    exportarPDF(titulo, columnas, filas, archivo);
  }

  async function descargarExcel() {
    const objetos = filas.map((fila) =>
      Object.fromEntries(columnas.map((c, i) => [c, fila[i]])),
    );
    await exportarExcel(objetos, archivo, esInv ? "Inventario" : "Movimientos");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Exportá el estado del inventario o el historial de movimientos."
      />

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label>Reporte</Label>
            <Select
              value={reporte}
              onChange={(e) => {
                setReporte(e.target.value as Reporte);
                setPagina(1);
              }}
              className="w-56"
            >
              <option value="inventario">Inventario actual</option>
              <option value="movimientos">Historial de movimientos</option>
            </Select>
          </div>
          <Button variant="secondary" onClick={descargarPDF}>
            Exportar PDF
          </Button>
          <Button variant="secondary" onClick={descargarExcel}>
            Exportar Excel
          </Button>
        </div>
      </Card>

      {!esInv && (
        <FiltroFechas
          ruta="/reportes"
          desde={desde}
          hasta={hasta}
          ocultos={{ reporte: "movimientos" }}
        />
      )}

      <Card className="overflow-hidden p-0">
        {filas.length === 0 ? (
          <EmptyState
            icon={FileBarChart}
            title="Sin datos"
            description="No hay información para este reporte todavía."
          />
        ) : (
          <Table className="lg:min-w-[640px]">
            <TableHead>
              <tr>
                {columnas.map((c) => (
                  <Th key={c}>{c}</Th>
                ))}
              </tr>
            </TableHead>
            <TableBody>
              {paginados.items.map((fila, i) => (
                <TableRow key={i}>
                  {fila.map((celda, j) => (
                    <Td key={j} label={columnas[j]}>{celda}</Td>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Paginacion pagina={paginados.pagina} total={filas.length} onCambiar={setPagina} />
      </Card>
    </div>
  );
}
