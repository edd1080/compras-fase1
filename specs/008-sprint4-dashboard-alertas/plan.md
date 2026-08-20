# Implementation Plan: 008-Sprint4-Dashboard-Alertas

**Branch**: `008-sprint4-dashboard-alertas` | **Date**: 2026-08-18 | **Spec**: `specs/008-sprint4-dashboard-alertas/spec.md`

**Input**: Decisión real por link (S1), dashboard con métricas y filtros reales (S2), motor de alertas (S3), exportación Excel (S4). Base RF-49…53, RF-57, H4.1/H4.4 del backlog.

## Summary

Conectar la medición de verdad: que el solicitante decida por un link público real (hoy demo) y eso cierre la solicitud; que el dashboard del admin pinte KPIs reales con filtros que funcionan; un motor de alertas configurables; y exportación Excel. Todo sobre las tablas que ya existen (`solicitud`, `comparativa`, `decision`, `link_publico`, `evento_trazabilidad`, `configuracion`).

## Technical Context

**Language/Version**: TypeScript estricto, Next.js 16 (App Router).

**Primary Dependencies**: `pg` (existente). `xlsx` (ya instalado en la 007, se reutiliza). `zod`. Sin nueva dependencia.

**Storage/DB**: Sin migraciones nuevas de esquema — todas las tablas existen. Se añaden índices solo si una consulta lo requiere (volúmenes pequeños hoy). Métodos nuevos en `PostgresRepositorio` usando consultas SQL (COUNT/JOIN/GROUP BY).

**Testing**: unit (vitest) para el cálculo de métricas y la lógica de alertas; e2e Playwright (admin dashboard, decisión pública por token, alertas). Uso la DB local real.

**Target Platform**: next (web-service).

**Constraints**: la decisión es del solicitante (se registra, no se decide por él); alertas determinísticas (sin IA); token de link no adivinable con expiración.

**Scale/Scope**: ~4 métodos nuevos en repo + 4 rutas API + 1 página dashboard reescrita + 1 página configuración real + 1 motor de alertas + 1 exportación + vista pública conectada + tests.

## Constitution Check

*GATE: RN-01 (la decisión la toma el solicitante; la IA solo sugiere — se mantiene); RN-05 (solicitante sin sesión, por link con token — decisión de riesgo ya documentada); autocontenido (solo tablas del dominio). RF-50/51/52/53/57.*

✅ Sin violaciones.

## Project Structure

### Código — S1 (decisión real)

```text
lib/db/repositorio.ts                 # (MOD) contrato: crearLinkPublico, obtenerLinkPorToken, registrarAccesoLink
lib/db/postgres-repo.ts               # (MOD) implementar los 3 métodos + obtenerComparativaPorId + listarDecisionesPorSolicitud
app/api/comparativas/[token]/route.ts         # (NUEVO) GET: resuelve link → comparativa + cotizaciones para la vista pública
app/api/comparativas/[token]/decision/route.ts # (NUEVO) POST: registra decisión + cierra solicitud (CERRADA_CON_DECISION | CERRADA_SIN_DECISION)
app/comparativa/[token]/page.tsx      # (MOD) lee de DB real; envía decisión al POST por token
components/publica/VistaPublica.tsx   # (MOD) recibe cotizacionSeleccionadaId y llama al POST por token
```

### Código — S2 (dashboard real)

```text
lib/db/postgres-repo.ts               # (MOD) metricsDashboard(filtros): conversión, tiempo ciclo, tiempo por etapa, activos, sin decisión; con JOIN decision/comparativa/evento_trazabilidad
app/api/metricas/route.ts             # (MOD) acepta query (rango, rangoInicio/Fin, coordinador, categoria); usa metricsDashboard
app/api/metricas/excel/route.ts       # (NUEVO, o S4) exporta la vista filtrada
app/admin/page.tsx                    # (MOD) tarjetas KPI reales + filtros funcionales + tabla + tiempo por etapa
lib/api-client.ts                     # (MOD) metricas(filtros) y listarSolicitudesTodas(filtros)
```

### Código — S3 (alertas)

```text
lib/domain/alertas.ts                 # (NUEVO) detectarAlertas(solicitudes, cotizaciones, config): inactividad, sin desglose, una sola cotización, discrepancia
app/api/admin/alertas/ejecutar/route.ts  # (NUEVO) POST: detecta y envía correo tipo 5
app/api/admin/configuracion/route.ts    # (NUEVO) GET/PATCH: leer/guardar configuracion (umbral, expiracion_link_dias, destinatario_alertas)
app/api/admin/configuracion/[clave]/route.ts
app/admin/configuracion/page.tsx       # (MOD) operativa: carga y guarda config
lib/mail/enviar.ts                     # (MOD, si falta) expone enviarCorreo para tipo 5 como hoy tipos 1/2
```

### Código — S4 (exportación)

```text
app/api/metricas/excel/route.ts       # (NUEVO) SheetJS reutiliza lib/excel
lib/excel/dashboard.ts                # (NUEVO) builder de la exportación de métricas/tabla
app/admin/page.tsx                    # (MOD) botón "Exportar" real
```

## Complexity Tracking

| Slice | Archivos | Riesgo |
|---|---|---|
| S1 decisión real | ~6 | Medio — tocar la vista pública demo y el cierre de estado |
| S2 dashboard/agregación | ~5 | Medio — SQL JOINs correctos + filtros |
| S3 alertas | ~6 | Bajo — reglas determinísticas |
| S4 exportación | ~3 | Bajo — reutiliza SheetJS |

## Risk / Rollback

| Riesgo | Mitigación |
|---|---|
| Romper el demo público (e2e comparativa usan token demo) | Mantener `demo-2026` funcionando en dev; la ruta real se agrega con verificación de link; los e2e nuevos crean link real |
| SQL de agregación lento | Volúmenes pequeños; añadir índices si hace falta (solicitud.fecha_*, decision.comparativa_id) |
| Umbral de inactividad sin definir por Lady | Leer de `configuracion` con default 5 días; documentar "pendiente confirmación" |
| La decisión pública expone montos | Mantener riesgo asumido ya documentado: token aleatorio + expiración + revoco + conteo de accesos |

**Rollback**: git revert; el dashboard vuelve a mock y la vista pública al token demo sin migrar nada.

## Verification Strategy

| Slice | Verificación |
|---|---|
| S1 | e2e: crear solicitud + comparativa + link; abrir por token; decidir → solicitud CERRADA_CON_DECISION y decisión en DB |
| S2 | e2e: dashboard muestra KPIs ≠ mock; cambiar filtros altera datos; unit de metricsDashboard (mock pool) |
| S3 | unit detección de alertas; e2e: config persistida + ejecutar alertas detecta solicitud inactiva |
| S4 | e2e/unit: exportar vista filtrada devuelve .xlsx |

DoD: typecheck, lint, test, build, e2e completo (workers=1), verification.md, cierre G5/G6.