---
description: "Task list for feature implementation — 008-Sprint4-Dashboard-Alertas"
---

# Tasks: 008-Sprint4-Dashboard-Alertas

**Input**: Design documents from `/specs/008-sprint4-dashboard-alertas/`
**Prerequisites**: plan.md (G3), spec.md (G2 aprobado).
**Nota**: S1 (decisión real) es prerrequisito de S2 (la conversión depende de decisiones registradas). S3 y S4 parcialmente independientes.

## Formato: `[ID] [P?] [Story] Descripción`

---

## Fase A — S1: Decisión real por link público

- [ ] T001 [S1] En `lib/db/repositorio.ts` y `postgres-repo.ts`: añadir métodos `crearLinkPublico`, `obtenerLinkPorToken`, `registrarAccesoLink` (veces_accedido++, ultimo_acceso) sobre `link_publico`; y `obtenerComparativaPorId`.
- [ ] T002 [S1] Crear `app/api/comparativas/[token]/route.ts` (GET): resuelve token → verifica expiración/revocación → registra acceso → devuelve comparativa + cotizaciones + solicitud (para la vista pública real).
- [ ] T003 [S1] Crear `app/api/comparativas/[token]/decision/route.ts` (POST): registra la decisión (`registrarDecision`) y transiciona la solicitud desde `ENVIADA_A_SOLICITANTE` → `CERRADA_CON_DECISION` (si elegida) o `CERRADA_SIN_DECISION` (si ninguna_opcion).
- [ ] T004 [S1] Modificar `app/comparativa/[token]/page.tsx` y `VistaPublica.tsx`: cargar desde la API real (no fixtures), permitir elegir proveedor o "ninguna sirve", y enviar la decisión por token. Mantener `demo-2026` funcional en dev.

## Fase B — S2: Dashboard con métricas reales y filtros

- [ ] T005 [S2] En `postgres-repo.ts`: `metricsDashboard(filtros)` con SQL de agregación (conversión desde `decision`, tiempo ciclo desde `solicitud.fecha_envio/fecha_cierre`, tiempo por etapa desde `evento_trazabilidad`, activos, sin decisión > umbral). Filtros: rango, fecha desde/hasta, coordinador, categoría.
- [ ] T006 [S2] Ampliar `app/api/metricas/route.ts`: aceptar query params de filtro y devolver el resultado de `metricsDashboard` + distribución por tipo/subtipo.
- [ ] T007 [S2] Actualizar `lib/api-client.ts`: `metricas(filtros)` con parámetros; `listarSolicitudesTodas(filtros)`.
- [ ] T008 [S2] Reescribir `app/admin/page.tsx`: tarjetas KPI con datos reales (conversión, tiempo promedio, activos, sin decisión), filtros que de verdad filtran, tabla de procesos y tiempo por etapa visibles.

## Fase C — S3: Motor de alertas

- [ ] T009 [S3] Crear `lib/domain/alertas.ts`: `detectarAlertas(solicitudes, cotizacionesPorSolicitud, config)` → lista de alertas tipadas (inactividad > umbral, sin desglose fiscal, una sola cotización, discrepancia de especificación).
- [ ] T010 [S3] Crear `app/api/admin/configuracion/route.ts` (GET/PATCH): leer/guardar `configuracion` (umbral_dias_sin_movimiento, expiracion_link_dias, destinatario_alertas).
- [ ] T011 [S3] Crear `app/api/admin/alertas/ejecutar/route.ts` (POST): corre el detector, envía correo tipo "5" (a los destinatarios configurados) y devuelve las alertas disparadas.
- [ ] T012 [S3] Modificar `app/admin/configuracion/page.tsx` para que sea operativa (carga y guarda en DB) y mostrar la vista de alertas activas en el dashboard.

## Fase D — S4: Exportación Excel

- [ ] T013 [S4] Crear `lib/excel/dashboard.ts` y `app/api/metricas/excel/route.ts`: exporta la vista filtrada (métricas + tabla de procesos) a .xlsx reutilizando SheetJS.
- [ ] T014 [S4] Botón "Exportar" funcional en el dashboard (enlaza a la ruta de exportación con los filtros actuales).

## Verificación final (DoD)

- [ ] T015 [S1-S4] Batería completa: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, e2e completo (workers=1) — incluye: decisión por token cierra la solicitud, dashboard con KPIs reales, alertas detectan inactividad, export Excel. Tests unitarios de `metricsDashboard` (mock pool) y `detectarAlertas`. Commit atómico + verification.md + cierre G5/G6 + testing general completo de todos los roles con edge cases.