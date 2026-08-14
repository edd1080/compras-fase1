---
title: Verification — 004-PDF-Correos
status: review
authority: technical
owner: Intelia (build)
last_reviewed: 2026-08-13
---

# ADF implementation contract — 004-PDF-Correos

- Current lifecycle gate: **G2** (especificación en revisión; G3/G4 pendientes)
- Approved scope and explicit exclusions: generación de PDF con pdfme (plantilla JSON declarativa genérica y reemplazable) para RFI/RFQ/RFP; persistencia en `documento_generado` con versionado; servicio de correo con Resend (correos 1–5) con bitácora `correo_enviado` y reintentos; orquestación de PDF+correos 1–2 en la transición a `ENVIADA_A_COMPRAS`. **Excluido**: plantilla oficial de Compras (se reemplaza la JSON genérica sin recodificar en una tarea posterior), integración real de IA, auth real (feature 005), Supabase Cloud (solo se mantiene la abstracción).
- Files expected to change: `lib/pdf/*` (generador pdfme + plantilla JSON), `lib/mail/*` (servicio Resend + plantillas 1–5), `lib/domain/types.ts` (DocumentoGenerado/CorreoEnviado si falta), `lib/db/repositorio.ts` + `postgres-repo.ts` (persistir documento/correo + orquestar en transición), `app/api/solicitudes/[id]/estado/route.ts` (pipeline), `package.json` (@pdfme/generator, resend), `.env.example` (RESEND_API_KEY, MAIL_FROM), tests, docs (REQ doc13).
- Requirement-to-test evidence map:
  - FR-001/002 → generador pdfme + plantilla (SC-001)
  - FR-003 → persistencia `documento_generado` versionada (SC-002)
  - FR-004 → fallo PDF no cambia estado (SC-004)
  - FR-005/006/007 → resend + plantillas 1–5 + adjunto/enlace (SC-003)
  - FR-008 → reintento + registro (SC-003)
  - FR-009 → transición dispara PDF+correos 1–2 (SC-003)
  - FR-010 → sin credenciales (secret-scan, SC-005)
- Security, privacy, and data-migration risks: sin credenciales de Resend en repo (env var); sin datos reales sensibles (fixtures); PDF/correos usan datos de solicitudes del entorno local de dev; sin migraciones nuevas (o migraciones menores para tablas `documento_generado`/`correo_enviado` alineadas con diccionario 15).
- Verification commands and expected signals: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npx adf doctor` (→ DOCTOR_OK), `npm run secret-scan`; test de generación de PDF y envío de correo (mock Resend) contra base local.
- Rollback or recovery boundary: cambios aislados en `lib/pdf/`, `lib/mail/`, `lib/db/`, endpoint de estado; sin migraciones destructivas; las tablas de documento/correo siguen el diccionario; revert si tests fallan.
- Session completion Definition of Done: PDF genérico válido generado con pdfme; `documento_generado` persistido con versión; correos 1–5 implementados con Resend y bitácora; transición a ENVIADA_A_COMPRAS dispara PDF+correos 1–2 con reglas de fallo; typecheck/lint/test/build/doctor/secret-scan en verde; commit atómico a origin/main.

Implementation is prohibited until G1, G2, G3, and G4 have explicit human approval recorded in the project state.