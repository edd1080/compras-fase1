---
description: "Task list for feature implementation — 001-Frontend-Prototype"
---

# Tasks: 001-Frontend-Prototype

**Input**: Design documents from `/specs/001-frontend-prototype/`
**Prerequisites**: plan.md (G3), spec.md (G2 aprobado)
**Tests**: tests de componentes y flujos en Vitest + verificación final.

## Formato: `[ID] [P?] [Story] Descripción`

- **Story**: US0 (cerebro) · US1 (diseño/shell) · US2 (solicitante) · US3 (coordinador) · US4 (pública) · US5 (dashboard)
- Orden: **US0 cerebro** → US1 → US2/US3 → US4/US5.

---

## Fase 0 — Cerebro: capa de dominio (US0) — TEST-FIRST

- [ ] T000 [US0] Crear `lib/domain/types.ts`: entidades del diccionario (Solicitud, Cotizacion, Comparativa, Decision, Usuario, Catálogo, etc.) y enums (tipo_solicitud, estado_solicitud, etc.).
- [ ] T001 [US0] Crear `lib/domain/state-machine.ts`: máquina de estados de solicitud con transiciones válidas (diccionario 15) + tests (válidas, inválidas, eventos).
- [ ] T002 [US0] Crear `lib/domain/rules.ts`: RN-01…08 y bloqueos B1/B2/B3 (funciones puras: `requireArte`, `requireRecomendacion`, `camposObligatorios`, etc.) + tests.
- [ ] T003 [US0] Crear `lib/domain/catalog.ts`: catálogo de campos → construir formulario dinámico (origen plantilla/assessment, obligatorios, condicionales) + tests.
- [ ] T004 [US0] Crear `lib/domain/comparativa.ts`: validación fiscal, detección de discrepancias, generación de pros/contras/sugerencia + tests (caso melamina vs madera).
- [ ] T005 [US0] Crear `lib/domain/metrics.ts`: conversión, tiempo de ciclo, volumen por coordinador/tipo, solicitudes sin movimiento + tests.
- [ ] T005b [US0] Verificación: `npm run typecheck && npm run lint && npm run test` sobre `lib/domain/*` (verde).

## Fase 1 — Infraestructura y sistema de diseño (US1)

- [ ] T006 [US1] Actualizar `styles/globals.css`: tokens fusión (brass/clay/sage/slate + var del prototipo) conservando DOC21; tipografías (Space Grotesk, DM Sans, DM Mono) y shadow/radius.
- [ ] T007 [US1] Crear `lib/fixtures/` con datos tipados derivados del modelo real (solicitudes, cotizaciones, coordinadores, métricas) — no el mock inline del prototipo.
- [ ] T008 [US1] Crear `lib/cookie.ts` (30 días) y `hooks/useToast.ts`.
- [ ] T009 [US1] Crear `components/ui-ext/`: `Segmented`, `Chip`, `Switch`, `Stepper`, `Modal`, `Toast`, `Avatar`, `Timeline` + tests.
- [ ] T010 [US1] Crear `components/ui-ext/`: `Topbar`, `Shell`, `DataTable`, `MetricCard`, `BarChart` (CSS), `EmptyState` + tests.
- [ ] T011 [US1] Wrapper de layouts por rol: `app/panel/layout.tsx` (coordinador), `app/admin/layout.tsx` (admin); layout raíz con redirección por rol (fixture de sesión).
- [ ] T012 [US1] Verificación: typecheck/lint/test sobre base extendida.

## Fase 2 — Flujo solicitante (US2)

- [ ] T013 [US2] `app/page.tsx` → P1 identificación (correo/nombre/área, validación email + dominio no institucional).
- [ ] T014 [US2] `hooks/useSolicitudWizard.ts` + `components/solicitante/SolicitanteWizard.tsx` con pasos P2–P7 y stepper navegable + guardado en hook.
- [ ] T015 [US2] `components/solicitante/ClasificacionChips.tsx`: clasificación RFI/RFQ/RFP con razonamiento breve y sin preselección si confianza baja.
- [ ] T016 [US2] `components/solicitante/AssessmentForm.tsx`: spinner de "revisando" + formulario hasta 6 preguntas; fallo → continúa sin error visible.
- [ ] T017 [US2] Bloqueos duros **B1** (obligatorios) y **B2** (branding sin logo) usando `lib/domain/rules` (misma lógica cliente/servidor).
- [ ] T018 [US2] `components/solicitante/DocPreview.tsx`: ticket de documento generado (contrato visual tipado) + modal.
- [ ] T019 [US2] Persistencia de wizard en cookie 30 días (`lib/cookie.ts`) y retomar borrador; `app/mis-solicitudes/page.tsx` consulta por correo.
- [ ] T020 [US2] Tests del flujo solicitante (P1–P7) + verificación.

## Fase 3 — Panel del coordinador (US3)

- [ ] T021 [US3] `app/panel/page.tsx` + `components/coordinador/Bandeja.tsx`: C1 con solicitudes asignadas (fixtures), badges, filtros de estado/tipo, empty states.
- [ ] T022 [US3] `app/panel/solicitud/[id]/page.tsx` + `components/coordinador/DetalleSolicitud.tsx`: C2 con stage-tabs (07/08/09).
- [ ] T023 [US3] `components/coordinador/CargaCotizaciones.tsx`: slots de cotización (PDF/Word/imagen) con estados por archivo y extracción editable (placeholder tipado); generar comparativa con ≥2 cotizaciones.
- [ ] T024 [US3] `components/coordinador/Comparativa.tsx`: tabla neto arriba/impuestos abajo + observación fiscal (cerebro) + discrepancia antes que precios.
- [ ] T025 [US3] `components/coordinador/Recomendacion.tsx`: provider-cards + suggestion-box (IA) + recomendación obligatoria → **B3** (cerebro) bloquea envío en cliente + servidor.
- [ ] T026 [US3] Tests del flujo coordinador + verificación.

## Fase 4 — Vista pública (US4)

- [ ] T027 [US4] `app/comparativa/[token]/page.tsx` + `components/publica/VistaPublica.tsx`: recomendación destacada, tarjetas por proveedor, discrepancia antes que precios, "no especificado".
- [ ] T028 [US4] `components/publica/DecisionButtons.tsx`: decisión con confirmación y "ninguna me sirve" (notifica sin cerrar).
- [ ] T029 [US4] Tests del flujo de decisión + verificación.

## Fase 5 — Dashboard (US5)

- [ ] T030 [US5] `app/admin/page.tsx` + `components/dashboard/MetricGrid.tsx`: métricas desde cerebro (`lib/domain/metrics`); empty states sin ceros.
- [ ] T031 [US5] `components/dashboard/BarChart.tsx` + Filtros (período/coordinador) + `TablaProcesos.tsx` (exportable placeholder).
- [ ] T032 [US5] Tests del dashboard + verificación.

## Verificación final (DoD)

- [ ] T033 [US0-5] Batería completa: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npx adf doctor` (→ DOCTOR_OK), `npm run secret-scan`; navegación manual de los portales por rol (público/panel/admin); confirmar SC-000…SC-07. Commit atómico de la feature a origin/main.