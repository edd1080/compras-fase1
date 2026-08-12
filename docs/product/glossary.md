---
title: Product Glossary — Portal de Compras BIA
status: review
authority: product
owner: Intelia (build), Lady Matute (domain)
last_reviewed: 2026-08-12
---

# Product Glossary — Portal de Compras BIA

Términos canónicos del dominio. Fuentes: 18 §4, 14 §1.7, 22 (vocabulario), 24.

## Roles

| Término | Definición | Sinónimos a evitar |
|---|---|---|
| **Solicitante** | Cualquier colaborador de BIA que necesita una compra. Quien **pide**. No inicia sesión. | requisante |
| **Coordinador de compras** (o "coordinador") | El individuo del equipo de Compras que **gestiona** una solicitud: recibe, cotiza, carga cotizaciones, escribe la recomendación. Son 4 personas. | **"comprador"** (ambiguo; evítese) |
| **Administrador** | Lady Matute, dueña del proceso. Ve todo y configura plantillas, coordinadores, reglas y umbrales. | — |
| **Agente de IA** | Servicio interno del sistema, no un actor con voluntad. Sugiere, no decide. | — |

> **Regla terminológica crítica:** "coordinador" es el término canónico para quien gestiona. **No** confundir con las 4 *categorías* de compra del descubrimiento original (materia prima, servicios logísticos, administrativas, CAPEX). Quien pide es el solicitante; quien gestiona es el coordinador.

## Clasificación (tipo de solicitud)

| Término | Significado | Texto visible al solicitante |
|---|---|---|
| **RFI** | Solicitud de Información — explorando el mercado | "Estoy explorando qué existe en el mercado" |
| **RFQ** | Solicitud de Cotización — sabe qué quiere, falta precio | "Ya sé qué necesito, me falta el precio" |
| **RFP** | Solicitud de Propuesta — problema que requiere solución | "Tengo un problema y necesito que me propongan cómo resolverlo" |
| **Subtipo** | producto / servicio / mixto | — |

> En la interfaz del solicitante **nunca** aparecen las siglas RFI/RFQ/RFP; solo en el panel del coordinador y el dashboard (vocabulario del área).

## Artefactos y términos de flujo

| Término | Definición |
|---|---|
| **Catálogo de campos** | Fuente única de verdad de la que se generan el formulario del solicitante y el PDF. Agregar/quitar un campo es carga de datos, no despliegue. |
| **Número de referencia** | Identificador único e inmutable de la solicitud, asignado al enviar (transición a `ENVIADA_A_COMPRAS`). |
| **Comparativa** | Documento Excel editable con el producto/servicio a la izquierda y un proveedor por columna; neto arriba, impuestos desglosados abajo. |
| **Assessment** | Intervención del agente que pide solo la información faltante (máx. 6 preguntas), dentro del catálogo. No se nombra en la interfaz. |
| **Sugerencia del sistema** | Análisis generado por la IA (pros/contras + sugerencia), siempre etiquetada como generada por el sistema. |
| **Recomendación del coordinador** | Texto obligatorio que escribe una persona antes de enviar la comparativa. Bloqueo duro B3. |
| **Cookie de continuidad** | Identificador firmado, sin privilegios, que asocia el navegador con sus borradores (no es autenticación). |
| **Link público** | Acceso a la comparativa por token (≥32 bytes), sin sesión. |

## Estados de una solicitud

`BORRADOR` → `ENVIADA_A_COMPRAS` → `EN_COTIZACION` → `COMPARATIVA_LISTA` → `ENVIADA_A_SOLICITANTE` → `CERRADA_CON_DECISION`.
Terminales alternos: `CANCELADA`, `CERRADA_SIN_DECISION`.

## Catálogos de valor (seed inicial)

| Catálogo | Valores iniciales |
|---|---|
| Área solicitante | Mercadeo, Ventas, Manufactura, Logística, Finanzas, Gente y Gestión, Tecnología, Compras, Otra |
| Categoría | Materia prima y empaque, Servicios logísticos, Compras administrativas, Mercadeo y publicidad, CAPEX e indirectos de manufactura, Tecnología, Otra |
| Unidad de medida | unidades, kg, libras, litros, metros, m², cajas, rollos, servicio, otra |
| Técnica de aplicación | bordado, serigrafía, sublimación, impresión digital, grabado láser, vinil, por definir |
| Modalidad | presencial, remoto, mixto |

## Moneda y fiscal

| Término | Definición |
|---|---|
| ISV | Impuesto Sobre Ventas de Honduras, tasa configurada (inicial 0.15). Detección de desglose, no cálculo. |
| HNL / USD | Lempira y dólar. Sin conversión automática. |
| "No especificado" | Representación de un dato ausente en pantalla y documentos. **Nunca** un cero. |
