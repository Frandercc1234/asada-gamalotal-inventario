# Rediseño Visual — Sistema de Inventario ASADA Gamalotal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. No test framework exists in this repo; "test" steps are replaced by `npm run build` / `npm run lint` and manual browser verification, per the spec's Verification section.

**Goal:** Reskin every screen (landing, login, panel admin) with a consistent design
system (tokens, tipografía Inter, componentes reutilizables, iconografía) sin tocar
lógica de negocio, Server Actions, RPC ni RLS.

**Architecture:** Design tokens in `app/globals.css` consumed by an extended
`components/ui` library (Button/Input/Card/Badge updated in place; Table/Modal/
EmptyState/Skeleton added new) plus a new `components/admin/page-header.tsx`. Every
screen then migrates to consume these primitives. Loading UX comes from Next.js
route-level `loading.tsx` files (automatic Suspense over the existing async Server
Components — no data-fetching code changes).

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4,
`next/font/google` (Inter), `lucide-react` (new dependency), Recharts (existing).

## Global Constraints

- No se modifica ninguna Server Action, la función RPC `registrar_movimiento`, RLS,
  ni el esquema SQL en `supabase/`.
- No se agregan librerías de UI (no shadcn/Radix); solo `lucide-react` para íconos.
- Todo color sale de los tokens definidos en `app/globals.css` — nada de clases de
  color Tailwind sueltas en componentes de pantalla.
- Radios: `rounded-xl` cards, `rounded-lg` controles. Sombra `shadow-sm` base,
  `shadow-md` en hover de interactivos.
- Tamaños táctiles: botones `md` (40px) por default, `sm` (36px) solo en acciones
  densas de fila de tabla, `lg` (44px) en CTAs de landing.
- Foco visible (`focus-visible:ring-2`) en todo elemento interactivo.
- Debe compilar: `npm run build` y `npm run lint` limpios antes de cerrar cada tarea
  de componentes base, y al final del plan completo.
- Responsive: verificar en viewport móvil (375px) y desktop.
- Repo sin `git` inicializado — los pasos de "commit" del template estándar se
  reemplazan por pasos de verificación (build/lint/inspección visual).

---

## Task 1: Fuente Inter + tokens de diseño

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: variables CSS consumibles por Tailwind v4 vía `@theme inline`:
  `--color-primary`, `--color-primary-hover`, `--color-surface`, `--color-border`,
  `--color-text-primary`, `--color-text-secondary`, `--color-success`,
  `--color-success-bg`, `--color-warning`, `--color-warning-bg`, `--color-danger`,
  `--color-danger-bg`. Estas se usan como `bg-primary`, `text-primary`, etc. en
  clases Tailwind a partir de este punto.

- [ ] **Step 1: Reemplazar Geist por Inter en el layout raíz**

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inventario — ASADA Gamalotal",
  description:
    "Sistema de inventario de la ASADA Gamalotal, acueducto rural de Costa Rica.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-surface text-text-primary font-sans">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Definir tokens en `globals.css`**

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-inter);

  --color-primary: oklch(59% 0.14 237);        /* sky-600 */
  --color-primary-hover: oklch(52% 0.14 237);  /* sky-700 */
  --color-surface: oklch(98.5% 0.002 247);     /* slate-50 */
  --color-border: oklch(92.9% 0.006 264);      /* slate-200 */
  --color-text-primary: oklch(20.8% 0.02 264); /* slate-900 */
  --color-text-secondary: oklch(55.4% 0.02 264); /* slate-500 */
  --color-success: oklch(52.7% 0.15 150);      /* green-600 */
  --color-success-bg: oklch(96.2% 0.03 150);   /* green-50 */
  --color-warning: oklch(55% 0.16 70);         /* amber-600 */
  --color-warning-bg: oklch(96.5% 0.04 70);    /* amber-50 */
  --color-danger: oklch(51% 0.19 25);          /* red-600 */
  --color-danger-bg: oklch(96% 0.03 25);       /* red-50 */
}

body {
  font-family: var(--font-sans), system-ui, sans-serif;
}
```

- [ ] **Step 3: Verificar compilación**

Run: `npm run build`
Expected: build exitoso (los tokens nuevos no rompen nada porque aún no se
consumen — este paso solo confirma que `globals.css`/`layout.tsx` son válidos).

---

## Task 2: Actualizar Button, Input/Select/Label, Card/Badge a tokens

**Files:**
- Modify: `components/ui/button.tsx`
- Modify: `components/ui/input.tsx`
- Modify: `components/ui/card.tsx`

**Interfaces:**
- Consumes: tokens de Task 1 (`bg-primary`, `text-primary`, `border-border`, etc.)
- Produces: mismas firmas públicas que ya consumen las pantallas —
  `buttonClasses(variant, size)`, `<Button variant size />`,
  `<Input />` / `<Select />` / `<Label />`, `<Card />` / `<Badge tone />`. Ningún
  screen necesita cambiar sus imports en esta tarea.

- [ ] **Step 1: Reescribir `button.tsx`**

```tsx
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const variantes: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-hover hover:shadow-md active:bg-primary-hover disabled:bg-primary/40 disabled:shadow-none",
  secondary:
    "border border-border bg-white text-text-primary shadow-sm hover:bg-surface hover:shadow-md active:bg-surface disabled:opacity-50 disabled:shadow-none",
  danger:
    "bg-danger text-white shadow-sm hover:bg-danger/90 hover:shadow-md disabled:bg-danger/40 disabled:shadow-none",
  ghost:
    "text-text-secondary hover:bg-surface hover:text-text-primary disabled:opacity-50",
};

