import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AlertCircle, Truck } from "lucide-react";
import { createClient, getPerfilActual } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, Badge } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { mensajeErrorDb } from "@/lib/utils";

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
  redirect("/proveedores");
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
  redirect("/proveedores");
}

export default async function ProveedoresPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const [{ data: proveedores }, perfil, { error: errorParam }] =
    await Promise.all([
      supabase.from("proveedores").select("*").order("nombre"),
      getPerfilActual(),
      searchParams,
    ]);
  const esAdmin = perfil?.rol === "admin";

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
          <form
            action={crearProveedor}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
          >
            <div>
              <Label htmlFor="prov-nombre">Nombre</Label>
              <Input id="prov-nombre" name="nombre" required />
            </div>
            <div>
              <Label htmlFor="prov-contacto">Contacto</Label>
              <Input id="prov-contacto" name="contacto" />
            </div>
            <div>
              <Label htmlFor="prov-telefono">Teléfono</Label>
              <Input id="prov-telefono" name="telefono" type="tel" />
            </div>
            <div>
              <Label htmlFor="prov-email">Email</Label>
              <Input id="prov-email" name="email" type="email" />
            </div>
            <div className="lg:col-span-4">
              <Button type="submit">Agregar</Button>
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
          <Table className="min-w-[640px]">
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
              {(proveedores ?? []).map((p) => (
                <TableRow key={p.id}>
                  <Td>{p.nombre}</Td>
                  <Td className="text-text-secondary">{p.contacto ?? "—"}</Td>
                  <Td className="text-text-secondary">{p.telefono ?? "—"}</Td>
                  <Td className="text-text-secondary">{p.email ?? "—"}</Td>
                  <Td>
                    <Badge tone={p.activo ? "sky" : "gray"}>
                      {p.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </Td>
                  {esAdmin && (
                    <Td className="text-right">
                      <form action={toggleProveedor}>
                        <input type="hidden" name="id" value={p.id} />
                        <input
                          type="hidden"
                          name="activo"
                          value={String(p.activo)}
                        />
                        <Button variant="ghost" size="sm" type="submit">
                          {p.activo ? "Desactivar" : "Activar"}
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
