---
description: "Registro de verificación (Gate G5/G6) — 006-IA-Integracion"
---

# Verification: 006-IA-Integracion

**Fecha**: 2026-08-15
**Rama/base**: main (fixed point `1a5313a` = cierre 005-auth-supabase)
**Resultado**: `DONE` — todos los criterios del DoD mapean a evidencia fresca.

## Definition of Done → evidencia

| Criterio | Comando / evidencia | Resultado |
|---|---|---|
| Typecheck | `npm run typecheck` | ✅ PASS |
| Lint | `npm run lint` | ✅ PASS (0 errores, 0 warnings) |
| Unit tests | `npm run test` | ✅ **68 passed** / 6 skipped (74) |
| Build de producción | `npm run build` | ✅ PASS (todas las rutas API IA compilan) |
| e2e (3 roles + QA) | `npm run test:e2e` (workers=1) | ✅ **21/21 passed** — solicitante, coordinador, admin, explorador QA, comparativa |
| Degradación sin clave IA | `orchestrator.test.ts` — "devuelve null sin excepción cuando la clave no está" | ✅ PASS (contrato de disponibilidad del doc 16) |

## US → evidencia

| US | Evidencia |
|---|---|
| US1 Cliente IA + orquestador | `lib/ai/{client,orchestrator,schemas,prompts}.ts` + `orchestrator.test.ts` (7 tests) |
| US2 Clasificación IA | `hooks/useSolicitudWizard.ts`, `clasificacion-hook.test.tsx` (3 tests) + e2e solicitante |
| US3 Assessment IA | `lib/domain/assessment.ts` (IA con fallback determinístico RN-02) + `assessment.test.ts` |
| US4 Extracción cotizaciones | `scripts/convert-document.py`, `lib/pdf/convert.ts`, route POST + `/api/convertir` + `CargaCotizaciones` (creación manual + confianza por campo) |
| US5 Comparativa IA | `generarComparativaConIA` + `comparativa-ia.test.ts` (3 tests) + etiqueta "generada por el sistema" |

## Migraciones creadas

- `009_campo_catalogo_seed.sql` — catálogo para el assessment IA
- `010_sincronizar_usuarios_auth.sql` — usuarios locales alineados con Supabase Auth (bandeja del coordinador)

## Decisiones registradas

- Motor de IA: OpenRouter → Gemini 2.5 Flash Lite (default) / GPT-4o-mini (fallback). Claude descartado por costo.
- La IA usa rutas server (`/api/ia/*`) — la clave `OPENROUTER_API_KEY` nunca viaja al navegador.
- Schemas de salida en snake_case (contrato del doc 16) + campos tolerantes (los modelos omiten contexto/sugerencia a veces).
- Creación manual de cotizaciones como fallback de disponibilidad (doc 17) + carga de archivo.

## Notas

- Los tests e2e se ejecutaron con `--workers=1` (el server dev local se satura en paralelo; no es un fallo del código).
- El explorador visual QA (`qa/report-explorador.md`) confirma 10 rutas sin errores de consola/red.