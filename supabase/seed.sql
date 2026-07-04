-- Datos de prueba. El stock inicial se carga con movimientos de entrada
-- (nunca escribiendo productos.stock_actual a mano).
-- Nota: los usuarios se crean desde Supabase Auth; el trigger handle_new_user
-- genera su profile automáticamente.

insert into public.categorias (nombre, descripcion) values
  ('Tubería', 'Tubos y accesorios PVC'),
  ('Bombas', 'Bombas y motores'),
  ('Químicos', 'Cloro y tratamiento de agua'),
  ('Herramientas', 'Herramienta manual y eléctrica')
on conflict (nombre) do nothing;

insert into public.proveedores (nombre, contacto, telefono, email) values
  ('Ferretería El Acueducto', 'Juan Mora', '2200-0000', 'ventas@elacueducto.cr'),
  ('AyA Suministros', 'Ana Rojas', '2100-0000', 'suministros@aya.cr')
on conflict do nothing;

insert into public.productos (codigo, nombre, categoria_id, proveedor_id, unidad, stock_minimo, precio)
values
  ('TUB-050', 'Tubo PVC 1/2"',
     (select id from public.categorias where nombre = 'Tubería'),
     (select id from public.proveedores where nombre = 'Ferretería El Acueducto'),
     'unidad', 20, 1200),
  ('QUI-CLO', 'Cloro granulado 1kg',
     (select id from public.categorias where nombre = 'Químicos'),
     (select id from public.proveedores where nombre = 'AyA Suministros'),
     'kg', 10, 4500),
  ('BOM-001', 'Bomba sumergible 1HP',
     (select id from public.categorias where nombre = 'Bombas'),
     (select id from public.proveedores where nombre = 'AyA Suministros'),
     'unidad', 1, 185000)
on conflict (codigo) do nothing;

-- Carga de stock inicial vía la RPC (requiere una sesión autenticada;
-- ejecutar desde la app o con un usuario válido). Ejemplo:
-- select public.registrar_movimiento(
--   (select id from public.productos where codigo = 'TUB-050'),
--   'entrada', 100, 'Stock inicial');
