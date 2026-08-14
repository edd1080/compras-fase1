---
title: Verification — 005-Auth-Supabase
status: review
authority: technical
owner: Intelia (build)
last_reviewed: 2026-08-14
---

# ADF implementation contract — 005-Auth-Supabase

- Current lifecycle gate: **G2** (especificación en revisión; G3/G4 pendientes)
- Approved scope and explicit exclusions: Supabase Auth con email/contraseña para coordinador y admin; middleware de protección de rutas; páginas de login (según diseño de referencias HTML); reemplazo de fixtura de sesión por sesión real; seed de usuarios con rol en `app_metadata`. El solicitante sigue sin auth (cookie de continuidad). **Excluido**: OAuth/SSO, magic link, registro de nuevos usuarios, gestión de usuarios desde la UI (se crean desde Supabase dashboard o seed), Supabase Storage (se integra después).
- Files expected to change: `middleware.ts` (nuevo), `app/login/*` (rutas), `lib/supabase/*` (SSR), `lib/auth.ts` (helpers), `lib/session.ts` (eliminar), componentes de header/panel/admin que usan fixtures, `scripts/seed-auth.js` (nuevo), `.env.example`, tests.
- Requirement-to-test evidence map:
  - FR-001/FR-002 → helpers de sesión y cliente SSR (SC-001)
  - FR-003 → middleware redirige correctamente (SC-001)
  - FR-004 → login renderiza y redirige tras éxito (SC-002)
  - FR-005 → botón "Salir" cierra sesión (SC-003)
  - FR-006 → panel/admin sin fixtures (SC-003)
  - FR-007 → seed de usuarios con rol (prueba manual + script)
  - FR-009 → solicitante sin cambios (SC-004)
- Security, privacy, and data-migration risks: las credenciales de Supabase (URL, anon key, service role) nunca en el repo (`.env.local`); se requiere SSL en producción; la sesión la gestiona Supabase (httpOnly cookie); los seed users tienen contraseñas temporales que deben cambiarse.
- Verification commands and expected signals: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npm run e2e`, `npx adf doctor` (→ DOCTOR_OK), `npm run secret-scan`.
- Rollback or recovery boundary: cambios aislados en `middleware.ts`, `app/login/*`, `lib/auth.ts`, `lib/supabase/*`; se elimina `lib/session.ts` y se actualizan referencias; revertir eliminando middleware y restaurando session.ts.
- Session completion Definition of Done: Supabase Auth integrado (login/logout con rol); middleware protege `/panel/*` y `/admin/*`; panel/admin usan sesión real (sin fixtures de sesión, `obtenerSesionFixture` eliminado); usuarios seed creados en Supabase; login pages del diseño HTML; typecheck/lint/test/build/doctor/secret-scan en verde; commit atómico a origin/main.

**Dependencia externa:** para la implementación (G4) se requiere que el usuario proporcione: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` de su proyecto Supabase Cloud.

Implementation is prohibited until G1, G2, G3, and G4 have explicit human approval recorded in the project state.