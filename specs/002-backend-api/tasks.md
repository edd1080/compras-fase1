---
description: "Task list for feature implementation — 002-Backend-Api"
---

# Tasks: 002-Backend-Api

**Input**: Design documents from `/specs/002-backend-api/`
**Prerequisites**: plan.md (G3), spec.md (G2 aprobado)
**Tests**: repositorios contra base local, dominio (assessment), API, integración frontend.

## Formato: `[ID] [P?] [Story] Descripción`

- **Story**: US1 (repositorios) · US2 (API) · US3 (assessment) · US4 (frontend)
- Orden: US1 → US3 (cerebro) → US2 (API) → US4 (integración).

---

## Fase 0 — Repositorios y persistencia (US1)

- [ ] T001 [US1] Añadir `pg` como dependencia; crear `lib/db/pool.ts` (pool desde `DATABASE_URL`) y `.env.example` con `DATABASE_URL`.
- [ ] T002 [US1] Crear interfaz `lib/db/repositorio.ts` (puerto): `crearSolicitud`, `guardarRespuestas`, `adjuntar`, `transicionarEstado`, `listarPorCoordinador`, `listarPorEmail`, `guardarCotizacion`, `guardarComparativa`, `registrarDecision`, `leerConfig`.
- [ ] T003 [US1] Adaptador `lib/db/postgres-repo.ts`: crear/leer `solicitud` (+ `respuesta_campo`), con `transicionarEstado` que escribe `evento_trazabilidad` en la **misma transacción** y fija `fecha_envio`/`fecha_cierre`.
- [ ] T004 [US1] Adaptador: `listarPorEmail` (solo referencia/título/estado/fechas, sin montos) y `listarPorCoordinador`.
- [ ] T005 [US1] Adaptador: `guardarCotizacion`, `guardarComparativa`, `registrarDecision`, `leerConfig` (tasa_isv, reglas).
- [ ] T006 [US1] Tests de repositorios contra una base local de prueba (crear→respuestas→transicionar→releer→evento en misma transacción).

## Fase 1 — Assessment en el cerebro (US3)

- [ ] T007 [US3] Crear `lib/domain/assessment.ts`: `assessment_requerimiento({ camposCapturados, camposDisponiblesCatalogo, tipo, subtipo })` → hasta 6 preguntas (validación dura del catálogo), `sin_preguntas_pendientes`, campo libre alternativo, y marca crítica cuando falta el logo (B2).
- [ ] T008 [US3] Tests de `assessment_requerimiento`: límite 6, campos inexistentes descartados, sin faltantes → `sin_preguntas_pendientes`, branding sin logo → crítico.

## Fase 2 — API (US2)

- [ ] T009 [US2] `POST /api/solicitudes` (Zod): crear borrador; `GET /api/solicitudes` (bandeja coordinador).
- [ ] T010 [US2] `PATCH /api/solicitudes/[id]/estado`: transicionar con la máquina de estados (persiste evento + fecha en misma transacción).
- [ ] T011 [US2] `GET /api/solicitudes/mis-solicitudes?email=` (sin montos).
- [ ] T012 [US2] `POST /api/solicitudes/[id]/cotizaciones` (guardar cotización) y `POST /api/solicitudes/[id]/comparativa` (generar con el motor).
- [ ] T013 [US2] `POST /api/comparativas/[id]/decision` (registrar decisión; `ninguna_opcion`).
- [ ] T014 [US2] `GET /api/metricas` (dashboard desde `lib/domain/metrics`).
- [ ] T015 [US2] Tests de API (validación Zod + reglas + errores tipados) y helper de test de handler.

## Fase 3 — Integrar frontend a la API (US4)

- [ ] T016 [US4] Crear `lib/api-client.ts`: cliente fetch tipado (`crearSolicitud`, `transicionar`, `misSolicitudes`, `bandeja`, `cargarCotizacion`, `generarComparativa`, `registrarDecision`, `metricas`).
- [ ] T017 [US4] Conectar el wizard del solicitante a la API (crear borrador, guardar respuestas, transición a ENVIADA_A_COMPRAS) y `mis-solicitudes` real.
- [ ] T018 [US4] Conectar la bandeja y detalle del coordinador a la API (solicitudes reales, cotizaciones, comparativa).
- [ ] T019 [US4] Conectar la vista pública (decisión) y el dashboard (métricas reales).
- [ ] T020 [US4] Los fixtures de runtime quedan fuera de los flujos; verificación: navegación completa con datos reales persistidos.

## Verificación final (DoD)

- [ ] T021 [US1-4] Batería completa: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npx adf doctor` (→ DOCTOR_OK), `npm run secret-scan`; prueba funcional real (crear→transicionar→listar→decisión) contra la base local; confirmar SC-01…SC-07. Commit atómico a origin/main.