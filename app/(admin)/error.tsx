"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

// Se muestra dentro del panel: el menú sigue disponible.
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
    <Card className="p-0">
      <EmptyState
        icon={AlertTriangle}
        title="No se pudo cargar esta sección"
        description="Tus datos no se modificaron. Intentá de nuevo en unos segundos."
        action={<Button onClick={retry}>Reintentar</Button>}
      />
    </Card>
  );
}
