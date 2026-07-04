# Product

## Register

product

## Users

Dos perfiles internos de una ASADA (acueducto rural comunitario), poco técnicos:

- **Admin**: administrador de la ASADA. Gestiona el catálogo completo (productos, categorías, proveedores), usuarios y reportes. Contexto: oficina o casa, computadora o celular, sesiones cortas y ocasionales.
- **Operador**: personal de campo/bodega. Registra movimientos de entrada y salida de inventario y consulta stock y alertas. Contexto: muchas veces desde el celular, en bodega o en campo, con conexión variable.

Además, visitantes de la comunidad que entran a la **landing pública informativa** (superficie secundaria) para conocer la ASADA. No operan el inventario.

El trabajo a resolver: llevar el inventario del acueducto (materiales, herramientas, insumos) de forma confiable, sin errores de stock, con la mínima fricción posible para gente que no es de sistemas.

## Product Purpose

Sistema de inventario para la ASADA Gamalotal. Inventario chico y de poco volumen. El producto existe para que la ASADA sepa en todo momento qué tiene, qué entró, qué salió y qué está por agotarse, con trazabilidad de cada movimiento y sin que nadie edite el stock a mano.

Éxito = el operador registra un movimiento en segundos desde el celular sin equivocarse; el admin ve stock, alertas de mínimo y reportes de un vistazo; el número de stock siempre cuadra porque solo lo mueven transacciones atómicas validadas.

## Brand Personality

Claro, confiable, funcional. Tres palabras: **honesto, tranquilo, servicial**. Es una herramienta de servicio comunitario, no un producto SaaS que se vende. Nada de marketing ni de efectismo: la interfaz debe transmitir orden y certeza. Tono directo y en español costarricense neutro. En la landing pública: cercano y transparente (es una entidad comunitaria, no una empresa).

## Anti-references

- Dashboards "AI" recargados: gradientes morados, mesh oscuro, glassmorphism en todo, cards flotantes por todos lados.
- SaaS genérico tipo plantilla (Inter + slate-900, tres feature-cards iguales, hero centrado sobre degradado).
- Herramientas empresariales densas y frías estilo ERP corporativo, con tablas ilegibles y jerarquía plana.
- Sobre-animación: micro-interacciones en loop, transiciones por todos lados. El movimiento solo cuando aporta.
- Cualquier cosa que se sienta cara, corporativa o intimidante para un usuario rural no técnico.

## Design Principles

- **El stock es sagrado.** La UI nunca invita a editar stock a mano; solo se mueve por movimientos. La interfaz debe reforzar esa regla, no contradecirla.
- **Móvil primero, dedo primero.** El operador trabaja desde el celular. Targets grandes, flujos de registro de movimiento en pocos toques, legible bajo sol y con conexión mala.
- **Certeza antes que adorno.** Prioridad a que el dato correcto se vea claro (stock, mínimos, alertas) por encima de cualquier decoración.
- **Confianza rural.** Lenguaje del dominio en español, sencillo y sin jerga; nada que intimide a alguien que no es de sistemas.
- **Sin sobreingeniería visual.** Inventario chico: pantallas simples y directas, no un panel de analytics que nadie pidió.

## Accessibility & Inclusion

Sin mandato formal WCAG, pero por el público (comunidad rural, edades y alfabetización digital variadas) apuntar a **WCAG AA** como piso: contraste de texto ≥ 4.5:1, targets táctiles cómodos, tipografía legible, no depender solo del color para comunicar estado (alertas de stock deben tener texto/icono, no solo rojo). Respetar `prefers-reduced-motion`. Todo responsive y usable en pantallas de celular pequeñas.