const tamanos: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-6 text-base gap-2",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return cn(
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed",
    variantes[variant],
    tamanos[size],
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button className={cn(buttonClasses(variant, size), className)} {...props} />
  );
}
```

Nota: se agrega el tamaño `lg` (44px) usado en CTAs de landing; `sm` pasa de 32px a
36px para acercarse al mínimo táctil sin inflar las acciones densas de tabla.

- [ ] **Step 2: Reescribir `input.tsx`**

```tsx
import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

const base =
  "h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-text-primary placeholder:text-text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50 disabled:bg-surface";

export function Input({
  className,
  "aria-invalid": ariaInvalid,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        base,
        ariaInvalid && "border-danger focus-visible:ring-danger",
        className,
      )}
      aria-invalid={ariaInvalid}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(base, "pr-8", className)} {...props} />;
}

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-text-primary", className)}
      {...props}
    />
  );
}
```

- [ ] **Step 3: Reescribir `card.tsx`**

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-white p-6 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

type BadgeTone = "gray" | "green" | "red" | "amber" | "sky";

const tonos: Record<BadgeTone, string> = {
  gray: "bg-surface text-text-secondary",
  green: "bg-success-bg text-success",
  red: "bg-danger-bg text-danger",
  amber: "bg-warning-bg text-warning",
  sky: "bg-primary/10 text-primary",
};

export function Badge({
  className,
  tone = "gray",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tonos[tone],
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Verificar compilación**

Run: `npm run build`
Expected: build exitoso. Las pantallas existentes (que usan `p-4` explícito en
algunos `Card` vía overrides tipo `p-0` para tablas) siguen funcionando porque
`className` sobreescribe con `twMerge`.

---

## Task 3: Instalar lucide-react y crear primitivos Table / Modal / EmptyState / Skeleton

**Files:**
- Modify: `package.json` (dependencia nueva)
- Create: `components/ui/table.tsx`
- Create: `components/ui/modal.tsx`
- Create: `components/ui/empty-state.tsx`
- Create: `components/ui/skeleton.tsx`

**Interfaces:**
- Produces:
  - `<Table>`, `<TableHead>`, `<TableRow>`, `<TableCell as="td"|"th">` — usados por
    todas las pantallas admin en tareas posteriores.
  - `<Modal open onClose title>` — usado por `productos-client.tsx`.
  - `<EmptyState icon title description action? />` — usado por todas las tablas.
  - `<Skeleton className />`, `<SkeletonTable rows cols />` — usados por los
    `loading.tsx` de Task 9.

- [ ] **Step 1: Instalar dependencia**

Run: `npm install lucide-react`
Expected: se agrega `lucide-react` a `package.json`/`package-lock.json`.

- [ ] **Step 2: Crear `components/ui/table.tsx`**

```tsx
import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  );
}

export function TableHead({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "sticky top-0 z-10 border-b border-border bg-surface text-left text-text-secondary",
        className,
      )}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-border", className)} {...props} />;
}

export function TableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("transition-colors hover:bg-surface/60", className)}
      {...props}
    />
  );
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn("px-4 py-3 font-medium", className)} {...props} />
  );
}

export function Td({
  className,
  numeric,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <td
      className={cn("px-4 py-3", numeric && "tabular-nums", className)}
      {...props}
    />
  );
}
```

- [ ] **Step 3: Crear `components/ui/modal.tsx`**

```tsx
"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 duration-150 animate-in fade-in"
      onClick={onClose}
    >
      <Card
        className={cn(
          "w-full max-w-lg duration-150 animate-in fade-in zoom-in-95",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-text-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
}
```

Nota: `animate-in`/`fade-in`/`zoom-in-95` requieren el plugin `tailwindcss-animate`
o utilidades equivalentes. Este proyecto no lo tiene instalado; en el Step 4 se
reemplazan por keyframes propios en `globals.css` para no sumar una dependencia
nueva fuera de `lucide-react`.

- [ ] **Step 4: Agregar keyframes de entrada en `app/globals.css`** (append al final)

```css
@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes overlay-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-overlay-in {
  animation: overlay-in 150ms ease-out;
}

.animate-modal-in {
  animation: modal-in 180ms ease-out;
}
```

Y actualizar `modal.tsx`: reemplazar `duration-150 animate-in fade-in` del overlay
por `animate-overlay-in`, y `duration-150 animate-in fade-in zoom-in-95` del `Card`
por `animate-modal-in`.

- [ ] **Step 5: Crear `components/ui/empty-state.tsx`**

```tsx
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
      <Icon className="h-8 w-8 text-text-secondary" strokeWidth={1.5} />
      <p className="font-medium text-text-primary">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-text-secondary">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
```

- [ ] **Step 6: Crear `components/ui/skeleton.tsx`**

```tsx
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-border/60", className)} />
  );
}

