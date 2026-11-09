import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Truck } from "lucide-react";
import { createClient, getPerfilActual } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/page-header";
import { Button, buttonClasses } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, Badge } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Paginacion } from "@/components/ui/pagination";
import { leerPagina, mensajeErrorDb, paginar } from "@/lib/utils";

async function crearProveedor(formData: FormData) {
  "use server";
  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) return;
  const supabase = await createClient();
  const { error } = await supabase.from("proveedores").insert({
    nombre,
    contacto: String(formData.get("contacto") ?? "").trim() || null,
    telefono: String(formData.get("telefono") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
  });
  if (error) {
    redirect(`/proveedores?error=${encodeURIComponent(mensajeErrorDb(error))}`);
  }
  revalidatePath("/proveedores");
  redirect("/proveedores?ok=proveedor_creado");
}

async function editarProveedor(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("proveedores")
    .update({
      nombre,
      contacto: String(formData.get("contacto") ?? "").trim() || null,
      telefono: String(formData.get("telefono") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
    })
    .eq("id", id);
  if (error) {
    redirect(
      `/proveedores?editar=${id}&error=${encodeURIComponent(mensajeErrorDb(error))}`,
    );
  }
  revalidatePath("/proveedores");
  redirect(`/proveedores?pagina=${leerPagina(String(formData.get("pagina")))}&ok=proveedor_actualizado`);
}

async function toggleProveedor(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const activo = formData.get("activo") === "true";
  const supabase = await createClient();
  const { error } = await supabase
    .from("proveedores")
    .update({ activo: !activo })
    .eq("id", id);
  if (error) {
    redirect(`/proveedores?error=${encodeURIComponent(mensajeErrorDb(error))}`);
  }
  revalidatePath("/proveedores");
  redirect(
    `/proveedores?pagina=${leerPagina(String(formData.get("pagina")))}&ok=${activo ? "proveedor_desactivado" : "proveedor_activado"}`,
  );
}

export default async function ProveedoresPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; pagina?: string; editar?: string }>;
}) {
  const supabase = await createClient();
  const [{ data: proveedores }, perfil, { error: errorParam, pagina: paginaParam, editar }] =
    await Promise.all([
      supabase.from("proveedores").select("*").order("nombre"),
      getPerfilActual(),
      searchParams,
    ]);
  const esAdmin = perfil?.rol === "admin";
  const paginados = paginar(proveedores ?? [], leerPagina(paginaParam));
  const editando = esAdmin
    ? (proveedores ?? []).find((p) => p.id === Number(editar))
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proveedores"
        description="Contactos de proveedores para el reabastecimiento."
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
              Editar proveedor
            </h2>
          )}
          <form
            key={editando?.id ?? "nuevo"}
            action={editando ? editarProveedor : crearProveedor}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
          >
            {editando && (
              <>
                <input type="hidden" name="id" value={editando.id} />
                <input type="hidden" name="pagina" value={paginados.pagina} />
              </>
            )}
            <div>
              <Label htmlFor="prov-nombre">Nombre</Label>
              <Input
                id="prov-nombre"
                name="nombre"
                defaultValue={editando?.nombre}
                required
              />
            </div>
            <div>
              <Label htmlFor="prov-contacto">Contacto</Label>
              <Input
                id="prov-contacto"
                name="contacto"
                defaultValue={editando?.contacto ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="prov-telefono">Teléfono</Label>
              <Input
                id="prov-telefono"
                name="telefono"
                type="tel"
                defaultValue={editando?.telefono ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="prov-email">Email</Label>
              <Input
                id="prov-email"
                name="email"
                type="email"
                defaultValue={editando?.email ?? ""}
              />
            </div>
            <div className="flex gap-2 lg:col-span-4">
              <Button type="submit">{editando ? "Guardar" : "Agregar"}</Button>
              {editando && (
                <Link href="/proveedores" className={buttonClasses("ghost")}>
                  Cancelar
                </Link>
              )}
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        {(proveedores ?? []).length === 0 ? (
          <EmptyState
            icon={Truck}
            title="Sin proveedores"
            description="Agregá el primer proveedor desde el formulario de arriba."
          />
        ) : (
          <Table className="lg:min-w-[640px]">
            <TableHead>
              <tr>
                <Th>Nombre</Th>
                <Th>Contacto</Th>
                <Th>Teléfono</Th>
                <Th>Email</Th>
                <Th>Estado</Th>
                {esAdmin && <Th />}
              </tr>
            </TableHead>
            <TableBody>
              {paginados.items.map((p) => (
                <TableRow key={p.id}>
                  <Td className="max-lg:font-medium">{p.nombre}</Td>
                  <Td label="Contacto" className="text-text-secondary">{p.contacto ?? "—"}</Td>
                  <Td label="Teléfono" className="text-text-secondary">{p.telefono ?? "—"}</Td>
                  <Td label="Email" className="text-text-secondary">{p.email ?? "—"}</Td>
                  <Td label="Estado">
                    <Badge tone={p.activo ? "sky" : "gray"}>
                      {p.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </Td>
                  {esAdmin && (
                    <Td className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/proveedores?editar=${p.id}&pagina=${paginados.pagina}`}
                          className={buttonClasses("secondary", "sm")}
                        >
                          Editar
                        </Link>
                        <form action={toggleProveedor}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="pagina" value={paginados.pagina} />
                          <input
                            type="hidden"
                            name="activo"
                            value={String(p.activo)}
                          />
                          <Button variant="ghost" size="sm" type="submit">
                            {p.activo ? "Desactivar" : "Activar"}
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
        <Paginacion pagina={paginados.pagina} total={(proveedores ?? []).length} ruta="/proveedores" />
      </Card>
    </div>
  );
}
