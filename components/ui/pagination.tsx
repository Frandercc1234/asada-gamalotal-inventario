import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";
import { POR_PAGINA } from "@/lib/utils";

// Con `ruta` cambia ?pagina= en la URL; con `onCambiar` usa estado local
// (listas que ya están completas en el cliente, como las filtradas).
export function Paginacion({
  pagina,
  total,
  ruta,
  onCambiar,
}: {
  pagina: number;
  total: number;
  ruta?: string;
  onCambiar?: (pagina: number) => void;
}) {
  if (total <= POR_PAGINA) return null;

  const totalPaginas = Math.ceil(total / POR_PAGINA);
  const desde = (pagina - 1) * POR_PAGINA + 1;
  const hasta = Math.min(pagina * POR_PAGINA, total);

  function control(
    destino: number,
    etiqueta: string,
    contenido: React.ReactNode,
  ) {
    const habilitado = destino >= 1 && destino <= totalPaginas;
    if (ruta && habilitado) {
      return (
        <Link
          href={`${ruta}?pagina=${destino}`}
          scroll={false}
          aria-label={etiqueta}
          className={buttonClasses("secondary", "sm")}
        >
          {contenido}
        </Link>
      );
    }
    return (
      <Button
        variant="secondary"
        size="sm"
        disabled={!habilitado}
        aria-label={etiqueta}
        onClick={() => onCambiar?.(destino)}
      >
        {contenido}
      </Button>
    );
  }

  return (
    <nav
      aria-label="Paginación"
      className="flex items-center justify-between gap-3 border-t border-border px-4 py-3"
    >
      <p className="text-sm tabular-nums text-text-secondary">
        {desde}–{hasta} de {total}
      </p>
      <div className="flex gap-2">
        {control(
          pagina - 1,
          "Página anterior",
          <>
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </>,
        )}
        {control(
          pagina + 1,
          "Página siguiente",
          <>
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </>,
        )}
      </div>
    </nav>
  );
}
