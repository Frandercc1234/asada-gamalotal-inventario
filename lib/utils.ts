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
  return error.message;
}

export function formatFecha(fecha: string | Date): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}
