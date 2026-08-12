# Implementation Plan: 002-Backend-Api

**Branch**: `002-backend-api` | **Date**: 2026-08-12 | **Spec**: `specs/002-backend-api/spec.md`

**Input**: Feature specification (US1–US4, FR-01…08, SC-01…07). Capa de API + persistencia real + assessment, sobre el frontend de la feature 001 que hoy usa fixtures.

## Summary

Materializar el backend que conecta el frontend (feature 001) con el modelo real: repositorios PostgreSQL (`pg` + `DATABASE_URL` sobre el esquema 001–006), API routes next con validación Zod que exponen `lib/domain`, la función `assessment_requerimiento` en el cerebro, y conectar el frontend para que lea/escriba datos reales (reemplazando fixtures de runtime). La capa de datos queda abstracta (puerto `Repositorio`) para migrar a Supabase Cloud luego con solo un adaptador nuevo.

## Technical Context

**Language/Version**: TypeScript estricto, Node, Next.js 16 (App Router).

**Primary Dependencies**: `pg` (node-postgres) para conectar a PostgreSQL local; `zod` (ya presente) para validación de entrada en API; `@/lib/domain/*` (cerebro) y `@/lib/db/*` (repositorios).

**Storage**: PostgreSQL local provisionada en Sprint 0 (esquema 001–006). `DATABASE_URL` en `.env`/entorno (nunca en repo). Cambio a Supabase Cloud = adaptador nuevo + URL.

**Testing**: Vitest (repositorios contra base local de prueba, dominio, API con handler de prueba); typecheck/lint/build.

**Target Platform**: next (web-service).

**Performance Goals**: no crítico para esta feature; conexión por pool de `pg`.

**Constraints**: sin credenciales en repo; la transición de estado + `evento_trazabilidad` ocurre en la **misma transacción**; `mis-solicitudes` nunca expone montos; sin migraciones nuevas (se reutiliza 001–006).

**Scale/Scope**: ~5 repositorios, ~8 endpoints, 1 función de dominio (assessment), integración frontend de 5 flujos.

## Constitution Check

*GATE: RN-06 (nunca inventar cifras → los montos solo vienen de la data); RN-07 (autocontenido → Postgres del proyecto, sin ERP del cliente); ADR 0006 (catálogo como fuente única → el assessment valida contra el catálogo); sin secretos en repo.*

✅ Sin violaciones.

## Project Structure

### Documentación (feature)

```text
specs/002-backend-api/
├── spec.md            # Especificación (G2 aprobada)
├── plan.md            # Este archivo (G3)
└── tasks.md           # Tareas ejecutables (contrato G4)
```

### Código

```text
portal-compras-bia/
├── lib/
│   ├── domain/
│   │   ├── assessment.ts     # assessment_requerimiento (NUEVO, test-first)
│   │   └── ...               # cerebro existente
│   ├── db/
│   │   ├── pool.ts           # pool de pg desde DATABASE_URL
│   │   ├── repositorio.ts    # interfaz (puerto) del dominio
│   │   ├── postgres-repo.ts  # adaptador Postgres (solicitud, respuesta, adjunto, evento, cotizacion, config)
│   │   └── seed.ts           # datos iniciales / lectura de catálogo (opcional)
│   └── api-client.ts         # cliente fetch tipado para el frontend
├── app/api/
│   ├── solicitudes/route.ts              # POST crear / GET listar (por rol)
│   ├── solicitudes/[id]/estado/route.ts  # PATCH transicionar
│   ├── solicitudes/[id]/cotizaciones/route.ts  # POST cargar
│   ├── solicitudes/[id]/comparativa/route.ts   # POST generar
│   ├── solicitudes/mis-solicitudes/route.ts     # GET por email (sin montos)
│   ├── comparativas/[id]/decision/route.ts      # POST registrar
│   └── metricas/route.ts                          # GET dashboard
├── hooks/               # llamadas a la API desde la UI
└── .env.example         # DATABASE_URL
```

**Structure Decision**: repositorios por agregado de dominio en `lib/db/` con una interfaz `Repositorio` (puerto) y adaptador `postgres-repo.ts`. Las API routes (App Router) validan entrada con Zod, invocan `lib/domain` y persisten vía el repositorio. El frontend usa `lib/api-client.ts` (cliente fetch tipado) en lugar de fixtures.

## Complexity Tracking

No aplica (sin violaciones).

## Risk / Rollback

| Riesgo | Mitigación |
|---|---|
| Conexión a PostgreSQL falla | `DATABASE_URL` en `.env`; pool; verificación con `pg_isready`/test de conexión |
| La API queda sin consumo | Se conecta el frontend (US4) dentro de la misma feature; no se deja backend huérfano |
| Inyección / datos corruptos | Validación Zod en todas las rutas; parámetros por prepared statements (.query con parámetros) |
| Transición sin evento | La máquina de estados + repositorio escriben en la misma transacción SQL |
| Rutas expuestas sin auth (Sprint 3) | La vista `mis-solicitudes` filtra por email en el servidor; se documenta que auth real llega en Sprint 3 |
| Cambiar a Supabase después costoso | Interfaz `Repositorio` abstracta; el frontend no depende del adaptador concreto |

**Rollback**: cambios aislados en `lib/db/`, `app/api/`, `lib/domain/`, frontend; sin migraciones; `db:reset` reinicia la base local (sin datos de producción); revert por commit si falla la verificación.