---
title: User Flows — Portal de Compras BIA
status: review
authority: product
owner: Intelia (build), Lady Matute (domain validation)
last_reviewed: 2026-08-12
---

# User Flows — Portal de Compras BIA

> **Rol:** referencia oficial de roles, acciones, funcionalidades y casos límite de la plataforma. Consolida el documento 20 (flujos por rol a nivel de proceso) y el 24 (navegación, pantalla, elemento e interacción). Si algo difiere de otra fuente, prevalece el `prd.md`; este documento es autoridad de comportamiento.
>
> **Convenciones:** `[ELEMENTO]` = control de interfaz · `→` = transición de pantalla · `⇒` = cambio de estado en BD · **EC-xx** = caso límite · **T-xx** = comportamiento transversal · ⚠️ = depende de un tema abierto del cliente (Q1–Q9, marcados TBD).

---

# 1. ROLES Y PERMISOS

| Rol | Quién es | Autenticación | Puede | No puede |
|---|---|---|---|---|
| **Solicitante** | Cualquier colaborador de BIA | Solo correo + cookie de continuidad | Crear solicitud, responder assessment, ver sus solicitudes (sin montos), ver su comparativa por link, decidir | Ver solicitudes de otros, ver panel, ver métricas |
| **Coordinador de compras** | Equipo de Lady, asignado por categoría (4) | Sesión con credenciales | Ver solicitudes asignadas, cargar cotizaciones, escribir recomendación, enviar comparativa, reasignar, cancelar | Ver solicitudes de otros ⚠️ (según Q2), loan al admin |
| **Administrador (Lady)** | Dueña del proceso (1) | Sesión, rol admin | Todo sobre todas las solicitudes + plantillas, catálogos, coordinadores, reglas de asignación, umbrales de alerta | — |
| **Agente de IA** | Servicio interno, sin voluntad | N/A | Clasificar, hacer assessment, extraer, validar fiscal, detectar discrepancias, generar pros/contras/sugerencia | Decidir, crear campos, inventar cifras, comprar |
| **Intelia** | Mantenimiento y evolución | Acceso a infraestructura | Mantener y evolucionar | — |

> **Terminología:** ver `glossary.md`. "Coordinador" = quien gestiona. "Solicitante" = quien pide.

---

# 2. MAPA DE NAVEGACIÓN

## 2.1 Rutas

| Ruta | Pantalla | Acceso | Sesión |
|---|---|---|---|
| `/` | P1 Identificación | Público | No |
| `/solicitud/nueva` | P2 Captura inicial | Público | Cookie de continuidad |
| `/solicitud/[id]/clasificacion` | P3 Clasificación | Público | Cookie + coincidencia de correo |
| `/solicitud/[id]/detalles` | P4 Formulario de plantilla | Público | Cookie + coincidencia de correo |
| `/solicitud/[id]/informacion-adicional` | P5 Assessment | Público | Cookie + coincidencia de correo |
| `/solicitud/[id]/revisar` | P6 Revisión | Público | Cookie + coincidencia de correo |
| `/solicitud/[id]/enviada` | P7 Confirmación | Público | Cookie |
| `/mis-solicitudes` | Consulta de estado | Público | No — consulta por correo |
| `/comparativa/[token]` | L1 Vista pública | Token | No |
| `/comparativa/[token]/confirmado` | L2 Confirmación | Token | No |
| `/ingresar` | Autenticación | Público | — |
| `/panel` | C1 Bandeja | Coordinador / Admin | Sí |
| `/panel/solicitud/[id]` | C2 Detalle | Coordinador / Admin | Sí |
| `/panel/solicitud/[id]/cotizaciones` | C3 Carga | Coordinador / Admin | Sí |
| `/panel/solicitud/[id]/comparativa` | C4 Revisión y recomendación | Coordinador / Admin | Sí |
| `/admin` | A1 Dashboard | Admin | Sí |
| `/admin/plantillas` | A2 Plantillas y campos | Admin | Sí |
| `/admin/coordinadores` | A3 Coordinadores y asignación | Admin | Sí |
| `/admin/alertas` | A4 Alertas | Admin | Sí |

