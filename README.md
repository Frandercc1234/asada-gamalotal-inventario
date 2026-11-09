# Sistema de Inventario — ASADA Gamalotal

Aplicación web para administrar el inventario de una ASADA (acueducto rural comunitario de Costa Rica): qué materiales hay, qué entró, qué salió y qué está por agotarse. Incluye una página pública informativa y un panel interno para el personal.

**Sitio publicado:** [asada-gamalotal-inventario.vercel.app](https://asada-gamalotal-inventario.vercel.app/)

## El problema

El personal de una ASADA necesita saber con certeza cuánto material tiene y quién lo movió, muchas veces desde el celular y sin conocimientos técnicos. Si cualquiera puede editar las existencias a mano, el número deja de ser confiable.

Por eso, en este sistema el stock no se edita: cambia solamente al registrar una entrada o una salida, y cada movimiento queda en el historial con su usuario y su fecha.

## Funcionalidades

- Dashboard con valor del inventario, alertas y gráfico de entradas y salidas de los últimos 30 días.
- Gestión de productos, categorías y proveedores.
- Registro de entradas y salidas con validación de existencias.
- Alertas de productos con stock igual o menor al mínimo.
- Reportes de inventario y movimientos exportables a PDF y Excel.
- Administración de roles y usuarios activos.
- Diseño responsive para computadora y celular.

## Tecnologías

| Área | Herramientas |
|---|---|
| Aplicación | Next.js 16 (App Router), React 19, TypeScript |
| Estilos | Tailwind CSS v4 |
| Base de datos y autenticación | Supabase (PostgreSQL, Auth, RLS) |
| Gráficos | Recharts |
| Exportación | jsPDF, jspdf-autotable, ExcelJS |

## Decisiones técnicas

**El stock solo cambia mediante una transacción.** La función de PostgreSQL `registrar_movimiento` bloquea la fila del producto, valida que haya existencias en las salidas, actualiza el stock y crea el movimiento en una sola operación. Dos salidas simultáneas no pueden dejar el stock en negativo, y la tabla de movimientos no permite inserciones directas.

**Los permisos están en la base de datos.** Row Level Security aplica las reglas aunque alguien evite la interfaz:

| Acción | `admin` | `operador` |
|---|---|---|
| Consultar inventario, alertas y movimientos | Sí | Sí |
| Registrar movimientos | Sí | Sí |
| Modificar productos, categorías y proveedores | Sí | No |
| Administrar usuarios | Sí | No |

**Sin una capa de backend adicional.** Para un inventario de poco volumen, Server Components, Server Actions y funciones de PostgreSQL alcanzan y mantienen el proyecto simple.

## Estructura

```text
app/(public)/     página informativa
app/(admin)/      dashboard, productos, categorías, proveedores,
                  movimientos, reportes y usuarios
app/login/        inicio de sesión con Server Actions
components/       interfaz, panel administrativo y gráficos
lib/supabase/     clientes de Supabase para navegador y servidor
lib/export/       generación de PDF y Excel
supabase/         migraciones SQL y datos de ejemplo
proxy.ts          protección de rutas y refresco de sesión
```

## Instalación

Requisitos: Node.js 20.9 o superior y un proyecto de [Supabase](https://supabase.com).

1. Instalá las dependencias:

   ```bash
   npm install
   ```

2. Copiá `.env.local.example` como `.env.local` y completá la URL y la clave pública de tu proyecto.

3. En el SQL Editor de Supabase, ejecutá en este orden:

   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_seguridad.sql`

4. En **Authentication > Users**, creá un usuario. Se registra como `operador`; para convertirlo en administrador, ejecutá:

   ```sql
   update public.profiles set rol = 'admin' where id = 'ID_DEL_USUARIO';
   ```

5. Opcional: cargá datos ficticios ejecutando `supabase/demo.sql`. El script reinicia los datos de la demo y se detiene sin cambiar nada si encuentra productos o movimientos reales.

6. Iniciá la aplicación:

   ```bash
   npm run dev
   ```

   Quedará disponible en `http://localhost:3000`.

## Comandos

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el entorno de desarrollo |
| `npm run build` | Genera la versión de producción |
| `npm run start` | Ejecuta la versión de producción |
| `npm run lint` | Revisa el código con ESLint |
