import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Tags } from "lucide-react";
import { createClient, getPerfilActual } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/page-header";
import { Button, buttonClasses } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, Badge } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Paginacion } from "@/components/ui/pagination";
import { leerPagina, mensajeErrorDb, paginar } from "@/lib/utils";

async function crearCategoria(formData: FormData) {
  "use server";
  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim() || null;
  if (!nombre) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("categorias")
    .insert({ nombre, descripcion });
  if (error) {
    redirect(`/categorias?error=${encodeURIComponent(mensajeErrorDb(error))}`);
  }
  revalidatePath("/categorias");
  redirect("/categorias?ok=categoria_creada");
}

async function editarCategoria(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim() || null;
  if (!nombre) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("categorias")
    .update({ nombre, descripcion })
    .eq("id", id);
  if (error) {
    redirect(
      `/categorias?editar=${id}&error=${encodeURIComponent(mensajeErrorDb(error))}`,
    );
  }
  revalidatePath("/categorias");
  redirect(`/categorias?pagina=${leerPagina(String(formData.get("pagina")))}&ok=categoria_actualizada`);
}

async function toggleCategoria(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const activo = formData.get("activo") === "true";
  const supabase = await createClient();
  const { error } = await supabase
    .from("categorias")
    .update({ activo: !activo })
    .eq("id", id);
  if (error) {
    redirect(`/categorias?error=${encodeURIComponent(mensajeErrorDb(error))}`);
  }
  revalidatePath("/categorias");
  redirect(
    `/categorias?pagina=${leerPagina(String(formData.get("pagina")))}&ok=${activo ? "categoria_desactivada" : "categoria_activada"}`,
  );
}

export default async function CategoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; pagina?: string; editar?: string }>;
}) {
  const supabase = await createClient();
  const [{ data: categorias }, perfil, { error: errorParam, pagina: paginaParam, editar }] =
    await Promise.all([
      supabase.from("categorias").select("*").order("nombre"),
      getPerfilActual(),
      searchParams,
    ]);
  const esAdmin = perfil?.rol === "admin";
  const paginados = paginar(categorias ?? [], leerPagina(paginaParam));
  const editando = esAdmin
    ? (categorias ?? []).find((c) => c.id === Number(editar))
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorías"
        description="Clasificación de productos del inventario."
      />

      {errorParam && (
        <p className="flex items-center gap-2 rounded-lg bg-danger-bg px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorParam}
        </p>
      )}

      {esAdmin && (
        <Card>
          {editando && (
            <h2 className="mb-3 font-semibold tracking-tight text-text-primary">
              Editar categoría
            </h2>
          )}
          <form
            key={editando?.id ?? "nueva"}
            action={editando ? editarCategoria : crearCategoria}
            className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            {editando && (
              <>
                <input type="hidden" name="id" value={editando.id} />
                <input type="hidden" name="pagina" value={paginados.pagina} />
              </>
            )}
            <div>
              <Label htmlFor="cat-nombre">Nombre</Label>
              <Input
                id="cat-nombre"
                name="nombre"
                defaultValue={editando?.nombre}
                required
              />
            </div>
            <div>
              <Label htmlFor="cat-descripcion">Descripción</Label>
              <Input
                id="cat-descripcion"
                name="descripcion"
                defaultValue={editando?.descripcion ?? ""}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editando ? "Guardar" : "Agregar"}</Button>
              {editando && (
                <Link href="/categorias" className={buttonClasses("ghost")}>
                  Cancelar
                </Link>
              )}
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        {(categorias ?? []).length === 0 ? (
          <EmptyState
            icon={Tags}
            title="Sin categorías"
            description="Agregá la primera categoría desde el formulario de arriba."
          />
        ) : (
          <Table className="lg:min-w-[480px]">
            <TableHead>
              <tr>
                <Th>Nombre</Th>
                <Th>Descripción</Th>
                <Th>Estado</Th>
                {esAdmin && <Th />}
              </tr>
            </TableHead>
            <TableBody>
              {paginados.items.map((c) => (
                <TableRow key={c.id}>
                  <Td className="max-lg:font-medium">{c.nombre}</Td>
                  <Td className="text-text-secondary">
                    {c.descripcion ?? "—"}
                  </Td>
                  <Td label="Estado">
                    <Badge tone={c.activo ? "sky" : "gray"}>
                      {c.activo ? "Activa" : "Inactiva"}
                    </Badge>
                  </Td>
                  {esAdmin && (
                    <Td className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/categorias?editar=${c.id}&pagina=${paginados.pagina}`}
                          className={buttonClasses("secondary", "sm")}
                        >
                          Editar
                        </Link>
                        <form action={toggleCategoria}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="pagina" value={paginados.pagina} />
                          <input
                            type="hidden"
                            name="activo"
                            value={String(c.activo)}
                          />
                          <Button variant="ghost" size="sm" type="submit">
                            {c.activo ? "Desactivar" : "Activar"}
                          </Button>
                        </form>
                      </div>
                    </Td>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Paginacion pagina={paginados.pagina} total={(categorias ?? []).length} ruta="/categorias" />
      </Card>
    </div>
  );
}
