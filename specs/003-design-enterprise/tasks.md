---
title: Tasks — 003-Design-Enterprise
status: approved
authority: technical
owner: Intelia (design)
last_reviewed: 2026-08-12
---

# Tasks — 003-Design-Enterprise

- [ ] T001 Refinar `styles/globals.css`: tokens de escala tipográfica (display/h1-h4/body/caption), tabular-nums en mono, sombras/radii unificados, tokens de espaciado (8px grid), colores "soft" unificados (azul-claro/soft2), focus-visible consistente.
- [ ] T002 Refinar `Button`, `Card`, `Badge`, `Alert`, `Field`: micro-interacciones (hover/active/focus-visible/transition), estados consistentes, sin romper API.
- [ ] T003 Refinar `Topbar` y crear **`AppShell` + `Sidebar`** (rail) para `panel` y `admin` (nav por rol, sin cambiar rutas ni labels).
- [ ] T004 Crear **`Skeleton`** y aplicar **empty/loading states** refinados (dashboard, bandeja, wizard assessment).
- [ ] T005 Refinar `Stepper`, `Segmented`, `Chip`, `Switch`, `Timeline`: micro-interacciones y estados activos pulidos.
- [ ] T006 Recomponer **dashboard admin**: metric-grid refinado, tabla de procesos con badges, distribuciones (barras), filtros persistente, empty states.
- [ ] T007 Recomponer **bandeja coordinador**: contadores, tabla enterprise con badges y filas, orden por fecha requerida, filtros.
- [ ] T008 Recomponer **detalle coordinador**: layout en dos paneles (información | acciones), stage-tabs refinados, comparativa/recomendación pulidas.
- [ ] T009 Refinar **vista pública** (`/comparativa/[token]`): tarjetas de proveedor, recomendación destacada vs sugerencia IA (RN-01), decisión con confirmación.
- [ ] T010 Refinar **wizard solicitante**: stepper + pasos con mejor ritmo, validación en vivo, bloqueos B1/B2 con explicación pulida, pantalla de documento/confirmación enterprise.
- [ ] T011 Añadir **animaciones/motion** sutiles: transiciones de vista, row hover, stepper, skeletons; `prefers-reduced-motion` respetado.
- [ ] T012 Verificación: `typecheck`, `lint`, `test`, `build`, `doctor`, `secret-scan`; revisión visual de los 4 portales; preservación (sin cambios de rutas/nav/fields/logo/copy). Commit a origin/main.