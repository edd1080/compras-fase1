# Feature Specification: 000-Sprint0-Backend-Base

**Feature Branch**: `000-sprint0-backend-base`

**Created**: 2026-08-12

**Status**: Approved (G2 — 2026-08-12)

**Input**: Sprint 0 del backlog (doc 17) — arquitectura y base del backend. Repositorio, stack, migraciones 001–006, entornos, secretos, CI/CD, sistema de diseño base con identidad BIA. Ninguna historia depende de insumos del cliente.

**Fuentes autoritativas**: `docs/references/architecture.md` (10+22), `docs/product/prd.md`, `docs/product/glossary.md`, `doc 15` (diccionario de datos/migraciones), `doc 21` (UX/UI identidad), `doc 17` (backlog Sprint 0), decisiones ADR 0005 (autocontenido) y 0006 (catálogo como fuente única).

## User Scenarios & Testing

> Nota: el Sprint 0 es infraestructura; no tiene usuario final. Los escenarios equivalentes describen **letreros de habilitación técnica** que cada tarea debe satisfacer de forma independiente, medible y verificable.

### User Story 1 — Repositorio, proyecto y convenciones (Prioridad P1)

Se inicializa el monorepo `portal-compras-bia` con Next.js (App Router) + TypeScript estricto + Tailwind, estructura de carpetas y convenciones documentadas.

**Why this priority**: base de todo lo demás; sin proyecto no existe nada que probar.
**Independent Test**: `npx tsc --noEmit` y `npm run lint` pasan en vacío; la estructura de carpetas coincide con `architecture.md`.
**Acceptance Scenarios**:
1. Dado un repo recién inicializado, **Cuando** se ejecuta `npm run typecheck`, **Entonces** pasa sin errores.
2. Dado el repo, **Cuando** se ejecuta `npm run lint`, **Entonces** pasa sin errores de formato.

### User Story 2 — Base de datos y migraciones 001–006 (Prioridad P1)

Se aprovisiona PostgreSQL (Supabase) y se aplican las migraciones 001–006 definidas en el diccionario de datos, con datos semilla (4 coordinadores, catálogos, plantillas v0.9).

**Why this priority**: las tablas de `solicitud`, `respuesta_campo`, `adjunto`, `evento_trazabilidad`, `configuracion` y catálogos son prerequisito del Sprint 1.
**Independent Test**: `npm run db:reset` aplica en limpio; las tablas lista por migración existen; `configuracion` tiene las claves iniciales.
**Acceptance Scenarios**:
1. Dado un esquema vacío, **Cuando** se ejecutan las migraciones 001–006, **Entonces** todas las tablas y tipos enumerados existen.
2. Dado el esquema aplicado, **Cuando** se consulta `configuracion`, **Entonces** contiene las claves del diccionario (tasa_isv=0.15, etc.).

### User Story 3 — Entornos, secretos y despliegue continuo (Prioridad P1)

Tres entornos (dev/staging/prod) desplegables de forma independiente, gestión de secretos en variables de entorno (ninguna credencial en el repo) y despliegue continuo desde la rama principal al entorno de pruebas.

**Why this priority**: sin entornos y secretos no hay despliegue seguro ni verificación reproducible.
**Independent Test**: un push a `main` despliega automáticamente a staging; no hay secretos en el repositorio (escaneo).
**Acceptance Scenarios**:
1. Dado un push a `main`, **Cuando** el CI corre, **Entonces** despliega al entorno de pruebas automáticamente.
2. Dado el repositorio, **Cuando** se escanea en busca de claves, **Entonces** no se encuentra ninguna credencial.

### User Story 4 — Sistema de diseño base con identidad BIA (Prioridad P2)

Se aplica la paleta institucional (navy `#1C3565`, azul medio `#2E5FC9`, azules claros), tipografías (Space Grotesk, DM Sans) y componentes base según doc 21, con tokens y escala de espaciado.

**Why this priority**: habilita las pantallas posteriores; no bloquea la base técnica.
**Independent Test**: existe un set de tokens de diseño (CSS variables) que coincide con el doc 21; los componentes base renderizan.
**Acceptance Scenarios**:
1. Dado el proyecto, **Cuando** se consultan los tokens de color, **Entonces** contienen `--azul-marino #1C3565` y `--azul-medio #2E5FC9`.
2. Dados los componentes base, **Cuando** se renderiza un formulario, **Entonces** usa la tipografía DM Sans.

### Edge Cases

