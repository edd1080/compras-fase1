# Feature Specification: 005-Auth-Supabase

**Feature Branch**: `005-auth-supabase`

**Created**: 2026-08-14

**Status**: Draft (en revisión para G2)

**Input**: Reemplazar la fixtura de sesión temporal (`lib/session.ts`) y los portales sin autenticación por Supabase Auth real: login/logout para coordinador y administrador, protección de rutas, sesión persistente, y redirección por rol. El solicitante continúa sin autenticación (solo cookie de continuidad).

**Fuentes autoritativas**: `docs/product/user-flows.md` (roles y portales), `docs/references/architecture.md` (stack: Supabase Cloud pendiente), prototipos HTML en `docs/identidad/referencias/flujo-admin.html` y `flujo-coordinadores.html` (pantallas de login ya diseñadas).

## Arquitectura de auth propuesta

- **Supabase Auth** con **email/contraseña** para coordinadores y administradores.
- Los usuarios se administran desde el **panel de Supabase** (o seed inicial en DB local → migrar a cloud cuando el usuario cree el proyecto).
- **Middleware de Next.js** (`middleware.ts`) protege las rutas: `/panel/*` requiere rol coordinador, `/admin/*` requiere rol admin; redirige a `/login` si no autenticado.
- La sesión se maneja con **cookies de Supabase** (`@supabase/ssr`).
- El solicitante **no se autentica**; sigue con cookie de continuidad (30 días, como ahora).

## User Stories

### US1 — Cliente Supabase Auth y sesión (Prioridad P0)
Crear el cliente Supabase para auth (`lib/supabase/server.ts` y `lib/supabase/client.ts` existente) usando `@supabase/ssr` para manejar cookies de sesión en server y client components. Añadir helpers: `getSession()`, `requireAuth()`, `requireRole()`.

**Why this priority**: sin esta capa no existe autenticación.
**Independent Test**: dado un usuario real en Supabase, el cliente server puede leer la sesión, y el middleware bloquea sin sesión.
**Acceptance Scenarios**:
1. Dada una petición a `/panel` sin sesión, **Cuando** se ejecuta el middleware, **Entonces** redirige a `/login/coordinador`.
2. Dada una sesión válida de admin, **Cuando** se accede a `/admin`, **Entonces** la sesión contiene `rol=admin`.
3. Dada una sesión expirada o inválida, **Cuando** se accede a cualquier ruta protegida, **Entonces** redirige a login.

### US2 — Páginas de login (Prioridad P1)
Pantallas de login para coordinador y administrador, según el diseño de los HTML de referencia (`flujo-coordinadores.html` / `flujo-admin.html`): formulario con correo + contraseña, íconos, fondo glass/blobs, y redirección al portal correspondiente tras login exitoso. El administrador inicia sesión en `http://localhost:3000/admin` y se redirige al dashboard.

**Why this priority**: sin login los portales siguen sin protección.
**Independent Test**: al ingresar credenciales correctas de coordinador, se redirige a `/panel`; credenciales incorrectas → mensaje de error.
**Acceptance Scenarios**:
1. Dado `/login`, **Cuando** se ingresan credenciales correctas, **Entonces** redirige al portal según el rol.
2. Dado `/login`, **Cuando** se ingresan credenciales incorrectas, **Entonces** se muestra error y no redirige.
3. Dado un usuario ya autenticado, **Cuando** visita `/login`, **Entonces** redirige a su portal en vez de mostrar el login.

### US3 — Middleware de protección de rutas (Prioridad P1)
Middleware de Next.js que intercepta todas las rutas, verifica la sesión de Supabase, y protege:
- `/panel/*` → requiere rol `coordinador` (si no autenticado: redirige a `/login/coordinador`)
- `/admin/*` → requiere rol `admin` (si no autenticado: redirige a `/login/admin`)
- `/` y `/solicitud/*` y `/mis-solicitudes` y `/comparativa/*` → **público** (sin auth)
- `/login/*` → si ya autenticado, redirige al portal según rol

**Why this priority**: es la barrera que evita la situación actual (cualquiera accede al panel sin auth).
**Independent Test**: con las rutas del middleware, un usuario sin sesión recibe redirect a login antes de que el componente renderice.
**Acceptance Scenarios**:
1. Dada una petición a `/panel` sin sesión, **Cuando** el middleware corre, **Entonces** responde con redirect 307 a `/login/coordinador`.
2. Dada una petición a `/admin` con sesión de coordinador (no admin), **Cuando** el middleware corre, **Entonces** responde con 403 o redirect a `/panel`.
3. Dada una petición a `/` sin sesión, **Cuando** el middleware corre, **Entonces** permite el acceso (público).

### US4 — Sesión y rol en el frontend (Prioridad P2)
Reemplazar `obtenerSesionFixture()` (fixtura) por el usuario real desde Supabase session. El header del panel/admin muestra el nombre real del usuario autenticado, y el botón "Salir" cierra sesión. El perfil de `/admin/ajustes` pre-carga datos reales.

