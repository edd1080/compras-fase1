---
title: Verification — 000-Sprint0-Backend-Base
status: review
authority: technical
owner: Intelia (build)
last_reviewed: 2026-08-12
---

# ADF implementation contract — 000-Sprint0-Backend-Base

- Current lifecycle gate: **G2** (especificación en revisión; G3 plan y G4 implementación pendientes)
- Approved scope and explicit exclusions: Esqueleto Next.js (App Router) + TS estricto + Tailwind; aprovisionamiento Supabase (PostgreSQL + Storage) en 3 entornos; migraciones 001–006 + seed; secretos por entorno; CI/CD a staging; tokens de identidad BIA y componentes base. **Excluido**: funcionalidad de negocio (intake, IA, comparativas), integración de Claude API/correo/SheetJS, dominios definitivos, pantallas del producto, RAG.
- Files expected to change: proyecto Next.js completo, `package.json` (scripts typecheck/lint/test/db:reset), migraciones SQL, configuración de entornos/CI (`vercel.json`/workflows), tokens de diseño, componentes base.
- Requirement-to-test evidence map:
  - FR-001 → `npx tsc --noEmit` + `npm run lint` (SC-001)
  - FR-004/FR-005 → `npm run db:reset` + inspección de tablas/seed (SC-002)
  - FR-006 → escaneo de secretos en repo (SC-003)
  - FR-007 → push a `main` dispara deploy a staging (SC-004)
  - FR-008 → tokens de color/fuente verificables vs doc 21 (SC-005)
  - FR-003 → conexión verificada desde los 3 entornos (SC-006)
- Security, privacy, and data-migration risks: gestión de secretos (ninguna credencial en repo); migraciones sobre esquema vacío (sin datos reales en Sprint 0); sin datos de solicitantes/cotizaciones (comercialmente sensibles) aún.
- Verification commands and expected signals: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run db:reset`, `npx adf doctor` (→ DOCTOR_OK), scaneo de secretos.
- Rollback or recovery boundary: `db:reset` regenera el esquema en limpio; despliegues reversibles por Vercel; sin datos de producción en riesgo.
- Session completion Definition of Done: esqueleto compilable y lint-clean; migraciones 001–006 aplicadas en limpio con seed; 3 entornos aprovisionados y conectados; CI/CD a staging operativo; secretos fuera del repo; tokens de identidad BIA y componentes base presentes.

Implementation is prohibited until G1, G2, G3, and G4 have explicit human approval recorded in the project state.
