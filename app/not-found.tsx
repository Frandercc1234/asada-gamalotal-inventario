import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <EmptyState
        icon={SearchX}
        title="No encontramos esta página"
        description="Puede que el enlace esté mal escrito o que la página ya no exista."
        action={
          <Link href="/" className={buttonClasses("primary")}>
            Ir al inicio
          </Link>
        }
      />
    </main>
  );
}
