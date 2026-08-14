---
description: "Task list for feature implementation — 005-Auth-Supabase"
---

# Tasks: 005-Auth-Supabase

**Input**: Design documents from `/specs/005-auth-supabase/`
**Prerequisites**: plan.md (G3), spec.md (G2 aprobado).
**Nota**: la implementación (G4) requiere que el usuario proporcione las credenciales de Supabase Cloud (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

## Formato: `[ID] [P?] [Story] Descripción`

---

## Fase 0 — Dependencias y cliente SSR (US1)

- [ ] T001 [US1] Instalar `@supabase/ssr`. Actualizar `lib/supabase/server.ts` (cliente SSR con cookies de sesión).
- [ ] T002 [US1] Actualizar `lib/supabase/client.ts` (cliente browser con `@supabase/ssr` singleton).
- [ ] T003 [US1] Crear `lib/auth.ts`: `getSession()`, `requireAuth(roles)`, `redirectPorRol(rol)`.
- [ ] T004 [US1] Añadir variables de entorno a `.env.example` (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY).
- [ ] T005 [US1] Types: extender el tipo `User` de Supabase para incluir `app_metadata.rol`.

## Fase 1 — Middleware de protección de rutas (US3)

- [ ] T006 [US3] Crear `middleware.ts` en raíz: rutas protegidas `/panel/*` (rol coordinador) y `/admin/*` (rol admin); rutas públicas `/`, `/solicitud/*`, `/mis-solicitudes`, `/comparativa/*`, `/login/*`, `/_next/*`, `/api/*`; redirección a `/login/[rol]` si no autenticado; redirección a su portal si ya autenticado en login.
- [ ] T007 [US3] Tests de integración del middleware: simular sesiones y verificar redirects.

## Fase 2 — Páginas de login (US2)

- [ ] T008 [US2] Crear `app/login/coordinador/page.tsx`: formulario email+password con diseño oficial (glass, blobs, íconos, piloto de referencia).
- [ ] T009 [US2] Crear `app/login/admin/page.tsx`: mismo diseño con sky tone.
- [ ] T010 [US2] Lógica de autenticación: `supabase.auth.signInWithPassword()`, manejo de errores, redirección post-login según rol (`/panel` o `/admin`).
- [ ] T011 [US2] Tests e2e de login: credenciales válidas → redirige; inválidas → error; ya autenticado → redirige a su portal.

## Fase 3 — Sesión real en paneles (US4)

- [ ] T012 [US4] Reemplazar `obtenerSesionFixture()` por sesión real en `app/panel/page.tsx`, `app/admin/page.tsx`, `app/panel/solicitud/[id]/page.tsx`, `app/admin/solicitud/[id]/page.tsx`.
- [ ] T013 [US4] Actualizar header de panel y admin: nombre real desde sesión; botón "Salir" → `supabase.auth.signOut()` + redirige a login.
- [ ] T014 [US4] Eliminar `lib/session.ts` y `obtenerSesionFixture`; limpiar imports en todos los archivos (buscar y reemplazar).
- [ ] T015 [US4] Verificar que el solicitante no se ve afectado (P1, wizard, mis-solicitudes, comparativa pública siguen funcionando sin auth).

## Fase 4 — Seed de usuarios (US5)

- [ ] T016 [US5] Crear `scripts/seed-auth.mjs`: script que usa `SUPABASE_SERVICE_ROLE_KEY` para crear/actualizar usuarios en Supabase Auth con `app_metadata.rol = "coordinador"|"admin"`. Usar los mismos datos de `migrations/006_configuracion_seed.sql`.
- [ ] T017 [US5] Documentar en README el comando `node scripts/seed-auth.mjs` para sembrar usuarios iniciales.

## Verificación final (DoD)

- [ ] T018 [US1-5] Batería completa: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npx adf doctor` (→ DOCTOR_OK), `npm run secret-scan`. Commit atómico de la feature a origin/main.