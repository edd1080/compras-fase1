# Feature Specification: 002-Backend-Api

**Feature Branch**: `002-backend-api`

**Created**: 2026-08-12

**Status**: Approved (G2 — 2026-08-12)

**Input**: Primera historia del Sprint 2 (doc 17, H2.1 — assessment del agente), sobre la deuda técnica real del proyecto: la feature 001 construyó el frontend consumiendo `lib/domain` con **fixtures** (sin persistencia). Esta feature materializa la **capa de API y persistencia** a la vez que añade la función `assessment_requerimiento` al cerebro, para que el flujo trabaje con datos reales.

**Fuentes autoritativas**: `docs/references/architecture.md` (stack), `docs/product/prd.md` (RF-12…18 assessment, RF-01…11 intake), diccionario de datos (15, tablas y migraciones 001–006), `docs/product/user-flows.md` (flujo solicitante), `lib/domain/*` (cerebro existente), doc 16 (`assessment_requerimiento` guardrails).

## User Scenarios & Testing

> Modelo de aplicación: la UI (feature 001) navega al **backend** a través de **API routes de Next.js** que exponen `lib/domain` y persisten en PostgreSQL local (vía `pg`). La capa de acceso a datos queda **abstracta** (interfaz `Repositorio`) para poder apuntar a Supabase Cloud después solo cambiando el adaptador y la URL. La configuración se lee de `DATABASE_URL` (local) sin credenciales en el repo.

### User Story 1 — Persistencia real de solicitudes y respuestas (Prioridad P0)

Repositorios PostgreSQL (`pg`) para `solicitud`, `respuesta_campo`, `adjunto`, `evento_trazabilidad` y `configuracion`, aplicando el esquema de las migraciones 001–006. Las operaciones de la UI que hoy usan fixtures pasan a usar estos repositorios.

**Why this priority**: sin persistencia, las demás historias (assessment, PDF, correos) no tienen datos reales.
**Independent Test**: un repo puede crear una solicitud en `BORRADOR`, guardar respuestas, transicionar a `ENVIADA_A_COMPRAS` (escribe `evento_trazabilidad` + `fecha_envio`) y releerla; todo contra la base local.
**Acceptance Scenarios**:
1. Dada la base migrada, **Cuando** el repo crea una solicitud, **Entonces** queda en `BORRADOR` con `created_at`.
2. Dada una solicitud, **Cuando** se aplica una transición válida, **Entonces** se persiste el nuevo estado y se escribe el evento de trazabilidad en la misma transacción.
3. Dado un correo no institucional, **Cuando** se crea la solicitud, **Entonces** se marca (campo de revisión) según la regla.

### User Story 2 — Capa de API (routes next) (Prioridad P0)

API routes que exponen el cerebro: crear/actualizar solicitud, transicionar estado, listar bandeja, consultar por correo (mis solicitudes, sin precios), guardar cotización, generar comparativa, registrar decisión, y métricas del dashboard. Reemplazan el uso de fixtures en el frontend.

**Why this priority**: es el "contrato servicios" que conecta la UI con el modelo real.
**Independent Test**: cada endpoint responde con JSON tipado, valida (Zod) y aplica reglas de `lib/domain`; `curl` a las rutas devuelve los datos reales persistidos.
**Acceptance Scenarios**:
1. Dado `POST /api/solicitudes`, **Cuando** llega una solicitud válida, **Entonces** crea el borrador y devuelve la solicitud tipada.
2. Dado `PATCH /api/solicitudes/[id]/estado`, **Cuando** la transición es válida, **Entonces** persiste y devuelve el nuevo estado + evento.
3. Dado `GET /api/solicitudes?email=...`, **Cuando** es consulta de "mis solicitudes", **Entonces** devuelve solo referencia/título/estado/fechas (nunca precios/cotizaciones).
4. Dado `POST /api/comparativas`, **Cuando** hay ≥2 cotizaciones, **Entonces** genera la comparativa con el motor y persiste.

### User Story 3 — `assessment_requerimiento` en el cerebro (Prioridad P1)

Función `assessment_requerimiento` en `lib/domain`: dado el formulario capturado y el catálogo vigente, devuelve hasta 6 preguntas de los campos faltantes (`campos_disponibles_catalogo`), con validación dura (los campos inexistentes se descartan) y un contrato para la IA (Sprint 3 la conectará; ahora devuelve las preguntas por reglas del catálogo).

**Why this priority**: es la historia H2.1 del Sprint 2 y la pieza faltante del cerebro; la UI ya la espera (P5).
**Independent Test**: la función devuelve hasta 6 preguntas solo de campos del catálogo, respetando el límite y el orden de impacto; sin campos inventados.
**Acceptance Scenarios**:
1. Dado un borrador con el formulario de plantilla lleno, **Cuando** se ejecuta el assessment, **Entonces** pide solo los campos obligatorios/determinantes aún vacíos del catálogo.
2. Dado un catálogo, **Cuando** la función propone campos, **Entonces** todos existen en `campos_disponibles_catalogo` (validación dura).
3. Dado un contexto sin faltantes, **Cuando** se ejecuta, **Entonces** devuelve `sin_preguntas_pendientes = true`.
4. Dado el formulario con branding activo, **Cuando** falta el logo, **Entonces** el assessment lo señala como crítico (B2 sigue vigente).

