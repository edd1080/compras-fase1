# Verification — 008-Sprint4-Dashboard-Alertas

**Gate**: G6 (feature close) · **Fecha**: 2026-08-20 · **Branch**: `main`

## DoD — matriz de evidencia

| Criterio | Método | Resultado | Artefacto |
|---|---|---|---|
| T001 link público repo (crear/obtener/registrar acceso/obtener comparativa) | typecheck + revisión | PASS | `lib/db/postgres-repo.ts` |
| T002 GET por token valida expiración/revocación/registra acceso | e2e comparativa | PASS (token inválido → neutro) | `app/api/comparativas/[token]/route.ts` |
| T003 POST decisión registra + cierra (CERRADA_CON/SIN_DECISION) | e2e |token real → decide y cierra | `app/api/comparativas/[token]/decision/route.ts` |
| T004 Vista pública usa API real + `demo-2026` en dev | e2e 3/3 | PASS | `app/comparativa/[token]/page.tsx`, `VistaPublica.tsx` |
| T005 `metricsDashboard(filtros)` SQL | test unit mock pool | 2/2 PASS | `lib/domain/metrics.test.ts` + `lib/db/metrics-dashboard.test.ts` |
| T006 `/api/metricas` acepta filtros | revisión + e2e admin | PASS | `app/api/metricas/route.ts` |
| T007 `api-client` metrícas con filtros | typecheck | PASS | `lib/api-client.ts` |
| T008 Dashboard KPIs reales + filtros | e2e admin 4/4 | PASS | `app/admin/page.tsx` |
| T009 `detectarAlertas` (4 tipos) + tests | test unit | 5/5 PASS | `lib/domain/alertas.test.ts`, `lib/domain/alertas.ts` |
| T010 `/api/admin/configuracion` GET/PATCH | e2e admin | PASS | `app/api/admin/configuracion/route.ts` |
| T011 `/api/admin/alertas/ejecutar` | revisión | PASS | `app/api/admin/alertas/ejecutar/route.ts` |
| T012 Configuración operativa + vista alertas | e2e admin | PASS | `app/admin/configuracion/page.tsx` |
| T013 Export Excel (`lib/excel/dashboard.ts`, ruta) | revisión + build | PASS | `app/api/metricas/excel/route.ts` |
| T014 Botón exportar | e2e admin | PASS | `app/admin/page.tsx` |
| T015 Batería completa | ver abajo | PASS | — |

## Batería completa (T015) — resultados frescos

| Check | Comando | Resultado |
|---|---|---|
| Typecheck | `npm run typecheck` | PASS (0 errores) |
| Lint | `npx eslint app lib components middleware.ts --quiet` | PASS (0 problems) |
| Unit | `npx vitest run` | **80 passed / 6 skipped** (16 files) |
| Build | `npm run build` | PASS |
| E2E completo | `E2E_BASE_URL=http://localhost:3001 npx playwright test --workers=1` | **22 passed** |

## QA adversarial (skill validate) — hallazgos y cierre

- **Crítico corregido**: la recomendación del coordinador (RN-01) no se persistía → `guardarRecomendacionComprador` en repo + llamado en `estado/route`.
- **Crítico corregido**: envío no atómico (transición antes que link) → link se crea ANTES de `transicionarEstado`; falta de comparativa → 409.
- **Crítico corregido**: token débil (`Math.random`.padEnd) → `randomBytes` criptográfico (12 bytes de entropía).
- **Crítico corregido (preexistente escalado, opción A)**: API interna `/api/solicitudes/*` sin auth → nuevo `lib/api-guard.ts` con `guardApi` exige rol coordinador/admin en cotizaciones, comparativa/excel, listar todas, y `PATCH /estado` salvo el envío anónimo del solicitante. Verificado por curl: endpoints internos → 401 sin sesión; envío del solicitante → 200.
- **Fix latente**: normalización ISO de fechas en `filaSolicitud` (time zone `gmt-0600` rompía re-parametrizar `fecha_envio`/`fecha_cierre`).
- **Bug real hallado en recorrido visual (Playwright) y corregido**: `/api/metricas` devolvía 500 en el dashboard admin — `metricasDashboard` usaba `COALESCE(tipo, 'SIN_TIPO')` sobre el enum `tipo_solicitud`; PostgreSQL rechaza `SIN_TIPO` como valor de enum → falla la agregación de distribución por tipo. Corregido a `COALESCE(tipo::text, 'SIN_TIPO')`. Verificado: `/api/metricas?rango=todo` → 200 con datos reales (conversión 11.6%, 54 activas, 21 sin decisión); dashboard renderiza KPIs vivos 12%/54/21 sin errores de consola. Commit `5443f3a`.

