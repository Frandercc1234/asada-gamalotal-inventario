"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TipoMovimiento } from "@/types/database.types";

// El stock se ajusta ÚNICAMENTE a través de esta RPC (transacción atómica
// que valida stock en salidas). Nunca se edita productos.stock_actual a mano.
export async function registrarMovimiento(input: {
  producto_id: number;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string | null;
}): Promise<{ error?: string }> {
  if (!input.producto_id) return { error: "Seleccioná un producto." };
  if (!(input.cantidad > 0)) return { error: "La cantidad debe ser mayor a 0." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("registrar_movimiento", {
    p_producto_id: input.producto_id,
    p_tipo: input.tipo,
    p_cantidad: input.cantidad,
    p_motivo: input.motivo ?? "",
  });

  if (error) return { error: error.message };

  revalidatePath("/movimientos");
  revalidatePath("/productos");
  revalidatePath("/dashboard");
  return {};
}
