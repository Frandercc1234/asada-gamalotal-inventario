-- =============================================================
-- El personal autenticado puede ver quién registró cada movimiento.
-- Antes un operador solo leía su propio perfil y los movimientos
-- de otros usuarios aparecían sin nombre.
-- La escritura sigue siendo solo para admin (profiles_admin_write)
-- y anon sigue sin acceso.
-- =============================================================
drop policy profiles_select_own on public.profiles;

create policy profiles_select on public.profiles
  for select to authenticated
  using (true);