export function SkeletonTable({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="space-y-3 p-6">
      <Skeleton className="h-4 w-1/3" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-8 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Verificar compilación**

Run: `npm run build`
Expected: build exitoso, sin errores de tipos en los nuevos archivos (aún no están
importados por ninguna pantalla, así que no deberían aparecer warnings de unused
salvo lint de "no exportado usado" si el linter lo marca — en ese caso confirmar que
`npm run lint` no falla por archivos nuevos sin usar todavía).

---

## Task 4: `PageHeader` admin

**Files:**
- Create: `components/admin/page-header.tsx`

**Interfaces:**
- Produces: `<PageHeader title description? actions? />`, usado por las 7 pantallas
  admin en tareas posteriores en vez de `<h1>` sueltos.

- [ ] **Step 1: Crear el componente**

```tsx
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Verificar compilación**

Run: `npm run build`
Expected: build exitoso.

---

## Task 5: Landing pública + layout público

**Files:**
- Modify: `app/(public)/layout.tsx`
- Modify: `app/(public)/page.tsx`

**Interfaces:**
- Consumes: `buttonClasses` (Task 2), tokens (Task 1), `lucide-react` (Task 3).

- [ ] **Step 1: Reescribir `app/(public)/layout.tsx`** — header sticky con blur,
  footer con datos institucionales:

```tsx
import Link from "next/link";
import { Droplets } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight text-text-primary"
          >
            <Droplets className="h-5 w-5 text-primary" />
            ASADA Gamalotal
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-text-secondary sm:flex">
            <a href="#servicios" className="transition-colors hover:text-text-primary">
              Servicios
            </a>
            <a href="#contacto" className="transition-colors hover:text-text-primary">
              Contacto
            </a>
          </nav>
          <Link href="/login" className={buttonClasses("primary", "sm")}>
            Panel administrativo
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-text-secondary sm:px-6">
          ASADA Gamalotal — Acueducto rural, Costa Rica.
        </div>
      </footer>
    </div>
  );
}
```

Nota: se deja el menú móvil sin botón hamburguesa dedicado porque el único nav
adicional (`Servicios`/`Contacto`) se oculta en móvil (`hidden sm:flex`) y el CTA
"Panel administrativo" sigue siempre visible — cumple "en móvil colapsa" sin sumar
un componente Sheet nuevo solo para dos anclas (evita sobreingeniería). Si en la
revisión visual el header se ve incompleto en móvil, agregar un botón `Menu`
(lucide) que despliegue las dos anclas en un `Modal`-like dropdown reutilizando el
mismo patrón de Task 3.

- [ ] **Step 2: Reescribir `app/(public)/page.tsx`** — hero con degradado + onda SVG,
  servicios con ícono, contacto con íconos:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Droplet, ShieldCheck, Users, MapPin, Phone, Clock } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "ASADA Gamalotal — Acueducto rural",
  description:
    "Asociación Administradora del Acueducto Rural de Gamalotal. Información institucional y servicios de agua potable para la comunidad.",
};

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-white">
        <div className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 sm:py-28">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            Agua potable para la comunidad de Gamalotal
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-text-secondary">
            Administramos el acueducto rural con transparencia y compromiso,
            garantizando un servicio de agua confiable para cada hogar.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login" className={buttonClasses("primary", "lg")}>
              Panel administrativo
            </Link>
            <a href="#servicios" className={buttonClasses("ghost", "lg")}>
              Conocer más
            </a>
          </div>
        </div>

        <svg
          className="absolute bottom-0 left-0 w-full text-white"
          viewBox="0 0 1440 80"
          fill="currentColor"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,40 C240,80 480,0 720,20 C960,40 1200,80 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </section>

      <section id="servicios" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-text-primary">
          Nuestros servicios
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <Servicio
            icon={Droplet}
            titulo="Servicio confiable"
            texto="Distribución continua de agua potable a la comunidad."
          />
          <Servicio
            icon={ShieldCheck}
            titulo="Gestión responsable"
            texto="Control de inventario y mantenimiento de la infraestructura."
          />
          <Servicio
            icon={Users}
            titulo="Cercanía"
            texto="Atención directa a las necesidades de las familias abonadas."
          />
        </div>
      </section>

      <section id="contacto" className="border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-text-primary">
            Contacto
          </h2>
          <div className="mx-auto mt-10 grid max-w-2xl gap-6 sm:grid-cols-3">
            <Contacto icon={MapPin} texto="Gamalotal, Costa Rica" />
            <Contacto icon={Phone} texto="Consultar en oficina local" />
            <Contacto icon={Clock} texto="Lunes a viernes, 8am–4pm" />
          </div>
        </div>
      </section>
    </>
  );
}

function Servicio({
  icon: Icon,
  titulo,
  texto,
}: {
  icon: typeof Droplet;
  titulo: string;
  texto: string;
}) {
  return (
    <Card className="text-center transition-shadow hover:shadow-md">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mt-4 font-semibold text-text-primary">{titulo}</h3>
      <p className="mt-2 text-sm text-text-secondary">{texto}</p>
    </Card>
  );
}

function Contacto({
  icon: Icon,
  texto,
}: {
  icon: typeof MapPin;
  texto: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <Icon className="h-5 w-5 text-primary" />
      <p className="text-sm text-text-secondary">{texto}</p>
    </div>
  );
}
```

