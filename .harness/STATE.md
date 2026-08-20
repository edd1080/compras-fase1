---
schemaVersion: 1
lifecycle: feature-specify
currentGate: G2
activeFeature: 008-sprint4-dashboard-alertas
approvals:
  G1: true
  G2: false
  G3: false
  G4: false
nextAction:
  command: feature-specify
  prompt: "Feature 008 abierta. Revisar y aprobar specs/008-sprint4-dashboard-alertas/spec.md (Gate G2)."
---

# Project State

## Current objective

Abrir la feature **008-sprint4-dashboard-alertas** (dashboard con métricas de conversión y alertas, Sprint 4/5 del backlog). La auditoría confirmó que hoy el dashboard admin es mayormente mock (KPIs hardcodeados, filtros decorativos, sin motor de alertas, sin decisión real que cierre la solicitud). Spec draft en preparación.

## Approvals

- G1 ✅ (proyecto global) · 000 ✅ … 007 ✅ (G5/G6, 2026-08-18).
- **008**: G2 pendiente.

## Hallazgo que ordena la 008

La tasa de conversión (métrica principal de Lady, "la cereza del pastel") no se puede medir hoy de forma real: la vista pública de decisión (`/comparativa/[token]`) es demo (token fijo, no llama `registrarDecision` ni transiciona a `CERRADA_CON_DECISION`). El dashboard pinta KPIs hardcodeados. La 008 debe primero hacer la decisión real y luego conectarla a las métricas, alertas y exportación.