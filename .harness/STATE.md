---
schemaVersion: 1
lifecycle: closed
currentGate: G6
activeFeature: 005-auth-supabase
approvals:
  G1: true
  G2: true
  G3: true
  G4: true
nextAction:
  command: feature-selection
  prompt: "Selecciona la siguiente feature: integración de IA (Sprint 3) o trabajo de detalle en flujos (gestión de plantillas/coordinadores en admin)."
---

# Project State

## Current objective

Feature **005-auth-supabase** cerrada (G5 ✅, G6 ✅). Auth real implementado: middleware protege /panel y /admin, login con Supabase Auth, sesión real en paneles. Pusheado a origin/main (`4bf4231`).

## Approvals

- G1 ✅ · 000 ✅ · 001 ✅ · 002 ✅ · 003 ✅ · 004 ✅ · 005-auth-supabase ✅ (2026-08-14).

## Blockers

None. Pendiente: el usuario debe crear las cuentas en Supabase Auth (o ejecutar `npm run seed-auth`). Sin cuentas, el login redirige a la página pero sin credenciales válidas no se inicia sesión.