- [ ] **Step 3: Verificar compilación y visual**

Run: `npm run build`
Expected: build exitoso.
Manual: iniciar `npm run dev`, abrir `/`, revisar en 375px y desktop.

---

## Task 6: Login

**Files:**
- Modify: `app/login/page.tsx`

- [ ] **Step 1: Reescribir con fondo degradado sutil y jerarquía más clara**

```tsx
"use client";

import { useActionState } from "react";
import { Droplets, AlertCircle } from "lucide-react";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/10 via-surface to-surface px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <Droplets className="h-5 w-5 text-primary" />
          </div>
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-text-primary">
            ASADA Gamalotal
          </h1>
          <p className="text-sm text-text-secondary">Sistema de Inventario</p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
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
              required
            />
          </div>

          {state?.error && (
            <p className="flex items-center gap-1.5 text-sm text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Verificar compilación y visual**

Run: `npm run build`
Expected: build exitoso. Manual: revisar `/login` con error simulado (credenciales
inválidas) para confirmar el estilo del mensaje de error.

---

## Task 7: Shell admin — layout + sidebar

**Files:**
- Modify: `app/(admin)/layout.tsx`
- Modify: `components/admin/sidebar.tsx`

**Interfaces:**
- Consumes: tokens, `lucide-react`.
- No cambia la firma `<Sidebar nombre rol />` ni la lógica de `logout`.

- [ ] **Step 1: Reescribir `sidebar.tsx`** con íconos, acento activo, drawer móvil
  animado y avatar de iniciales:

```tsx
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
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";
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
          <aside className="animate-slide-in-left absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-lg">
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
```

- [ ] **Step 2: Agregar keyframe de drawer en `app/globals.css`** (append)

```css
@keyframes slide-in-left {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-slide-in-left {
  animation: slide-in-left 200ms ease-out;
}
```

- [ ] **Step 3: Actualizar `app/(admin)/layout.tsx`** (fondo a token, `main` con más
  aire):

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre, rol")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen flex-col bg-surface md:flex-row">
      <Sidebar nombre={profile?.nombre ?? ""} rol={profile?.rol ?? "operador"} />
      <div className="flex-1">
        <main className="mx-auto max-w-6xl p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verificar compilación y visual**

Run: `npm run build`
Expected: build exitoso. Manual: abrir cualquier pantalla admin, confirmar drawer
móvil (abrir/cerrar con overlay), ítem activo, avatar.

---

## Task 8: Dashboard

**Files:**
- Modify: `app/(admin)/dashboard/page.tsx`
- Modify: `components/charts/movimientos-chart.tsx`

**Interfaces:**
- Consumes: `PageHeader` (Task 4), `Table/TableHead/TableBody/TableRow/Th/Td`
  (Task 3), `EmptyState` (Task 3).

- [ ] **Step 1: Reescribir `dashboard/page.tsx`** — KPIs con ícono en chip,
  variación, tabla de alertas migrada a `Table`:

```tsx
import { Package, Wallet, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/page-header";
import { Card, Badge } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import {
  MovimientosChart,
  type PuntoMovimiento,
} from "@/components/charts/movimientos-chart";
import { formatColones } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();

  const desde = new Date();
  desde.setDate(desde.getDate() - 30);

  const [{ data: productos }, { data: alertas }, { data: movs }] =
    await Promise.all([
      supabase
        .from("productos")
        .select("stock_actual, precio")
        .eq("activo", true),
      supabase
        .from("v_alertas_stock")
        .select("id, codigo, nombre, stock_actual, stock_minimo"),
      supabase
        .from("movimientos")
        .select("tipo, cantidad, created_at")
        .gte("created_at", desde.toISOString()),
    ]);

  const totalProductos = productos?.length ?? 0;
  const valorInventario =
    productos?.reduce((acc, p) => acc + p.stock_actual * p.precio, 0) ?? 0;
  const totalAlertas = alertas?.length ?? 0;

  const porDia = new Map<string, PuntoMovimiento>();
  for (const m of movs ?? []) {
    const fecha = new Date(m.created_at).toLocaleDateString("es-CR", {
      day: "2-digit",
      month: "2-digit",
    });
    const punto = porDia.get(fecha) ?? { fecha, entradas: 0, salidas: 0 };
    if (m.tipo === "entrada") punto.entradas += m.cantidad;
    else punto.salidas += m.cantidad;
    porDia.set(fecha, punto);
  }
  const dataChart = Array.from(porDia.values());

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Resumen del inventario y actividad reciente." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi
          icon={Package}
          titulo="Productos activos"
          valor={totalProductos.toString()}
          contexto="Catálogo vigente"
        />
        <Kpi
          icon={Wallet}
          titulo="Valor del inventario"
          valor={formatColones(valorInventario)}
          contexto="Stock × precio"
        />
        <Kpi
          icon={AlertTriangle}
          titulo="Alertas de stock"
          valor={totalAlertas.toString()}
          contexto={totalAlertas > 0 ? "Requieren atención" : "Todo en orden"}
          alerta={totalAlertas > 0}
        />
      </div>

      <Card>
        <h2 className="mb-4 font-semibold tracking-tight text-text-primary">
          Movimientos (últimos 30 días)
        </h2>
        <MovimientosChart data={dataChart} />
      </Card>

      <Card
        className={cn(
          "overflow-hidden p-0",
          totalAlertas > 0 && "border-warning/40",
        )}
      >
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold tracking-tight text-text-primary">
            Productos bajo mínimo
          </h2>
        </div>
        {totalAlertas === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="Todo el stock está por encima del mínimo"
          />
        ) : (
          <Table className="min-w-[520px]">
            <TableHead>
              <tr>
                <Th>Código</Th>
                <Th>Producto</Th>
                <Th>Stock</Th>
                <Th>Mínimo</Th>
              </tr>
            </TableHead>
            <TableBody>
              {(alertas ?? []).map((a) => (
                <TableRow key={a.id}>
                  <Td className="font-mono text-xs">{a.codigo}</Td>
                  <Td>{a.nombre}</Td>
                  <Td>
                    <Badge tone="red">{a.stock_actual}</Badge>
                  </Td>
                  <Td className="text-text-secondary" numeric>
                    {a.stock_minimo}
                  </Td>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function Kpi({
  icon: Icon,
  titulo,
  valor,
  contexto,
  alerta,
}: {
  icon: typeof Package;
  titulo: string;
  valor: string;
  contexto: string;
  alerta?: boolean;
}) {
  return (
    <Card>
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          alerta ? "bg-danger-bg" : "bg-primary/10",
        )}
      >
        <Icon className={cn("h-4.5 w-4.5", alerta ? "text-danger" : "text-primary")} />
      </div>
      <p className="mt-3 text-sm text-text-secondary">{titulo}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tracking-tight",
          alerta ? "text-danger" : "text-text-primary",
        )}
      >
        {valor}
      </p>
      <p className="mt-1 text-xs text-text-secondary">{contexto}</p>
    </Card>
  );
}
```

Falta el import de `cn` — agregar `import { cn } from "@/lib/utils";` junto a los
demás imports.

- [ ] **Step 2: Recolorear `movimientos-chart.tsx`** a tokens sky/amber:

```tsx
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type PuntoMovimiento = {
  fecha: string;
  entradas: number;
  salidas: number;
};

export function MovimientosChart({ data }: { data: PuntoMovimiento[] }) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-text-secondary">
        Sin movimientos en el período.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="fecha" fontSize={12} stroke="#64748b" />
        <YAxis fontSize={12} stroke="#64748b" allowDecimals={false} />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            fontSize: 13,
          }}
        />
        <Legend />
        <Bar dataKey="entradas" name="Entradas" fill="#0284c7" radius={[3, 3, 0, 0]} />
        <Bar dataKey="salidas" name="Salidas" fill="#d97706" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 3: Verificar compilación y visual**

