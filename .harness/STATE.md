---
schemaVersion: 1
lifecycle: feature-closed
currentGate: G6
activeFeature: null
approvals:
  G1: true
  G2: true
  G3: true
  G4: true
  G5: true
  G6: true
nextAction:
  command: feature-select
  prompt: "008 cerrada (G6) + ronda post-cierre de QA/UX (2026-08-21, cambios SIN commit). Decidir: commitear ronda UX → siguiente feature del Sprint 4 residual (H4.2 versionado, H4.3 coordinadores CRUD, H4.5 seguridad por fila) o preparación de piloto/nube."
---

# Project State

## Current objective

Las 9 etapas del producto están cerradas y verificadas (000–008). Sobre el cierre de la **008** se ejecutó una **ronda post-cierre de QA manual por rol** (2021-08-20/21) que produjo mejoras de UI/UX y correcciones funcionales — **cambios en el working tree SIN commitear** (ver HANDOFF).

## Approvals

- G1 ✅ (proyecto global) · 000 ✅ … 007 ✅ (G5/G6, 2026-08-18).
- **008** ✅ G2–G6 (2026-08-20).

## Estado funcional actual

- Ciclo completo punta a punta contra PostgreSQL local: solicitante crea/clasifica/envía → coordinador cotiza/compara/recomienda/envía enlace → solicitante decide por token → solicitud cierra; admin ve KPIs reales, alertas y exporta Excel.
- Seguridad: API interna protegida por rol (`lib/api-guard.ts`); envío anónimo del solicitante sigue público.
- Asignación de coordinadores: por categoría canónica + respaldo al coordinador de mayor cobertura.
- Wizard guarda claves de categoría canónicas y persiste tipo/subtipo/fecha requerida de la clasificación IA.

## Ronda post-cierre (2026-08-20/21, sin commit)

Rediseño del panel del coordinador (cards con ícono/color por estado, búsqueda con limpiar, filas clicables, referencias legibles SOL-XXXXXXXX, categoría y estado con color, tabs por color, layout más ancho); solicitudes cerradas quedan en solo lectura con banda de decisión; guiones "—" reemplazados por estados informativos; badge CERRADA_SIN_DECISION corregido a verde. Validado: typecheck, eslint, 80 unit, e2e solicitante+coordinador 5/5, recorrido visual.

## Siguiente

1. Commitear la ronda post-cierre (working tree).
2. Elegir: Sprint 4 residual (H4.2 versionado de plantillas, H4.3 CRUD coordinadores, H4.5 seguridad por fila/RLS) o preparación nube+piloto (requiere insumos del cliente).
