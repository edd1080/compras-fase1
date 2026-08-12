# Portal de Compras BIA

Aplicación web que digitaliza el ciclo de solicitudes de compra de **BIA Honduras**.
Desarrollada por **Intelia** · Código interno: COM-1 v2.0, Fase 1.

Cualquier colaborador de BIA solicita una compra desde el portal (sin cuenta ni
contraseña), el sistema la clasifica, un agente de IA pide los datos faltantes, se
genera un documento PDF para proveedores, el coordinador de compras carga las
cotizaciones, el sistema arma un comparativo, el coordinador escribe su
recomendación, y el solicitante elige por un enlace público. Todo el ciclo queda
medido.

## Stack

- **Frontend + backend:** Next.js (App Router), TypeScript estricto, Tailwind CSS.
- **Base de datos / autenticación / almacenamiento:** Supabase (PostgreSQL + Storage).
- **Hosting:** Vercel.

> El sistema es **autocontenido**: no lee ni escribe en los sistemas de gestión del
> cliente ni depende del acceso del área de tecnología de BIA (ADR 0005).

## Requisitos

- Node.js 20+
- Cliente `psql` (para migraciones)
- Variables de entorno (ver `.env.example`)

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo
npm run typecheck  # TypeScript estricto (sin any implícito)
npm run lint       # ESLint
npm run test       # tests (Vitest)
npm run db:reset   # recrear esquema + migraciones (SOLO desarrollo; prohibido en prod)
npm run db:migrate # aplicar migraciones pendientes
npm run secret-scan# verificar que no haya secretos en el repo
```

## Estructura

```text
app/            # Next.js App Router (rutas del producto)
components/     # componentes base (Button, Field, Card, Alert, Badge)
lib/
  supabase/     # cliente de Supabase
  design/       # tokens, utilidades (cn)
migrations/     # SQL 001..006 (diccionario de datos)
scripts/        # db-migrate, db-reset, db-seed, secret-scan
styles/         # globals.css (tokens de identidad BIA)
tests/          # (tests de componentes junto a componentes o en tests/)
```

## Convenciones

- **Español de Honduras** en interfaz y documentos generados.
- Zona horaria **America/Tegucigalpa**; monedas HNL y USD (sin conversión automática).
- Toda validación importante existe en **servidor**; la de cliente es comodidad.
- **Nunca mostrar cero** cuando el dato no existe: usar "no especificado".
- En la interfaz del solicitante **no** se usan las siglas RFI/RFQ/RFP.
- **Ningún secreto en el repositorio.** Usar variables de entorno por entorno.
- Un solo registro de tratamiento (voseo/tuteo/neutro) en toda la interfaz.

## Verificación antes de terminar una tarea

```bash
npm run typecheck
npm run lint
npm run test
```

Si se agregó una migración, verificar que aplique en limpio:

```bash
npm run db:reset
```

## Documentación

Ver `docs/references/index.md` para la jerarquía de documentos. El PRD
(`docs/product/prd.md`) es autoritativo; los flujos de usuarios y casos límite
están en `docs/product/user-flows.md`.
