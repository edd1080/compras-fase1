# Implementation Plan: 004-PDF-Correos

**Branch**: `004-pdf-correos` | **Date**: 2026-08-13 | **Spec**: `specs/004-pdf-correos/spec.md`

**Input**: Feature specification (US1–US3, FR-01…10, SC-01…05). Generación de PDF con pdfme (plantilla JSON genérica reemplazable) + correos 1–5 con Resend, sobre el backend de 002.

## Summary

Materializar el documento formal: generar el PDF membretado (RFI/RFQ/RFP) con **pdfme** a partir de una plantilla declarativa genérica (reemplazable por la oficial sin recodificar), enviar los **correos 1–5** con **Resend** (registrados en `correo_enviado`), persistir el documento en `documento_generado` con versionado, y orquestar PDF+correos 1–2 en la transición a `ENVIADA_A_COMPRAS`. Verificación con Playwright antes del commit.

## Technical Context

**Language/Version**: TypeScript estricto, Node, Next.js 16 (App Router).

**Primary Dependencies**: `@pdfme/generator` (+ schemas) para PDF; `resend` (SDK) para correo. `pg` ya en el stack para persistencia.

**Storage**: PostgreSQL local (misma base); tablas `documento_generado` y `correo_enviado` (diccionario 15) — verificar/crear migración si no existen.

**Testing**: unit (dominio), Vitest; **e2e con Playwright** (flujos oficiales + edge cases); typecheck/lint/build/doctor/secret-scan.

**Target Platform**: next (web-service); correo y PDF en el servidor (API routes / utilidades server).

**Constraints**: sin credenciales en repo (`RESEND_API_KEY`, `MAIL_FROM` en entorno); PDF no cambia estado si falla; correo 1 fallido → `notificacion_fallida`; nomenclatura vigente (4 ciclo + 1 alerta).

**Scale/Scope**: ~1 generador PDF + 1 servicio de correo + plantillas 1–5 + orquestación en transición + e2e Playwright.

## Constitution Check

*GATE: RN-06 (datos faltantes como "no especificado" — el PDF muestra los datos reales sin inventar); regla de verificación (Playwright + aprobación antes de commit — nueva); sin secretos en repo.*

✅ Sin violaciones.

## Project Structure

### Documentación (feature)

```text
specs/004-pdf-correos/
├── spec.md            # Especificación (G2 aprobada)
├── plan.md            # Este archivo (G3)
└── tasks.md           # Tareas ejecutables (contrato G4)
```

### Código

```text
lib/
├── pdf/
│   ├── generador.ts      # pdfme: render(plantilla JSON, inputs) → Buffer
│   ├── plantilla-generica.ts  # plantilla JSON declarativa (RFI/RFQ/RFP) — reemplazable
│   └── schema.ts          # tipado de la plantilla y sus variables
├── mail/
│   ├── cliente.ts        # cliente Resend (RESEND_API_KEY en env)
│   ├── plantillas.ts     # cuerpos/asuntos 1–5 (doc 13) + registro correo_enviado
│   └── enviar.ts         # enviarCorreo({tipo, destinatario, datos}) con reintento
├── db/repositorio.ts      # + persistirDocumento / registrarCorreo (puerto)
├── db/postgres-repo.ts    # + implementaciones (tablas documento_generado/correo_enviado)
└── domain/types.ts        # + DocumentoGenerado / CorreoEnviado
app/api/solicitudes/[id]/estado/route.ts  # orquesta: PDF + correos 1–2 al transicionar a ENVIADA_A_COMPRAS
migrations/               # (si hace falta) 007_documento_correo.sql
e2e/                      # Playwright: flujos oficiales + edge cases
```

**Structure Decision**: generador PDF y cliente de correo como utilidades server puras; plantilla JSON aislada para reemplazo; la orquestación vive en el flujo de transición (para que PDF+correos ocurran al enviar). Playwright en `e2e/` recorre los flujos reales.

## Complexity Tracking

No aplica (sin violaciones).

## Risk / Rollback

| Riesgo | Mitigación |
|---|---|
| pdfme no compila en el entorno | Instalar deps; fallback de generación (template HTML→pdf si hiciera falta); test dedicado |
| Resend no disponible en dev | SDK con mock en tests; la clave en env; el flujo no bloquea si no está configurada (se registra) |
| Fallo de PDF cambia estado | La transición a ENVIADA_A_COMPRAS se hace SOLO si el PDF se genera; si falla, no avanza (RF-24) |
| Fallo de correo 1 | Avanza con `notificacion_fallida` + reintento + alerta (RF-25) |
| Tablas de documento/correo no existen | Migración 007 alineada con diccionario 15; `db:reset` las crea |
| e2e Playwright no configurado | Setup con `@playwright/test`; se ejecuta contra `npm run dev` (server de test) |

**Rollback**: cambios aislados en `lib/pdf/`, `lib/mail/`, `lib/db/`, endpoint de estado; migración 007 reversible; revert si tests/e2e fallan.