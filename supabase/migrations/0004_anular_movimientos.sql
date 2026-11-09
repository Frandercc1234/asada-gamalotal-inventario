-- =============================================================
-- Anulación de movimientos.
-- Un movimiento no se edita ni se borra: se registra el movimiento
-- contrario, enlazado con el original, y queda el historial completo.
-- =============================================================
alter table public.movimientos
  add column anula_a bigint references public.movimientos (id),
  add constraint movimientos_anula_a_unico unique (anula_a);

create function public.anular_movimiento(
  p_movimiento_id bigint,
  p_motivo text
)
returns public.movimientos
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario  uuid := auth.uid();
  v_original public.movimientos;
  v_tipo     public.tipo_movimiento;
  v_stock    numeric;
  v_nuevo    numeric;
  v_mov      public.movimientos;
begin
  if v_usuario is null then
    raise exception 'Sesión requerida';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = v_usuario and activo and rol = 'admin'
  ) then
    raise exception 'Solo un administrador puede anular movimientos';
  end if;

  if coalesce(trim(p_motivo), '') = '' then
    raise exception 'El motivo es obligatorio';
  end if;

  -- El bloqueo evita que dos personas anulen el mismo movimiento a la vez.
  select * into v_original
  from public.movimientos where id = p_movimiento_id for update;

  if not found then
    raise exception 'Movimiento no encontrado';
  end if;

  if v_original.anula_a is not null then
    raise exception 'Una anulación no se puede anular';
  end if;

  if exists (
    select 1 from public.movimientos where anula_a = p_movimiento_id
  ) then
    raise exception 'Este movimiento ya fue anulado';
  end if;

  select stock_actual into v_stock
  from public.productos where id = v_original.producto_id for update;

  if v_original.tipo = 'entrada' then
    if v_stock < v_original.cantidad then
      raise exception 'Stock insuficiente para anular. Disponible: %', v_stock;
    end if;
    v_tipo := 'salida';
    v_nuevo := v_stock - v_original.cantidad;
  else
    v_tipo := 'entrada';
    v_nuevo := v_stock + v_original.cantidad;
  end if;

  update public.productos
    set stock_actual = v_nuevo, updated_at = now()
    where id = v_original.producto_id;

  insert into public.movimientos
    (producto_id, tipo, cantidad, motivo, stock_resultante, usuario_id, anula_a)
  values (
    v_original.producto_id, v_tipo, v_original.cantidad,
    'Anulación de #' || p_movimiento_id || ': ' || trim(p_motivo),
    v_nuevo, v_usuario, p_movimiento_id
  )
  returning * into v_mov;

  return v_mov;
end;
$$;

revoke execute on function public.anular_movimiento from public, anon;
grant execute on function public.anular_movimiento to authenticated;
