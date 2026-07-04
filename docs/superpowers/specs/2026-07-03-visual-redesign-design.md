# Rediseño visual — Sistema de Inventario ASADA Gamalotal

Fecha: 2026-07-03

## Objetivo

Elevar el nivel visual de toda la app (landing pública, login, panel admin) para que
se vea como trabajo de agencia: cuidado en spacing, tipografía, jerarquía y
consistencia — sin recargar. Tono profesional, confiable, con un guiño sutil al agua.
Cambio de **presentación únicamente**: no se toca lógica de negocio, Server Actions,
RPC (`registrar_movimiento`), RLS, ni el esquema de datos.

## Alcance

Todas las pantallas existentes:
- `app/(public)/page.tsx` (landing) y su layout
- `app/login/page.tsx`
- Shell admin: `app/(admin)/layout.tsx` + `components/admin/sidebar.tsx`
- `app/(admin)/dashboard`, `productos`, `movimientos`, `categorias`, `proveedores`,
  `reportes`, `usuarios`

Fuera de alcance: nuevas features, cambios de rutas, cambios de RLS/roles, cambios de
esquema SQL.

## 1. Fundaciones

**Tipografía**: reemplazar `Geist` por `Inter` vía `next/font/google` en
`app/layout.tsx`. Pesos: 400 texto, 500 labels, 600/700 títulos. `tracking-tight` en
títulos.

**Tokens** (`app/globals.css`, bloque `@theme`): variables para `--color-primary`
(sky-600 acción / sky-700 hover), `--color-surface`, `--color-border`,
`--color-text-primary/secondary`, `--color-success` (verde), `--color-warning`
(ámbar), `--color-danger` (rojo). Todos los componentes consumen estos tokens; no se
usan clases de color Tailwind sueltas fuera de `globals.css` y los componentes `ui`.

**Radios y sombras**: `rounded-xl` en cards, `rounded-lg` en controles. `shadow-sm`
base, `shadow-md` en hover de elementos interactivos (cards clicables, botones).

**Densidad**: `p-6` en cards, separación generosa entre secciones (`space-y-6`/`8`).

## 2. Componentes (`components/ui`)

Se extiende la librería existente, sin romper las firmas usadas por las pantallas:

- `Button` — variantes `primary/secondary/ghost/danger` ya existen; se refuerzan
  estados hover/active/focus-visible/disabled. Tamaños: `sm` (36px, para acciones
  densas en filas de tabla), `md` (40px, default), `lg` (44px, CTAs de landing).
- `Input` / `Select` / `Label` — anillo de foco accesible, estado de error con ícono
  (`lucide-react`) y texto rojo.
- `Card` — migra a tokens, mantiene la API actual.
- `Badge` — tonos `gray/green/red/amber/sky` mapeados a los tokens de estado.
- **Nuevo `Table`** (`components/ui/table.tsx`): `Table`, `TableHead` (sticky),
  `TableRow` (hover), `TableCell` (`tabular-nums` para números). Reemplaza los
  `<table>` crudos repetidos en 6 pantallas.
- **Nuevo `Modal`** (`components/ui/modal.tsx`): overlay semitransparente, entrada
  fade + scale (150–200ms), bloqueo de scroll del body mientras está abierto, cierre
  con Escape. Reemplaza el modal inline de `productos-client.tsx`.
- **Nuevo `PageHeader`** (`components/admin/page-header.tsx`): título + descripción
  corta + slot de acciones a la derecha. Reutilizado en las 7 pantallas admin en vez
  de `<h1>` sueltos.
- **Nuevo `EmptyState`** (`components/ui/empty-state.tsx`): ícono + mensaje + acción
  opcional. Reemplaza las filas "Sin productos." / "Sin movimientos." etc.
- **Nuevo `Skeleton`/`SkeletonTable`** (`components/ui/skeleton.tsx`): bloques
  animados (`animate-pulse`) para cards y filas de tabla.

