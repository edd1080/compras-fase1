# Active Handoff

**Portal de Compras BIA — 008 cerrada (G6) + ronda post-cierre QA/UX (SIN COMMIT)**

Fecha: 2026-08-21 · Branch `main` @ f7c438f + working tree con cambios sin commitear.

## Estado
- 9 etapas cerradas y verificadas (000–008). 008 cerró G6 el 2026-08-20 (`specs/008-sprint4-dashboard-alertas/verification.md`).
- Batería al día: typecheck ✓ · eslint ✓ · 80 unit ✓ · e2e 22/22 ✓ · recorrido visual de los 3 roles ✓.
- Ronda post-cierre manual por rol (2026-08-20/21) produjo mejoras UI/UX y fixes funcionales **aún no commiteados**.

## Cambios SIN commit en el working tree (commitear primero)
1. **Rediseño panel coordinador** (`app/panel/page.tsx`, `components/Badge.tsx`): cards métricas con ícono+color por estado (activa azul, cot naranja, decisión índigo, cerrada verde), búsqueda con X para limpiar, filas clicables, referencia fallback `SOL-XXXXXXXX`, categoría/estado con color, tabs coloreados por estado (Todos negro), layout max-w-1500.
2. **Cierre de flujo terminal** (`app/panel/solicitud/[id]/page.tsx`, `components/coordinador/DetalleSolicitud.tsx`, `CargaCotizaciones.tsx`): solicitudes CERRADA_*/CANCELADA muestran banda verde con la decisión ("eligió X" / "ninguna opción") + fecha, quedan solo lectura (sin agregar/editar/generar). Nuevo repo method `obtenerDecisionPorSolicitud`. Badge CERRADA_SIN_DECISION → verde. Guiones "—" reemplazados ("Por definir", "Área por definir").
3. **Persistencia clasificación IA** (`hooks/useSolicitudWizard.ts`, `lib/api-client.ts`, `app/api/solicitudes/route.ts`, `lib/db/postgres-repo.ts` + interfaz): wizard envía tipo/subtipo/fechaRequerida; INSERT los guarda con cast a enums. Arregla sidebar vacío y métricas "SIN_TIPO" a futuro.

Excluidos del commit: `qa/report-explorador.md` (artefacto), capturas `.playwright-mcp/`, `p2-*.png`, `panel-coordinador-rediseñado.png`.

## Bugs corregidos en esta ronda (ya commiteados)
- Respaldo de asignación = coordinador de mayor cobertura (antes caía al primer coordinador ficticio) — `f7c438f`.
- Wizard guarda claves canónicas de categoría + backfill DB "Empaque y branding"→mercadeo_publicidad — `f7c438f`.
- 500 /api/metricas por enum (COALESCE(tipo::text)) — `5443f3a`.

## Pendientes / próximos pasos
1. **Commitear la ronda post-cierre** (punto anterior).
2. **Generación real de numero_referencia** (`{{TIPO}}-{{ANIO}}-{{SECUENCIA}}`): hoy el panel usa fallback derivado del id; el tipo ya se persiste así que es viable implementar en backend.
3. **Sprint 4 residual**: H4.2 versionado de plantillas/campos · H4.3 CRUD coordinadores + regla asignación configurable · H4.5 seguridad por fila (RLS, URL firmadas).
4. **H4.1 menor**: distribución por subtipo, tiempo por etapa, rango personalizado en UI admin.
5. **Nube + piloto**: migración Supabase Cloud (decisión del cliente) e insumos oficiales (plantillas/dominio) para el piloto ≥10 compras.

## Operativa local
- App dev: `PORT=3001 npm run dev` (usar nohup; procesos background mueren fácil). DB: postgres local `bia`. Login coordinador `coordinador@biafoods.co / Coordinador2026!`; admin `admin@biafoods.co / AdminBIA2026!`.
- Coordinadores seed ficticios (Coordinador 1–4) siguen en DB; la cuenta real es "Coordinador BIA" (0a1).
