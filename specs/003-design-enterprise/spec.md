---
title: Spec — 003-Design-Enterprise
status: approved
authority: technical
owner: Intelia (design)
last_reviewed: 2026-08-12
---

# Spec — 003-Design-Enterprise (Redesign-Preserve)

**Modo:** Redesign-Preserve. Refinar el sistema de diseño propio al máximo nivel enterprise, integral y moderno. **No** a shadcn, **no** cambios de URLs/nav primaria/fields/logo/copy, **no** regresión RN-01 ni accesibilidad.

## Palancas (Taste 11.D, orden de prioridad)
1. Typography refresh — escala y jerarquía refinadas; DM Mono tabular-nums para datos.
2. Spacing & rhythm — grid 8px consistente, padding de sección, respiro.
3. Color recalibration — unificar "softs" (azul-claro/soft2), contraste AA, tokens en vez de grises ad-hoc.
4. Motion layer — micro-interacciones (botones, rows, stepper, cards, tabs), transiciones de vista suaves, loading skeletons, `prefers-reduced-motion`.
5. Shell & rail — layout de app con **sidebar** para `panel` (coordinador) y `admin`; navegación de secciones por rol.
6. Key-section recomposition — dashboard (rail + metric-grid + tabla procesos + distribuciones), bandeja enterprise, detalle en dos paneles (info | acciones).

## Preservación
Rutas/slugs, nav por rol, nombres y orden de campos del wizard, logo "BIA · Honduras" (brass span), RN-01 (recomendación humana > sugerencia IA), eventos/analytics, accesibilidad ya ganada.

## Criterios de éxito
- Los 4 portales se ven como una app enterprise única y coherente (no bloques apilados).
- Micro-interacciones y animaciones sutiles en los componentes clave; respetan `prefers-reduced-motion`.
- Sidebar por rol en `panel` y `admin`.
- Contraste AA y navegación por teclado intactos.
- Sin cambios de rutas/nav/fields/logo/copy/estructura de datos.