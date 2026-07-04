import { redirect } from "next/navigation";
import { createClient, getPerfilActual } from "@/lib/supabase/server";
import { Sidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const perfil = await getPerfilActual();

  if (!perfil) redirect("/login");

  // Un perfil desactivado no puede seguir usando el panel.
  if (!perfil.activo) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface md:flex-row">
      <Sidebar nombre={perfil.nombre} rol={perfil.rol} />
      <div className="flex-1">
        <main className="mx-auto max-w-6xl p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
