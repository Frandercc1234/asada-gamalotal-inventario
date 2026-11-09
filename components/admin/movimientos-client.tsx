"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import { anularMovimiento, registrarMovimiento } from "@/app/(admin)/movimientos/actions";
import { FiltroFechas } from "@/components/admin/filtro-fechas";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, Badge } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Paginacion } from "@/components/ui/pagination";
import { formatFecha } from "@/lib/utils";
import { avisoError, avisoExito, pedirMotivoAnulacion } from "@/lib/alertas";
import type { Movimiento, TipoMovimiento } from "@/types/database.types";

type ProductoOpcion = {
  id: number;
  nombre: string;
  codigo: string;
  unidad: string;
  stock_actual: number;
};

type MovimientoRow = Movimiento & {
  productos: { nombre: string; codigo: string } | null;
  profiles: { nombre: string } | null;
};

export function MovimientosClient({
  productos,
  movimientos,
  anulados,
  esAdmin,
  pagina,
  total,
  desde,
  hasta,
}: {
  productos: ProductoOpcion[];
  movimientos: MovimientoRow[];
  anulados: number[];
  esAdmin: boolean;
  pagina: number;
  total: number;
  desde: string;
  hasta: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [productoId, setProductoId] = useState("");
  const [tipo, setTipo] = useState<TipoMovimiento>("entrada");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const seleccionado = productos.find((p) => p.id === Number(productoId));

  const filtros = new URLSearchParams({
    ...(desde && { desde }),
    ...(hasta && { hasta }),
  }).toString();

  async function anular(m: MovimientoRow) {
    const motivo = await pedirMotivoAnulacion(
      `${m.tipo} de ${m.cantidad} · ${m.productos?.nombre ?? "producto"}. Se registrará el movimiento contrario.`,
    );
    if (!motivo) return;
    startTransition(async () => {
      const res = await anularMovimiento(m.id, motivo);
      if (res.error) {
        avisoError(res.error);
        return;
      }
      avisoExito("Movimiento anulado");
      router.refresh();
    });
  }

  function enviar() {
    setError(null);
    startTransition(async () => {
      const res = await registrarMovimiento({
        producto_id: Number(productoId),
        tipo,
        cantidad: Number(cantidad),
        motivo: motivo.trim() || null,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      setCantidad("");
      setMotivo("");
      avisoExito(tipo === "entrada" ? "Entrada registrada" : "Salida registrada");
      // El movimiento nuevo aparece primero: se vuelve a la página 1.
      if (pagina > 1) router.push("/movimientos");
      else router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Movimientos" description="Entradas y salidas de inventario." />

      <Card>
        <h2 className="mb-4 font-semibold tracking-tight text-text-primary">
          Registrar movimiento
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Label>Producto</Label>
            <Select
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
            >
              <option value="">Seleccionar...</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.codigo}) — {p.stock_actual} {p.unidad}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Tipo</Label>
            <Select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoMovimiento)}
            >
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
            </Select>
          </div>
          <div>
            <Label>Cantidad</Label>
            <Input
              type="number"
              min="0"
              step="any"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <Label>Motivo (opcional)</Label>
            <Input
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: compra, uso en reparación..."
            />
          </div>
        </div>

        {seleccionado && tipo === "salida" && (
          <p className="mt-3 text-xs text-text-secondary">
            Stock disponible: {seleccionado.stock_actual} {seleccionado.unidad}
          </p>
        )}
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        <div className="mt-4">
          <Button onClick={enviar} disabled={pending}>
            {pending ? "Registrando..." : "Registrar"}
          </Button>
        </div>
      </Card>

      <FiltroFechas ruta="/movimientos" desde={desde} hasta={hasta} />

      <Card className="overflow-hidden p-0">
        {movimientos.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="Sin movimientos"
            description={
              desde || hasta
                ? "No hay movimientos en ese rango de fechas."
                : "Todavía no se ha registrado ningún movimiento."
            }
          />
        ) : (
          <Table className="lg:min-w-[820px]">
            <TableHead>
              <tr>
                <Th>Fecha</Th>
                <Th>Producto</Th>
                <Th>Tipo</Th>
                <Th>Cantidad</Th>
                <Th>Stock resultante</Th>
                <Th>Usuario</Th>
                <Th>Motivo</Th>
                {esAdmin && <Th />}
              </tr>
            </TableHead>
            <TableBody>
              {movimientos.map((m) => (
                <TableRow key={m.id}>
                  <Td className="whitespace-nowrap text-text-secondary">
                    {formatFecha(m.created_at)}
                  </Td>
                  <Td className="max-lg:font-medium">{m.productos?.nombre ?? "—"}</Td>
                  <Td label="Tipo">
                    <span className="inline-flex flex-wrap gap-1">
                      <Badge tone={m.tipo === "entrada" ? "green" : "amber"}>
                        {m.tipo}
                      </Badge>
                      {m.anula_a && <Badge tone="gray">anulación</Badge>}
                      {anulados.includes(m.id) && <Badge tone="red">anulado</Badge>}
                    </span>
                  </Td>
                  <Td label="Cantidad" numeric>{m.cantidad}</Td>
                  <Td label="Stock resultante" numeric>{m.stock_resultante}</Td>
                  <Td label="Usuario" className="text-text-secondary">
                    {m.profiles?.nombre ?? "—"}
                  </Td>
                  <Td label="Motivo" className="text-text-secondary">{m.motivo ?? "—"}</Td>
                  {esAdmin && (
                    <Td className="text-right">
                      {!m.anula_a && !anulados.includes(m.id) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={pending}
                          onClick={() => anular(m)}
                        >
                          Anular
                        </Button>
                      )}
                    </Td>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Paginacion pagina={pagina} total={total} ruta={filtros ? `/movimientos?${filtros}` : "/movimientos"} />
      </Card>
    </div>
  );
}
