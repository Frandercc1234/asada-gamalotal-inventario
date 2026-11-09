import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Lo llama el cron de Vercel a diario: la consulta mantiene activa la base
// en el plan gratis de Supabase. Sin sesión, la RLS no devuelve filas.
export async function GET() {
  const supabase = await createClient();
  const { error } = await supabase.from("categorias").select("id").limit(1);
  return NextResponse.json({ ok: !error }, { status: error ? 503 : 200 });
}