## 2.2 Puntos de entrada

| Origen | Destino | Quién |
|---|---|---|
| Enlace difundido internamente | `/` | Solicitante |
| Correo 1 (nueva solicitud) | `/panel/solicitud/[id]` | Coordinador |
| Correo 2 (acuse) | `/mis-solicitudes` | Solicitante |
| Correo 3 (comparativo) | `/comparativa/[token]` | Solicitante |
| Correo 4 (decisión) | `/panel/solicitud/[id]` | Coordinador |
| Correo 5 (alerta) | `/panel/solicitud/[id]` | Coordinador / Admin |
| Marcador guardado | `/panel` o `/admin` | Coordinador / Admin |

## 2.3 Sesión del solicitante (decisión de diseño)

El solicitante no tiene autenticación. Una **cookie de continuidad** (identificador firmado, sin privilegios) asocia el navegador con sus borradores. Reglas: no es autenticación; toda ruta `/solicitud/[id]/*` valida coincidencia de correo; vigencia 30 días; si se pierde, retoma por `/mis-solicitudes`; una solicitud ya enviada no es editable.

## 2.4 Navegación transversal

| Situación | Comportamiento |
|---|---|
| Botón atrás P2→P6 | Vuelve al paso anterior con datos guardados; nunca reenvía |
| Botón atrás desde P7 | No vuelve a P6; redirige a `/mis-solicitudes` |
| Recarga en cualquier paso | Recupera el estado guardado |
| Enlace profundo sin cookie | Redirige a `/` con mensaje de identificación |
| Enlace profundo a `/panel/*` sin sesión | Redirige a `/ingresar` conservando destino |
| Enlace profundo a `/admin/*` con rol coordinador | Error de permisos, registrado. No redirige en silencio |
| Cierre de pestaña a media captura | Datos persistidos; se retoma con cookie o por `/mis-solicitudes` |
| Doble clic en envío | Botón deshabilitado al primer clic; idempotencia en servidor |

---

# 3. FLUJOS POR ROL

## 3.1 SOLICITANTE — crear una solicitud (camino feliz)

| Paso | Pantalla | Acción | Estado |
|---|---|---|---|
| 1 | P1 | Se identifica con correo, nombre, área | `BORRADOR` creado |
| 2 | P2 | Llena 5 campos base + categoría + fecha | persiste en `BORRADOR` |
| 3 | P3 | Confirma o corrige clasificación (RFI/RFQ/RFP + producto/servicio) | fija tipo/subtipo |
| 4 | P4 | Llena formulario de plantilla (dinámico) | persiste en `BORRADOR` |
| 5 | P5 | Responde assessment (1–6 preguntas) | persiste con origen `assessment` |
| 6 | P6 | Revisa resumen y envía | `BORRADOR` → `ENVIADA_A_COMPRAS` |
| 7 | P7 | Recibe confirmación + número de referencia | — |

Al enviar (P6): se asigna referencia (única e inmutable), se genera PDF, se determina coordinador (regla configurable ⚠️ Q1), se transiciona a `ENVIADA_A_COMPRAS`, se disparan correos 1 y 2.

### Casos límite (Flujo A / EC-1…EC-7)