Run: `npm run build`
Expected: build exitoso, sin errores de tipos por el `cn` faltante corregido.
Manual: abrir `/dashboard`, confirmar KPIs, gráfico y tabla de alertas (probar con
y sin alertas si es posible).

---

## Task 9: Productos (tabla + modal)

**Files:**
- Modify: `components/admin/productos-client.tsx`

**Interfaces:**
- Consumes: `PageHeader`, `Table/TableHead/TableBody/TableRow/Th/Td`, `EmptyState`,
  `Modal` (todas de tareas previas). No cambia ninguna firma de `actions.ts`.

- [ ] **Step 1: Migrar el header, la tabla y el modal**

Reemplazar el bloque de header:

```tsx
import { PackageSearch } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
// ...mantener el resto de imports existentes (Button, Input/Label/Select, Card/Badge, formatColones, actions, tipos)
```

```tsx
return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Catálogo de productos del inventario."
        actions={esAdmin && <Button onClick={abrirNuevo}>Nuevo producto</Button>}
      />

      <Input
        placeholder="Buscar por nombre o código..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="max-w-sm"
      />

      <Card className="overflow-hidden p-0">
        {filtrados.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="Sin productos"
            description={
              busqueda
                ? "No hay productos que coincidan con la búsqueda."
                : "Todavía no hay productos registrados."
            }
          />
        ) : (
          <Table className="min-w-[720px]">
            <TableHead>
              <tr>
                <Th>Código</Th>
                <Th>Nombre</Th>
                <Th>Categoría</Th>
                <Th>Stock</Th>
                <Th>Precio</Th>
                <Th>Estado</Th>
                {esAdmin && <Th />}
              </tr>
            </TableHead>
            <TableBody>
              {filtrados.map((p) => {
                const bajo = p.stock_actual <= p.stock_minimo;
                return (
                  <TableRow key={p.id}>
                    <Td className="font-mono text-xs">{p.codigo}</Td>
                    <Td>{p.nombre}</Td>
                    <Td className="text-text-secondary">
                      {p.categorias?.nombre ?? "—"}
                    </Td>
                    <Td>
                      <Badge tone={bajo ? "red" : "green"}>
                        {p.stock_actual} {p.unidad}
                      </Badge>
                    </Td>
                    <Td numeric>{formatColones(p.precio)}</Td>
                    <Td>
                      <Badge tone={p.activo ? "sky" : "gray"}>
                        {p.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </Td>
                    {esAdmin && (
                      <Td>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => abrirEdicion(p)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={pending}
                            onClick={() => cambiarActivo(p)}
                          >
                            {p.activo ? "Desactivar" : "Activar"}
                          </Button>
                        </div>
                      </Td>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={editandoId ? "Editar producto" : "Nuevo producto"}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label>Código</Label>
            <Input
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            />
          </div>
          <div>
            <Label>Nombre</Label>
            <Input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Descripción</Label>
            <Input
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </div>
          <div>
            <Label>Categoría</Label>
            <Select
              value={form.categoria_id}
              onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
            >
              <option value="">Sin categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Proveedor</Label>
            <Select
              value={form.proveedor_id}
              onChange={(e) => setForm({ ...form, proveedor_id: e.target.value })}
            >
              <option value="">Sin proveedor</option>
              {proveedores.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.nombre}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Unidad</Label>
            <Input
              value={form.unidad}
              onChange={(e) => setForm({ ...form, unidad: e.target.value })}
            />
          </div>
          <div>
            <Label>Stock mínimo</Label>
            <Input
              type="number"
              min="0"
              value={form.stock_minimo}
              onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })}
            />
          </div>
          <div>
            <Label>Precio (₡)</Label>
            <Input
              type="number"
              min="0"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
            />
          </div>
        </div>

        {editandoId && (
          <p className="mt-3 text-xs text-text-secondary">
            El stock actual se ajusta solo desde Movimientos.
          </p>
        )}
        {error && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalAbierto(false)} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={guardar} disabled={pending}>
            {pending ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </Modal>
    </div>
  );
```

