"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { cambiarClave } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function NuevaClavePage() {
  const [state, action, pending] = useActionState(cambiarClave, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Nueva contraseña
        </h1>
        <p className="mb-6 mt-1.5 text-sm text-text-secondary">
          Usá al menos 8 caracteres.
        </p>
        <form action={action} className="space-y-4">
          <div>
            <Label htmlFor="password">Contraseña nueva</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirmacion">Repetí la contraseña</Label>
            <Input
              id="confirmacion"
              name="confirmacion"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          {state?.error && (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm text-danger"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {state.error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Guardando..." : "Guardar contraseña"}
          </Button>
        </form>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </Link>
      </div>
    </main>
  );
}
