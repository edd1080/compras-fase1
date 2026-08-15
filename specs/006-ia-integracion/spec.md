# Feature Specification: 006-IA-Integracion

**Feature Branch**: `006-ia-integracion`

**Created**: 2026-08-14

**Status**: Draft (para revisión G2)

**Input**: Integrar IA en las 6 funciones del agente (clasificar, assessment, extraer cotización, validar fiscal, detectar discrepancias, generar pros/contras) usando OpenRouter con Gemini 2.5 Flash Lite como modelo principal y GPT-4o-mini como fallback. La IA se conecta desde la primera pregunta del solicitante hasta la recomendación del coordinador, siempre con fallback graceful (ninguna función de IA bloquea el flujo).

**Fuentes autoritativas**: `documentacion inicial/16-especificacion-prompts-agente.md` (contrato de las 6 funciones, guardrails, timeouts), `docs/references/architecture.md` (capa de inteligencia actualizada), `docs/product/prd.md` (RF-12 a RF-18, RF-39, RF-40, RN-01, RN-02), `lib/domain/assessment.ts` (contrato tipado existente), `lib/domain/comparativa.ts` (motor determinístico actual).

## Stack de IA

- **Proxy**: OpenRouter (un solo cliente HTTP para todos los modelos, fallback automático, sin vendor lock-in)
- **Modelo principal**: `google/gemini-2.5-flash-lite` — visión nativa, 1M contexto, $0.10/M prompt, $0.40/M completion. Ideal por: visión para cotizaciones escaneadas, contexto largo para PDFs, precio 90% menor que Claude.
- **Fallback**: `openai/gpt-4o-mini` — $0.15/M prompt, $0.60/M completion, 128K contexto.
- **Conversión documentos**: microsoft/markitdown (Python, via subprocess o API interna) — extracción de capa de texto gratis; fallback OCR con el mismo modelo de visión.
- **Presupuesto estimado**: ~$0.001 por solicitud completa (clasificación + assessment + extracción de 3 cotizaciones + comparativa).

## User Stories

### US1 — Cliente IA y orquestador (Prioridad P0)
Crear `lib/ai/client.ts` (cliente HTTP barebones para OpenRouter, sin SDK pesados) y `lib/ai/orchestrator.ts` (timeout por función, validación Zod de salida, fallback graceful). El orquestador NO bloquea el flujo si la IA falla — registra el error y devuelve null.

**Why this priority**: sin esta capa no existe conexión con ningún modelo.
**Independent Test**: con OPENROUTER_API_KEY mock, el cliente devuelve JSON estructurado según el schema de cada función; con timeout simulado, el orquestador devuelve null sin excepción.
**Acceptance Scenarios**:
1. Dado un prompt de clasificación, **Cuando** se llama al orquestador, **Entonces** devuelve `{tipo, subtipo, confianza, razonamiento}` tipado.
2. Dado un timeout simulado (>10s), **Cuando** expira, **Entonces** devuelve null y registra el error, sin lanzar excepción.
3. Dado un modelo caído, **Cuando** falla el principal, **Entonces** reintenta con el fallback automáticamente.

### US2 — Clasificación IA del solicitante (Prioridad P1)
Reemplazar el stub hardcodeado en `PasoClasificacion` (hoy siempre RFQ) con `clasificar_solicitud` real. Al presionar "Continuar" en P2, el hook llama al orquestador con `{titulo, descripcion, categoria}` y puebla `estado.clasificacion`, `confianzaClasificacion`, `razonamientoBreve`. Si confianza < 0.7, no se preselecciona ningún tipo. El usuario siempre puede corregir.

**Why this priority**: es la primera interacción con IA; demuestra valor inmediato.
**Independent Test**: dado "Necesito 5000 camisetas estampadas con el logo" → IA devuelve `{tipo:RFQ, subtipo:producto, confianza:0.92}`.
**Acceptance Scenarios**:
1. Dado texto ambiguo, **Cuando** la confianza es <0.7, **Entonces** P3 muestra "No pudimos determinar el tipo" y el usuario selecciona manualmente.
2. Dado que el usuario cambia la selección, **Entonces** `solicitud.clasificacion_corregida = true`.

### US3 — Assessment IA dinámico (Prioridad P1)
Reemplazar el assessment determinístico (`lib/domain/assessment.ts`) con `assessment_requerimiento`. La IA recibe tipo, subtipo, categoría, campos ya capturados y el catálogo completo, y devuelve hasta 6 preguntas relevantes con `campoKey`, `pregunta`, `porQue`, `critica`. El usuario responde en formulario (con opción "No lo sé"). Si falla (timeout 15s), se salta a P5 con plantilla base.