El resto del componente (estado, `abrirNuevo`, `abrirEdicion`, `guardar`,
`cambiarActivo`, `filtrados`) no cambia.

- [ ] **Step 2: Verificar compilación y flujo funcional**

Run: `npm run build`
Expected: build exitoso.
Manual: abrir `/productos` como admin, crear un producto, editarlo, desactivarlo —
confirmar que el modal abre/cierra, bloquea scroll, cierra con Escape, y que el
guardado sigue llamando a las Server Actions sin cambios.

---

## Task 10: Movimientos

**Files:**
- Modify: `components/admin/movimientos-client.tsx`

- [ ] **Step 1: Migrar header y tabla** (mismo patrón que Task 9: `PageHeader` en
  vez de `<h1>`, `Table/TableHead/TableBody/TableRow/Th/Td` en vez de `<table>`
  crudo, `EmptyState` con ícono `ArrowLeftRight` cuando `movimientos.length === 0`).
  El formulario de registro (`Card` con `Select`/`Input`/`Button`) mantiene su
  lógica intacta, solo se envuelve el título con `PageHeader`.

```tsx
import { ArrowLeftRight } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
// mantener el resto de imports
```

```tsx
<PageHeader title="Movimientos" description="Entradas y salidas de inventario." />
```

```tsx
<Card className="overflow-hidden p-0">
  {movimientos.length === 0 ? (
    <EmptyState icon={ArrowLeftRight} title="Sin movimientos" description="Todavía no se ha registrado ningún movimiento." />
  ) : (
    <Table className="min-w-[720px]">
      <TableHead>
        <tr>
          <Th>Fecha</Th>
          <Th>Producto</Th>
          <Th>Tipo</Th>
          <Th>Cantidad</Th>
          <Th>Stock resultante</Th>
          <Th>Usuario</Th>
          <Th>Motivo</Th>
        </tr>
      </TableHead>
      <TableBody>
        {movimientos.map((m) => (
          <TableRow key={m.id}>
            <Td className="whitespace-nowrap text-text-secondary">{formatFecha(m.created_at)}</Td>
            <Td>{m.productos?.nombre ?? "—"}</Td>
            <Td>
              <Badge tone={m.tipo === "entrada" ? "green" : "amber"}>{m.tipo}</Badge>
            </Td>
            <Td numeric>{m.cantidad}</Td>
            <Td numeric>{m.stock_resultante}</Td>
            <Td className="text-text-secondary">{m.profiles?.nombre ?? "—"}</Td>
            <Td className="text-text-secondary">{m.motivo ?? "—"}</Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )}
</Card>
```

- [ ] **Step 2: Verificar compilación y flujo funcional**

