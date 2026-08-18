# Feature Specification: 007-Sprint3-IA-Comparativa

**Feature Branch**: `007-sprint3-ia-comparativa`

**Created**: 2026-08-15

**Status**: Draft (para revisión G2)

**Input**: Decision the feature 007 as the "Sprint 3 IA" evolution of the 006. Goals: (1) cerrar el hueco de persistencia que descarta campos extraídos, (2) validación fiscal robusta (doc 16 §2.4), (3) comparativa contextual + Excel de 3 hojas (doc 13 §5 / RF-36), y (4) gestión del catálogo en admin (doc 14 §A2).

**Fuentes autoritativas**: `specs/006-ia-integracion/*` (estado previo), `documentacion inicial/16-especificacion-prompts-agente.md` (validar_fiscal, guardrails), `documentacion inicial/13-plantillas-documentos-y-correos-v09.md` (§5 Excel comparativo), `documentacion inicial/14-catalogo-campos-y-especificacion-pantallas.md` (§A2 gestión de campos), `documentacion inicial/17-backlog-desarrollo-sprints.md` (H3.5), `docs/product/prd.md` (RF-33…40, RF-36 Excel), `lib/db/postgres-repo.ts`, `lib/ai/*` (estado actual).

## Hallazgo que ordena el alcance (observacional)

`postgres-repo.ts` descarta al guardar/leer: `proveedorIdentificacionFiscal`, `proveedorContacto`, `montoOtrosImpuestos`, `formaPago`, `vigenciaOferta`, `garantia`, `observacionesFiscales`. Existen como columnas (migración 008) y en el tipo `Cotizacion`, pero `guardarCotizacion`, `listarCotizaciones` y `actualizarCotizacion` no los usan. La IA de la 006 los extrae y se pierden. Esto bloquea la comparativa contextual (S2) y el Excel (S2). **S1 de esta feature lo corrige primero.**

## Slices

Prioridad estricta: S1 es prerrequisito de S2; S3 independiente (puede ir en paralelo al final).

### S1 — Persistencia completa + validación fiscal (Prioridad P0)

**Objetivo**: que los datos extraídos lleguen a la DB y que la validación fiscal sea robusta (determinística + IA).

- **S1a Persistencia completa**: extender `guardarCotizacion`, `listarCotizaciones`, `actualizarCotizacion` para leer/escribir todos los campos de la migración 008 (identificación fiscal, contacto, otros impuestos, forma pago, vigencia, garantía, observaciones fiscales) y `markdown_extraido`.
- **S1b Validación fiscal determinística**: completar `detectarTratamientoFiscal` (rules.ts:63) con el campo `requiere_aclaracion` que exige el doc 16 §2.4, y conectarla al momento de guardar/extraer (ej. en el POST de cotizaciones).
- **S1c `validar_fiscal` con IA**: integrar la función agente en el orquestador (JSON: `tratamiento_declarado`, `coherencia_aritmetica`, `observacion`, `requiere_aclaracion`), con fallback a la determinística (nunca bloquea).
- **S1d Alertas de revisión**: en `CargaCotizaciones`, mostrar la salida de `validar_fiscal` (inconsistencia aritmética → "revisar con el proveedor"; confianza <0.5 → alerta por campo, lista).

### S2 — Comparativa contextual + Excel descargable (Prioridad P1)

**Objetivo**: que la IA vea condiciones reales y se genere el Excel de 3 hojas (RF-36).

- **S2a Comparativa IA contextual**: ampliar `ComparativaInputSchema` y el mapeo de `generarComparativaConIA` para pasar `formaPago`, `garantia`, `vigenciaOferta`, `impuestosDesglosados`, `montoOtrosImpuestos`, `observacionesFiscales`, y `especificacionesSolicitadas` reales (hoy `{}` hardcodeado).
- **S2b ComparativaView**: mostrar forma de pago, garantía y vigencia en la tabla.
- **S2c Excel 3 hojas con SheetJS**: instalar `xlsx`; ruta `GET/POST /api/solicitudes/[id]/comparativa/excel` que genere Hoja1 "Comparativo" (bloques A–H del doc 13 §5, regla de oro: neto arriba / impuestos abajo / "no especificado" nunca cero), Hoja2 "Detalle de cotizaciones" (texto normalizado + notas de extracción/confianza baja), Hoja3 "Requerimiento original" (especificaciones solicitadas). Persistir `comparativa.ruta_excel`.
- **S2d Botón de descarga** en `ComparativaView`.

### S3 — Gestión de catálogo en admin (Prioridad P2, independiente)

**Objetivo**: que Lady (admin) edite campos y categorías sin desarrollo (doc 14 §A2).

- Página `app/admin/campos`: listar `campo_catalogo` (repo `listarCampoCatalogo` ya existe), crear/editar/desactivar/reordenar campos; editor de catálogos de valores (áreas, categorías, unidades, técnicas).
- API CRUD `/api/admin/campos` (solo rol admin, validado por middleware).
- Conecta el assessment IA y el wizard (que hoy pasan `catalogo: []` desde el front).

## Guardrails transversales (heredados del doc 16)

1. La IA nunca bloquea: fallback determinístico / captura manual siempre disponible.
2. JSON estricto por función; la salida inválida se descarta con log.
3. Nunca inventar valores: null / "no especificado", y el Excel muestra "no especificado", nunca cero.
4. No convertimos moneda automáticamente (doc 13).
5. La recomendación final la escribe una persona (RN-01); la sugerencia IA queda etiquetada "generada por el sistema".
6. La tasa de ISV se lee de configuración (`configuracion.tasa_isv`), no del prompt.
7. Acciones en admin: autorizadas solo para rol admin (middleware existente).

## Timeouts por función (doc 16)

| Función | Timeout | Si falla |
|---|---|---|
| `validar_fiscal` | 10s | Se omite la observación fiscal, se registra; queda la determinística |

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Cambiar persistencia rompe la 006 | Extendemos columnas existentes (no hay migración nueva de esquema); tests de repo con DB real + e2e coordinador |
| Excel con montos incorrectos | Regla "no especificado, nunca cero" + SheetJS con datos ya validados (S1b/c) |
| La IA de validar_fiscal inventa coherencia | Guardrail doc 16: solo verifica con neto+impuesto+total presentes; de lo contrario `no_verificable` |
| Gestión de catálogo desborda alcance | S3 se limita a campos + valores, sin versionado de plantillas (fuera de alcance) |

## No-alcance (para después)

- Versionado de plantillas PDF/RFQ desde admin (doc 14 §A2 completo).
- Exenciones y retenciones fiscales (doc 16 §4, pendiente confirmación de Lady).
- RAG/pgvector (MIPI/NIC MVP).
- Búsqueda web en assessment (misma decisión de la 006).

## Criterios de aceptación de alto nivel por slice

- **S1**: tras extraer una cotización con montos, la DB conserva formaPago/vigencia/garantía/identificación fiscal; `validar_fiscal` marca inconsistencia aritmética y el coordinador ve la alerta de revisión.
- **S2**: comparativa IA menciona plazo, forma pago y garantía; botón descarga un `.xlsx` con 3 hojas según doc 13 §5.
- **S3**: admin crea un campo, el assessment lo toma en la siguiente solicitud.