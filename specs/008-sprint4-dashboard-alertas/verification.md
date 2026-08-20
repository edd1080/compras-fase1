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

## Batería de roles y edge cases

- **Solicitante (público)**: wizard P1–P6 completo (e2e 3/3): correo inválido bloquea, no retoma borrador ajeno, llega a confirmación.
- **Coordinador**: detalle real con 2 cotizaciones, bloqueo B3 respeta recomendación obligatoria, envío crea link real con token (e2e 2/2).
- **Admin**: dashboard KPIs reales, trazabilidad/timeline, procesos, coordenadores, config, catálogo campo crear/desactivar (e2e 4/4).
- **Vista pública**: token real decide y cierra; `ninguna sirve` notifica; token inválido neutro (e2e 3/3).
- **Explorador visual**: 10/10 rutas sin errores de consola/HTTP.

## Inventario de escuelas

- verification.md (este), tasks.md → 8/8 checkboxes completados, STATE.md → G6.

## Decisión

**DONE** — la feature 008 cumple el DoD completo con evidencia fresca en esta sesión. Review de estándares/spec: ver `code-review` (dos ejes) si se requiere para el cierre completo; los hallazgos críticos de la skill validate quedaron corregidos antes de G6.