Run: `npm run build`
Expected: build exitoso.
Manual: registrar un movimiento de entrada y uno de salida, confirmar validación de
stock insuficiente sigue funcionando (mensaje de error rojo con el mismo texto que
retorna `registrarMovimiento`).

---

## Task 11: Categorías y Proveedores

**Files:**
- Modify: `app/(admin)/categorias/page.tsx`
- Modify: `app/(admin)/proveedores/page.tsx`

- [ ] **Step 1: Migrar ambas pantallas** al mismo patrón: `PageHeader` (sin
  `actions`, ya que el formulario de alta vive en su propia `Card` como hoy),
  `Table/TableHead/TableBody/TableRow/Th/Td`, `EmptyState` (`Tags` para categorías,
  `Truck` para proveedores). Los `<form action={...}>` de Server Actions inline
  (`crearCategoria`, `toggleCategoria`, `crearProveedor`, `toggleProveedor`) no
  cambian ni de firma ni de ubicación — solo se restylean sus `Input`/`Button` ya
  actualizados en Task 2 (heredan el estilo automáticamente, sin tocar JSX del
  formulario).

```tsx
// categorias/page.tsx — reemplazo del <h1> y la tabla
import { Tags } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
```

```tsx
<PageHeader title="Categorías" description="Clasificación de productos del inventario." />
```

```tsx
<Card className="overflow-hidden p-0">
  {(categorias ?? []).length === 0 ? (
    <EmptyState icon={Tags} title="Sin categorías" description="Agregá la primera categoría desde el formulario de arriba." />
  ) : (
    <Table className="min-w-[480px]">
      <TableHead>
        <tr>
          <Th>Nombre</Th>
          <Th>Descripción</Th>
          <Th>Estado</Th>
          {esAdmin && <Th />}
        </tr>
      </TableHead>
      <TableBody>
        {(categorias ?? []).map((c) => (
          <TableRow key={c.id}>
            <Td>{c.nombre}</Td>
            <Td className="text-text-secondary">{c.descripcion ?? "—"}</Td>
            <Td>
              <Badge tone={c.activo ? "sky" : "gray"}>{c.activo ? "Activa" : "Inactiva"}</Badge>
            </Td>
            {esAdmin && (
              <Td className="text-right">
                <form action={toggleCategoria}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="activo" value={String(c.activo)} />
                  <Button variant="ghost" size="sm" type="submit">
                    {c.activo ? "Desactivar" : "Activar"}
                  </Button>
                </form>
              </Td>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )}
</Card>
```

Aplicar el mismo reemplazo (título/descripción/`EmptyState` con ícono `Truck`,
`Table` con las columnas Nombre/Contacto/Teléfono/Email/Estado) en
`proveedores/page.tsx`.

- [ ] **Step 2: Verificar compilación y flujo funcional**

Run: `npm run build`
Expected: build exitoso.
Manual: crear una categoría y un proveedor, activar/desactivar, confirmar que las
Server Actions inline siguen revalidando la ruta correctamente.

---

## Task 12: Usuarios

**Files:**
- Modify: `app/(admin)/usuarios/page.tsx`

- [ ] **Step 1: Migrar al mismo patrón** (`PageHeader` con la descripción existente
  sobre Supabase Auth, `Table`, `EmptyState` con ícono `Users`). Los formularios
  `cambiarRol`/`toggleActivo` no cambian.

```tsx
import { Users } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
```

```tsx
<PageHeader
  title="Usuarios"
  description="La creación de cuentas se hace desde Supabase Auth. Acá se administra el rol y el estado de los perfiles existentes."
/>
```

```tsx
<Card className="overflow-hidden p-0">
  {(usuarios ?? []).length === 0 ? (
    <EmptyState icon={Users} title="Sin usuarios" />
  ) : (
    <Table className="min-w-[640px]">
      <TableHead>
        <tr>
          <Th>Nombre</Th>
          <Th>Rol</Th>
          <Th>Estado</Th>
          <Th>Alta</Th>
          <Th />
        </tr>
      </TableHead>
      <TableBody>
        {(usuarios ?? []).map((u) => (
          <TableRow key={u.id}>
            <Td>{u.nombre}</Td>
            <Td>
              <form action={cambiarRol} className="flex items-center gap-2">
                <input type="hidden" name="id" value={u.id} />
                <Select name="rol" defaultValue={u.rol} className="h-9 w-32">
                  <option value="operador">operador</option>
                  <option value="admin">admin</option>
                </Select>
                <Button variant="secondary" size="sm" type="submit">
                  Guardar
                </Button>
              </form>
            </Td>
            <Td>
              <Badge tone={u.activo ? "green" : "gray"}>{u.activo ? "Activo" : "Inactivo"}</Badge>
            </Td>
            <Td className="whitespace-nowrap text-text-secondary">{formatFecha(u.created_at)}</Td>
            <Td className="text-right">
              <form action={toggleActivo}>
                <input type="hidden" name="id" value={u.id} />
                <input type="hidden" name="activo" value={String(u.activo)} />
                <Button variant="ghost" size="sm" type="submit">
                  {u.activo ? "Desactivar" : "Activar"}
                </Button>
              </form>
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )}
</Card>
```

