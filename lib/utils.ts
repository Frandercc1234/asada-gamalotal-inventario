import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatColones(valor: number): string {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valor);
}

// Traduce errores de Postgres/RLS a mensajes entendibles.
export function mensajeErrorDb(error: {
  code?: string;
  message: string;
}): string {
  if (error.code === "23505") return "Ya existe un registro con ese valor.";
  if (error.code === "23514") return "Los datos no son válidos.";
  if (error.code === "42501" || error.message.includes("row-level security"))
    return "No tenés permisos para esta acción.";
  // P0001: raise exception de las RPC, con mensajes escritos para el usuario.
  if (error.code === "P0001") return error.message;
  console.error(error);
  return "No se pudo completar la operación. Intentá de nuevo.";
}

export const POR_PAGINA = 5;

export function leerPagina(valor?: string): number {
  const pagina = Number(valor);
  return Number.isInteger(pagina) && pagina > 0 ? pagina : 1;
}

// Recorta una lista ya cargada; una página fuera de rango va a la última.
export function paginar<T>(items: T[], pedida: number) {
  const totalPaginas = Math.max(1, Math.ceil(items.length / POR_PAGINA));
  const pagina = Math.min(Math.max(1, pedida), totalPaginas);
  return {
    pagina,
    items: items.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA),
  };
}

export function formatFecha(fecha: string | Date): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}
