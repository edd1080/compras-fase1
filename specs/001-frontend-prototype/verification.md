---
title: Verification — 001-Frontend-Prototype
status: review
authority: technical
owner: Intelia (build)
last_reviewed: 2026-08-12
---

# ADF implementation contract — 001-Frontend-Prototype

- Current lifecycle gate: **G3** (plan en revisión; G4 implementación pendiente)
- Approved scope and explicit exclusions: **capa de dominio pura (`lib/domain/*`) test-first** (máquina de estados, reglas RN/B1B2B3, catálogo, comparativa, métricas) + port del prototipo HTML a React sobre ese cerebro, con 3 **portales por rol** (público-solicitante, coordinador, admin) y rutas reales de user-flows P1–P7, C1–C4, L1, A1; sistema de diseño enterprise (tokens fusión DOC 21 + prototipo + componentes); persistencia de wizard en cookie (30 días); sin mock data (fixtures tipados). El router de demo del prototipo **no se porta a producción**. **Excluido**: generación real de PDF/Excel (Sprint 2+), integración real de IA (Sprint 2+), autenticación real de coordinador/admin (Sprint 2+), API next de backend (se usará `lib/domain`).
- Files expected to change: `lib/domain/*` (cerebro + tests), `styles/globals.css`, `components/ui/*` y `components/ui-ext/*`, `components/solicitante|coordinador|publica|dashboard/*`, `app/*` (rutas y layouts por rol), `lib/fixtures/*`, `lib/cookie.ts`, `hooks/*`, tests.
- Requirement-to-test evidence map:
  - FR-000 → tests de `lib/domain/*` (US0/SC-000): state-machine, rules, catalog, comparativa, metrics
  - FR-001 → tokens en `@theme` + unit tests de componentes (US1/SC-006)
  - FR-002 → shell/topbar por rol renderizando
  - FR-003–007 → flujo solicitante con validación y bloqueos B1/B2 (US2, vía `lib/domain/rules`)
  - FR-008–012 → panel coordinador con B3 y hasta N cotizaciones (US3)
  - FR-013 → vista pública con decisión y "ninguna me sirve" (US4)
  - FR-014–015 → dashboard con métricas reales del cerebro y empty states (US5)
  - FR-016 → axe/contraste AA + navegación teclado
  - FR-017 → cookie 30 días (test de persistencia)
- Security, privacy, and data-migration risks: sin datos reales de solicitantes (fixtures); sin secretos; vista pública solo por token; sin migraciones nuevas (0 cambios de esquema).
- Verification commands and expected signals: `npm run typecheck`, `npm run lint`, `npm run test` (incluye `lib/domain`), `npm run build`, `npx adf doctor` (→ DOCTOR_OK), `npm run secret-scan`.
- Rollback or recovery boundary: cambios aislados en `lib/domain/`, `components/`, `app/`, `lib/fixtures/`; sin migraciones; revert si los tests/typecheck fallan.
- Session completion Definition of Done: US0–US5 implementadas y navegables por portal de rol; tests de dominio verdes; typecheck/lint/build verde; rutas de user-flows responden; B1/B2/B3 vía `lib/domain` (cliente+servidor); empty states reales; accesibilidad AA; router de demo no presentado en producción; commit atómico de la feature a origin/main.

Implementation is prohibited until G1, G2, G3, and G4 have explicit human approval recorded in the project state.