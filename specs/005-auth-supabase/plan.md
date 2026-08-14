# Implementation Plan: 005-Auth-Supabase

**Branch**: `005-auth-supabase` | **Date**: 2026-08-14 | **Spec**: `specs/005-auth-supabase/spec.md`

**Input**: Feature specification (US1–US5, FR-01…09, SC-01…06). Auth real con Supabase Auth, middleware de protección, login por rol, reemplazo de fixtures de sesión.

## Summary

Implementar autenticación real con Supabase Auth (email/contraseña) para coordinadores y administradores, con middleware de Next.js que protege rutas por rol, páginas de login según el diseño oficial, y reemplazo completo de las fixturas de sesión temporales. El solicitante continúa sin auth (cookie de continuidad).

## Technical Context

**Language/Version**: TypeScript estricto, Node, Next.js 16 (App Router).

**Primary Dependencies**: `@supabase/supabase-js` (ya presente), `@supabase/ssr` (nueva, para cookies de sesión en Server Components). `pg` (repo existente — los roles se leen la tabla `usuario` de la DB local antes de Supabase Cloud).

**Storage/DB**: La autenticación se gestiona en Supabase Auth (la DB local `usuario` como fuente de metadatos de rol). Cuando migremos a Supabase Cloud, los usuarios en Auth reemplazan la tabla local.

**Testing**: e2e con Playwright (login → redirección → logout), unit de helpers de auth, typecheck/lint/build.

**Target Platform**: next (web-service). Middleware edge runtime.

**Constraints**: sin credenciales en repo; `@supabase/ssr` para cookies seguras; el rol se almacena en `app_metadata` de Supabase Auth.

**Scale/Scope**: ~5 componentes (2 páginas login + helpers) + middleware + seed script + actualizar paneles existentes.

## Constitution Check

*GATE: RN-05 (sin sesión para solicitante — se mantiene); RN-07 (autocontenido — auth en Supabase, no en ERP del cliente); privacidad (no exponer datos de sesión).*

✅ Sin violaciones.

## Project Structure

### Documentación (feature)

```text
specs/005-auth-supabase/
├── spec.md            # Especificación (G2 aprobada)
├── plan.md            # Este archivo (G3)
└── tasks.md           # Tareas ejecutables (contrato G4)
```

### Código

```text
lib/
├── supabase/
│   ├── server.ts      # cliente SSR con cookies (server components / route handlers)
│   ├── client.ts      # cliente browser (client components, ya existe, se actualiza con @supabase/ssr)
│   └── middleware.ts   # helpers para middleware (getSession, refreshSession)
├── auth.ts            # (NUEVO) requireAuth(roles[]), redirectByRole(), getUserRole()
├── session.ts         # (ELIMINAR / reemplazar) — ya no se usa
middleware.ts           # (NUEVO) Next.js middleware edge: protege /panel/*, /admin/*
app/
├── login/
│   ├── coordinador/page.tsx  # pantalla de login para coordinador
│   └── admin/page.tsx        # pantalla de login para admin (igual con sky tone)
├── auth/
│   └── callback/route.ts     # (opcional) ruta de callback si usamos redirección OAuth
├── panel/* (ya existe, se protege con middleware)
├── admin/* (ya existe, se protege con middleware)
scripts/
└── seed-auth.mjs      # script para crear usuarios seed en Supabase Auth (se ejecuta una vez)
.env.example           # NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

**Structure Decision**: middleware en raíz (`middleware.ts`), cliente SSR en `lib/supabase/server.ts`, helpers en `lib/auth.ts`. Las páginas de login son rutas App Router (`/login/coordinador`, `/login/admin`) que reutilizan el diseño de las referencias HTML. `obtenerSesionFixture` se elimina y los componentes de panel/admin reciben la sesión real.

## Complexity Tracking

No aplica.

## Risk / Rollback

| Riesgo | Mitigación |
|---|---|
| El middleware bloquea rutas públicas | `middleware.ts` excluye explícitamente `/`, `/solicitud/*`, `/mis-solicitudes`, `/comparativa/*`, `/_next/*`, etc. |
| Las cookies de sesión no se refrescan en Server Components | `@supabase/ssr` maneja refresco automático |
| Los seed users no tienen rol en app_metadata | El script seed-auth crea usuarios con `user_metadata` y actualiza `app_metadata` vía admin API |
| Fallo de Supabase Cloud en desarrollo | Se implementa apuntando a cloud; si el usuario no tiene proyecto aún, la feature se puede completar especificando que requiere las credenciales |
| Rompe el flujo del solicitante | El middleware solo protege `/panel/*` y `/admin/*`; las rutas del solicitante son explícitamente públicas |

**Rollback**: eliminar `middleware.ts`, restaurar `lib/session.ts` (git revert), volver a la fixtura temporal.