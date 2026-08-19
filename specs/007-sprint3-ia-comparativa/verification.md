---
description: "Registro de verificación (Gate G5/G6) — 007-Sprint3-IA-Comparativa"
---

# Verification: 007-Sprint3-IA-Comparativa

**Fecha**: 2026-08-18
**Rama/base**: main (fixed point `3494c15` = apertura 007)
**Resultado**: `DONE` — todos los criterios del DoD mapean a evidencia fresca.

## Definition of Done → evidencia

| Criterio | Comando / evidencia | Resultado |
|---|---|---|
| Typecheck | `npm run typecheck` | ✅ PASS |
| Lint | `npm run lint` | ✅ PASS (0 errores, 0 warnings) |
| Unit tests | `npm run test` | ✅ **73 passed** / 6 skipped (79) |
| Build de producción | `npm run build` | ✅ PASS (incluye rutas excel/admin) |
| e2e (3 roles + QA) | `npm run test:e2e` (workers=1) | ✅ **22/22 passed** (incluye catálogo admin y coordinador) |
| Descarga Excel real | `curl GET /api/solicitudes/[id]/comparativa/excel` | ✅ HTTP 200, 23.6 KB, `Microsoft Excel 2007+`, 3 hojas verificadas |

## Slices → evidencia

| Slice | Evidencia |
|---|---|
| **S1** Persistencia completa | `postgres-repo.ts`: guardar/actualizar/listar escriben todos los campos (identificación fiscal, contacto, otros impuestos, forma de pago, vigencia, garantía, observaciones). `mapeoCotizacion` centraliza. |
| **S1** Validación fiscal | `rules.ts` `detectarTratamientoFiscal` ahora devuelve `requiere_aclaracion`; `validarFiscal` IA en orquestador (schema + prompt doc 16 §2.4); route POST conecta determinística + IA; UI muestra "Revisión fiscal" en CargaCotizaciones. |
| **S2** Comparativa contextual | `ComparativaInputSchema` ampliado (formaPago, garantia, vigencia, ISV, obs. fiscales); mapeo en `generarComparativaConIA`; `ComparativaView` muestra condiciones + botón "Descargar Excel". |
| **S2** Excel 3 hojas | `xlsx` (SheetJS) instalado; `lib/excel/comparativo.ts` (doc 13 §5: Comparativo / Detalle / Requerimiento original); ruta GET excel; `actualizarRutaExcel` en repo. Test verifica 3 hojas y "no especificado". |
| **S3** Catálogo admin | CRUD `guardarCampoCatalogo`/`actualizarCampoCatalogo`; rutas `/api/admin/campos`; página `/admin/campos` con alta/edición/desactivar; link en AdminSidebar. e2e crea y desactiva un campo. |

## Tests nuevos

- `lib/domain/rules.test.ts`: 15 tests (incluye `requiere_aclaracion`).
- `lib/ai/orchestrator.test.ts`: 8 tests (incluye `validarFiscal`).
- `lib/excel/comparativo.test.ts`: 2 tests (3 hojas + "no especificado" en ISV).
- `e2e/admin.spec.ts`: nuevo test "catálogo: crea un campo y lo desactiva".

## Notas

- El e2e se corrió con `--workers=1` (estabilidad del server dev local).
- El Excel generado contiene "no especificado" cuando falta un dato (nunca cero inferido), respetando doc 13 §5.
- La validación fiscal se ejecuta de forma asíncrona al guardar (nunca bloquea el flujo).