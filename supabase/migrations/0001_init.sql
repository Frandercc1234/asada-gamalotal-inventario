-- =============================================================
-- Inventario ASADA Gamalotal — schema inicial
-- Tablas, enums, RLS, RPC transaccional y triggers.
-- El stock (productos.stock_actual) SOLO se ajusta vía registrar_movimiento.
-- =============================================================

-- Enums -------------------------------------------------------
create type public.rol_usuario as enum ('admin', 'operador');
create type public.tipo_movimiento as enum ('entrada', 'salida');

-- Perfiles (1:1 con auth.users) -------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nombre     text not null,
  rol        public.rol_usuario not null default 'operador',
  activo     boolean not null default true,
  created_at timestamptz not null default now()
);

-- Catálogos ---------------------------------------------------
create table public.categorias (
  id          bigint generated always as identity primary key,
  nombre      text not null unique,
  descripcion text,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.proveedores (
  id         bigint generated always as identity primary key,
  nombre     text not null,
  contacto   text,
  telefono   text,
  email      text,
  activo     boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.productos (
  id            bigint generated always as identity primary key,
  codigo        text not null unique,
  nombre        text not null,
  descripcion   text,
  categoria_id  bigint references public.categorias (id),
  proveedor_id  bigint references public.proveedores (id),
  unidad        text not null default 'unidad',
  stock_actual  numeric not null default 0,
  stock_minimo  numeric not null default 0,
  precio        numeric not null default 0,
  imagen_url    text,
  activo        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.movimientos (
  id               bigint generated always as identity primary key,
  producto_id      bigint not null references public.productos (id),
  tipo             public.tipo_movimiento not null,
  cantidad         numeric not null check (cantidad > 0),
  motivo           text,
  stock_resultante numeric not null,
  usuario_id       uuid not null references public.profiles (id),
  created_at       timestamptz not null default now()
);

-- Vista de alertas (stock por debajo o igual al mínimo) -------
create view public.v_alertas_stock as
  select id, codigo, nombre, stock_actual, stock_minimo
  from public.productos
  where activo = true and stock_actual <= stock_minimo;

-- Helper: rol del usuario actual ------------------------------
create function public.mi_rol()
returns public.rol_usuario
language sql
stable
security definer
set search_path = ''
as $$
  select rol from public.profiles where id = auth.uid();
$$;

-- Alta automática de perfil al crear un usuario en auth -------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nombre, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', new.email),
    coalesce((new.raw_user_meta_data->>'rol')::public.rol_usuario, 'operador')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RPC: único punto de ajuste de stock (transacción atómica) ---
create function public.registrar_movimiento(
  p_producto_id bigint,
  p_tipo public.tipo_movimiento,
  p_cantidad numeric,
  p_motivo text
)
returns public.movimientos
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_stock_actual numeric;
  v_nuevo_stock  numeric;
  v_mov          public.movimientos;
  v_usuario      uuid := auth.uid();
begin
  if p_cantidad <= 0 then
    raise exception 'La cantidad debe ser mayor a cero';
  end if;

  select stock_actual into v_stock_actual
  from public.productos where id = p_producto_id for update;

  if v_stock_actual is null then
    raise exception 'Producto no encontrado';
  end if;

  if p_tipo = 'salida' then
    if v_stock_actual < p_cantidad then
      raise exception 'Stock insuficiente. Disponible: %', v_stock_actual;
    end if;
    v_nuevo_stock := v_stock_actual - p_cantidad;
  else
    v_nuevo_stock := v_stock_actual + p_cantidad;
  end if;

  update public.productos
    set stock_actual = v_nuevo_stock, updated_at = now()
    where id = p_producto_id;

  insert into public.movimientos
    (producto_id, tipo, cantidad, motivo, stock_resultante, usuario_id)
  values
    (p_producto_id, p_tipo, p_cantidad, p_motivo, v_nuevo_stock, v_usuario)
  returning * into v_mov;

  return v_mov;
end;
$$;

-- =============================================================
-- RLS
-- Lectura: cualquier usuario autenticado.
-- Escritura de catálogos: solo rol admin.
-- movimientos: sin INSERT directo; se escribe solo por la RPC
--   (SECURITY DEFINER, que salta RLS). Lectura para autenticados.
-- =============================================================
alter table public.profiles    enable row level security;
alter table public.categorias  enable row level security;
alter table public.proveedores enable row level security;
alter table public.productos   enable row level security;
alter table public.movimientos enable row level security;

-- profiles
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.mi_rol() = 'admin');

create policy profiles_admin_write on public.profiles
  for all to authenticated
  using (public.mi_rol() = 'admin')
  with check (public.mi_rol() = 'admin');

-- categorias
create policy categorias_select on public.categorias
  for select to authenticated using (true);
create policy categorias_write on public.categorias
  for all to authenticated
  using (public.mi_rol() = 'admin')
  with check (public.mi_rol() = 'admin');

-- proveedores
create policy proveedores_select on public.proveedores
  for select to authenticated using (true);
create policy proveedores_write on public.proveedores
  for all to authenticated
  using (public.mi_rol() = 'admin')
  with check (public.mi_rol() = 'admin');

-- productos
create policy productos_select on public.productos
  for select to authenticated using (true);
create policy productos_write on public.productos
  for all to authenticated
  using (public.mi_rol() = 'admin')
  with check (public.mi_rol() = 'admin');

-- movimientos (solo lectura directa)
create policy movimientos_select on public.movimientos
  for select to authenticated using (true);
