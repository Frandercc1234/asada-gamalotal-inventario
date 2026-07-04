import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AlertCircle, Tags } from "lucide-react";
import { createClient, getPerfilActual } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, Badge } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { mensajeErrorDb } from "@/lib/utils";

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
  redirect("/categorias");
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
  redirect("/categorias");
}

export default async function CategoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const [{ data: categorias }, perfil, { error: errorParam }] =
    await Promise.all([
      supabase.from("categorias").select("*").order("nombre"),
      getPerfilActual(),
      searchParams,
    ]);
  const esAdmin = perfil?.rol === "admin";

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
          <form
            action={crearCategoria}
            className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <div>
              <Label htmlFor="cat-nombre">Nombre</Label>
              <Input id="cat-nombre" name="nombre" required />
            </div>
            <div>
              <Label htmlFor="cat-descripcion">Descripción</Label>
              <Input id="cat-descripcion" name="descripcion" />
            </div>
            <Button type="submit">Agregar</Button>
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
          <Table className="min-w-[480px]">
            <TableHead>
              <tr>
                <Th>Nombre</Th>
                <Th>Descripción</Th>
                <Th>Estado</Th>
                {esAdmin && <Th />}
              </tr>
            </TableHead>
            <TableBody>
              {(categorias ?? []).map((c) => (
                <TableRow key={c.id}>
                  <Td>{c.nombre}</Td>
                  <Td className="text-text-secondary">
                    {c.descripcion ?? "—"}
                  </Td>
                  <Td>
                    <Badge tone={c.activo ? "sky" : "gray"}>
                      {c.activo ? "Activa" : "Inactiva"}
                    </Badge>
                  </Td>
                  {esAdmin && (
                    <Td className="text-right">
                      <form action={toggleCategoria}>
                        <input type="hidden" name="id" value={c.id} />
                        <input
                          type="hidden"
                          name="activo"
                          value={String(c.activo)}
                        />
                        <Button variant="ghost" size="sm" type="submit">
                          {c.activo ? "Desactivar" : "Activar"}
                        </Button>
                      </form>
                    </Td>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
