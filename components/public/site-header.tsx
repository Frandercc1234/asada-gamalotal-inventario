"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SECCIONES = [
  { href: "#nosotros", label: "Quiénes somos" },
  { href: "#servicios", label: "Servicios" },
  { href: "#ahorro", label: "Ahorro de agua" },
  { href: "#contacto", label: "Contacto" },
];

export function SiteHeader() {
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight text-text-primary"
          onClick={() => setAbierto(false)}
        >
          <Image
            src="/logo-asada.png"
            alt="Logo de la ASADA Gamalotal"
            width={40}
            height={40}
            className="h-9 w-9 object-contain"
            priority
          />
          <span className="leading-tight">
            ASADA Gamalotal
            <span className="block text-xs font-normal text-text-secondary">
              Acueducto rural
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-text-secondary md:flex">
          {SECCIONES.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="transition-colors hover:text-text-primary"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(buttonClasses("primary", "sm"), "hidden sm:inline-flex")}
          >
            Panel administrativo
          </Link>
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface md:hidden"
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={abierto}
          >
            {abierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {abierto && (
        <div className="border-t border-border bg-white md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6">
            {SECCIONES.map((s) => (
              <a
                key={s.href}
                href={s.href}
                onClick={() => setAbierto(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
              >
                {s.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setAbierto(false)}
              className={cn(buttonClasses("primary", "md"), "mt-2 w-full")}
            >
              Panel administrativo
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
