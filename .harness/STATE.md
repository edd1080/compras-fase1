---
schemaVersion: 1
lifecycle: feature-closed
currentGate: G6
activeFeature: 008-sprint4-dashboard-alertas
approvals:
  G1: true
  G2: true
  G3: true
  G4: true
  G5: true
  G6: true
nextAction:
  command: feature-select
  prompt: "Feature 008 cerrada (G6, 2026-08-20). Seleccionar la próxima feature del backlog (Sprint 4/5 restante o piloto)."
---

# Project State

## Current objective

Feature **008-sprint4-dashboard-alertas** cerrada (G6) el 2026-08-20: decisión real del solicitante por link público (RN-01), dashboard admin con KPIs reales y filtros, motor de alertas y exportación Excel — todo con batería completa verde y QA adversarial cerrado.

## Approvals

- G1 ✅ (proyecto global) · 000 ✅ … 007 ✅ (G5/G6, 2026-08-18).
- **008** ✅ G2, G3, G4, G5, G6 (2026-08-20).

## Resultado de la 008 (G5/G6)

Decisión real por link: la vista pública deja de ser demo; al enviar la comparativa se persiste la recomendación (RN-01) y se crea un `link_publico` real con token criptográfico y expiración configurable; el solicitante decide por token y eso cierra la solicitud. Dashboard admin con KPIs reales (conversión, tiempo, activos, sin decisión), filtros funcionales, motor de alertas y export Excel. QA adversarial (skill validate) cerró 4 críticos y además se protegió la API interna por rol (opción A) — ver `specs/008-sprint4-dashboard-alertas/verification.md`.

## Siguiente

- Seleccionar próxima feature (Sprint 4/5 completo o piloto).