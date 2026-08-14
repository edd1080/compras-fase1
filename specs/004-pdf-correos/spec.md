# Feature Specification: 004-PDF-Correos

**Feature Branch**: `004-pdf-correos`

**Created**: 2026-08-13

**Status**: Draft (en revisión para G2)

**Input**: Sprint 2 (doc 17, H2.3 generación de PDF y H2.4 correo transaccional). Generar el documento formal (RFI/RFQ/RFP) con **pdfme** (plantilla declarativa genérica y reemplazable) y enviar los **correos 1–5** del ciclo con **Resend**. Sobre el backend de la feature 002 (repositorios PostgreSQL).

**Fuentes autoritativas**: `docs/references/architecture.md` (stack: pdfme + Resend, actualizado), `docs/product/prd.md` (RF-19…25, RF-45, sección "Stack de PDF y correo"), `docs/product/user-flows.md` (§5 Correos), documento 13 (plantillas RFI/RFQ/RFP y cuerpos de correos 1–5), `lib/db/repositorio.ts` (puerto), `lib/domain/types.ts` (DocumentoGenerado/Correo).

## User Scenarios & Testing

> **PDF genérico reemplazable:** la plantilla de pdfme se define como **JSON declarativo en configuración/datos**, con el membrete y estructura genérica actual. Cuando llegue la plantilla oficial de Compras, se reemplaza la definición sin recodificar. Se persiste en `documento_generado` con versión (se conservan las versiones).
> **Correos con Resend:** cada envío se registra en `correo_enviado` (remitente, destinatario, asunto, estado, intentos, error). Cumple la nomenclatura vigente (4 del ciclo + 1 de alerta configurable).

### User Story 1 — Generación de PDF genérico con pdfme (Prioridad P0)

Generar un PDF membretado genérico a partir de una plantilla declarativa de pdfme, con: membrete (encabezado/pie), bloque de identificación (referencia, tipo, área, solicitante, coordinador, fecha), y las secciones según tipo (RFI/RFQ/RFP) con los datos de la solicitud y respuestas. Se persiste en `documento_generado` (con versión) y se devuelve el buffer/archivo para adjuntar al correo.

**Why this priority**: es el corazón de H2.3; sin el PDF no hay documento para enviar al proveedor ni para adjuntar al correo.
**Independent Test**: dado un objeto `Solicitud`+plantilla JSON, se genera un buffer PDF válido, con la referencia visible, y se persiste con versión en `documento_generado`.
**Acceptance Scenarios**:
1. Dada una plantilla pdfme JSON genérica, **Cuando** se llama al generador con los datos de la solicitud, **Entonces** devuelve un buffer PDF que inicia con `%PDF` y contiene la referencia.
2. Dado el PDF generado, **Cuando** se persiste, **Entonces** queda en `documento_generado` con `version=1` y `plantilla_version`.
3. Dado un fallo de generación, **Cuando** ocurre, **Entonces** la solicitud NO cambia de estado (RF-24) y se registra el error.

### User Story 2 — Envío de correos con Resend (Prioridad P1)

Servicio de correo transaccional con Resend que envía los correos del ciclo (1 nueva solicitud con PDF, 2 acuse, 3 comparativo con enlace, 4 decisión, 5 alerta) y registra cada envío en `correo_enviado`.

**Why this priority**: notifica a coordinador y solicitante; parte del pipeline del documento (doc 17 H2.4).
**Independent Test**: dado un destinatario y plantilla de correo, Resend envía y se registra un fila en `correo_enviado` con estado `enviado`.
**Acceptance Scenarios**:
1. Dado el correo 1, **Cuando** se envía a un coordinador con el PDF adjunto, **Entonces** se registra `correo_enviado` y, si falla, la solicitud avanza marcada `notificacion_fallida` (RF-25).
2. Dado el correo 3, **Cuando** se envía al solicitante con el enlace público, **Entonces** se usa el token del link.
3. Dada la decisión, **Cuando** se registra, **Entonces** se envía el correo 4 a coordinador + admin.
4. Dado un envío fallido, **Cuando** ocurre, **Entonces** se intenta reintentar y se guarda `estado_envio`/`error_detalle`.

### User Story 3 — Orquestación del documento en la transición (Prioridad P1)

Al transicionar la solicitud a `ENVIADA_A_COMPRAS`, se genera el PDF + se envían los correos 1 y 2 en el pipeline, con las reglas de fallo (PDF no cambia estado; correo al coordinador marca `notificacion_fallida`). Se integra en el flujo actual de transición del repo.

