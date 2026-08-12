# Implementation Plan: 001-Frontend-Prototype

**Branch**: `001-frontend-prototype` | **Date**: 2026-08-12 | **Spec**: `specs/001-frontend-prototype/spec.md`

**Input**: Feature specification (US1–US5, FR-01…17, SC-01…07). Port del prototipo HTML a React sobre el stack del Sprint 0.

## Summary

Migrar el prototipo vanilla-JS a un frontend React/Next.js enterprise con **capa de dominio pura (el "cerebro")** y **portales internos por rol** (público-solicitante, coordinador, admin). El router de demo del prototipo no se porta: cada rol entra a su portal por sesión/rol. Orden: primero el cerebro (`lib/domain/*` test-first: máquina de estados, reglas/B1B2B3, catálogo, comparativa, métricas), luego cada rol se porta sobre ese cerebro.

## Technical Context

**Language/Version**: TypeScript estricto, React 19, Next.js 16 (App Router).

**Primary Dependencies**: Next.js, React, Tailwind CSS v4 (tokens `@theme`), clsx/tailwind-merge (`cn`). Sin librería de gráficos (barras CSS). Sin mock del prototipo; fixtures tipados en `lib/fixtures`.

**Storage**: SQLite/servidor actual (Sprint 0) — sin migraciones nuevas; los datos del port provienen de fixtures tipados hasta que existan las API next.

**Testing**: Vitest + Testing Library (componentes, flujos básicos), typecheck/lint/build.

**Target Platform**: Web (App Router). Español de Honduras.

**Project Type**: web-service (frontend+backend unificados en Next.js).

**Performance Goals**: carga inicial < 2s; sin librerías pesadas; barras CSS (sin lib de charts).

**Constraints**: reutilizar el sistema de diseño del Sprint 0 (no diseñar otro); accesibilidad AA; `prefers-reduced-motion`; movil primero (público) / escritorio (panel/admin).

**Scale/Scope**: ~12 componentes nuevos + ~10 rutas + 5 flujos + fixtures tipados.

## Constitution Check

*GATE: reglas de la constitution aplicables: RN-01 (decisión humana → B3 recomendación destacada vs sugerencia IA), RN-02 (agente dentro del catálogo), RN-05 (sin login / link público → cookie de continuidad), RN-06 (nunca cero → "no especificado"), RN-07 (autocontenido). Principios 3 (decisión humana visible como humana) y 4 (problemas declarados, no escondidos) de UX/UI (21).*

✅ Sin violaciones que justificar.

## Project Structure

### Documentación (feature)

```text
specs/001-frontend-prototype/
├── spec.md            # Especificación (G2 aprobada)
├── plan.md            # Este archivo (G3)
└── tasks.md           # Tareas ejecutables (contrato G4)
```

### Código (App Router — estructura objetivo)

```text
portal-compras-bia/
├── app/
│   ├── layout.tsx              # shell raíz (fuentes, globals, providers)
│   ├── page.tsx                # P1 identificacion (US1/US2)
│   ├── solicitud/
│   │   └── nueva/page.tsx      # wizard P2-P7 (US2) — hook useSolicitudWizard
│   ├── mis-solicitudes/page.tsx# consulta por correo (US2)
│   ├── panel/
│   │   ├── layout.tsx          # topbar coordinador
│   │   ├── page.tsx            # C1 bandeja (US3)
│   │   └── solicitud/[id]/page.tsx  # C2 detalle + etapas (US3)
│   ├── comparativa/[token]/page.tsx  # L1/L2 vista pública (US4)
│   └── admin/
│       ├── layout.tsx          # topbar admin
│       └── page.tsx            # A1 dashboard (US5)
├── components/
│   ├── ui/                     # base existentes (Button, Field, Card, Alert, Badge)
│   └── ui-ext/                 # nuevos: Segmented, Chip, Switch, Stepper, Modal,
│   │                           #        Toast, DataTable, MetricCard, BarChart,
│   │                           #        EmptyState, Timeline, Avatar, Topbar, Shell
│   ├── solicitante/  # SolicitanteWizard, Stepper, AssessmentForm, ClasificacionChips, DocPreview
│   ├── coordinador/  # Bandeja, DetalleSolicitud, CargaCotizaciones, Comparativa, Recomendacion
│   ├── publica/      # VistaPublica, TarjetaProveedor, DecisionButtons
│   └── dashboard/    # MetricGrid, Filtros, TablaProcesos
├── lib/
│   ├── domain/       # EL CEREBRO — TypeScript puro, sin Next/Supabase (test-first)
│   │   ├── types.ts            # entidades del diccionario
│   │   ├── state-machine.ts    # máquina de estados de solicitud
│   │   ├── rules.ts            # RN-01…08 + bloqueos B1/B2/B3 (funciones puras)
│   │   ├── catalog.ts          # catálogo de campos → formulario dinámico
│   │   ├── comparativa.ts      # fiscal, discrepancias, pros/contras/sugerencia
│   │   └── metrics.ts          # conversión, ciclo, volumen por coordinador/tipo
│   ├── fixtures/     # fixtures tipados (solicitudes, cotizaciones, usuarios, métricas)
│   ├── catalog.ts   # alias → lib/domain/catalog
│   └── cookie.ts     # cookie de continuidad (30 días)
├── styles/globals.css  # tokens fusión DOC21 + prototipo
└── hooks/              # useSolicitudWizard, useFixtures, useMediaQuery, useToast
```

**Structure Decision**: se reutiliza la estructura App Router del Sprint 0 con tres layouts de rol (raíz, panel, admin), componentes `ui/` (base) y `ui-ext/` (extended), y funcional específica por dominio (`solicitante/`, `coordinador/`, `publica/`, `dashboard/`). Los fixtures tipados por dominio van en `lib/fixtures`.

## Complexity Tracking

No aplica (sin violaciones).

## Risk / Rollback

| Riesgo | Mitigación |
|---|---|
| La lógica de negocio se pierde entre flujos | Cerebro central en `lib/domain/*` test-first; la UI y las futuras API lo importan (no reimplementan) |
| El port generico difiere visualmente del prototipo | Screenshot del prototipo como referencia; SC-006 compara el port |
| Mock data cuela en la UI | Fixtures tipados y centralizados en `lib/fixtures`; no inline en componentes |
| Magnitud de 5 flujos | Implementación por US atómica; cada US con su test y commit |
| Bloqueos B1/B2/B3 solo en cliente | Funciones de `lib/domain/rules` reutilizadas por cliente y servidor |
| Accesibilidad olvidada | Contraste AA desde tokens; navegación por teclado testeada; axe en CI si se agrega |

**Rollback**: cambios aislados en `components/`,`app/`,`lib/fixtures/`,`hooks/`; sin migraciones; revert fácil ante fallo de typecheck/test.