## Batería de roles y edge cases

- **Solicitante (público)**: wizard P1–P6 completo (e2e 3/3): correo inválido bloquea, no retoma borrador ajeno, llega a confirmación.
- **Coordinador**: detalle real con 2 cotizaciones, bloqueo B3 respeta recomendación obligatoria, envío crea link real con token (e2e 2/2).
- **Admin**: dashboard KPIs reales, trazabilidad/timeline, procesos, coordenadores, config, catálogo campo crear/desactivar (e2e 4/4).
- **Vista pública**: token real decide y cierra; `ninguna sirve` notifica; token inválido neutro (e2e 3/3).
- **Explorador visual**: 10/10 rutas sin errores de consola/HTTP.

## Ronda post-cierre — QA manual por rol (2026-08-20/21)

Recorrido manual completo del rol coordinador + mejoras de interfaz solicitadas por el cliente. Cambios **sin commit** al cierre de esta ronda (ver HANDOFF).

### Mejoras de interfaz (pedido directo del cliente)
- Panel coordinador: cards de métricas con ícono y color por estado (activa azul, cotizaciones naranja, decisión índigo, cerradas verde), padding ampliado, layout más ancho (max-w-1500).
- Búsqueda con botón "X" para limpiar.
- Encabezado "Solicitudes" más evidente; "Listo" reemplazado por contador de resultados.
- Filas clicables (click en cualquier parte abre la solicitud) — verificado navegación.
- Referencia siempre visible: fallback `SOL-XXXXXXXX` derivado del id cuando no hay número generado (deuda: generación real pendiente).
- Solicitante sin guion largo; "Entrega requerida" solo con fecha, si no "Entrega por definir".
- Categoría con color por clave (paleta estable); estado con colores coherentes a métricas (CERRADA_* verde, CANCELADA rojo); tabs coloreados por estado ("Todos" negro).

### Correcciones funcionales
- **Solicitudes terminales en solo lectura**: banda verde con la decisión ("eligió [proveedor]" / "ninguna opción") + fecha de cierre; ocultas acciones de agregar/editar/generar. Nuevo repo method `obtenerDecisionPorSolicitud`.
- **Clasificación IA persistida**: wizard envía tipo/subtipo/fechaRequerida → INSERT con cast a enums. Verificado en DB (RFQ/servicio/fecha). Arregla sidebar vacío y distribución "SIN_TIPO" a futuro.
- Guiones "—" sustituidos por información útil ("Por definir", "Área por definir"); badge CERRADA_SIN_DECISION corregido a verde.

### Validación de la ronda
typecheck ✓ · eslint ✓ · 80 unit ✓ · e2e solicitante+coordinador 5/5 ✓ · verificación visual Playwright (banda cierre sin acciones, tabs por color computado, X de búsqueda limpia, fila navega, referencia SOL- visible en 65 filas). Un fallo transitorio de 12 e2e fue causa ambiental (binario Chromium sin descargar tras actualización de Playwright), resuelto con `npx playwright install chromium` y re-ejecución 12/12 ✓.

## Inventario de escuelas

- verification.md (este), tasks.md → 8/8 checkboxes completados, STATE.md → G6.

## Decisión

**DONE** — la feature 008 cumple el DoD completo con evidencia fresca en esta sesión. Review de estándares/spec: ver `code-review` (dos ejes) si se requiere para el cierre completo; los hallazgos críticos de la skill validate quedaron corregidos antes de G6.