| # | Situación | Comportamiento |
|---|---|---|
| EC-1.1 | Correo mal formado | Validación al perder foco; no avanza |
| EC-1.2 | Dominio no institucional ⚠️ (Q4) | Advertencia no bloqueante; marca para revisión |
| EC-1.3 | Borrador sin terminar | Aviso con continuar o empezar nueva |
| EC-2.1 | Fecha en el pasado | Bloqueo del campo |
| EC-2.2 | Fecha < 5 días hábiles | Advertencia no bloqueante |
| EC-2.7 | Clasificación falla o >10 s | P3 sin preselección, sin error visible |
| EC-3.1 | Confianza <0.70 | Tres opciones sin preselección |
| EC-4.1 | Marca activada sin archivo | **Bloqueo duro B2** (cliente y servidor) |
| EC-4.7 | Obligatorios vacíos | **Bloqueo duro B1**; foco al primero |
| EC-5.1 | Assessment falla o >15 s | Salta a P6 sin error visible |
| EC-5.3 | Agente propone campos fuera del catálogo | Se descartan en servidor |
| EC-6.1 | Falla la generación del PDF | La solicitud NO cambia de estado; alerta y reintento |
| EC-6.2 | Falla correo al coordinador | Avanza; marca `notificacion_fallida` |
| EC-6.4 | Doble clic en enviar | Idempotencia; nunca dos números |
| EC-7 | Recarga/vuelve atrás desde P7 | Se mantiene; no reenvía |

## 3.2 SOLICITANTE — consultar estado (`/mis-solicitudes`)

Consulta por correo sin sesión. Muestra solo referencia, título, estado, fechas y coordinador — **nunca precios ni cotizaciones**. Paginación 20.

| # | Situación | Comportamiento |
|---|---|---|
| EC-8.1 | Sin solicitudes | Estado vacío amable + crear nueva |
| EC-8.2 | Correo de otra persona | Ve esas solicitudes (consecuencia asumida del diseño) — sin montos |
| EC-8.5 | Abre comparativo | Usa el token del correo 3 |

## 3.3 SOLICITANTE — recibir comparativa y decidir (`/comparativa/[token]`)

Móvil primero. Orden estricto en L1: referencia → **advertencia de discrepancia (antes que precios)** → recomendación del coordinador (destacada, con nombre) → descargar Excel → tarjeta por proveedor → "Ninguna me sirve".

Cada tarjeta: nombre · etiqueta "sugerido" (si aplica) · advertencia propia · neto · impuestos desglosados · **total** (jerarquía mayor) · moneda · plazo (advertencia si incumple) · condiciones · pros/contras · `[SELECCIONAR ESTA OPCION]`.

Al elegir: confirmación → se registra decisión → transición a `CERRADA_CON_DECISION` → correo 4 → L2.

| # | Situación | Comportamiento |
|---|---|---|
| EC-9.1 | Token inválido/manipulado | Mensaje neutro, sin filtrar info |
| EC-9.2/3 | Token expirado/revocado | Mensaje con contacto del coordinador |
| EC-9.4 | Comparativa ya decidida | Modo lectura, opción marcada, no cambiable |
| EC-9.6 | Ninguna opción le sirve | Notifica al coordinador; vuelve a `EN_COTIZACION` (no cierra) |
| EC-9.8 | Monedas distintas | Cada una en su moneda; sin conversión |
| EC-9.9 | Una sola cotización | "No hay comparación posible"; puede aceptar o no |
| EC-9.10 | Dato faltante | "no especificado"; nunca cero |
| EC-9.12 | Dos personas deciden a la vez | Primera prevalece; segunda ve modo lectura |

## 3.4 COORDINADOR — recibir y gestionar (C1 bandeja, C2 detalle)

- **C1 Bandeja:** contadores, filtros, tabla ordenada por fecha requerida ascendente, indicador de inactividad. Cada coordinador ve lo asignado ⚠️ Q2.
- **C2 Detalle:** info capturada (distingue plantilla vs assessment), adjuntos, PDF, línea de tiempo, acciones por estado.

| # | Situación | Comportamiento |
|---|---|---|
| D-E1/EC-12.2 | Categoría equivocada | Reasignar con selector y motivo; registrado |
| D-E2/EC-12.1 | Mal especificada | Devolver a `BORRADOR` con nota; notifica |
| D-E3/EC-12.3 | Ya no la necesita | Cancelar con motivo → `CANCELADA` |
| D-E5/EC-11.3 | Otro coordinador ⚠️ Q2 | Según configuración: oculta/lectura o denegado |
| D-E6 | Ningún proveedor responde | `CERRADA_SIN_DECISION` con motivo |
| D-E7/EC-12.5 | Error en el PDF | Regenerar; versión nueva conservando la anterior |

