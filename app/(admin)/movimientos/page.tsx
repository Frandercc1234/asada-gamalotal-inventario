import { createClient, getPerfilActual } from "@/lib/supabase/server";
import { MovimientosClient } from "@/components/admin/movimientos-client";
import { leerPagina, POR_PAGINA, rangoFechas } from "@/lib/utils";

export default async function MovimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string; desde?: string; hasta?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const rango = rangoFechas(params.desde, params.hasta);

  // El total va primero: pedir un rango fuera de la tabla devuelve error.
  let conteo = supabase
    .from("movimientos")
    .select("id", { count: "exact", head: true });
  if (rango.inicio) conteo = conteo.gte("created_at", rango.inicio);
  if (rango.fin) conteo = conteo.lt("created_at", rango.fin);
  const { count } = await conteo;

  const total = count ?? 0;
  const pagina = Math.min(
    leerPagina(params.pagina),
    Math.max(1, Math.ceil(total / POR_PAGINA)),
  );
  const desde = (pagina - 1) * POR_PAGINA;

  let consulta = supabase
    .from("movimientos")
    .select("*, productos(nombre, codigo), profiles(nombre)");
  if (rango.inicio) consulta = consulta.gte("created_at", rango.inicio);
  if (rango.fin) consulta = consulta.lt("created_at", rango.fin);

  const [{ data: productos }, { data: movimientos }, perfil] = await Promise.all([
    supabase
      .from("productos")
      .select("id, nombre, codigo, unidad, stock_actual")
      .eq("activo", true)
      .order("nombre"),
    consulta
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(desde, desde + POR_PAGINA - 1),
    getPerfilActual(),
  ]);

  const { data: anulaciones } = await supabase
    .from("movimientos")
    .select("anula_a")
    .in("anula_a", (movimientos ?? []).map((m) => m.id));

  return (
    <MovimientosClient
      productos={productos ?? []}
      movimientos={movimientos ?? []}
      anulados={(anulaciones ?? []).flatMap((a) => a.anula_a ?? [])}
      esAdmin={perfil?.rol === "admin"}
      pagina={pagina}
      total={total}
      desde={rango.desde}
      hasta={rango.hasta}
    />
  );
}