- [ ] **Step 2: Verificar compilación y flujo funcional**

Run: `npm run build`
Expected: build exitoso.
Manual: cambiar el rol de un usuario de prueba y su estado activo, confirmar que
sigue funcionando igual.

---

## Task 13: Reportes

**Files:**
- Modify: `components/admin/reportes-client.tsx`

- [ ] **Step 1: Migrar header y tabla** (`PageHeader`, `Table`, `EmptyState` con
  ícono `FileBarChart`). Los botones de exportar PDF/Excel y su lógica
  (`exportarPDF`, `exportarExcel`) no cambian.

```tsx
import { FileBarChart } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
```

```tsx
<PageHeader title="Reportes" description="Exportá el estado del inventario o el historial de movimientos." />
```

```tsx
<Card className="overflow-hidden p-0">
  {filas.length === 0 ? (
    <EmptyState icon={FileBarChart} title="Sin datos" description="No hay información para este reporte todavía." />
  ) : (
    <Table className="min-w-[640px]">
      <TableHead>
        <tr>
          {columnas.map((c) => (
            <Th key={c}>{c}</Th>
          ))}
        </tr>
      </TableHead>
      <TableBody>
        {filas.map((fila, i) => (
          <TableRow key={i}>
            {fila.map((celda, j) => (
              <Td key={j}>{celda}</Td>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )}
</Card>
```

- [ ] **Step 2: Verificar compilación y flujo funcional**

Run: `npm run build`
Expected: build exitoso.
Manual: exportar PDF y Excel de ambos reportes, confirmar que los archivos
descargados no cambiaron (la migración es solo de la tabla en pantalla).

---

## Task 14: Skeletons por ruta admin

**Files:**
- Create: `app/(admin)/dashboard/loading.tsx`
- Create: `app/(admin)/productos/loading.tsx`
- Create: `app/(admin)/movimientos/loading.tsx`
- Create: `app/(admin)/categorias/loading.tsx`
- Create: `app/(admin)/proveedores/loading.tsx`
- Create: `app/(admin)/usuarios/loading.tsx`
- Create: `app/(admin)/reportes/loading.tsx`

**Interfaces:**
- Consumes: `Skeleton`, `SkeletonTable` (Task 3).

- [ ] **Step 1: Crear un skeleton genérico de pantalla con tabla** — mismo
  contenido para `productos`, `movimientos`, `categorias`, `proveedores`,
  `usuarios`, `reportes` (ajustando `rows`/`cols` si se quiere, pero el default
  sirve para las seis):

```tsx
import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Card className="p-0">
        <SkeletonTable rows={6} cols={5} />
      </Card>
    </div>
  );
}
```

Copiar este archivo literal a `productos/loading.tsx`, `movimientos/loading.tsx`,
`categorias/loading.tsx`, `proveedores/loading.tsx`, `usuarios/loading.tsx`,
`reportes/loading.tsx`.

- [ ] **Step 2: Crear el skeleton de `dashboard/loading.tsx`** (con espacio para
  KPIs + gráfico + tabla):

```tsx
import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="mt-3 h-4 w-24" />
            <Skeleton className="mt-2 h-7 w-20" />
          </Card>
        ))}
      </div>
      <Card>
        <Skeleton className="h-4 w-56" />
        <Skeleton className="mt-4 h-64 w-full" />
      </Card>
      <Card className="p-0">
        <SkeletonTable rows={4} cols={4} />
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Verificar compilación y comportamiento**

Run: `npm run build`
Expected: build exitoso.
Manual: en `npm run dev`, forzar un throttle de red (DevTools) y navegar entre
rutas admin para confirmar que el skeleton se muestra brevemente antes del
contenido real.

---

## Task 15: Verificación final

**Files:** ninguno (solo comandos y revisión manual).

- [ ] **Step 1: Build y lint completos**

Run: `npm run build && npm run lint`
Expected: ambos comandos terminan sin errores.

- [ ] **Step 2: Recorrido manual completo**

Manual, en `npm run dev`, en viewport desktop y 375px:
- `/` (landing): hero, onda SVG, servicios, contacto, header sticky con blur al
  scrollear.
- `/login`: fondo degradado, error visual con ícono.
- `/dashboard`, `/productos`, `/movimientos`, `/categorias`, `/proveedores`,
  `/usuarios`, `/reportes`: `PageHeader`, tablas, `EmptyState` (vaciar un filtro de
  búsqueda en productos para verlo), modal de productos (abrir/cerrar/Escape/scroll
  lock), sidebar (activo, drawer móvil), skeleton al navegar.

- [ ] **Step 3: Confirmar que no se tocó lógica de negocio**

Run: `git diff --stat -- 'app/**/actions.ts' 'app/login/actions.ts' 'supabase/'` (si
se decide inicializar git) o revisión manual de que esos archivos no aparecen en la
lista de archivos modificados de este plan (Tasks 1–14 no los listan como
`Modify`).
Expected: sin cambios en Server Actions, RPC ni SQL.
