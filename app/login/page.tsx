"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Lock } from "lucide-react";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Panel de marca */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[oklch(47%_0.13_240)] via-[oklch(41%_0.12_243)] to-[oklch(32%_0.10_246)] p-12 text-white lg:flex">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al sitio
        </Link>

        <div className="relative z-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2.5 shadow-lg shadow-black/10">
            <Image
              src="/logo-asada.png"
              alt="Logo de la ASADA Gamalotal"
              width={80}
              height={80}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="mt-8 max-w-md text-balance text-3xl font-semibold tracking-tight">
            Sistema de Inventario
          </h1>
          <p className="mt-3 max-w-sm text-pretty leading-relaxed text-white/90">
            Gestión del acueducto rural de Gamalotal. Stock, movimientos y
            reportes en un solo lugar, con trazabilidad de cada cambio.
          </p>
        </div>

        <p className="relative z-10 text-sm text-white/80">
          ASADA Gamalotal — Acueducto rural, Costa Rica.
        </p>

        <svg
          className="absolute inset-x-0 bottom-0 text-white/10"
          viewBox="0 0 1440 320"
          fill="currentColor"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,224 C240,320 480,160 720,192 C960,224 1200,320 1440,224 L1440,320 L0,320 Z" />
        </svg>
      </aside>

      {/* Formulario */}
      <main className="flex items-center justify-center bg-surface px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          {/* Marca compacta para móvil (el panel lateral está oculto) */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <Image
              src="/logo-asada.png"
              alt="Logo de la ASADA Gamalotal"
              width={64}
              height={64}
              priority
              className="h-16 w-16 object-contain"
            />
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-primary">
              Panel administrativo
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-text-primary">
              Ingresá a tu cuenta
            </h2>
            <p className="mt-1.5 text-sm text-text-secondary">
              Usá el correo y la contraseña que te asignó la ASADA.
            </p>
          </div>

          <form action={action} className="space-y-4">
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
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
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

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={pending}
            >
              <Lock className="h-4 w-4" />
              {pending ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al sitio
          </Link>
        </div>
      </main>
    </div>
  );
}
