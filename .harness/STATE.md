---
schemaVersion: 1
lifecycle: feature-specify
currentGate: G2
activeFeature: 007-sprint3-ia-comparativa
approvals:
  G1: true
  G2: true
  G3: false
  G4: false
nextAction:
  command: feature-plan
  prompt: "G2 aprobado. Producción de specs/007-sprint3-ia-comparativa/plan.md (Gate G3)."
---

# Project State

## Current objective

Feature **007-sprint3-ia-comparativa** en G2 aprobado (2026-08-18, aprobación del usuario). Alcance confirmado en orden: S1 (persistencia completa + validación fiscal) → S2 (comparativa contextual + Excel 3 hojas) → S3 (catálogo en admin). Preparando plan (G3).

## Approvals

- G1 ✅ (proyecto global) · 000 ✅ · 001 ✅ · 002 ✅ · 003 ✅ · 004 ✅ · 005 ✅ · 006-ia-integracion ✅ (2026-08-15, G5/G6).
- **007**: G2 pendiente (spec draft lista).

## Hallazgo que ordena la 007

La auditoría encontró que **la persistencia descarta datos ya extraídos** por la IA de la 006: `formaPago`, `vigenciaOferta`, `garantia`, `montoOtrosImpuestos`, identificación fiscal y observaciones fiscales existen como columnas y en el tipo `Cotizacion`, pero `postgres-repo.ts` no las lee ni escribe. Eso bloquea la comparativa contextual y el Excel. El S1 de la 007 debe empezar corrigiendo este hueco (bloquea todo lo demás).

## Next

Revisar la spec 007 y aprobar G2.