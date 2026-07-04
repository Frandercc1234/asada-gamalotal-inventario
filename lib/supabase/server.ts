import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

export type PerfilActual = {
  id: string;
  nombre: string;
  rol: Database["public"]["Enums"]["rol_usuario"];
  activo: boolean;
};

// Usuario autenticado + su perfil (o null si no hay sesión).
export async function getPerfilActual(): Promise<PerfilActual | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await supabase
    .from("profiles")
    .select("nombre, rol, activo")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    nombre: perfil?.nombre ?? "",
    rol: perfil?.rol ?? "operador",
    activo: perfil?.activo ?? false,
  };
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Llamado desde un Server Component: se ignora.
            // El proxy (updateSession) se encarga de refrescar la sesión.
          }
        },
      },
    },
  );
}
