import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AlertCircle, Users } from "lucide-react";
import { createClient, getPerfilActual } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, Badge } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Paginacion } from "@/components/ui/pagination";
import { formatFecha, leerPagina, mensajeErrorDb, paginar } from "@/lib/utils";
import type { RolUsuario } from "@/types/database.types";

function fallar(mensaje: string): never {
  redirect(`/usuarios?error=${encodeURIComponent(mensaje)}`);
}

// Ambas actions verifican admin acá aunque la RLS ya lo bloquee:
// sin esto el fallo sería silencioso (update de 0 filas).
const CLAVE_SERVIDOR = "Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor.";

async function crearUsuario(formData: FormData) {
  "use server";
  const perfil = await getPerfilActual();
  if (perfil?.rol !== "admin" || !perfil.activo) {
    fallar("Solo un admin puede crear usuarios.");
  }
  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const rol = String(formData.get("rol")) as RolUsuario;
  if (!nombre || !email) fallar("Nombre y correo son obligatorios.");
  if (password.length < 8) fallar("La contraseña debe tener al menos 8 caracteres.");

  const admin = createAdminClient();
  if (!admin) fallar(CLAVE_SERVIDOR);
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre },
  });
  if (error) {
    console.error(error);
    fallar(
      error.code === "email_exists"
        ? "Ya existe una cuenta con ese correo."
        : "No se pudo crear el usuario.",
    );
  }

  // El trigger crea el perfil como operador; el rol lo asigna este admin.
  if (rol === "admin") {
    const supabase = await createClient();
    const { error: errorRol } = await supabase
      .from("profiles")
      .update({ rol })
      .eq("id", data.user.id);
    if (errorRol) fallar(mensajeErrorDb(errorRol));
  }
  revalidatePath("/usuarios");
  redirect("/usuarios?ok=usuario_creado");
}

async function restablecerClave(formData: FormData) {
  "use server";
  const perfil = await getPerfilActual();
  if (perfil?.rol !== "admin" || !perfil.activo) {
    fallar("Solo un admin puede restablecer contraseñas.");
  }
  const id = String(formData.get("id"));
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) fallar("La contraseña debe tener al menos 8 caracteres.");

  const admin = createAdminClient();
  if (!admin) fallar(CLAVE_SERVIDOR);
  const { error } = await admin.auth.admin.updateUserById(id, { password });
  if (error) {
    console.error(error);
    fallar("No se pudo restablecer la contraseña.");
  }
  redirect(`/usuarios?pagina=${leerPagina(String(formData.get("pagina")))}&ok=clave_restablecida`);
}

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
  redirect(`/usuarios?pagina=${leerPagina(String(formData.get("pagina")))}&ok=rol_actualizado`);
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
  redirect(
    `/usuarios?pagina=${leerPagina(String(formData.get("pagina")))}&ok=${activo ? "usuario_desactivado" : "usuario_activado"}`,
  );
}

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; pagina?: string }>;
}) {
  const perfil = await getPerfilActual();
  if (perfil?.rol !== "admin") redirect("/dashboard");

  const supabase = await createClient();
  const [{ data: usuarios }, { error: errorParam, pagina: paginaParam }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    searchParams,
  ]);
  const paginados = paginar(usuarios ?? [], leerPagina(paginaParam));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Creá cuentas para el personal y administrá su rol, estado y contraseña."
      />

      {errorParam && (
        <p className="flex items-center gap-2 rounded-lg bg-danger-bg px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorParam}
        </p>
      )}

      <Card>
        <h2 className="mb-3 font-semibold tracking-tight text-text-primary">
          Nuevo usuario
        </h2>
        <form
          action={crearUsuario}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
        >
          <div>
            <Label htmlFor="usu-nombre">Nombre</Label>
            <Input id="usu-nombre" name="nombre" autoComplete="off" required />
          </div>
          <div>
            <Label htmlFor="usu-email">Correo</Label>
            <Input id="usu-email" name="email" type="email" autoComplete="off" required />
          </div>
          <div>
            <Label htmlFor="usu-password">Contraseña temporal</Label>
            <Input
              id="usu-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <div>
            <Label htmlFor="usu-rol">Rol</Label>
            <Select id="usu-rol" name="rol" defaultValue="operador">
              <option value="operador">operador</option>
              <option value="admin">admin</option>
            </Select>
          </div>
          <div className="lg:col-span-4">
            <Button type="submit">Crear usuario</Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden p-0">
        {(usuarios ?? []).length === 0 ? (
          <EmptyState icon={Users} title="Sin usuarios" />
        ) : (
          <Table className="lg:min-w-[640px]">
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
              {paginados.items.map((u) => {
                const esPropio = u.id === perfil.id;
                return (
                  <TableRow key={u.id}>
                    <Td className="max-lg:font-medium">
                      {u.nombre}
                      {esPropio && (
                        <span className="ml-2 text-xs text-text-secondary">
                          (vos)
                        </span>
                      )}
                    </Td>
                    <Td label="Rol">
                      {esPropio ? (
                        <span className="capitalize">{u.rol}</span>
                      ) : (
                        <form
                          action={cambiarRol}
                          className="flex items-center gap-2"
                        >
                          <input type="hidden" name="id" value={u.id} />
                          <input type="hidden" name="pagina" value={paginados.pagina} />
                          <Select
                            name="rol"
                            defaultValue={u.rol}
                            className="h-9 max-md:h-11 w-32"
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
                    <Td label="Estado">
                      <Badge tone={u.activo ? "green" : "gray"}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </Td>
                    <Td label="Alta" className="whitespace-nowrap text-text-secondary">
                      {formatFecha(u.created_at)}
                    </Td>
                    <Td className="text-right">
                      {!esPropio && (
                        <form action={toggleActivo}>
                          <input type="hidden" name="id" value={u.id} />
                          <input type="hidden" name="pagina" value={paginados.pagina} />
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
                      {!esPropio && (
                        <details className="mt-1 text-left">
                          <summary className="cursor-pointer py-1 text-sm text-text-secondary max-md:py-3">
                            Restablecer contraseña
                          </summary>
                          <form action={restablecerClave} className="mt-2 flex gap-2">
                            <input type="hidden" name="id" value={u.id} />
                            <input type="hidden" name="pagina" value={paginados.pagina} />
                            <Input
                              name="password"
                              type="password"
                              autoComplete="new-password"
                              minLength={8}
                              required
                              aria-label={`Contraseña nueva de ${u.nombre}`}
                              placeholder="Contraseña nueva"
                            />
                            <Button variant="secondary" size="sm" type="submit">
                              Guardar
                            </Button>
                          </form>
                        </details>
                      )}
                    </Td>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        <Paginacion pagina={paginados.pagina} total={(usuarios ?? []).length} ruta="/usuarios" />
      </Card>
    </div>
  );
}
