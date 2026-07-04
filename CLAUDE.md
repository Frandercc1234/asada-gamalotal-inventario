Sistema de Inventario — ASADA Gamalotal
App de inventario para una ASADA (acueducto rural). Página pública informativa + panel administrativo interno. Inventario chico, poco volumen. No sobreingenierizar.
Stack
Next.js 16 (App Router, Turbopack por defecto) + React 19 + TypeScript
Tailwind CSS v4
Supabase (Postgres + Auth + RLS) — backend y base de datos
Recharts (gráficos), jsPDF + jspdf-autotable (PDF), SheetJS/xlsx (Excel)

No usar NestJS ni otra capa de backend. La lógica va en Server Actions y, cuando necesita transacción, en funciones RPC de Postgres.
Comandos
npm run dev — desarrollo
npm run build — build de producción (correr antes de dar algo por terminado)
npm run lint — lint
Estructura
Proyecto sin carpeta src/. El alias @/* apunta a la raíz (ej. @/components/..., @/lib/...).

app/(public)/      landing informativa

app/(admin)/       panel: dashboard, productos, categorias, proveedores,

                   movimientos, reportes, usuarios

app/login/         auth con Server Actions

components/ui/      button, input, card, badge

components/admin/   sidebar, tablas, formularios

components/charts/  gráficos

lib/supabase/       clientes browser/server + middleware

lib/export/         pdf.ts, excel.ts

types/              tipos del dominio

supabase/           migraciones SQL + seed

proxy.ts            (en la raíz; Next 16 renombró middleware → proxy, runtime nodejs)
Reglas de negocio (importante)
El stock NUNCA se edita a mano. Solo se ajusta por movimientos que llaman a la función registrar_movimiento (transacción atómica, valida stock en salidas).
Escritura de catálogos (productos, categorías, proveedores): solo rol admin. Lectura: cualquier usuario autenticado.
Roles: admin y operador. La RLS ya lo controla; no bypassear.
Alertas de stock: vista v_alertas_stock (productos con stock ≤ mínimo).
Convenciones de código
Nombres del dominio en español (productos, movimientos, proveedores).
Componentes de servidor por defecto; "use client" solo cuando hace falta (estado, eventos, Recharts).
Data fetching en Server Components; mutaciones en Server Actions con revalidatePath.
Estructura por dominio, nada de archivos gigantes. Naming consistente.
Tailwind para estilos. Nada de CSS suelto ni inline styles.
Todo responsive. Probar en móvil siempre.
Cómo quiero que me respondas
En español, directo y conciso. Código primero, explicaciones mínimas.
No sobreingenierices. Si un CRUD no necesita abstracciones, no las agregues.
Si ves un problema en mi enfoque, decímelo directo con la alternativa concreta.
No entregues sin que compile (npm run build) y sin probarlo.
Nada de emojis. Negritas solo para lo crítico.
Supabase
Variables en .env.local (ver .env.local.example).
Migraciones en supabase/migrations/. Al cambiar el schema, actualizá el SQL ahí.
Regenerar tipos: npx supabase gen types typescript --project-id ID > types/database.types.ts
