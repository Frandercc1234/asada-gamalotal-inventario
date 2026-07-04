import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AlertCircle, Users } from "lucide-react";
import { createClient, getPerfilActual } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Card, Badge } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { formatFecha, mensajeErrorDb } from "@/lib/utils";
import type { RolUsuario } from "@/types/database.types";

function fallar(mensaje: string): never {
  redirect(`/usuarios?error=${encodeURIComponent(mensaje)}`);
}

// Ambas actions verifican admin acá aunque la RLS ya lo bloquee:
// sin esto el fallo sería silencioso (update de 0 filas).
async function cambiarRol(formData: FormData) {
  "use server";
  const perfil = await getPerfilActual();
  if (perfil?.rol !== "admin") fallar("Solo un admin puede cambiar roles.");
  const id = String(formData.get("id"));
  if (id === perfil.id) {
    fallar("No podés cambiar tu propio rol; pedile a otro admin.");
  }
  const rol = String(formData.get("rol")) as RolUsuario;
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ rol }).eq("id", id);
  if (error) fallar(mensajeErrorDb(error));
  revalidatePath("/usuarios");
  redirect("/usuarios");
}

async function toggleActivo(formData: FormData) {
  "use server";
  const perfil = await getPerfilActual();
  if (perfil?.rol !== "admin") fallar("Solo un admin puede cambiar el estado.");
  const id = String(formData.get("id"));
  if (id === perfil.id) {
    fallar("No podés desactivar tu propia cuenta.");
  }
  const activo = formData.get("activo") === "true";
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ activo: !activo })
    .eq("id", id);
  if (error) fallar(mensajeErrorDb(error));
  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const perfil = await getPerfilActual();
  if (perfil?.rol !== "admin") redirect("/dashboard");

  const supabase = await createClient();
  const [{ data: usuarios }, { error: errorParam }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    searchParams,
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="La creación de cuentas se hace desde Supabase Auth. Acá se administra el rol y el estado de los perfiles existentes."
      />

      {errorParam && (
        <p className="flex items-center gap-2 rounded-lg bg-danger-bg px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorParam}
        </p>
      )}

      <Card className="overflow-hidden p-0">
        {(usuarios ?? []).length === 0 ? (
          <EmptyState icon={Users} title="Sin usuarios" />
        ) : (
          <Table className="min-w-[640px]">
            <TableHead>
              <tr>
                <Th>Nombre</Th>
                <Th>Rol</Th>
                <Th>Estado</Th>
                <Th>Alta</Th>
                <Th />
              </tr>
            </TableHead>
            <TableBody>
              {(usuarios ?? []).map((u) => {
                const esPropio = u.id === perfil.id;
                return (
                  <TableRow key={u.id}>
                    <Td>
                      {u.nombre}
                      {esPropio && (
                        <span className="ml-2 text-xs text-text-secondary">
                          (vos)
                        </span>
                      )}
                    </Td>
                    <Td>
                      {esPropio ? (
                        <span className="capitalize">{u.rol}</span>
                      ) : (
                        <form
                          action={cambiarRol}
                          className="flex items-center gap-2"
                        >
                          <input type="hidden" name="id" value={u.id} />
                          <Select
                            name="rol"
                            defaultValue={u.rol}
                            className="h-9 w-32"
                            aria-label={`Rol de ${u.nombre}`}
                          >
                            <option value="operador">operador</option>
                            <option value="admin">admin</option>
                          </Select>
                          <Button variant="secondary" size="sm" type="submit">
                            Guardar
                          </Button>
                        </form>
                      )}
                    </Td>
                    <Td>
                      <Badge tone={u.activo ? "green" : "gray"}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </Td>
                    <Td className="whitespace-nowrap text-text-secondary">
                      {formatFecha(u.created_at)}
                    </Td>
                    <Td className="text-right">
                      {!esPropio && (
                        <form action={toggleActivo}>
                          <input type="hidden" name="id" value={u.id} />
                          <input
                            type="hidden"
                            name="activo"
                            value={String(u.activo)}
                          />
                          <Button variant="ghost" size="sm" type="submit">
                            {u.activo ? "Desactivar" : "Activar"}
                          </Button>
                        </form>
                      )}
                    </Td>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
