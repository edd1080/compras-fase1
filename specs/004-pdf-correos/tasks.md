---
description: "Task list for feature implementation — 004-PDF-Correos"
---

# Tasks: 004-PDF-Correos

**Input**: Design documents from `/specs/004-pdf-correos/`
**Prerequisites**: plan.md (G3), spec.md (G2 aprobado)
**Tests**: unit + integration (Vitest) + **e2e Playwright** de los flujos oficiales y edge cases. Verificación completa ANTES de buscar aprobación de commit.

## Formato: `[ID] [P?] [Story] Descripción`

- **Story**: US1 (PDF) · US2 (correos) · US3 (orquestación) · E2E (Playwright)

---

## Fase 0 — Dependencias y tipos (T)

- [ ] T001 Instalar `@pdfme/generator` (+ `@pdfme/schemas`) y `resend`; añadir `@playwright/test` como devDependency.
- [ ] T002 Crear tipos de dominio `DocumentoGenerado` y `CorreoEnviado` en `lib/domain/types.ts` (diccionario 15).
- [ ] T003 Verificar/crear migración `007_documento_correo.sql` (tablas `documento_generado`, `correo_enviado`) y añadir al `db-migrate`.

## Fase 1 — Generador de PDF (US1)

- [ ] T004 Crear `lib/pdf/plantilla-generica.ts`: plantilla JSON declarativa de pdfme (membrete, bloque de identificación, secciones RFI/RFQ/RFP) con variables de la solicitud.
- [ ] T005 Crear `lib/pdf/generador.ts`: `generarPdf({ plantilla, datos }) → Buffer` usando pdfme; función `generarDocumento(solicitud, respuestas)` que elige plantilla por tipo y arma inputs (datos reales, "no especificado" si falta — RN-06).
- [ ] T006 Crear `lib/pdf/schema.ts`: tipos de la plantilla e inputs.
- [ ] T007 Persistencia: `repositorio.persistirDocumento(solicitudId, { tipo, ruta, version, plantillaVersion })` + implementación Postgres (tabla `documento_generado`, versionado).
- [ ] T008 Tests de `generarDocumento`: PDF válido (%PDF + referencia), elección por tipo, datos faltantes → "no especificado".

## Fase 2 — Servicio de correo con Resend (US2)

- [ ] T009 Crear `lib/mail/cliente.ts`: cliente Resend desde `RESEND_API_KEY`; remitente `MAIL_FROM` (config).
- [ ] T010 Crear `lib/mail/plantillas.ts`: cuerpos/asuntos de los correos 1–5 (documento 13) con destinatarios y variables.
- [ ] T011 Crear `lib/mail/enviar.ts`: `enviarCorreo({ tipo, destinatario, datos })` → invoca Resend, registra en `correo_enviado`, reintenta ante fallo (RF-25, J-E1).
- [ ] T012 Persistencia: `repositorio.registrarCorreo(...)` + implementación Postgres (tabla `correo_enviado`).
- [ ] T013 Tests de `enviarCorreo` con mock de Resend: éxito (registro), fallo (reintento + estado), correo 3 con enlace, correo 1 con PDF adjunto.

## Fase 3 — Orquestación en la transición (US3)

- [ ] T014 En `app/api/solicitudes/[id]/estado/route.ts`: al transicionar a `ENVIADA_A_COMPRAS`, ejecutar pipeline: generar PDF → persistir documento → enviar correos 1 y 2 → transicionar estado (solo si PDF ok; si PDF falla, no avanza — RF-24; si correo 1 falla, avanza con `notificacion_fallida` — RF-25).
- [ ] T015 Registrar el pipeline en la transición también si se reutiliza en el repo (transición programática).
- [ ] T016 Tests de integración: transición dispara PDF + correos 1–2; fallo de PDF no cambia estado; fallo de correo 1 marca `notificacion_fallida`.

## Fase 4 — Playwright e2e (verificación oficial + edge cases)

- [ ] T017 Configurar Playwright (`playwright.config.ts`, scripts `e2e`); servidor de test.
- [ ] T018 e2e — Solicitante: crear solicitud de punta a punta (P1→P6), validación de email, fecha pasada, clasificación corregible, bloqueo B2 (branding sin logo).
- [ ] T019 e2e — Coordinador: bandeja (filtros/búsqueda), detalle 3 etapas, carga de ≥2 cotizaciones → comparativa, bloqueo B3 (recomendación vacía), envío → vista de envío con enlace.
- [ ] T020 e2e — Vista pública: token, decisión con confirmación, "ninguna me sirve".
- [ ] T021 e2e — Admin: dashboard (métricas/filtros), trazabilidad (timeline desde "Ver Detalle"), procesos/coordinadores/configuración renderizan.
- [ ] T022 Ejecutar e2e y corregir fallos.

## Verificación final (DoD)

- [ ] T023 Batería completa: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run e2e`, `npm run build`, `npx adf doctor` (→ DOCTOR_OK), `npm run secret-scan`. **Presentar evidencia (Playwright + unit) y buscar aprobación explícita antes del commit** (regla de la constitución). Commit atómico a origin/main.