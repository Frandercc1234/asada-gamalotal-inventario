"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { mensajeErrorDb } from "@/lib/utils";

// stock_actual NUNCA se toca acá: solo se ajusta por movimientos (RPC).
type ProductoInput = {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoria_id: number | null;
  proveedor_id: number | null;
  unidad: string;
  stock_minimo: number;
  precio: number;
};

function validar(input: ProductoInput): string | null {
  if (!input.codigo.trim() || !input.nombre.trim())
    return "Código y nombre son obligatorios.";
  if (!Number.isFinite(input.stock_minimo) || input.stock_minimo < 0)
    return "El stock mínimo no puede ser negativo.";
  if (!Number.isFinite(input.precio) || input.precio < 0)
    return "El precio no puede ser negativo.";
  return null;
}

export async function crearProducto(
  input: ProductoInput,
): Promise<{ error?: string }> {
  const invalido = validar(input);
  if (invalido) return { error: invalido };

  const supabase = await createClient();
  const { error } = await supabase.from("productos").insert(input);
  if (error) return { error: mensajeErrorDb(error) };
  revalidatePath("/productos");
  return {};
}

export async function editarProducto(
  id: number,
  input: ProductoInput,
): Promise<{ error?: string }> {
  const invalido = validar(input);
  if (invalido) return { error: invalido };

  const supabase = await createClient();
  const { error } = await supabase.from("productos").update(input).eq("id", id);
  if (error) return { error: mensajeErrorDb(error) };
  revalidatePath("/productos");
  return {};
}

export async function desactivarProducto(
  id: number,
  activo: boolean,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("productos")
    .update({ activo })
    .eq("id", id);
  if (error) return { error: mensajeErrorDb(error) };
  revalidatePath("/productos");
  return {};
}
