"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <EmptyState
        icon={AlertTriangle}
        title="No se pudo cargar la página"
        description="Puede ser un problema de conexión. Intentá de nuevo en unos segundos."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={retry}>Reintentar</Button>
            <Link href="/" className={buttonClasses("secondary")}>
              Ir al inicio
            </Link>
          </div>
        }
      />
    </main>
  );
}