### User Story 4 — Conectar el frontend a la API (Prioridad P1)

Reemplazar los usos de `lib/fixtures` en la UI por llamadas a la API (fetch), manteniendo los portales por rol. Los stubs/fixtures quedan solo como datos iniciales del seed/auth; nada crítico se lee de mock en runtime.

**Why this priority**: esta es la integración que hace "real" al producto; si no, la API no tiene consumidor.
**Independent Test**: al levantar la app con la API, los flujos solicitante y coordinador leen/escriben datos reales persistidos (no fixtures).
**Acceptance Scenarios**:
1. Dado el wizard, **Cuando** se completa el flujo, **Entonces** crea una solicitud real vía API y aparece en "mis solicitudes" reales.
2. Dado la bandeja del coordinador, **Cuando** carga, **Entonces** muestra solicitudes reales asignadas desde la API.
3. Dado el dashboard, **Cuando** carga, **Entonces** calcula métricas sobre datos reales.

## Requirements

### Functional Requirements

- **FR-001**: Repositorios PostgreSQL (`lib/db/`): acceso a datos para solicitud, respuesta_campo, adjunto, evento_trazabilidad, cotizacion, configuracion; usando `pg` y `DATABASE_URL`; sin credenciales en el repo.
- **FR-002**: Interfaz `Repositorio` (puerto) + adaptador Postgres, de modo que cambiar a Supabase Cloud luego sea solo nuevo adaptador + URL.
- **FR-003**: La máquina de estados escribe estado + `evento_trazabilidad` en la misma transacción (integridad).
- **FR-004**: API routes (Zod validation): `POST /api/solicitudes`, `PATCH /api/solicitudes/[id]/estado`, `GET /api/solicitudes`, `GET /api/solicitudes/mis-solicitudes`, `POST /api/solicitudes/[id]/cotizaciones`, `POST /api/solicitudes/[id]/comparativa`, `POST /api/comparativas/[id]/decision`, `GET /api/metricas`.
- **FR-005**: `assessment_requerimiento` en `lib/domain/assessment.ts`: hasta 6 preguntas, validación dura contra el catálogo, `sin_preguntas_pendientes`, campo libre alternativo, contrato tipado para la IA futura.
- **FR-006**: El frontend consume la API (fetch + tipos) en lugar de fixtures para solicitud, bandeja, comparativa, decisión y métricas; mantiene portales por rol.
- **FR-007**: `mis-solicitudes` y estado nunca exponen precios/cotizaciones (esto requiere la vista está protegida).
- **FR-008**: Manejo de errores en API: respuestas JSON de error tipadas, validación de entrada, y ningún secreto en respuestas.

### Key Entities

- **Solicitud / RespuestaCampo / EventoTrazabilidad / Cotizacion / Comparativa / Configuracion**: mismas del diccionario, ahora persistidas.
- **Catálogo de campos**: persiste y alimenta el assessment con campos válidos (ADR 0006).

## Success Criteria

### Measurable Outcomes

- **SC-001**: Los repositorios persisten y releen solicitudes, respuestas y eventos contra la base migrada 001–006.
- **SC-002**: Los endpoints de la API responden JSON tipado, validan con Zod y aplican reglas de `lib/domain`.
- **SC-003**: `assessment_requerimiento` devuelve ≤6 preguntas, todas del catálogo, con `sin_preguntas_pendientes` cuando no falta nada.
- **SC-004**: El frontend lee/escribe datos reales (no fixtures) para los 5 flujos; `mis-solicitudes` no muestra montos.
- **SC-005**: La transición de estado + evento ocurre en la misma transacción (integridad).
- **SC-006**: `npm run typecheck`, `npm run lint`, `npm run test` pasan; la API se prueba con una base local (no mock).
- **SC-007**: Sin credenciales en el repo; `DATABASE_URL` solo en entorno/`.env` (ignorado).

## Assumptions

- Persistencia vía `pg` contra el PostgreSQL local provisionado en Sprint 0 (mismo esquema). Se define una interfaz `Repositorio` para que cambiar a Supabase Cloud después sea solo un adaptador nuevo + URL; no se bloquea por tener o no Supabase.
- La IA del assessment (Claude) se integra en Sprint 3; esta feature implementa la función de assessment por reglas del catálogo con un contrato listo para la IA.
- La autenticación real (coordinador/admin) sigue siendo Sprint 3+; la sesión por rol se mantiene como fixture de sesión. La API valida por lógica de dominio, no por auth real aún.
- PDF y correo transaccional se tratan en la feature 003 (siguiendo H2.3/H2.4), sobre los datos ya persistidos por esta feature.