- ¿Qué ocurre si las migraciones se aplican en un entorno que ya tiene datos? → `db:reset` es idempotente y la base se regenera en limpio (Sprint 0 no tiene datos reales).
- ¿Cómo se maneja un fallo de aprovisionamiento de Supabase/almacenamiento? → el CI reporta el fallo y bloquea el despliegue; la conexión se verifica desde los tres entornos.
- ¿Qué ocurre con la identidad visual si falta una fuente? → las fuentes se cargan como dependencia; si fallan, los componentes siguen siendo legibles con fuente de respaldo.
- ¿Secretos por entorno? → cada entorno tiene su propio conjunto de variables de entorno; ninguno comparte secretos en el repo.

## Requirements

### Functional Requirements (técnicos / de habilitación)

- **FR-001**: El sistema DEBE iniciar un proyecto Next.js (App Router) con TypeScript estricto (sin `any` implícito) y Tailwind.
- **FR-002**: El sistema DEBE definir scripts de verificación `typecheck`, `lint`, `test` y `db:reset` en `package.json` (obligatorio: el AGENTS.md/guía 23 depende de ellos).
- **FR-003**: El sistema DEBE aprovisionar PostgreSQL y almacenamiento de archivos en tres entornos independientes (dev, staging, prod).
- **FR-004**: El sistema DEBE aplicar las migraciones 001–006 en orden (tipos, usuario/catálogos, campos/plantillas, solicitud/respuestas/adjuntos, trazabilidad, configuración + seed).
- **FR-005**: El sistema DEBE cargar datos semilla: 4 coordinadores con categorías, catálogos (áreas, categorías, unidades, técnicas) y plantillas v0.9.
- **FR-006**: El sistema DEBE gestionar secretos y variables por entorno; ninguna credencial en el repositorio.
- **FR-007**: El sistema DEBE desplegar automáticamente al entorno de pruebas desde la rama principal.
- **FR-008**: El sistema DEBE aplicar la identidad visual base BIA (paleta, tipografías, tokens de espaciado, componentes base) según doc 21.
- **FR-009**: El sistema DEBE operar sobre un **dominio temporal** del proveedor de despliegue y migrar cuando BIA resuelva el dominio (tema abierto Q, no bloquea este sprint).
- **FR-010** [NEEDS CLARIFICATION]: resolución del **dominio definitivo** — no bloquea el Sprint 0; se trabaja sobre dominio temporal.

### Key Entities

- **Configuración (`configuracion`)**: parámetros operativos editables sin despliegue (claves iniciales según diccionario).
- **Usuarios (`usuario`)**: coordinadores y admin, con categorías asignadas.
- **Catálogos (`catalogo_valor`, `campo_catalogo`, `plantilla`, `plantilla_campo`)**: base del catálogo de campos (ADR 0006).
- **Solicitudes y trazabilidad (`solicitud`, `respuesta_campo`, `adjunto`, `evento_trazabilidad`)**: tablas del Sprint 1, creadas aquí.
- **Seed**: datos iniciales de coordinadores y catálogos.

## Success Criteria

### Measurable Outcomes

- **SC-001**: `npm run typecheck` y `npm run lint` pasan sobre el esqueleto sin errores.
- **SC-002**: Las migraciones 001–006 aplican en limpio (`npm run db:reset`) en los tres entornos.
- **SC-003**: Ninguna credencial aparece en el repositorio (verificación automatizada).
- **SC-004**: Un push a `main` despliega automáticamente a staging (CI/CD operativo).
- **SC-005**: Existen tokens de diseño de identidad BIA y componentes base que renderizan.
- **SC-006**: La estructura del proyecto coincide con `architecture.md` (capas y carpetas).

## Assumptions

- Se usa el stack vigente de `architecture.md`: Next.js (App Router), Supabase (PostgreSQL + Storage), Vercel, Tailwind; SheetJS, correo transaccional y Claude API se integran en sprints posteriores (el Sprint 0 solo sienta la base y no integra aún el agente).
- El dominio temporal es aceptable para el Sprint 0; la migración al dominio definitivo es tarea del Sprint 5.
- La identidad visual se aplica a nivel de tokens y componentes base, no se construyen aún las pantallas del producto (eso es de sprints 1+).
- No se implementa ninguna funcionalidad de negocio (intake, IA, comparativas) en este sprint — solo habilitación técnica.
- RAG/embeddings se posponen (ADR/arquitectura); solo se garantiza esquema limpio.
