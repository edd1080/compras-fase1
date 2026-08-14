---
schemaVersion: 1
lifecycle: specification
currentGate: G2
activeFeature: 005-auth-supabase
approvals:
  G1: true
  G2: false
  G3: false
  G4: false
nextAction:
  command: feature-specify
  prompt: Especifica la feature 005-auth-supabase (auth real con Supabase Auth + rutas segmentadas por rol).
---

# Project State

## Current objective

Feature **004-pdf-correos** cerrada (G6). Nueva: especificar la feature **005-auth-supabase**: autenticación real con Supabase Auth, separación de portales por rol (solicitante/coordinador/admin), login/logout, middleware de protección de rutas, y reemplazo de la fixtura de sesión temporal.

## Approvals

- G1 ✅ · 000 ✅ · 001 ✅ · 002 ✅ · 003 ✅ · 004 ✅ (G6).
- 005-auth-supabase: G2 pendiente — especificación en elaboración.

## Blockers

None. Se requiere proyecto Supabase (URL + anon key + service role key) para la integración; se pedirá en el momento de implementación (G4).
