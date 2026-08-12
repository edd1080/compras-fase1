---
title: Verification — 002-Backend-Api
status: review
authority: technical
owner: Intelia (build)
last_reviewed: 2026-08-12
---

# ADF implementation contract — 002-Backend-Api

- Current lifecycle gate: **G2** (especificación en revisión; G3 plan y G4 implementación pendientes)
- Approved scope and explicit exclusions: repositorios PostgreSQL (`lib/db/`, `pg` + `DATABASE_URL`, esquema 001–006); interfaz `Repositorio` abstracta (adapter Postgres, preparado para Supabase); API routes con validación Zod que exponen `lib/domain` (solicitudes, estado+trazabilidad transaccional, mis-solicitudes, cotizaciones, comparativa, decisión, métricas); `assessment_requerimiento` en `lib/domain` (≤6 preguntas, validación dura del catálogo); frontend conectado a la API (reemplaza fixtures de runtime). **Excluido**: PDF y correos (feature 003), IA Claude real del assessment (Sprint 3), autenticación real (Sprint 3+), Supabase Cloud (solo adaptador preparado).
- Files expected to change: `lib/db/*` (repositorios + pool), `lib/domain/assessment.ts` (+ test), `app/api/*` (routes), `lib/domain/types.ts` (contratos API), `lib/api-client.ts` (cliente fetch tipado), frontend de los 5 flujos (de fixtures a API), `package.json` (pg, zod si falta), tests de repositorio y API, `.env.example` (DATABASE_URL).
- Requirement-to-test evidence map:
  - FR-001/FR-002 → tests de repositorios contra base local (US1/SC-001)
  - FR-004/FR-008 → pruebas de endpoints (Zod + reglas) (US2/SC-002)
  - FR-005 → tests de `assessment_requerimiento` (US3/SC-003)
  - FR-006/FR-007 → flujos frontend reales + `mis-solicitudes` sin montos (US4/SC-004)
  - FR-003 → transición+evento en misma transacción (SC-005)
- Security, privacy, and data-migration risks: sin credenciales en repo (DATABASE_URL en `.env`); `mis-solicitudes` nunca expone montos; sin migraciones nuevas (se reutiliza 001–006); datos reales solo en entorno local de desarrollo.
- Verification commands and expected signals: `npm run typecheck`, `npm run lint`, `npm run test` (incluye repos/API/domain), `npm run build`, `npx adf doctor` (→ DOCTOR_OK), `npm run secret-scan`; prueba funcional contra la base local (crear→transicionar→listar).
- Rollback or recovery boundary: cambios aislados en `lib/db/`, `app/api/`, `lib/domain/`, frontend; sin migraciones; revert si tests fallan; la base local se puede reiniciar (`db:reset`) sin datos de producción.
- Session completion Definition of Done: repositorios persisten/releen contra 001–006; endpoints JSON tipados validados; assessment ≤6 preguntas del catálogo; frontend real en los 5 flujos; transición+evento transaccional; typecheck/lint/test/build/doctor/secret-scan en verde; commit atómico a origin/main.

Implementation is prohibited until G1, G2, G3, and G4 have explicit human approval recorded in the project state.