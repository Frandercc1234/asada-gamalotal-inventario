import { createClient } from "@/lib/supabase/server";
import { MovimientosClient } from "@/components/admin/movimientos-client";
import { leerPagina, POR_PAGINA } from "@/lib/utils";

export default async function MovimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  const supabase = await createClient();

  // El total va primero: pedir un rango fuera de la tabla devuelve error.
  const { count } = await supabase
    .from("movimientos")
    .select("id", { count: "exact", head: true });
  const total = count ?? 0;
  const pagina = Math.min(
    leerPagina((await searchParams).pagina),
    Math.max(1, Math.ceil(total / POR_PAGINA)),
  );
  const desde = (pagina - 1) * POR_PAGINA;

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
      .order("id", { ascending: false })
      .range(desde, desde + POR_PAGINA - 1),
  ]);

  return (
    <MovimientosClient
      productos={productos ?? []}
      movimientos={movimientos ?? []}
      pagina={pagina}
      total={total}
    />
  );
}
