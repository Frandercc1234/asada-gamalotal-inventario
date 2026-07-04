import { createClient } from "@/lib/supabase/server";
import { ReportesClient } from "@/components/admin/reportes-client";

export default async function ReportesPage() {
  const supabase = await createClient();

  const [{ data: productos }, { data: movimientos }] = await Promise.all([
    supabase
      .from("productos")
      .select("codigo, nombre, unidad, stock_actual, stock_minimo, precio, categorias(nombre)")
      .order("nombre"),
    supabase
      .from("movimientos")
      .select("created_at, tipo, cantidad, stock_resultante, motivo, productos(nombre, codigo)")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  return (
    <ReportesClient
      productos={productos ?? []}
      movimientos={movimientos ?? []}
    />
  );
}
