"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PackageSearch } from "lucide-react";
import {
  crearProducto,
  editarProducto,
  desactivarProducto,
} from "@/app/(admin)/productos/actions";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, Badge } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { formatColones } from "@/lib/utils";
import type { Producto } from "@/types/database.types";

type ProductoRow = Producto & {
  categorias: { nombre: string } | null;
  proveedores: { nombre: string } | null;
};

type Opcion = { id: number; nombre: string };

type FormState = {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria_id: string;
  proveedor_id: string;
  unidad: string;
  stock_minimo: string;
  precio: string;
};

const FORM_VACIO: FormState = {
  codigo: "",
  nombre: "",
  descripcion: "",
  categoria_id: "",
  proveedor_id: "",
  unidad: "unidad",
  stock_minimo: "0",
  precio: "0",
};

export function ProductosClient({
  productos,
  categorias,
  proveedores,
  esAdmin,
}: {
  productos: ProductoRow[];
  categorias: Opcion[];
  proveedores: Opcion[];
  esAdmin: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [error, setError] = useState<string | null>(null);

  const filtrados = productos.filter((p) => {
    const q = busqueda.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q)
    );
  });

  function abrirNuevo() {
    setEditandoId(null);
    setForm(FORM_VACIO);
    setError(null);
    setModalAbierto(true);
  }

  function abrirEdicion(p: ProductoRow) {
    setEditandoId(p.id);
    setForm({
      codigo: p.codigo,
      nombre: p.nombre,
      descripcion: p.descripcion ?? "",
      categoria_id: p.categoria_id?.toString() ?? "",
      proveedor_id: p.proveedor_id?.toString() ?? "",
      unidad: p.unidad,
      stock_minimo: p.stock_minimo.toString(),
      precio: p.precio.toString(),
    });
    setError(null);
    setModalAbierto(true);
  }

  function guardar() {
    setError(null);
    const input = {
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
      proveedor_id: form.proveedor_id ? Number(form.proveedor_id) : null,
      unidad: form.unidad.trim() || "unidad",
      stock_minimo: Number(form.stock_minimo) || 0,
      precio: Number(form.precio) || 0,
    };

    if (!input.codigo || !input.nombre) {
      setError("Código y nombre son obligatorios.");
      return;
    }

    startTransition(async () => {
      const res = editandoId
        ? await editarProducto(editandoId, input)
        : await crearProducto(input);
      if (res.error) {
        setError(res.error);
        return;
      }
      setModalAbierto(false);
      router.refresh();
    });
  }

  function cambiarActivo(p: ProductoRow) {
    startTransition(async () => {
      const res = await desactivarProducto(p.id, !p.activo);
      if (!res.error) router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Catálogo de productos del inventario."
        actions={esAdmin && <Button onClick={abrirNuevo}>Nuevo producto</Button>}
      />

      <Input
        placeholder="Buscar por nombre o código..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="max-w-sm"
      />

      <Card className="overflow-hidden p-0">
        {filtrados.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="Sin productos"
            description={
              busqueda
                ? "No hay productos que coincidan con la búsqueda."
                : "Todavía no hay productos registrados."
            }
          />
        ) : (
          <Table className="min-w-[720px]">
            <TableHead>
              <tr>
                <Th>Código</Th>
                <Th>Nombre</Th>
                <Th>Categoría</Th>
                <Th>Stock</Th>
                <Th>Precio</Th>
                <Th>Estado</Th>
                {esAdmin && <Th />}
              </tr>
            </TableHead>
            <TableBody>
              {filtrados.map((p) => {
                const bajo = p.stock_actual <= p.stock_minimo;
                return (
                  <TableRow key={p.id}>
                    <Td className="font-mono text-xs">{p.codigo}</Td>
                    <Td>{p.nombre}</Td>
                    <Td className="text-text-secondary">
                      {p.categorias?.nombre ?? "—"}
                    </Td>
                    <Td>
                      <Badge tone={bajo ? "red" : "green"}>
                        {p.stock_actual} {p.unidad}
                      </Badge>
                    </Td>
                    <Td numeric>{formatColones(p.precio)}</Td>
                    <Td>
                      <Badge tone={p.activo ? "sky" : "gray"}>
                        {p.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </Td>
                    {esAdmin && (
                      <Td>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => abrirEdicion(p)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={pending}
                            onClick={() => cambiarActivo(p)}
                          >
                            {p.activo ? "Desactivar" : "Activar"}
                          </Button>
                        </div>
                      </Td>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={editandoId ? "Editar producto" : "Nuevo producto"}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label>Código</Label>
            <Input
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            />
          </div>
          <div>
            <Label>Nombre</Label>
            <Input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Descripción</Label>
            <Input
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </div>
          <div>
            <Label>Categoría</Label>
            <Select
              value={form.categoria_id}
              onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
            >
              <option value="">Sin categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Proveedor</Label>
            <Select
              value={form.proveedor_id}
              onChange={(e) => setForm({ ...form, proveedor_id: e.target.value })}
            >
              <option value="">Sin proveedor</option>
              {proveedores.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.nombre}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Unidad</Label>
            <Input
              value={form.unidad}
              onChange={(e) => setForm({ ...form, unidad: e.target.value })}
            />
          </div>
          <div>
            <Label>Stock mínimo</Label>
            <Input
              type="number"
              min="0"
              value={form.stock_minimo}
              onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })}
            />
          </div>
          <div>
            <Label>Precio (₡)</Label>
            <Input
              type="number"
              min="0"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
            />
          </div>
        </div>

        {editandoId && (
          <p className="mt-3 text-xs text-text-secondary">
            El stock actual se ajusta solo desde Movimientos.
          </p>
        )}
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => setModalAbierto(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button onClick={guardar} disabled={pending}>
            {pending ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
