# Implementation Plan: 000-Sprint0-Backend-Base

**Branch**: `000-sprint0-backend-base` | **Date**: 2026-08-12 | **Spec**: `specs/000-sprint0-backend-base/spec.md`

**Input**: Feature specification from `/specs/000-sprint0-backend-base/spec.md` (FR-001…FR-010, SC-001…SC-006). Sprint 0 del backlog (doc 17).

## Summary

El Sprint 0 sienta la base técnica del Portal de Compras BIA sin implementar negocio: un proyecto Next.js (App Router) + TypeScript estricto + Tailwind; aprovisionamiento de PostgreSQL y almacenamiento (Supabase) en tres entornos; migraciones 001–006 con datos semilla; gestión de secretos por entorno; despliegue continuo a staging; y un sistema de diseño base con identidad BIA (tokens y componentes). Todo según `architecture.md` y el diccionario de datos (doc 15).

## Technical Context

**Language/Version**: TypeScript estricto (sin `any` implícito), Node LTS actual.

**Primary Dependencies**: Next.js (App Router), React, Tailwind CSS, Supabase (JS client + Postgres), variables de entorno. Internos posteriores (no se integran aún): Claude API, SheetJS, correo transaccional.

**Storage**: PostgreSQL (Supabase) + Supabase Storage (archivos). Migraciones SQL versionadas (001–006).

**Testing**: Jest/Vitest + testing-library para los pocos componentes base; verificación de migraciones vía `db:reset`; CI ejecuta typecheck/lint/test.

**Target Platform**: Web (Vercel). Español de Honduras, zona America/Tegucigalpa.

**Project Type**: web-service (frontend + backend unificados en Next.js App Router).

**Performance Goals**: no aplica métricas de negocio en este sprint; objetivo: esqueleto compilable, lint-clean y desplegable.

**Constraints**: sin credenciales en repo (secretos por entorno); migraciones sobre esquema en limpio (sin datos reales); dominio temporal aceptable (migración a dominio definitivo en Sprint 5); la identidad visual no construye pantallas de producto.

**Scale/Scope**: 1 proyecto Next.js, 3 entornos, 6 migraciones, tokens de diseño BIA.

## Constitution Check

*GATE: reglas de la constitution aplicables a este sprint: *

- **Autocontenido** (ADR 0005): sin integraciones externas al ERP; verificado — este sprint solo aprovisiona el stack propio.
- **Catálogo como fuente única** (ADR 0006): las tablas y semillas de catálogos se crean aquí siguiendo el diccionario.
- **Sin secretos en repo**: se cumple mediante gestión de secretos por entorno.
- **Configurable, no en código**: `configuracion` se crea con claves iniciales; no se fija nada operativo en código.

✅ Sin violaciones que justificar (no requiere Complexity Tracking).

## Project Structure

### Documentation (this feature)

```text
specs/000-sprint0-backend-base/
├── spec.md            # Especificación (G2 aprobada)
├── plan.md            # Este archivo (G3)
└── tasks.md           # Tareas ejecutables (contrato G4)
```

### Source Code (web app, Next.js App Router)

```text
portal-compras-bia/
├── app/                       # Next.js App Router (rutas del producto, sprints posteriores)
│   └── layout.tsx / page.tsx  # shell base con identidad BIA
├── components/                # componentes base (button, field, card, alert, badge)
├── lib/
│   ├── supabase/              # cliente + tipos de la base
│   └── design/                # tokens (color, tipografía, espaciado, radius)
├── styles/                    # Tailwind + variables CSS de identidad BIA
├── migrations/                # SQL 001..006 (diccionario de datos) + seed
├── scripts/                   # db:reset, db:migrate, secret-scan
├── .env.example              # plantilla de variables de entorno (sin valores)
├── vercel.json               # entornos/despliegue
└── package.json              # scripts typecheck/lint/test/db:reset
```

**Structure Decision**: se usa un único proyecto Next.js (App Router) con `app/` para rutas, `components/` y `lib/` para lógica/tokens, y `migrations/` para SQL. El stack es frontend+backend unificado (no hay `backend/` separado): las API routes de Next.js servirán la capa de aplicación en sprints posteriores. Esta estructura coincide con `architecture.md`.

## Complexity Tracking

No aplica (sin violaciones de la constitución).

## Risk / Rollback

| Riesgo | Mitigación |
|---|---|
| Migraciones fallan al aplicar | `db:reset` idempotente; se aplican en orden y se verifican por migración |
| Credenciales filtradas | Secretos solo en variables de entorno por entorno; escaneo en CI; `.env.example` sin valores |
| Fallo de aprovisionamiento Supabase/Vercel | CI lo reporta y bloquea deploy; dominio temporal no bloquea |
| Estructura diverge de la arquitectura | Plan fija la estructura; se valida contra `architecture.md` en DoD |
| Identidad visual sin fuentes | Fuentes como dependencia; respaldo legible si falla carga |

**Rollback**: `db:reset` regenera el esquema en limpio (sin datos reales en Sprint 0); deploys reversibles por Vercel (rollback a instancia anterior).
