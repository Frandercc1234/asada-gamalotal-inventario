-- =============================================================
-- Datos de demostración (ficticios). Correr en el SQL Editor.
-- Reinicia el catálogo y los movimientos de la demo: se puede repetir
-- y las fechas siempre quedan dentro de los últimos 30 días.
--
-- Se niega a correr si encuentra productos o movimientos que no sean
-- de la demo. Requiere un usuario con rol admin en profiles.
-- El stock se carga con registrar_movimiento, nunca a mano.
-- =============================================================
do $$
declare
  v_codigos text[] := array[
    'TUB-050', 'TUB-100', 'COD-050', 'VAL-050', 'PEG-PVC',
    'MED-050', 'BOM-001', 'QUI-CLO', 'QUI-REA', 'HER-LLA'
  ];
  v_admin uuid;
  v_mov   public.movimientos;
  m       record;
begin
  if exists (select 1 from public.productos where codigo <> all (v_codigos))
     or exists (
       select 1 from public.movimientos
       where motivo is null or motivo not like 'Demo: %'
     ) then
    raise exception 'La base tiene datos que no son de la demo; no se modificó nada.';
  end if;

  select id into v_admin
  from public.profiles
  where rol = 'admin' and activo
  order by created_at
  limit 1;

  if v_admin is null then
    raise exception 'Se necesita un usuario admin activo en profiles.';
  end if;

  -- registrar_movimiento exige sesión: se simula la del admin (solo esta transacción).
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', v_admin, 'role', 'authenticated')::text,
    true
  );

  delete from public.movimientos;
  delete from public.productos;
  delete from public.categorias
    where nombre in ('Tubería', 'Medición', 'Bombas', 'Químicos', 'Herramientas');
  delete from public.proveedores
    where nombre in ('Ferretería El Acueducto', 'Distribuidora Aguas Claras');

  insert into public.categorias (nombre, descripcion) values
    ('Tubería', 'Tubos y accesorios PVC'),
    ('Medición', 'Medidores de consumo'),
    ('Bombas', 'Bombas y motores'),
    ('Químicos', 'Cloro y tratamiento de agua'),
    ('Herramientas', 'Herramienta manual y eléctrica');

  insert into public.proveedores (nombre, contacto, telefono, email) values
    ('Ferretería El Acueducto', 'Contacto de ventas', '0000-0000', 'ventas@acueducto.example'),
    ('Distribuidora Aguas Claras', 'Contacto de ventas', '0000-0001', 'ventas@aguasclaras.example');

  insert into public.productos
    (codigo, nombre, categoria_id, proveedor_id, unidad, stock_minimo, precio)
  select v.codigo, v.nombre, c.id, p.id, v.unidad, v.minimo, v.precio
  from (values
    ('TUB-050', 'Tubo PVC 1/2"',          'Tubería',      'Ferretería El Acueducto',    'unidad', 20, 1200),
    ('TUB-100', 'Tubo PVC 1"',            'Tubería',      'Ferretería El Acueducto',    'unidad', 15, 2800),
    ('COD-050', 'Codo PVC 1/2"',          'Tubería',      'Ferretería El Acueducto',    'unidad', 30, 350),
    ('VAL-050', 'Válvula de bola 1/2"',   'Tubería',      'Ferretería El Acueducto',    'unidad', 8,  3900),
    ('PEG-PVC', 'Pegamento para PVC',     'Tubería',      'Ferretería El Acueducto',    'unidad', 4,  5200),
    ('MED-050', 'Medidor de agua 1/2"',   'Medición',     'Distribuidora Aguas Claras', 'unidad', 5,  32000),
    ('BOM-001', 'Bomba sumergible 1HP',   'Bombas',       'Distribuidora Aguas Claras', 'unidad', 1,  185000),
    ('QUI-CLO', 'Cloro granulado 1kg',    'Químicos',     'Distribuidora Aguas Claras', 'kg',     10, 4500),
    ('QUI-REA', 'Reactivo DPD para cloro','Químicos',     'Distribuidora Aguas Claras', 'unidad', 5,  6500),
    ('HER-LLA', 'Llave de tubo 14"',      'Herramientas', 'Ferretería El Acueducto',    'unidad', 2,  14500)
  ) as v(codigo, nombre, categoria, proveedor, unidad, minimo, precio)
  join public.categorias c on c.nombre = v.categoria
  join public.proveedores p on p.nombre = v.proveedor;

  for m in
    select v.dias, p.id as producto_id, v.tipo::public.tipo_movimiento as tipo,
           v.cantidad, v.motivo
    from (values
      (40, 'TUB-050', 'entrada', 120, 'Demo: stock inicial'),
      (40, 'TUB-100', 'entrada', 60,  'Demo: stock inicial'),
      (40, 'COD-050', 'entrada', 150, 'Demo: stock inicial'),
      (40, 'VAL-050', 'entrada', 40,  'Demo: stock inicial'),
      (40, 'PEG-PVC', 'entrada', 20,  'Demo: stock inicial'),
      (40, 'MED-050', 'entrada', 18,  'Demo: stock inicial'),
      (40, 'BOM-001', 'entrada', 3,   'Demo: stock inicial'),
      (40, 'QUI-CLO', 'entrada', 50,  'Demo: stock inicial'),
      (40, 'QUI-REA', 'entrada', 12,  'Demo: stock inicial'),
      (40, 'HER-LLA', 'entrada', 4,   'Demo: stock inicial'),
      (28, 'QUI-CLO', 'salida',  8,   'Demo: cloración semanal'),
      (27, 'TUB-050', 'salida',  18,  'Demo: reparación de fuga'),
      (26, 'COD-050', 'salida',  35,  'Demo: ampliación de ramal'),
      (25, 'MED-050', 'salida',  4,   'Demo: nuevas conexiones'),
      (24, 'TUB-100', 'salida',  12,  'Demo: ampliación de ramal'),
      (24, 'PEG-PVC', 'salida',  5,   'Demo: ampliación de ramal'),
      (23, 'VAL-050', 'salida',  8,   'Demo: mantenimiento de red'),
      (22, 'QUI-CLO', 'salida',  10,  'Demo: cloración semanal'),
      (21, 'BOM-001', 'salida',  1,   'Demo: cambio de bomba'),
      (20, 'QUI-REA', 'salida',  3,   'Demo: control de calidad'),
      (19, 'TUB-050', 'salida',  25,  'Demo: reparación de fuga'),
      (18, 'COD-050', 'salida',  30,  'Demo: reparación de fuga'),
      (17, 'QUI-CLO', 'salida',  9,   'Demo: cloración semanal'),
      (16, 'MED-050', 'salida',  3,   'Demo: reemplazo de medidores'),
      (15, 'TUB-100', 'salida',  20,  'Demo: cambio de tubería'),
      (15, 'HER-LLA', 'salida',  1,   'Demo: herramienta dañada'),
      (14, 'VAL-050', 'salida',  6,   'Demo: mantenimiento de red'),
      (13, 'QUI-CLO', 'entrada', 15,  'Demo: compra mensual'),
      (12, 'TUB-050', 'salida',  30,  'Demo: cambio de tubería'),
      (11, 'MED-050', 'entrada', 6,   'Demo: compra mensual'),
      (11, 'PEG-PVC', 'salida',  6,   'Demo: cambio de tubería'),
      (10, 'COD-050', 'salida',  28,  'Demo: cambio de tubería'),
      (9,  'TUB-050', 'entrada', 40,  'Demo: compra mensual'),
      (8,  'BOM-001', 'salida',  1,   'Demo: cambio de bomba'),
      (7,  'QUI-CLO', 'salida',  12,  'Demo: cloración semanal'),
      (6,  'TUB-100', 'salida',  16,  'Demo: reparación de fuga'),
      (6,  'QUI-REA', 'salida',  2,   'Demo: control de calidad'),
      (5,  'VAL-050', 'salida',  10,  'Demo: mantenimiento de red'),
      (4,  'TUB-050', 'salida',  22,  'Demo: reparación de fuga'),
      (3,  'COD-050', 'salida',  24,  'Demo: reparación de fuga'),
      (3,  'QUI-CLO', 'salida',  9,   'Demo: cloración semanal'),
      (2,  'MED-050', 'salida',  5,   'Demo: nuevas conexiones'),
      (2,  'PEG-PVC', 'salida',  9,   'Demo: reparación de fuga'),
      (1,  'QUI-CLO', 'salida',  9,   'Demo: cloración semanal')
    ) as v(dias, codigo, tipo, cantidad, motivo)
    join public.productos p on p.codigo = v.codigo
    order by v.dias desc
  loop
    v_mov := public.registrar_movimiento(m.producto_id, m.tipo, m.cantidad, m.motivo);

    -- Solo se ajusta la fecha para repartir el historial; el stock no se toca.
    update public.movimientos
      set created_at = now() - make_interval(days => m.dias, hours => m.dias % 5)
      where id = v_mov.id;
  end loop;
end;
$$;
