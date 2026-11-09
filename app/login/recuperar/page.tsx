"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { solicitarRecuperacion } from "../actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

function Formulario() {
  const [state, action, pending] = useActionState(solicitarRecuperacion, undefined);
  const enlaceInvalido = useSearchParams().get("error") === "enlace";

  if (state?.enviado) {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-sm text-text-primary">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        Si el correo está registrado, vas a recibir un enlace para crear una
        contraseña nueva. Revisá también la carpeta de spam.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {enlaceInvalido && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm text-danger"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          El enlace venció o ya se usó. Pedí uno nuevo.
        </p>
      )}
      <div>
        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nombre@ejemplo.com"
          required
        />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Enviando..." : "Enviar enlace"}
      </Button>
    </form>
  );
}

export default function RecuperarPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Recuperar contraseña
        </h1>
        <p className="mb-6 mt-1.5 text-sm text-text-secondary">
          Escribí tu correo y te enviamos un enlace para crear una nueva.
        </p>
        <Suspense fallback={null}>
          <Formulario />
        </Suspense>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a ingresar
        </Link>
      </div>
    </main>
  );
}
