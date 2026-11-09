import { createClient } from "@/lib/supabase/server";
import { ReportesClient, type MovimientoRow } from "@/components/admin/reportes-client";
import { rangoFechas } from "@/lib/utils";

// Supabase limita cada respuesta: los movimientos se piden por lotes
// para que el reporte y las exportaciones incluyan todo el rango.
const LOTE = 1000;

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ reporte?: string; desde?: string; hasta?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const rango = rangoFechas(params.desde, params.hasta);

  const { data: productos } = await supabase
    .from("productos")
    .select("codigo, nombre, unidad, stock_actual, stock_minimo, precio, categorias(nombre)")
    .order("nombre");

  const movimientos: MovimientoRow[] = [];
  for (let desde = 0; ; desde += LOTE) {
    let consulta = supabase
      .from("movimientos")
      .select("created_at, tipo, cantidad, stock_resultante, motivo, productos(nombre, codigo)");
    if (rango.inicio) consulta = consulta.gte("created_at", rango.inicio);
    if (rango.fin) consulta = consulta.lt("created_at", rango.fin);
    const { data } = await consulta
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(desde, desde + LOTE - 1);
    movimientos.push(...(data ?? []));
    if (!data || data.length < LOTE) break;
  }

  return (
    <ReportesClient
      productos={productos ?? []}
      movimientos={movimientos}
      reporteInicial={
        params.reporte === "movimientos" || rango.desde || rango.hasta
          ? "movimientos"
          : "inventario"
      }
      desde={rango.desde}
      hasta={rango.hasta}
    />
  );
}
