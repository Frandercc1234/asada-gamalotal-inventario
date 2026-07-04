import { createClient } from "@/lib/supabase/server";
import { MovimientosClient } from "@/components/admin/movimientos-client";

export default async function MovimientosPage() {
  const supabase = await createClient();

  const [{ data: productos }, { data: movimientos }] = await Promise.all([
    supabase
      .from("productos")
      .select("id, nombre, codigo, unidad, stock_actual")
      .eq("activo", true)
      .order("nombre"),
    supabase
      .from("movimientos")
      .select("*, productos(nombre, codigo), profiles(nombre)")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  return (
    <MovimientosClient
      productos={productos ?? []}
      movimientos={movimientos ?? []}
    />
  );
}
