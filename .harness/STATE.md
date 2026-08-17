---
schemaVersion: 1
lifecycle: closed
currentGate: G6
activeFeature: 007-sprint3-ia-comparativa
approvals:
  G1: true
  G2: true
  G3: true
  G4: true
nextAction:
  command: feature-selection
  prompt: "Feature 006 cerrada (G5/G6). Iniciar 007: profundización de IA en comparativa y extracción (costo por token via OpenRouter ya implementado)."
---

# Project State

## Current objective

Feature **006-ia-integracion** cerrada (G5 ✅, G6 ✅). Integración de IA aproximada: orquestador OpenRouter → Gemini Flash Lite, clasificación y assessment del solicitante, extracción de cotizaciones con conversión markitdown, comparativa IA razonada con fallback determinístico, y creación manual de cotizaciones por el coordinador. Pusheado a origin/main (cierres `a60fe75`…`014b501`, verificación `verification.md`).

## Approvals

- G1 ✅ · 000 ✅ · 001 ✅ · 002 ✅ · 003 ✅ · 004 ✅ · 005-auth-supabase ✅ · 006-ia-integracion ✅ (2026-08-15, G5/G6 con `specs/006-ia-integracion/verification.md`).

## Next feature (007) — recomendación

**007-sprint3-ia-comparativa**: profundizar la IA en los puntos donde hoy es un primer corte:

1. **Extracción multi-formato robusta** — manejar tablas dentro de PDF/configuración, validar el desglose fiscal (ISV) con la IA, y marcar "revisar manualmente" con listas de discrepancias reales (RF-33…38).
2. **Comparativa contextual** — que la IA considere plazos, condiciones de pago y garantías, no solo precio; y que genere el Excel comparativo descargable (doc 17).
3. **Configuración del catálogo en admin** — edición de campos/categorías para que el assessment y la extracción se ajusten a cada rubro (fecha: parte del work de detalle).

Prioridad sugerida para el primer slice: **mejorar la extracción de cotizaciones** (validación fiscal + alertas de revisión), porque es donde el coordinador más captura valor manual hoy.

## Blocker

Ninguno. Pendiente: decidir alcance de los slicés de la 007 (extracción vs comparativa vs catálogo).