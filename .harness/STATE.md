---
schemaVersion: 1
lifecycle: feature-selection
currentGate: G1
activeFeature: 007-sprint3-ia-comparativa
approvals:
  G1: true
  G2: false
  G3: false
  G4: false
nextAction:
  command: feature-specify
  prompt: "Feature 007 abierta. Revisar y aprobar specs/007-sprint3-ia-comparativa/spec.md (Gate G2)."
---

# Project State

## Current objective

Abrir la feature **007-sprint3-ia-comparativa** (intake oficial). El proyecto global ya tiene G1 aprobado; la auditoría observacional de los slices candidatos se completó y la spec draft está lista para revisión G2.

## Approvals

- G1 ✅ (proyecto global) · 000 ✅ · 001 ✅ · 002 ✅ · 003 ✅ · 004 ✅ · 005 ✅ · 006-ia-integracion ✅ (2026-08-15, G5/G6).
- **007**: G2 pendiente (spec draft lista).

## Hallazgo que ordena la 007

La auditoría encontró que **la persistencia descarta datos ya extraídos** por la IA de la 006: `formaPago`, `vigenciaOferta`, `garantia`, `montoOtrosImpuestos`, identificación fiscal y observaciones fiscales existen como columnas y en el tipo `Cotizacion`, pero `postgres-repo.ts` no las lee ni escribe. Eso bloquea la comparativa contextual y el Excel. El S1 de la 007 debe empezar corrigiendo este hueco (bloquea todo lo demás).

## Next

Revisar la spec 007 y aprobar G2.