**Why this priority**: elimina preguntas irrelevantes y adapta el formulario al rubro.
**Independent Test**: para categoría "Empaque y branding" con `llevaBranding=true` → IA pregunta por cantidad, material, acabado, color — NO pregunta por dimensiones logísticas.
**Acceptance Scenarios**:
1. Dado un servicio (subtipo=servicio), **Cuando** se llama assessment, **Entonces** no pregunta por materiales ni dimensiones.
2. Dado que el usuario responde "No lo sé" a una pregunta crítica, **Entonces** el bloqueo B2 se activa para ese campo.

### US4 — Extracción IA de cotizaciones (Prioridad P1)
Implementar `extraer_cotizacion`: al subir un archivo en `CargaCotizaciones`, convertir a Markdown (markitdown para PDF/DOCX con texto, OCR vía Gemini visión para escaneados), enviar al modelo, y guardar los 18 campos estructurados (con `confianzaExtraccion` por campo). El coordinador puede editar manualmente después.

**Why this priority**: automatiza la tarea más tediosa del coordinador.
**Independent Test**: dado un PDF de cotización digital con "Valor neto: L 86,000 // ISV: L 12,900 // Total: L 98,900 // Plazo: 12 días", la IA extrae los 4 campos correctamente con confianza >0.9.
**Acceptance Scenarios**:
1. Dado un PDF escaneado (sin texto), **Cuando** se procesa, **Entonces** se usa OCR vía modelo de visión y se extraen los campos con confianza por campo.
2. Dado que la confianza en algún campo es <0.5, **Cuando** se muestran los resultados, **Entonces** el campo se resalta como "revisión manual requerida".

### US5 — Comparativa IA con sugerencia razonada (Prioridad P2)
Aumentar el motor determinístico actual (`construirComparativa`) con detección de discrepancias y pros/contras generados por IA, incluyendo una sugerencia razonada en lenguaje natural (RF-39/RF-40). La sugerencia se etiqueta visualmente como "generada por el sistema". El fallback determinístico (menor precio) se mantiene como plan B.

**Why this priority**: cumple RF-39/RF-40 y diferencia el producto.
**Independent Test**: con 3 cotizaciones donde una es significativamente más cara pero ofrece mejor calidad, la IA menciona la diferencia de calidad en pros/contras y justifica su sugerencia.
**Acceptance Scenarios**:
1. Dada una cotización con valor total mucho menor, **Cuando** se genera la comparativa, **Entonces** la sugerencia IA incluye advertencia sobre posibles omisiones.
2. Dado que la IA falla, **Cuando** se muestra la comparativa, **Entonces** se usa el motor determinístico (menor precio total).

## No-alcance (para próximas iteraciones)

- OCR con Tesseract.js (la visión del modelo es suficiente)
- Subida de binarios a Supabase Storage (sigue solo metadata)
- RAG con pgvector (pospuesto del MVP)
- Búsqueda web real en assessment (se omite en esta iteración; el modelo funciona con su conocimiento interno)
- Validación fiscal IA (se pospone; la validación determinística actual es suficiente)
- Chat conversacional (sigue siendo formulario, RF-14)

## Guardrails transversales (heredados del doc 16)

1. Nunca inventar valores de negocio → null o "no especificado"
2. Nunca crear campos fuera del catálogo vigente
3. Nunca sobrescribir lo que el usuario declaró
4. Nunca decidir el proveedor ganador (RN-01)
5. Toda salida es JSON estricto contra el esquema definido, sin texto adicional
6. Declarar confianza baja explícitamente (<0.5 = alerta visual)
7. Si falla o excede tiempo, el flujo continúa con lo que ya tiene (nunca bloquea)
8. Responder siempre en español de Honduras, registro profesional y neutro

## Timeouts configurados por función

| Función | Timeout | Si falla |
|---|---|---|
| `clasificar_solicitud` | 10s | P3 sin preselección |
| `assessment_requerimiento` | 15s | Salta a P5 con plantilla base |
| `extraer_cotizacion` | 30s | Captura manual |
| `generar_pros_contras` + `detectar_discrepancias` | 25s | Comparativa determinística (precio) |

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Costos de API impredecibles | Gemini Flash Lite es 10× más barato que Claude; presupuesto <$0.001/solicitud |
| Latencia en extracción de PDF grandes | Timeout 30s; si falla → captura manual |
| Calidad variable del modelo | Cada función tiene schema Zod de validación; si la salida no matchea, se descarta y se usa fallback determinístico |
| Cambio de precios de OpenRouter | El cliente es agnóstico al modelo (solo un string `IA_MODEL` en env); cambiar modelo es editar .env |