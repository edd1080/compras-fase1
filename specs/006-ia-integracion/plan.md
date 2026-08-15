# Implementation Plan: 006-IA-Integracion

**Branch**: `006-ia-integracion` | **Date**: 2026-08-14 | **Spec**: `specs/006-ia-integracion/spec.md`

**Input**: Feature specification (US1–US5). Integrar IA en 6 funciones del agente via OpenRouter + Gemini Flash Lite, conectándolas al flujo del solicitante (P2→P3 clasificación, P3→P4 assessment) y coordinador (carga de cotizaciones → extracción → comparativa → sugerencia).

## Summary

Implementar un orquestador de IA que conecta las 6 funciones del agente (doc 16) con modelos de lenguaje via OpenRouter. La IA se activa en 3 puntos del flujo: (1) clasificación automática de la solicitud al pasar P2→P3, (2) assessment dinámico de preguntas relevantes al pasar P3→P4, (3) extracción de datos de cotizaciones al subir archivos, y (4) generación de comparativa con pros/contras y sugerencia razonada. Ninguna función bloquea el flujo — si falla, degrada gracefulmente.

## Technical Context

**Language/Version**: TypeScript estricto, Node, Next.js 16 (App Router), Python 3.10+ (markitdown como subprocess).

**Primary Dependencies**: 
- `markitdown[pdf]` (Python) — conversión PDF/DOCX → Markdown con OCR opcional.
- `zod` (ya presente) — validación de salida JSON de la IA.
- Sin SDK de IA pesado — HTTP directo a OpenRouter API (`https://openrouter.ai/api/v1/chat/completions`).

**Storage/DB**: Las cotizaciones ya tienen columnas `markdown_extraido` y `confianzaExtraccion` en la migración 008 — se usan sin cambios de esquema.

**Testing**: Unit tests con mocks de fetch (vitest), typecheck/lint/build, e2e actualizado del solicitante (P2→P6 con IA mockeada).

**Target Platform**: next (web-service). Cliente IA no requiere edge runtime (se ejecuta en server/route handlers).

**Constraints**: ninguna clave de IA en repo (OPENROUTER_API_KEY en .env.local). Sin bloqueo duro por fallo de IA. Toda salida IA se valida con Zod antes de usarla.

**Scale/Scope**: ~8 archivos nuevos (cliente IA, orquestador, schema Zod, 4 puntos de integración) + modificaciones a 5 archivos existentes.

## Constitution Check

*GATE: RN-01 (recomendación la escribe una persona — la IA solo sugiere, etiquetada como tal); RN-02 (no crear campos fuera del catálogo — la IA se restringe al catálogo vigente); disponibilidad (ninguna función IA bloquea el flujo — timeouts y fallbacks implementados).*

✅ Sin violaciones.

## Project Structure

### Documentación (feature)

```text
specs/006-ia-integracion/
├── spec.md            # Especificación (G2 aprobada)
├── plan.md            # Este archivo (G3)
└── tasks.md           # Tareas ejecutables (contrato G4)
```

### Código nuevo

```text
lib/ai/
├── client.ts           # (NUEVO) HTTP client para OpenRouter (fetch directo, sin SDK)
├── orchestrator.ts     # (NUEVO) Orquestador: timeout, fallback, validación Zod por función
├── schemas.ts          # (NUEVO) Schemas Zod de entrada/salida para cada función IA
│                        # (clasificar, assessment, extraer, discrepancias, prosContras)
└── prompts.ts          # (NUEVO) Templates de prompt para cada función, en español HN,
                         # con guardrails inline (JSON estricto, no inventar, etc.)
lib/pdf/
└── convert.ts          # (NUEVO) Wrapper para markitdown: intenta text-layer primero,
                         # fallback a OCR con modelo de visión
```

### Código modificado

```text
components/solicitante/SolicitanteWizard.tsx   # P2→P3: llamar clasificación IA
                                                # P3→P4: llamar assessment IA
hooks/useSolicitudWizard.ts                    # conectar estados con orquestador
lib/domain/assessment.ts                       # reemplazar cuerpo con llamada IA
components/coordinador/CargaCotizaciones.tsx    # conectar extracción IA tras subir archivo
components/coordinador/DetalleSolicitud.tsx     # conectar generación de comparativa IA
lib/domain/comparativa.ts                       # añadir ruta IA (mantener determinístico como fallback)
.env.example                                   # ya actualizado
```

### Integración de markitdown (Python)

```text
scripts/convert-document.py     # (NUEVO) Script Python llamado como subprocess:
                                 # recibe ruta archivo → devuelve markdown por stdout
                                 # Usa markitdown[pdf] internamente
```

## Complexity Tracking

| Componente | Archivos | Riesgo |
|---|---|---|
| Cliente IA + orquestador | ~4 (client, orchestrator, schemas, prompts) | Bajo — HTTP stateless, sin estado compartido |
| Clasificación IA | ~2 (wizard + hook) | Bajo — reemplazo directo de stub |
| Assessment IA | ~2 (assessment.ts + wizard) | Medio — el contrato ya está tipado |
| Extracción cotizaciones | ~3 (convert.ts, script Python, CargaCotizaciones) | Medio — dependencia de Python/markitdown |
| Comparativa IA | ~2 (comparativa.ts + DetalleSolicitud) | Medio — mantener compatibilidad con fallback |

## Risk / Rollback

| Riesgo | Mitigación |
|---|---|
| markitdown (Python) no está disponible en el entorno | `lib/pdf/convert.ts` detecta si Python+markitdown están instalados; si no, salta la conversión y la extracción usa solo el texto del PDF si existe. Nunca bloquea. |
| La salida de la IA no es JSON válido | El schema Zod valida y rechaza; el orquestador retorna null y se usa el fallback determinístico. |
| Costo de API inesperado | Gemini Flash Lite es $0.10/M tokens. Una solicitud completa usa ~10K tokens → $0.001. Con 1000 solicitudes/mes → $1/mes. Configurable via env. |
| La clasificación IA empeora la UX | El usuario siempre puede corregir manualmente (como hoy). Si la IA es mala, la corrección queda registrada y podemos desactivar la clasificación IA via env flag. |
| Latencia en extracción de PDFs grandes | Timeout 30s; si excede → captura manual. El PDF se procesa en server, no bloquea al usuario (llamada async). |

**Rollback**: git revert del merge de la feature branch. La app funciona exactamente como antes sin la IA (el assessment determinístico y comparativa determinística siguen intactos). Solo se pierden las mejoras de UX.

## Verification Strategy

| US | Verificación |
|---|---|
| US1 (orquestador) | Unit test: mock fetch a OpenRouter devuelve JSON válido; mock timeout devuelve null. |
| US2 (clasificación) | E2e: al llenar P2 y continuar → P3 muestra tipo sugerido. Test unit: mock de orquestador devuelve RFQ → estado.clasificacion = RFQ. |
| US3 (assessment) | E2e: al llegar a P4 con categoría "Empaque y branding" → P4 muestra preguntas dinámicas (no campos hardcodeados genéricos). |
| US4 (extracción) | Unit: dado un markdown simulado de cotización → extracción devuelve los 18 campos. E2e: subir archivo → cotización extraída visible en el detalle. |
| US5 (comparativa) | E2e: con 2+ cotizaciones → generar comparativa → muestra pros/contras y sugerencia IA. Unit: mock IA falla → muestra comparativa determinística (menor precio). |