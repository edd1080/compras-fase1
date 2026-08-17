# Active Handoff

**Feature 006-IA-Integracion — CERRADA (G5/G6)**

## Estado
- Feature 006 cerrada con evidencia completa (`specs/006-ia-integracion/verification.md`).
- Batería final: 68 unit tests ✅ · 21 e2e ✅ (workers=1) · typecheck ✅ · lint ✅ · build ✅.
- Todos los gaps del cierre resueltos: lint (0 errores), T008 (test de hook de clasificación), T015 (confianza por campo + alerta "revisión manual" <0.5), tasks.md marcado 19/19, verification.md creado.

## Decisiones registradas
- Motor IA: OpenRouter → Gemini Flash Lite (default) / GPT-4o-mini (fallback). Rutas server `/api/ia/*` (la clave nunca va al navegador).
- Schemas de salida IA en snake_case (doc 16) con campos tolerantes.
- Creación manual de cotizaciones = fallback de disponibilidad (doc 17) + subida de archivo.
- Migraciones 009 (catálogo) y 010 (usuarios auth) aplicadas.

## Feature 007 (recomendada, NO iniciada)
- Esqueleto en `specs/007-sprint3-ia-comparativa/spec.md` (Draft, G2 pendiente).
- S1: Extracción robusta + validación fiscal (ISV) + alertas de revisión.
- S2: Comparativa contextual + Excel descargable.
- S3: Catálogo editable en admin.

## Próxima acción exacta
1. Decidir alcance del primer slice de la 007 (recomendación: S1 extracción/validación fiscal).
2. Ejecutar intake/feature-selection del ADF para abrir la 007 formalmente (G2 → G3 → G4 → implementación).

## Evidencia de cierre
- `git log 1a5313a..HEAD` = commits `a60fe75`…`<cierre>` (feature 006).
- `specs/006-ia-integracion/verification.md` (informe completo).