**Why this priority**: conecta el documento y los correos al ciclo real sin rehacer la máquina de estados.
**Independent Test**: una transición a `ENVIADA_A_COMPRAS` dispara generación de PDF y correos 1 y 2; el estado y la bitácora reflejan el resultado.
**Acceptance Scenarios**:
1. Dada una solicitud en `BORRADOR`, **Cuando** se envía (P6→ENVIADA_A_COMPRAS), **Entonces** se genera el PDF, se persiste `documento_generado`, y se envían correos 1 y 2.
2. Dado un fallo de PDF, **Cuando** se transiciona, **Entonces** la solicitud permanece en su estado (no avanza).
3. Dado un fallo del correo 1, **Cuando** avanza, **Entonces** `notificacion_fallida=true` y se alerta.

### Edge Cases

- **PDF con branding**: si el producto lleva marca, el arte/logo se referencia en el documento (sin bloquear por contenido).
- **Sin remitente definido**: el dominio/remitente definitivo es TBD (Q/dominio); Resend usa un remitente provisional hasta que BIA resuelva.
- **Correo rebotado**: reintento automático + `estado_envio=reintentando` + alerta (doc 20 J-E1).
- **Correo 5 (alerta)**: solo se envía si el umbral de días está configurado (nomenclatura vigente).

## Requirements

### Functional Requirements

- **FR-001**: Generador de PDF con **pdfme** a partir de una **plantilla JSON declarativa genérica reemplazable** (`lib/pdf/`).
- **FR-002**: Plantilla genérica cubre RFI, RFQ (producto/servicio) y RFP: membrete (encabezado/pie), bloque de identificación, y secciones según tipo.
- **FR-003**: Persistencia en `documento_generado` con `version` y `plantilla_version` (se conservan versiones, RF/regla de versionado).
- **FR-004**: Fallo de generación de PDF → la solicitud NO cambia de estado (RF-24).
- **FR-005**: Servicio de correo con **Resend** (`lib/mail/`) y remitente/dominio de config; registra en `correo_enviado`.
- **FR-006**: Plantillas de correo 1–5 según documento 13 (cuerpo + asunto + destinatarios) y la nomenclatura vigente (4 del ciclo + 1 alerta).
- **FR-007**: Correo 1 incluye el PDF adjunto; correo 3 incluye el enlace público (token).
- **FR-008**: Reintento automático y registro de `estado_envio`/`error_detalle` ante fallo (RF-25, J-E1).
- **FR-009**: Orquestación en la transición a `ENVIADA_A_COMPRAS` (genera PDF + correos 1–2) en el pipeline del repo.
- **FR-010**: Sin credenciales de Resend en el repo (`RESEND_API_KEY` en entorno).

### Key Entities

- **DocumentoGenerado**: solicitud_id, tipo, ruta_pdf (o buffer), version, plantilla_version, fecha_generacion.
- **CorreoEnviado**: solicitud_id, tipo_correo, destinatario, asunto, estado_envio, intentos, error_detalle, fecha_envio.

## Success Criteria

### Measurable Outcomes

- **SC-001**: `npm run pdf:demo` (o test) genera un PDF genérico válido con la referencia visible.
- **SC-002**: La persistencia de `documento_generado` conserva versiones al regenerar.
- **SC-003**: Un envío de correo (mock de Resend en tests) se registra correctamente en `correo_enviado`; la transición a `ENVIADA_A_COMPRAS` dispara PDF + correos 1–2.
- **SC-004**: Fallo de PDF no cambia el estado; fallo del correo al coordinador marca `notificacion_fallida`.
- **SC-005**: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` pasan; sin credenciales en repo (`secret-scan`).

## Assumptions

- pdfme es la librería de generación de PDF (solicitada por el usuario); la plantilla es **JSON genérico temporal** y se reemplazará por la oficial sin recodificar.
- Resend es el proveedor de correo transaccional (solicitado por el usuario); el remitente/dominio definitivo es configurable (TBD/dominio de BIA).
- La base de datos sigue siendo PostgreSQL local; se mantiene la abstracción `Repositorio` para migrar a Supabase Cloud después.
- En la transición real, el pipeline de generación+correo se ejecuta de forma confiable; los envíos de correo a servicios externos se hacen con reintentos y registro de errores.