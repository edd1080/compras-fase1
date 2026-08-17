# Feature Spec (DRAFT): 007-Sprint3-IA-Comparativa

**Branch propuesto**: `007-sprint3-ia-comparativa`
**Created**: 2026-08-15
**Status**: Draft (no iniciada — G2 pendiente)

> Este es un esqueleto de alcance. La feature NO está autorizada a implementarse; requiere pasar por G2 (spec), G3 (plan) y G4 (workshop) del harness ADF antes de tocar código.

## Objetivo

Profundizar la integración de IA del punto donde quedó la 006, priorizando los eslabones donde el coordinador captura más valor manual y donde la extracción/comparativa hoy son "primer corte".

## Alcance candidato (en orden de prioridad sugerido)

### S1 — Extracción de cotizaciones robusta
- Manejar tablas dentro de PDFs y layout de cotizaciones (markitdown + texto).
- Validación fiscal con IA (`validar_fiscal` del doc 16): detectar si ISV está desglosado, consistencia a nivel total = neto + ISV.
- Alertas de "revisión manual" por campo con confianza baja y discrepancias aritméticas reales (lista, no solo texto).
- Mantener el fallback determinístico y la edición manual (nunca bloquea).

### S2 — Comparativa contextual
- IA considera plazo, condiciones de pago, garantía y vigencia, no solo el precio total.
- Generación de Excel comparativo descargable (SheetJS) con tres hojas (doc 17, líneas 238-249).
- Mantener la etiqueta "generada por el sistema" y la decisión humana (RN-01).

### S3 — Catálogo editable en admin
- CRUD de campos `campo_catalogo` y categorías desde el panel admin para que assessment y extracción se ajusten a cada rubro.

## Fuentes

- `documentacion inicial/16-especificacion-prompts-agente.md` (funciones `validar_fiscal`, `detectar_discrepancias`, `generar_pros_contras`).
- `documentacion inicial/17-backlog-desarrollo-sprints.md` (líneas 199-249, 317-357).
- `lib/ai/*`, `lib/pdf/convert.ts`, `components/coordinador/*` (estado actual de la 006).

## Guardrails heredados (doc 16)

- JSON estricto por función; nunca inventar valores; la IA nunca bloquea; la recomendación la escribe una persona (RN-01).

## Criterios de aceptación de alto nivel

- Extraer y validar fiscalmente una cotización real con alertas de revisión correctas.
- Comparativa que mencione plazo/condiciones/garantía y que genere Excel descargable.
- Administración funcional del catálogo (crear/editar/desactivar campos y categorías).
