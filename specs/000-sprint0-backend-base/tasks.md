---
description: "Task list for feature implementation — 000-Sprint0-Backend-Base"
---

# Tasks: 000-Sprint0-Backend-Base

**Input**: Design documents from `/specs/000-sprint0-backend-base/`
**Prerequisites**: plan.md (G3), spec.md (G2 aprobado)
**Tests**: los issues siguientes (esc:base) cubren verificación técnica; se añadirán tests de componentes base y de integración de migraciones.
**Organization**: agrupadas por historia de habilitación; el orden de ejecución es secuencial (sprint 0 es fundacional, no paralelo en su primera pasada).

## Formato: `[ID] [P?] [Story] Descripción`

- **Story**: US1 (repo/stack), US2 (migraciones), US3 (entornos/secretos/CI/CD), US4 (diseño base)
- Paths dentro de `portal-compras-bia/`

---

## Fase 0 — Repositorio y stack (US1)

- [ ] T001 [US1] Inicializar el proyecto Next.js (App Router) con TypeScript estricto (`tsconfig.json` con `strict: true`, sin `noEmit` en modo dev) y Tailwind.
- [ ] T002 [US1] Crear estructura de carpetas: `app/`, `components/`, `lib/supabase`, `lib/design`, `styles/`, `migrations/`, `scripts/`.
- [ ] T003 [US1] Añadir scripts a `package.json`: `typecheck` (`tsc --noEmit`), `lint`, `test`, `db:reset`, `db:migrate`.
- [ ] T004 [US1] Configurar linter y formateo (ESLint + Prettier) y documentar la convención de ramas en un `CONVENTIONS.md` o sección en `AGENTS.md`.
- [ ] T005 [US1] Crear `app/layout.tsx` y `app/page.tsx` shell base renderizando la identidad BIA (fuentes Space Grotesk/DM Sans, paleta).

## Fase 1 — Base de datos y migraciones (US2)

- [ ] T006 [US2] Escribir migración `001` — tipos enumerados (`tipo_solicitud`, `subtipo_solicitud`, `estado_solicitud`, `tipo_dato_campo`, `origen_campo`, `tipo_adjunto`, `formato_cotizacion`, `rol_usuario`, `tipo_evento`).
- [ ] T007 [US2] Escribir migración `002` — tablas `usuario` y `catalogo_valor`.
- [ ] T008 [US2] Escribir migración `003` — `campo_catalogo`, `plantilla`, `plantilla_campo`.
- [ ] T009 [US2] Escribir migración `004` — `solicitud`, `respuesta_campo`, `adjunto`.
- [ ] T010 [US2] Escribir migración `005` — `evento_trazabilidad` (tabla de solo escritura).
- [ ] T011 [US2] Escribir migración `006` — `configuracion` + valores iniciales (`tasa_isv=0.15`, etc.) y datos semilla: 4 coordinadores con categorías, catálogos (áreas, categorías, unidades, técnicas), plantillas v0.9.
- [ ] T012 [US2] Implementar `scripts/db:reset` y `scripts/db:migrate` (aplicar 001–006 en orden, idempotente).
- [ ] T013 [US2] Verificar las tablas lista por migración y el seed (coordinadores, catálogos, `configuracion`).

## Fase 2 — Entornos, secretos y CI/CD (US3)

- [ ] T014 [US3] Crear `.env.example` (plantilla sin valores) y configurar gestión de secretos por entorno (dev/staging/prod) en Vercel.
- [ ] T015 [US3] Crear `vercel.json` y configuración de tres entornos desplegables de forma independiente.
- [ ] T016 [US3] Configurar despliegue continuo: push a `main` → deploy automático a staging.
- [ ] T017 [US3] Añadir escaneo/verificación de secretos en CI (ninguna credencial en el repositorio).
- [ ] T018 [US3] Verificar conexión a Supabase (PostgreSQL + Storage) desde los tres entornos.

## Fase 3 — Sistema de diseño base (US4)

- [ ] T019 [US4] Implementar tokens de color en `lib/design`/`styles`: `--azul-marino #1C3565`, `--azul-medio #2E5FC9`, `--azul-claro #E8EEF9`, `--azul-tenue #F0F4FB`, `--fondo #F5F7FA`, `--superficie #FFFFFF`, `--borde #D8DFE9`, semánticos (éxito/advertencia/error/info) y escala de espaciado 4px.
- [ ] T020 [US4] Implementar tokens de tipografía (Space Grotesk títulos, DM Sans cuerpo) y carga de fuentes.
- [ ] T021 [US4] Crear componentes base: `Button`, `Field`, `Card`, `Alert`, `Badge` (según doc 21: radius 8px, alturas 44px, estados).
- [ ] T022 [US4] Añadir tests de unidades de los componentes base y verificación de tokens vs doc 21.

## Verificación final (DoD)

- [ ] T023 [US1-4] Ejecutar la batería completa: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run db:reset`, `npx adf doctor` (→ DOCTOR_OK), escaneo de secretos; confirmar SC-001…SC-006.
