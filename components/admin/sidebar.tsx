"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  ArrowLeftRight,
  FileBarChart,
  Users,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { logout } from "@/app/login/actions";
import { cn } from "@/lib/utils";
import type { RolUsuario } from "@/types/database.types";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/productos", label: "Productos", icon: Package },
  { href: "/categorias", label: "Categorías", icon: Tags },
  { href: "/proveedores", label: "Proveedores", icon: Truck },
  { href: "/movimientos", label: "Movimientos", icon: ArrowLeftRight },
  { href: "/reportes", label: "Reportes", icon: FileBarChart },
  { href: "/usuarios", label: "Usuarios", icon: Users, soloAdmin: true },
];

function iniciales(nombre: string) {
  return (
    nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}

export function Sidebar({
  nombre,
  rol,
}: {
  nombre: string;
  rol: RolUsuario;
}) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  const items = NAV.filter((i) => !i.soloAdmin || rol === "admin");

  const nav = (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {items.map((item) => {
        const activo =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setAbierto(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activo
                ? "bg-primary/10 text-primary"
                : "text-text-secondary hover:bg-surface hover:text-text-primary",
            )}
          >
            <span
              className={cn(
                "h-5 w-0.5 rounded-full",
                activo ? "bg-primary" : "bg-transparent",
              )}
              aria-hidden="true"
            />
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const usuario = (
    <div className="border-t border-border p-3">
      <div className="flex items-center gap-3 rounded-lg px-1 py-1.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {iniciales(nombre)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text-primary">
            {nombre}
          </p>
          <p className="text-xs capitalize text-text-secondary">{rol}</p>
        </div>
      </div>
      <form action={logout} className="mt-2">
        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-danger transition-colors hover:bg-danger-bg">
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </form>
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-white px-4 py-3 md:hidden">
        <span className="font-semibold tracking-tight text-text-primary">
          ASADA Gamalotal
        </span>
        <button
          onClick={() => setAbierto(true)}
          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-white md:flex">
        <div className="px-5 py-5">
          <p className="font-semibold tracking-tight text-text-primary">
            ASADA Gamalotal
          </p>
          <p className="text-xs text-text-secondary">Inventario</p>
        </div>
        {nav}
        {usuario}
      </aside>

      {abierto && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 animate-overlay-in bg-slate-900/40"
            onClick={() => setAbierto(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] animate-slide-in-left flex-col bg-white shadow-lg">
            <div className="flex items-center justify-between px-5 py-5">
              <div>
                <p className="font-semibold tracking-tight text-text-primary">
                  ASADA Gamalotal
                </p>
                <p className="text-xs text-text-secondary">Inventario</p>
              </div>
              <button
                onClick={() => setAbierto(false)}
                className="rounded-lg p-2 text-text-secondary hover:bg-surface"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
            {usuario}
          </aside>
        </div>
      )}
    </>
  );
}
