"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { avisoExito } from "@/lib/alertas";

// Claves fijas: el texto del aviso nunca sale directamente de la URL.
const MENSAJES: Record<string, string> = {
  categoria_creada: "Categoría agregada",
  categoria_activada: "Categoría activada",
  categoria_desactivada: "Categoría desactivada",
  proveedor_creado: "Proveedor agregado",
  proveedor_activado: "Proveedor activado",
  proveedor_desactivado: "Proveedor desactivado",
  rol_actualizado: "Rol actualizado",
  usuario_activado: "Usuario activado",
  usuario_desactivado: "Usuario desactivado",
};

// Las Server Actions redirigen con ?ok=clave; acá se muestra y se limpia la URL.
export function AvisoUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const ok = params.get("ok");
  const mostrado = useRef<string | null>(null);

  useEffect(() => {
    if (!ok) {
      mostrado.current = null;
      return;
    }
    if (mostrado.current === ok) return;
    mostrado.current = ok;

    const mensaje = MENSAJES[ok];
    if (mensaje) avisoExito(mensaje);

    const resto = new URLSearchParams(params);
    resto.delete("ok");
    const query = resto.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [ok, params, pathname, router]);

  return null;
}