## 3.5 COORDINADOR — cargar cotizaciones (C3)

**Es el punto de mayor complejidad técnica.** Carga múltiple PDF/Word/imagen → normalización a Markdown → **extracción estructurada editable por campo**, con confianza destacada; campos ilegibles → captura manual.

| # | Situación | Comportamiento |
|---|---|---|
| EC-13.1 | Imagen borrosa/ilegible | Declara ilegible; captura manual. **Nunca inventa cifras** |
| EC-13.2 | No menciona impuestos | `impuestos_desglosados=false`, observación. **No calcula** |
| EC-13.5 | Especificaciones distintas | Se detecta y muestra **antes que los precios** |
| EC-13.7 | Una sola cotización | Advertencia previa; resultado es resumen |
| EC-13.11 | Extracción >30 s | Error + retry/captura manual para ese archivo |
| EC-13.12 | Cotización duplicada | Advertencia de posible duplicado |

## 3.6 COORDINADOR — revisar comparativa y recomendar (C4)

**Punto de control humano (RN-01).** Discrepancias arriba; observaciones fiscales; pros/contras; sugerencia etiquetada; campo obligatorio de recomendación (B3).

| # | Situación | Comportamiento |
|---|---|---|
| EC-14.1 | Enviar sin recomendación | **Bloqueo B3**; botón deshabilitado con nota |
| EC-14.2 | Solo espacios | Cuenta como vacío; bloqueo se mantiene |
| EC-14.3 | Contradice la sugerencia | Se envía sin fricción — es el comportamiento esperado |
| EC-14.7 | Falla correo 3 | La comparativa NO avanza a `ENVIADA_A_SOLICITANTE` hasta confirmar |
| EC-14.4 | Sin pros/contras | La comparativa se genera igual; recomienda normalmente |

## 3.7 ADMINISTRADOR — medir (A1 dashboard)

Métricas: **tasa de conversión solicitud→aceptación**, tiempo promedio de ciclo, solicitudes activas, sin movimiento; filtros por período/coordinador/categoría; tiempo por etapa; exportación Excel.

| # | Situación | Comportamiento |
|---|---|---|
| EC-15.1 | Sin datos suficientes | Estado vacío explicativo, sin ceros |
| EC-15.3 | Borradores nunca enviados | Excluidos del cálculo de conversión |
| EC-15.4 | Volumen alto | Agregaciones materializadas |

## 3.8 ADMINISTRADOR — plantillas/coordinadores/alertas (A2, A3, A4)

- **A2 Plantillas:** editor de campos, catálogos, vista previa, **versionado** (solicitudes conservan su versión de origen).
- **A3 Coordinadores:** alta/baja, categorías, regla de asignación ⚠️ Q1, respaldo.
- **A4 Alertas:** umbral de días ⚠️ Q3, destinatarios, activación.

| # | Situación | Comportamiento |
|---|---|---|
| EC-16.1/2 | Quita/renombra campo | El histórico conserva dato y etiqueta original |
| EC-16.9 | Restaurar versión | Crea versión nueva; nunca borra historial |
| EC-17.1 | Baja con solicitudes abiertas | Exige reasignar antes de completar |
| EC-18.2 | Umbral sin configurar | Alertas inactivas; no se inventa valor por defecto |

## 3.9 AGENTE DE IA — intervenciones

Servicio con cuatro momentos de intervención y límites estrictos:

| Momento | Función | Qué hace | Qué NO hace |
|---|---|---|---|
| Tras captura | `clasificar_solicitud` | Propone tipo/subtipo + confianza | No fija irreversible; usuario corrige |
| Tras plantilla | `assessment_requerimiento` | Pide hasta 6 datos faltantes | No crea campos, no autocompleta, no estima precios |
| Al cargar | `extraer_cotizacion` + `validar_fiscal` | Extrae datos, detecta desglose fiscal | No inventa cifras, no calcula impuestos ausentes, no convierte |
| Al comparar | `detectar_discrepancias` + `generar_pros_contras` | Señala diferencias, sugiere | No decide; subordinado a recomendación humana |

