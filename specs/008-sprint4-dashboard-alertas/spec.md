# Feature Specification: 008-Sprint4-Dashboard-Alertas

**Feature Branch**: `008-sprint4-dashboard-alertas`

**Created**: 2026-08-18

**Status**: Draft (para revisión G2)

**Input**: Medir por primera vez la conversión solicitud → aceptación (RF-50), el tiempo por etapa (RF-52), con filtros reales (RF-51), exportación a Excel (RF-53), y un motor de alertas configurable (RF-57 / H4.4). Requiere conectar la decisión pública real (hoy demo) para que la métrica sea verificable.

**Fuentes autoritativas**: `documentacion inicial/17-backlog-desarrollo-sprints.md` (Sprint 4: H4.1 dashboard, H4.4 alertas), `docs/product/prd.md` (RF-49…58), `migrations/005` (evento_trazabilidad), `migrations/008` (comparativa/decision), `lib/domain/metrics.ts` (funciones puras existentes), auditoría observacional 2026-08-18.

## Hallazgos (observacionales)

1. El dashboard admin (`app/admin/page.tsx`) tiene KPIs **hardcodeados** (84%, 4.2d, 38, 7) — `calcularMetricas()` existe y está testeado pero no se usa para ellos.
2. Los filtros `rango`/`coordinador` no filtran nada (los selects recargan pero `api.metricas()` y `listarSolicitudesTodas()` no aceptan filtros).
3. **No hay motor de alertas**: plantilla de correo tipo "5" existe (alerta de inactividad) pero nadie la envía; `configuracion.umbral_dias_sin_movimiento` no tiene consumidor; la página `/admin/configuracion` es UI inerte.
4. **La decisión pública es demo**: `/comparativa/[token]` usa token fijo y fixtures; no llama `registrarDecision` ni transiciona a `CERRADA_CON_DECISION`. Sin eso no hay conversión real.
5. `detectarTratamientoFiscal` (007) ya produce alerta de desglose; se reutiliza.

## Slices

### S1 — Decisión real y conversión (Prioridad P0)

**Objetivo**: que el solicitante decida por link real y eso cierre la solicitud, habilitando la métrica.

- **S1a Link público real**: `POST /api/comparativas/[token]/decision` con token real (no "demo-2026"), verificación de `link_publico` vigente (expiracion, revocado, veces_accedido++), registro de la decisión (`registrarDecision`) y transición de la solicitud: `ENVIADA_A_SOLICITANTE → CERRADA_CON_DECISION` (si eligió) o `CERRADA_SIN_DECISION` (si ninguna_opcion).
- **S1b Vista pública real**: `app/comparativa/[token]/page.tsx` lee de la DB (comparativa + link vigente), no de fixtures; renderiza cotizaciones y registra la decisión.
- **S1c** Crear link público al generar/enviar comparativa (si no existe), con expiración configurable (`expiracion_link_dias`).

### S2 — Dashboard con métricas reales y filtros (Prioridad P0)

**Objetivo**: KPIs y filtros reales (RF-50/51/52).

- **S2a Agregación en el repo**: nuevo `metricasDashboard(filtros)` en `postgres-repo.ts` con consultas SQL (COUNT/AVG/JOIN) sobre `solicitud`, `decision`, `comparativa`, `evento_trazabilidad`: conversión (aceptadas/enviadas), tiempo ciclo promedio, tiempo por etapa (encode timestamps de eventos), activos, sin decisión > umbral.
- **S2b Endpoint**: ampliar `app/api/metricas/route.ts` para aceptar `?rango=dia|semana|mes|todo&rangoInicio&rangoFin&coordinador&categoria`.
- **S2c Dashboard**: conectar las 4 tarjetas a datos reales; filtros que de verdad filtran; tabla de procesos completa; usar `calcularMetricas` para cálculo puro cuando aplique (o la agregación).
- **S2d** Distribución por tipo/subtipo y tiempo por etapa visibles.

### S3 — Motor de alertas (Prioridad P1)

**Objetivo**: alertas configurables (H4.4, RF-57).

- **S3a Config persistente**: página `/admin/configuracion` real — leer/guardar `configuracion` (umbral_dias_sin_movimiento, expiracion_link_dias, destinatarios alertas) vía API.
- **S3b Scheduler/consulta**: ruta `POST /api/admin/alertas/ejecutar` (llamable manualmente y por cron en producción) que detecta solicitudes activas sin movimiento > umbral, sin desglose fiscal, con una sola cotización, o con discrepancia de especificación.
- **S3c Envío**: usar `enviarCorreo` tipo "5" con destinatarios configurados; marcar `notificacion_fallida` si falla.
- **S3d Vista de alertas** en el dashboard (lista de solicitudes que requieren atención).

### S4 — Exportación Excel (Prioridad P1)

**Objetivo**: RF-53 (exportar la vista filtrada).

- Reutilizar SheetJS: `GET /api/admin/metricas/excel` exporta la vista filtrada actual (métricas + tabla) a `.xlsx`.
- Botón "Exportar" real en el dashboard.

## Guardrails transversales

1. La IA no participa en las alertas: todo es regla determinística (umbral, desglose, una sola cotización).
2. La decisión es del solicitante; el sistema solo la registra (RN-01: la recomendación la escribe una persona, la decisión la toma el solicitante).
3. Token de link público no adivinable; expiración configurable; registro de accesos (sigue la decisión de riesgo asumido ya documentada).
4. Sin credenciales en repo; solo lectura/escritura en las tablas del dominio.
5. Las alertas no bloquean ningún flujo (son informativas; el caos de disponibilidad aplica igual).

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Romper la vista pública demo (e2e comparativa usa token demo) | Mantener compatibilidad: si no hay link real, los e2e se actualizan para crear comparativa + link; la ruta publica nueva falla degradando a la anterior solo en dev |
| Agregaciones SQL grandes sin índices | Las tablas son pequeñas en este estadio; usar índices por `solicitud_id`/`fecha_*` si necesario |
| Alerta por inactividad con umbral no definido por Lady | Umbral leído de `configuracion` con default 5 d (el mismo que usa `metrics.ts`); se documenta como "pendiente confirmación de Lady" |
| La decisión pública expone montos (riesgo asumido) | Mantener el token aleatorio + expiración + revoco + conteo de accesos ya previsto |

## No-alcance

- Gestión de plantillas/versionado (H4.2/RF-54/55) — queda para otra feature.
- Gestión de coordinadores y reglas de asignación (H4.3/RF-56) — las reglas por categoría ya existen; el CRUD de usuarios admin queda pendiente.
- RLS completo (H4.5) — pospuesto.
- Correos 3 y 4 del ciclo (generación comparativa / reasignación) — solo se habilita el tipo "5" (alerta).

## Criterios de aceptación de alto nivel

- **S1**: el solicitante decide por link real, la solicitud se cierra (`CERRADA_CON_DECISION` o `CERRADA_SIN_DECISION`) y la decisión queda registrada.
- **S2**: el dashboard muestra conversión y tiempo por etapa reales; cambiar filtros cambia los datos.
- **S3**: configurar umbral/destinatarios persiste; ejecutar alertas detecta solicitudes inactivas y envía correo tipo 5.
- **S4**: el botón Exportar descarga la vista filtrada en .xlsx.