**Why this priority**: sin esto, la UI muestra datos hardcodeados del fixture.
**Independent Test**: al autenticarse como coordinador, el header muestra su nombre; al hacer clic en Salir, cierra sesión y redirige a login.
**Acceptance Scenarios**:
1. Dada una sesión de coordinador, **Cuando** renderiza el panel, **Entonces** el header muestra el nombre real y permite "Salir".
2. Dado el botón "Salir", **Cuando** se hace clic, **Entonces** se cierra la sesión en Supabase y redirige a login.

### US5 — Usuarios seed en Supabase (Prioridad P1)
Crear los mismos 4 coordinadores + admin de la DB (`usuario` en PostgreSQL local) como usuarios en Supabase Auth (email + contraseña), con metadatos de rol (`app_metadata.rol`). Si se usa Supabase Cloud, crear estos usuarios vía API (service role key). Si se usa local, seed via CLI.

**Why this priority**: sin usuarios no hay login real.
**Independent Test**: los usuarios seed existen en Supabase Auth; al autenticarse con sus credenciales, el middleware reconoce su rol.
**Acceptance Scenarios**:
1. Los usuarios `coordinador1@compras.bia.local`...`coordinador4@` y `lady.matute@compras.bia.local` existen en Supabase Auth.
2. Cada usuario tiene `raw_app_meta_data.rol` = "coordinador" o "admin".

### Edge Cases
- **Sesión expirada**: al caducar la cookie de Supabase, cualquier ruta protegida redirige a login; el trabajo en curso se pierde (el estado de wizard se conserva en localStorage).
- **Rol inválido**: si el middleware detecta un rol desconocido, redirige a `/login` genérico.
- **Auth deshabilitado en desarrollo**: mientras no haya Supabase Cloud, se usa un modo de desarrollo con sesión de demostración (opcional, para no bloquear desarrollo).
- **Logout**: al cerrar sesión, redirige a `/login` y limpia la cookie.

## Requirements

### Functional Requirements
- **FR-001**: Cliente Supabase SSR (`lib/supabase/server.ts`, `lib/supabase/client.ts`) con cookies de sesión.
- **FR-002**: `lib/auth.ts` con helpers `getSession()`, `requireAuth(roles[])`, `redirectPorRol(rol)`.
- **FR-003**: Middleware (`middleware.ts`) que protege `/panel/*` (rol coordinador), `/admin/*` (rol admin), redirige según sesión.
- **FR-004**: Página `/login` (y `/login/coordinador`, `/login/admin`) con formulario de credenciales y redirección post-login.
- **FR-005**: Botón "Salir" en panel y admin que llama `supabase.auth.signOut()`.
- **FR-006**: Reemplazar `lib/session.ts` y todos los usos de `obtenerSesionFixture()` por la sesión real.
- **FR-007**: Usuarios seed en Supabase Auth con `app_metadata.rol`.
- **FR-008**: Variables de entorno: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (para seed).
- **FR-009**: El solicitante **no** cambia (sin auth, cookie de continuidad como hoy).

### Key Entities
- **Sesion Supabase** (tipo `User` + `app_metadata.rol`).
- **Rol middleware** (definido en `app_metadata`).
- **LoginPage** para coordinador y admin (ya diseñada en HTML de referencia).

## Success Criteria
- **SC-001**: El middleware protege `/panel/*` y `/admin/*` y redirige correctamente sin sesión.
- **SC-002**: Login con credenciales válidas redirige al portal correcto; inválidas → error.
- **SC-003**: El header del panel/admin muestra el nombre real del usuario autenticado; "Salir" cierra sesión.
- **SC-004**: Sin romper el flujo del solicitante (sigue sin auth ni login).
- **SC-005**: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npm run e2e`, `npx adf doctor` pasan.
- **SC-006**: Los seed de usuarios funcionan (vía script `npm run db:seed-auth` o manual).

## Dependencias / Supabase data needed

Para la implementación (G4) necesitaré del usuario:
1. **NEXT_PUBLIC_SUPABASE_URL** — URL del proyecto Supabase.
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY** — clave anónima del proyecto.
3. **SUPABASE_SERVICE_ROLE_KEY** — clave de rol de servicio (para crear usuarios seed).

Hasta que el usuario proporcione estos datos, la feature solo llega hasta G3 (plan). La implementación G4 requiere las credenciales.

## Supuestos
- Se usa **Supabase Auth** con email/contraseña (no magic link, no OAuth por ahora).
- El `app_metadata.rol` se asigna al crear el usuario (vía API admin o seed).
- Las rutas protegidas redirigen a `/login/[rol]` y el login redirige al portal según el rol.
- Mientras no haya Supabase Cloud, los endpoints de auth se pueden probar con Supabase local (mediante `supabase start` que requiere Docker, o se difiere a cloud directamente).
- Si el usuario no tiene Docker y prefiere Supabase Cloud directamente, se implementa apuntando a su proyecto cloud desde el inicio.