Ninguna función de IA es bloqueo duro. Ante fallo o exceso de tiempo, el flujo continúa sin error visible (degradar funcionalidad, nunca disponibilidad).

---

# 4. CORREOS DEL SISTEMA

**Nomenclatura vigente** (ver ADR 0004): **4 correos del ciclo** (siempre se envían) + **1 correo de alerta** (configurable, solo si el umbral está definido). Los cinco se registran en `correo_enviado`.

| # | Correo | Disparador | Destinatario |
|---|---|---|---|
| 1 | Nueva solicitud asignada | `ENVIADA_A_COMPRAS` | Coordinador |
| 2 | Acuse de recibo | `ENVIADA_A_COMPRAS` | Solicitante |
| 3 | Comparativo listo | `ENVIADA_A_SOLICITANTE` | Solicitante |
| 4 | Decisión registrada | `CERRADA_CON_DECISION` | Coordinador + admin |
| 5 | Solicitud sin movimiento (alerta) | Umbral de días superado ⚠️ Q3 | Coordinador + admin |

---

# 5. MATRIZ TRANSVERSAL (T-01 … T-18)

Comportamientos que aplican en todo el sistema.

| # | Situación | Comportamiento |
|---|---|---|
| T-01 | Pérdida de conexión | Datos persistidos; se retoma |
| T-02 | Sesión expirada | Reautenticación conservando el trabajo |
| T-03 | Edición concurrente | Aviso; última escritura prevalece con registro |
| T-04 | IA caída prolongada | Flujo operable de forma manual |
| T-05 | Almacenamiento sin responder | Mensaje específico; no avanza si el archivo era obligatorio |
| T-06 | Navegador antiguo | Aviso de compatibilidad; básico preservado |
| T-07 | Dato nunca capturado | "no especificado"; nunca cero |
| T-08 | Error en evento de trazabilidad | Evento compensatorio; tabla de solo escritura |
| T-09 | Cambio de plantilla | Solicitudes en curso conservan su versión |
| T-10 | Uso desde teléfono | Portal y vista pública plenamente funcionales |
| T-11 | Navegación por teclado | Todo el flujo completable; foco visible |
| T-12 | Lector de pantalla | Errores anunciados y asociados al campo |
| T-13 | Zoom 200% | Funcional sin pérdida |
| T-14 | Movimiento reducido | Se respeta |
| T-15 | Doble envío | Idempotencia en servidor |
| T-16 | Enlace profundo sin permisos | Redirige a auth o error de permisos; nunca falla en silencio |
| T-17 | Recarga | Estado recuperado |
| T-18 | Botón atrás | Coherente con el estado real; nunca reenvía |

---

# 6. MARCAS TBD (Q1–Q9) DENTRO DE ESTE DOCUMENTO

Los temas abiertos del cliente afectan puntos concretos de este documento; se completarán cuando lleguen (ver `prd.md`):

| Q | Tema | Afecta en este doc | Responsable / nota |
|---|---|---|---|
| Q1 | Regla de asignación de coordinadores | 3.1 paso 6, 3.8 A3 | TBD |
| Q2 | Visibilidad cruzada de coordinadores | 1, 3.4 C1/C2 | TBD |
| Q3 | Umbral de días para alerta de inactividad | 4 correo 5 | TBD |
| Q4 | Dominios de correo institucionales | 3.1 EC-1.2 | TBD |
| Q5 | Formato del número de referencia | 3.1 paso 6 | TBD |
| Q6 | Si RFI/RFP recorren ciclo completo de comparativa | 3.3, 3.5 | TBD |
| Q7 | Exenciones/retenciones fiscales | 3.5 EC-13.2, comparativa | TBD |
| Q8 | Tamaño máximo de archivo | 3.5 C3, carga | TBD |
| Q9 | Registro de tratamiento (voseo/tuteo/neutro) | toda la interfaz | TBD |
