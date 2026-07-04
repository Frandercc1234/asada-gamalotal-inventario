import { createClient, getPerfilActual } from "@/lib/supabase/server";
import { ProductosClient } from "@/components/admin/productos-client";

export default async function ProductosPage() {
  const supabase = await createClient();

  const [{ data: productos }, { data: categorias }, { data: proveedores }, perfil] =
    await Promise.all([
      supabase
        .from("productos")
        .select("*, categorias(nombre), proveedores(nombre)")
        .order("nombre"),
      supabase
        .from("categorias")
        .select("id, nombre")
        .eq("activo", true)
        .order("nombre"),
      supabase
        .from("proveedores")
        .select("id, nombre")
        .eq("activo", true)
        .order("nombre"),
      getPerfilActual(),
    ]);

  return (
    <ProductosClient
      productos={productos ?? []}
      categorias={categorias ?? []}
      proveedores={proveedores ?? []}
      esAdmin={perfil?.rol === "admin"}
    />
  );
}
