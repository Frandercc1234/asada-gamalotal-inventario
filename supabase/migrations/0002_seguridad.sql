-- =============================================================
-- Endurecimiento de seguridad
-- 1. El rol ya NO se toma de user_metadata al crear usuarios
--    (cualquiera que se registre podría autoasignarse 'admin').
-- 2. La vista de alertas respeta RLS (security_invoker) y no es
--    visible para anon.
-- 3. registrar_movimiento exige usuario autenticado y perfil
--    activo, y solo puede ejecutarla un usuario autenticado.
-- 4. Checks de datos: precio y stock_minimo no negativos.
-- 5. Índices para el historial de movimientos.
-- =============================================================

-- 1. Alta de perfil: siempre operador; el admin asigna roles después.
create or replace function public.handle_new_user()
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
    'operador'
  );
  return new;
end;
$$;

-- 2. Vista de alertas: correr con permisos del que consulta (RLS aplica).
alter view public.v_alertas_stock set (security_invoker = true);
revoke all on public.v_alertas_stock from anon;

-- 3. RPC: exigir sesión y perfil activo; ejecutable solo por authenticated.
create or replace function public.registrar_movimiento(
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
  v_activo       boolean;
begin
  if v_usuario is null then
    raise exception 'Sesión requerida';
  end if;

  select activo into v_activo
  from public.profiles where id = v_usuario;

  if v_activo is distinct from true then
    raise exception 'Usuario inactivo';
  end if;

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

revoke execute on function public.registrar_movimiento from public, anon;
grant execute on function public.registrar_movimiento to authenticated;

-- mi_rol tampoco tiene por qué ser ejecutable por anon.
revoke execute on function public.mi_rol from public, anon;
grant execute on function public.mi_rol to authenticated;

-- 4. Datos: nada de precios ni mínimos negativos.
alter table public.productos
  add constraint productos_precio_no_negativo check (precio >= 0),
  add constraint productos_stock_minimo_no_negativo check (stock_minimo >= 0);

-- 5. Índices para listados e historial.
create index movimientos_created_at_idx on public.movimientos (created_at desc);
create index movimientos_producto_id_idx on public.movimientos (producto_id);