**Íconos**: se instala `lucide-react`. Uso: nav del sidebar, chips de KPI, tarjetas
de servicio en landing, bloque de contacto, tarjeta de alertas, estados vacíos,
mensajes de error de formulario.

## 3. Estados de carga

Se agrega `loading.tsx` en cada carpeta de ruta admin (`dashboard`, `productos`,
`movimientos`, `categorias`, `proveedores`, `usuarios`, `reportes`). Next.js
App Router muestra automáticamente ese skeleton via Suspense mientras el Server
Component de la página (que ya hace `await` a Supabase) resuelve — no requiere
reestructurar el data fetching existente.

## 4. Landing pública

- Header sticky con blur al hacer scroll (`backdrop-blur` + fondo semitransparente).
  Nav con anclas a "Servicios" y "Contacto"; en móvil colapsa a botón hamburguesa
  (Sheet simple con overlay, reutilizable con el mismo patrón del drawer admin).
- Hero: degradado sutil sky→white, título grande con `tracking-tight`, subtítulo,
  un CTA primario ("Panel administrativo") y uno secundario fantasma (ej. "Conocer
  más" que ancla a Servicios). Onda SVG suave al pie del hero.
- Servicios: tarjetas con ícono (`lucide-react`), hover con elevación (`shadow-md`).
- Contacto: bloque con íconos de ubicación/teléfono/horario alineados.
- Footer prolijo con la información institucional actual.

## 5. Panel admin

- **Sidebar**: ícono por sección (`lucide-react`), ítem activo con fondo sky-50 +
  barra de acento, hover sutil, sección de usuario abajo con avatar de iniciales +
  rol. En móvil: drawer con overlay y animación de entrada/salida (reemplaza el
  toggle `hidden`/`block` actual).
- **Dashboard**: KPI cards con ícono en chip de color tenue, número grande, label y
  variación/contexto corto. Gráfico (`recharts`) recoloreado a sky/amber con grid y
  ejes en slate tenue, tooltip limpio. Tarjeta de alertas con acento rojo/ámbar y
  cada ítem mostrando el faltante con claridad.
- **Productos / Movimientos / Categorías / Proveedores / Usuarios / Reportes**:
  migran su tabla cruda al componente `Table`, su `<h1>` al `PageHeader`, sus filas
  "sin datos" al `EmptyState`, y (productos) su modal inline al componente `Modal`.
  La lógica de Server Actions, validaciones y RPC no cambia.

## Fuera de alcance / no-goals

- No se agregan roles, tablas ni columnas nuevas.
- No se cambia ninguna Server Action ni la función `registrar_movimiento`.
- No se agrega gestión de estado global ni librerías de UI pesadas (no shadcn, no
  Radix): los primitivos se construyen a mano sobre Tailwind, consistente con
  "no sobreingenierizar" de `CLAUDE.md`.

## Orden de implementación

1. Fundaciones: fuente, tokens en `globals.css`.
2. Componentes `ui` (Button/Input/Card/Badge actualizados + Table/Modal/EmptyState/
   Skeleton nuevos) + `PageHeader` admin. Instalar `lucide-react`.
3. Landing + login.
4. Shell admin (layout + sidebar).
5. Dashboard.
6. Resto de pantallas admin (productos, movimientos, categorías, proveedores,
   usuarios, reportes) + `loading.tsx` por ruta.
7. `npm run build` + `npm run lint`, smoke test manual en navegador (desktop y
   móvil), corregir lo que falle.

## Verificación

- `npm run build` debe pasar sin errores antes de dar por terminado.
- `npm run lint` limpio.
- Revisión visual manual en el navegador: landing, login, y cada pantalla admin, en
  viewport desktop y móvil (375px).
- Confirmar que ninguna Server Action, RPC o política RLS cambió (diff de
  `app/**/actions.ts`, `supabase/` debe estar vacío).
