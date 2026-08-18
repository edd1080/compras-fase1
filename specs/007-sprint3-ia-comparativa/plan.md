# Implementation Plan: 007-Sprint3-IA-Comparativa

**Branch**: `007-sprint3-ia-comparativa` | **Date**: 2026-08-18 | **Spec**: `specs/007-sprint3-ia-comparativa/spec.md`

**Input**: Feature specification (S1/S2/S3). Ampliar la IA de la 006: corregir el hueco que descarta campos extraídos, validar fiscalmente las cotizaciones, comparativa contextual + Excel de 3 hojas, y gestión del catálogo en admin.

## Summary

Tres slices en orden de dependencia estricto:
- **S1** (P0): completar la persistencia de todos los campos de cotización (hoy la IA extrae pero el repo descarta), y añadir `validar_fiscal` (determinística + IA) con alertas de revisión.
- **S2** (P1): la comparativa IA ve condiciones reales (plazo, forma de pago, garantía, vigencia) y se genera el Excel de 3 hojas con SheetJS.
- **S3** (P2): CRUD de `campo_catalogo` + catálogos de valores desde `/admin`.

El S1 es prerrequisito de S2 (sin los campos persistidos, ni la comparativa contextual ni el Excel pueden verlos).

## Technical Context

**Language/Version**: TypeScript estricto, Node, Next.js 16 (App Router). Python 3.11 (markitdown, ya en `.venv-md`).

**Primary Dependencies**: `xlsx` (SheetJS) — nueva, para el Excel. `zod` (ya presente). Sin SDK de IA (HTTP directo a OpenRouter, ya implementado).

**Storage/DB**: Sin migraciones nuevas de esquema — todas las columnas necesarias ya existen en la migración 008 (`cotizacion`). El trabajo es de leer/escribir los campos que hoy se ignoran en `postgres-repo.ts`. `comparativa.ruta_excel` ya existe como columna.

**Testing**: unit tests con mocks (vitest) + e2e Playwright (coordinador valida excel/fiscal). Los tests de repo con DB real ya están skippeados sin `DATABASE_URL`.

**Target Platform**: next (web-service).

**Constraints**: la IA nunca bloquea (fallback determinístico siempre); sin credenciales en repo; SheetJS se usa en server (generación de archivo), no en cliente.

**Scale/Scope**: ~8 archivos modificados + ~6 nuevos (rutas Excel/admin, página admin).

## Constitution Check

*GATE: RN-01 (recomendación humana obligatoria — la sugerencia IA queda etiquetada y el Excel tiene celda obligatoria de recomendación del comprador); RN-02 (catálogo como única fuente; el admin lo edita sin romper assessment); doc 16 guardrails (JSON estricto, no inventar, "no especificado" en vez de cero).*

✅ Sin violaciones.

## Project Structure

### Documentación (feature)

```text
specs/007-sprint3-ia-comparativa/
├── spec.md            # Especificación (G2 aprobada)
├── plan.md            # Este archivo (G3)
└── tasks.md           # Tareas ejecutables (contrato G4)
```

### Código — S1 (persistencia + validación fiscal)

```text
lib/db/postgres-repo.ts               # (MOD) leer/escribir identificación fiscal, contacto,
                                       #   otros impuestos, forma pago, vigencia, garantía, obs. fiscales, markdown
app/api/solicitudes/[id]/cotizaciones/route.ts   # (MOD) conectar validar_fiscal al guardar
lib/ai/orchestrator.ts                # (MOD) nueva función `validarFiscal()` con timeout/schema
lib/ai/schemas.ts                     # (NUEVO schema) ValidarFiscalOutputSchema
lib/ai/prompts.ts                     # (MOD) prompt de validar_fiscal (doc 16 §2.4)
lib/domain/rules.ts                   # (MOD) detectarTratamientoFiscal → añade `requiere_aclaracion`
components/coordinador/CargaCotizaciones.tsx   # (MOD) render salida validar_fiscal + alertas
```

### Código — S2 (comparativa + Excel)

```text
lib/ai/schemas.ts                     # (MOD) ComparativaInputSchema ampliado
lib/domain/comparativa.ts             # (MOD) pasar formaPago, garantia, vigencia, ISV, especSolicitadas
app/api/solicitudes/[id]/comparativa/route.ts  # (MOD) usar especificacionesS solicitadas reales + ruta excel
app/api/solicitudes/[id]/comparativa/excel/route.ts  # (NUEVO) generación .xlsx
lib/excel/comparativo.ts              # (NUEVO) builder de las 3 hojas (doc 13 §5)
components/coordinador/Comparativa.tsx      # (MOD) mostrar forma pago/garantía/vigencia + botón Excel
```

### Código — S3 (catálogo admin)

```text
app/admin/campos/page.tsx             # (NUEVO) listar/crear/editar/desactivar campos
app/api/admin/campos/route.ts         # (NUEVO) CRUD (GET/POST)
app/api/admin/campos/[id]/route.ts    # (NUEVO) PATCH/DELETE
lib/db/postgres-repo.ts               # (MOD) guardarCampoCatalogo, actualizarCampoCatalogo, eliminarCampoCatalogo
```

## Complexity Tracking

| Slice | Archivos | Riesgo |
|---|---|---|
| S1 persistencia | 2 (repo + types ya listos) | Bajo — columnas existen |
| S1 validar_fiscal | ~5 | Medio — conecta IA + determinística + UI |
| S2 Excel | ~5 | Medio — layout 3 hojas debe respetar doc 13 |
| S3 catálogo | ~5 | Medio — CRUD + conecta assessment |

## Risk / Rollback

| Riesgo | Mitigación |
|---|---|
| Cambiar persistencia rompe cotizaciones existentes | Solo añadimos lecturas/escrituras; no cambiamos columnas; tests con DB real |
| SheetJS en runtime edge | Se genera en route handler Node (no edge); `xlsx` es Node-compatible |
| La IA de validar_fiscal inventa coherencia | Guardrail: solo verifica si neto+impuesto+total presentes; else `no_verificable` |
| El admin rompe el catálogo que usa el assessment | Validaciones en PATCH (tipoDato/origen desde enums) + desactivar en vez de borrar |
| Excel con montos equivocados | Regla "no especificado, nunca cero" + datos solo desde persistencia corregida (S1) |

**Rollback**: git revert del merge; los cambios son aditivos sobre la 006, la app vuelve al comportamiento previo sin migrar nada.

## Verification Strategy

| Slice | Verificación |
|---|---|
| S1 | Unit: repo guarda/lee todos los campos (mock de pool o DB local); unit `detectarTratamientoFiscal` con `requiere_aclaracion`; unit orchestrator `validarFiscal`; e2e coordinador muestra alerta de inconsistencia |
| S2 | Unit: builder Excel produce 3 hojas y celdas clave (neto arriba / impuestos; "no especificado"); e2e descarga .xlsx; unit comparativa IA recibe condiciones |
| S3 | e2e admin: crear campo y verificar que assessment lo toma; unit CRUD repo |

DoD final: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, e2e completo (workers=1), commit de cierre con verification.md.