---
description: "Task list for feature implementation — 006-IA-Integracion"
---

# Tasks: 006-IA-Integracion

**Input**: Design documents from `/specs/006-ia-integracion/`
**Prerequisites**: plan.md (G3), spec.md (G2 aprobado).
**Nota**: la implementación (G4) requiere que el usuario proporcione la clave `OPENROUTER_API_KEY` en `.env.local`. Sin clave, la app degrada sin romper (contrato de disponibilidad).

## Formato: `[ID] [P?] [Story] Descripción`

---

## Fase 0 — Cliente IA y orquestador (US1)

- [x] T001 [US1] Crear `lib/ai/prompts.ts`: templates de las 4 funciones prioritarias (clasificar, assessment, extraer, comparativa) en español de Honduras, con guardrails inline (JSON estricto, no inventar valores, "no especificado", no decidir ganador). Basado en doc 16.
- [x] T002 [US1] Crear `lib/ai/schemas.ts`: schemas Zod de entrada/salida — `clasificarSalida`, `assessmentSalida`, `extraerSalida`, `comparativaSalida` con sus tipos (`ConfianzaClasificacion`, `ResultadoAssessment`, `CotizacionExtraida`).
- [x] T003 [US1] Crear `lib/ai/client.ts`: cliente HTTP mínimo para OpenRouter (`fetch` directo a `https://openrouter.ai/api/v1/chat/completions`), header de auth de OpenRouter, lectura de `OPENROUTER_API_KEY` + `IA_MODEL` desde env. Sin SDK pesado.
- [x] T004 [US1] Crear `lib/ai/orchestrator.ts`: wrapper con timeout por función (`IA_TIMEOUT_*`), retry con fallback (`IA_MODEL_FALLBACK`), validación Zod de la salida, y retorno de `null` en fallo (nunca lanza excepción al llamador).
- [x] T005 [US1] Unit tests: mock de `fetch` devuelve JSON válido → resultado tipado; timeout simulado → null; modelo principal falla → reintenta fallback; salida inválida → null + log de error.

## Fase 1 — Clasificación IA del solicitante (US2)

- [x] T006 [US2] En `hooks/useSolicitudWizard.ts`: función `clasificar()` que llama al orquestador con `{titulo, descripcion, tipoNecesidad}` y puebla `estado.clasificacion`, `estado.confianzaClasificacion`, `estado.razonamientoBreve`. Si confianza < 0.7 o null → sin preselección.
- [x] T007 [US2] En `components/solicitante/SolicitanteWizard.tsx` (P2→P3): al presionar "Continuar", disparar `clasificar()` (async, con estado "Clasificando…"); P3 muestra el resultado real en el badge de sugerencia, elimina el texto hardcodeado "Confianza Alta".
- [x] T008 [US2] Marcar `solicitud.clasificacion_corregida = true` cuando el usuario cambia la selección en P3. Unit test del hook: dado mock de orquestador → estado.clasificacion correcto; confianza baja → sin preselección.

## Fase 2 — Assessment IA dinámico (US3)

- [x] T009 [US3] En `lib/domain/assessment.ts`: reemplazar el cuerpo determinístico por `assert`/wrapper que llama al orquestador con `{tipo, subtipo, categoria, camposCapturados, catalogo}`; validar que todo `campoKey` devuelto exista en el catálogo (RN-02). Mantener la implementación determinística como función exportada separada para fallback.
- [x] T010 [US3] En `PasoDetalles` (P4): renderizar las preguntas del assessment dinámicamente (formulario), con opción "No lo sé", además de los campos base de catálogo. Integrar con el estado `assessmentPreguntas`/`assessmentListo` ya definidos en el hook.
- [x] T011 [US3] Si assessment falla o expira → P4 muestra solo campos base de catálogo (sin error visible). Unit test del módulo assessment: dado mock de IA → devuelve preguntas con campoKey válidos; IA devuelve campoKey fuera de catálogo → filtrado.

## Fase 3 — Extracción IA de cotizaciones (US4)

- [x] T012 [US4] Crear `scripts/convert-document.py`: subprocess Python que usa `markitdown[pdf]` para convertir el archivo recibido a Markdown (stdout). Manejar: PDF/DOCX con texto (gratis), fallback OCR vía modelo de visión si escaneado.
- [x] T013 [US4] Crear `lib/pdf/convert.ts`: wrapper que ejecuta el script Python, detecta si Python+markitdown están disponibles; si no, devuelve null (sin romper el flujo).
- [x] T014 [US4] En `app/api/solicitudes/[id]/cotizaciones/route.ts` (POST): tras guardar la cotización con metadata, disparar la extracción IA: convertir a markdown → llamar `extraer_cotizacion` → guardar `especificacionesOfertadas`, `confianzaExtraccion`, `markdown_extraido` (columna ya existente).
- [x] T015 [US4] En `CargaCotizaciones.tsx`: estado "Extrayendo datos…" durante el POST; mostrar confianza por campo en el detalle; si campos con confianza <0.5 → alerta visual "revisión manual requerida". El coordinador puede editar manualmente después.

## Fase 4 — Comparativa IA (US5)

- [x] T016 [US5] En `lib/domain/comparativa.ts`: añadir ruta IA — `generarComparativaIA()` que llama al orquestador con el requerimiento + cotizaciones ya extraídas, y produce `discrepanciasDetectadas`, `prosContras`, `sugerenciaIA`, `cotizacionSugeridaId`. Mantener `construirComparativa` determinística como fallback.
- [x] T017 [US5] En `DetalleSolicitud.tsx`: usar la ruta IA si está disponible (con fallback al determinístico); la sugerencia se muestra en `ComparativaView`/`Recomendacion` etiquetada como "generada por IA/el sistema" (RF-40).
- [x] T018 [US5] Unit tests: dado mock de IA → comparativa con pros/contras y sugerencia razonada; IA falla → se usa motor determinístico (menor precio); discrepancia severa detectada → advertencia visual.

## Verificación final (DoD)

- [x] T019 [US1-5] Batería completa: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npm run test:e2e` (solicitante + coordinador). Verificar degradación graceful sin clave IA (la app funciona igual). Commit atómico de la feature a origin/main.