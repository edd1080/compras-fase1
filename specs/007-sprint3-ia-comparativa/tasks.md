---
description: "Task list for feature implementation — 007-Sprint3-IA-Comparativa"
---

# Tasks: 007-Sprint3-IA-Comparativa

**Input**: Design documents from `/specs/007-sprint3-ia-comparativa/`
**Prerequisites**: plan.md (G3), spec.md (G2 aprobado).
**Nota**: el S1 (persistencia + validación fiscal) es pre-requisito de S2 (Excel/comparativa). S3 es independiente.

## Formato: `[ID] [P?] [Story] Descripción`

---

## Fase A — S1: Persistencia completa + validación fiscal

- [x] T001 [S1] En `lib/db/postgres-repo.ts`: extender `guardarCotizacion`, `listarCotizaciones` y `actualizarCotizacion` para leer/escribir `proveedorIdentificacionFiscal`, `proveedorContacto`, `montoOtrosImpuestos`, `formaPago`, `vigenciaOferta`, `garantia`, `observacionesFiscales` (columnas ya existen en la migración 008). Agregar `markdown_extraido` si aplica.
- [x] T002 [S1] En `lib/domain/rules.ts`: añadir el campo `requiere_aclaracion: boolean` a la salida de `detectarTratamientoFiscal` (doc 16 §2.4). Si la coherencia es inconsistent o tratamiento no_declarado → true.
- [x] T003 [S1] En `lib/ai/schemas.ts`: crear `ValidarFiscalOutputSchema` (`tratamiento_declarado`, `coherencia_aritmetica`, `observacion`, `requiere_aclaracion`). En `lib/ai/prompts.ts`: prompt `validar_fiscal` (doc 16 §2.4) — solo verificar con los 3 montos presentes, else `no_verificable`.
- [x] T004 [S1] En `lib/ai/orchestrator.ts`: exponer `validarFiscal(input)` con timeout 10s (doc 16) y validación Zod; fallback a `null` sin excepción.
- [x] T005 [S1] En `app/api/solicitudes/[id]/cotizaciones/route.ts` (POST): tras guardar con extracción, ejecutar `validarFiscal` (determinística primero, IA si disponible) y persistir el resultado (observación + requiere_aclaracion) en la cotización.
- [x] T006 [S1] En `CargaCotizaciones.tsx`: renderizar la salida de validación fiscal — banner ámbar "Verificar con el proveedor" si `requiere_aclaracion`, y mostrar `observacion`. Unit test de `detectarTratamientoFiscal` con `requiere_aclaracion`.

## Fase B — S2: Comparativa contextual + Excel descargable

- [x] T007 [S2] Ampliar `ComparativaInputSchema` y el mapeo en `generarComparativaConIA` para pasar `formaPago`, `garantia`, `vigenciaOferta`, `impuestosDesglosados`, `montoOtrosImpuestos`, `observacionesFiscales` a la IA.
- [x] T008 [S2] En `comparativa/route.ts`: usar `especificacionesSolicitadas` reales (hoy `{}`) y persistir la comparativa con campos ampliados.
- [x] T009 [S2] Instalar `xlsx` (SheetJS). Crear `lib/excel/comparativo.ts`: builder de las 3 hojas según doc 13 §5 — Hoja1 "Comparativo" (bloques A-H, regla de oro), Hoja2 "Detalle de cotizaciones" (notas de extracción/confianza baja), Hoja3 "Requerimiento original". Regla: "no especificado" nunca cero.
- [x] T010 [S2] Crear ruta `GET /api/solicitudes/[id]/comparativa/excel`: generar el .xlsx y retornarlo como descarga; persistir `comparativa.ruta_excel`.
- [x] T011 [S2] En `ComparativaView.tsx`: mostrar forma de pago, garantía y vigencia en la tabla; agregar botón "Descargar Excel". e2e: descargar .xlsx y verificar hojas.

## Fase C — S3: Catálogo en admin

- [x] T012 [S3] En `postgres-repo.ts`: añadir `guardarCampoCatalogo`, `actualizarCampoCatalogo`, `eliminarCampoCatalogo` (desactivar en vez de borrar).
- [x] T013 [S3] Crear `app/api/admin/campos/route.ts` (GET, POST) y `app/api/admin/campos/[id]/route.ts` (PATCH, DELETE), restringidos a rol admin.
- [x] T014 [S3] Crear página `app/admin/campos/page.tsx`: tabla de campos, formulario crear/editar y toggle desactivar. Conectar el assessment IA y el wizard para que usen los campos activos.

## Verificación final (DoD)

- [x] T015 [S1-S3] Batería completa: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, e2e completo (workers=1) — coordinador valida alerta fiscal + descarga Excel; admin crea campo. Commit atómico de la feature + verification.md + cierre G5/G6.