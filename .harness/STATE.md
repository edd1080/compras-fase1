---
schemaVersion: 1
lifecycle: implementation
currentGate: G4
activeFeature: 004-pdf-correos
approvals:
  G1: true
  G2: true
  G3: true
  G4: true
nextAction:
  command: feature-implement
  prompt: Implementa la feature 004-pdf-correos según tasks.md (T001→T023), con verificación Playwright antes del commit.
---

# Project State

## Current objective

Implementación autorizada de **004-pdf-correos**. Ejecutar T001→T023: PDF con pdfme (plantilla JSON genérica), correos 1–5 con Resend, orquestación en transición, e2e Playwright. Antes de commitear: verificación completa + pruebas manuales del usuario + aprobación explícita.

## Approvals

- G1 ✅ · 000 ✅ · 001 ✅ · 002 ✅ · 003 ✅ (G6).
- 004-pdf-correos: G2 ✅, G3 ✅, G4 ✅ (2026-08-13).

## Blockers

None.
