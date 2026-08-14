---
name: visual-qa
description: "Exploración visual manual/semi-automática del producto en el navegador para encontrar bugs que las pruebas unitarias/e2e no cubren. Use when the user wants to visually test the app, find broken screens, flows that don't load, hardcoded data, or anything not working heuristically — beyond asserting happy paths."
license: MIT
metadata:
  adf-version: "0.1.0"
  adf-lifecycle: "any"
  adf-trigger: "visual QA, probar la app visualmente, encontrar bugs en el navegador, probar handson el producto"
---

# Visual QA — Exploración del producto en el navegador

Detecta bugs **visuales y de flujo reales** que las pruebas de aserciones (Playwright e2e, unit) no cubren: pantallas que no cargan, datos hardcoded en lugar de reales, flujos incompletos, errores de consola/red, estados vacíos incorrectos.

## Diferencia clave con Playwright e2e
- **E2E = aserciones del camino feliz** fijas. No exploran lo no planificado.
- **Visual QA = exploración heurística del sistema REAL** (conectado a DB), observando y reportando todo lo que `no se ve bien`, no solo lo que "falla un expect".

## Reglas de la skill (obligatorio)

1. **El app debe correr conectado a la DB real** (no fixtures). Levantar `npm run dev` con `DATABASE_URL` real antes de probar.
2. **Recorrer rutas REALES creadas en vivo** (no ids de fixtures). Crear datos reales vía API/UI y navegar a ellos, igual que un usuario.
3. **Reportar en un formato estructurado** (ver abajo), no solo "falla".
4. **Solo leer para reportar**; escribir un archivo de reporte (`docs/qa/report-<fecha>.md`). No modificar código de producto salvo autorización.

## Proceso

1. **Preparar entorno**: levantar servidor + asegurar DB (migraciones OK, coordinadores con ids fijos).
2. **Inicializar datos reales** de prueba (solicitud creada via UI, cotizaciones via API) para que los flujos no estén vacíos.
3. **Recorrer cada rol** (solicitante, coordinador, admin) y cada ruta:
   - `http://localhost:3000/` (P1)
   - `/solicitud/nueva` (wizard P1→P6)
   - `/mis-solicitudes`
   - `/panel` y `/panel/solicitud/[id]` (detalle real)
   - `/comparativa/demo-2026`
   - `/admin`, `/admin/solicitud/[id]`, `/admin/procesos`, `/admin/coordinadores`, `/admin/configuracion`, `/admin/ajustes`
4. **Por cada pantalla observar**:
   - ¿Carga sin error 500/504/404 (excepto los intencionales)?
   - ¿Usa datos reales o hardcoded? (abrir una solicitud real creada en vivo → ¿se ve?)
   - ¿Errores de consola / red (Network 4xx/5xx) al interactuar?
   - ¿El flujo tiene todos los pasos/acciones esperadas (guardar borrador, cancelar, etc.)?
   - ¿Estados de carga/vacío correctos (no quedarse "Cargando…" infinito)?
   - ¿Accesibilidad básica (focus, contraste de botones)?
5. **Registrar cada hallazgo** con: ruta, pasos para reproducir, qué se esperaba, qué pasó, severidad (crítico/alto/medio/bajo), y si es bug de UI o de backend.

## Formato de reporte

```markdown
# Reporte Visual QA — <fecha>
Estado: servidor corriendo con DB real, datos de prueba sembrados.

## Resumen
- [ ] Todas las rutas probadas
- [ ] 0 errores críticos
- [ ] Los datos reales se muestran (no hardcoded)

## Hallazgos
| # | Severidad | Ruta | Reproducción | Esperado | Real | Tipo |
|---|---|---|---|---|---|---|
| 1 | crítico | /panel/solicitud/x | abrir solicitud real | detalle carga | 404 | backend |
| ... |

## Flujos sin problemas
- Nombre del flujo / ruta — OK (qué se verificó)
```

## Do's / Don'ts
- **DO**: navegar como usuario real, con datos reales; verificar consola/red; reportar todo lo raro.
- **DO**: separar "bug de UI" (visual/flujo) de "bug de backend" (5xx, datos no llegan).
- **DON'T**: quedarse solo en el camino feliz; no asumir que una ruta con fixture "s014" representa el sistema real.
- **DON'T**: modificar el código de producto mientras se reporta (solo leer); los arreglos se piden aparte.

## Completion criteria
- Se recorrieron todos los roles y rutas contra la DB real.
- Se crearon y navegó a solicitudes reales (no fixtures).
- El reporte en `docs/qa/report-<fecha>.md` documenta cada hallazgo con severidad y reproducción.
- Se listan explícitamente los flujos que sí funcionan.
