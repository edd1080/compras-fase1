# Propuesta de decisiones — Piloto Portal de Compras BIA

**Versión:** 1.0 — 2026-09-05
**Autor:** Intelia (OpenCode)
**Estado:** En revisión — se requiere confirmación por escrito de Compras para aplicar.
**Dirigido a:** Ladi Isabel Matute, Jefe de Compras BIA Foods Honduras.

Este documento consolida los temas que quedaron abiertos tras revisar la documentación y plantillas
compartidas, junto con la respuesta del equipo de Compras. Cada tema incluye la propuesta y el impacto.
Aprobación de este documento habilita el arranque del piloto.

---

## Contexto (lo acordado)

- El objetivo del Portal es **canalizar las requisiciones de gasto y CAPEX** a través de una aplicación
  web con trazabilidad completa. El 70% del gasto (materia prima/costo) **queda fuera** del piloto y
  continúa en los sistemas actuales.
- Tres roles: **solicitante** (sin contraseña, llena el formulario), **coordinador de compras**
  (gestiona cotizaciones y comparativas), **administrador** (configura, asigna, revisa métricas).
- Los usuarios de Compras pueden hacer todo lo que hace un solicitante; el solicitante no puede hacer
  la gestión de Compras. (Confirmado por Compras.)

## Decisiones propuestas

| # | Tema | Propuesta | Impacto | Requiere confirmación |
|---|---|---|---|---|
| D1 | Equipo y roles | Cargar el equipo real: Ladi Matute (admin), Bryan Bonilla, Carlos Melara, Lester Ramirez, Maria Jose Torres (coordinadores), con sus correos oficiales `@biabrands.co`. | Las solicitudes se asignan a compradores reales desde el día 1. | Sí |
| D2 | Asignación por categoría | Cada coordinador recibe las categorías de gasto y CAPEX según su cartera; el administrador ve todo. La asignación propuesta se detalla en el anexo y está pendiente de validar con la plantilla de categorías por comprador que Compras iba a compartir. | Las compras llegan al comprador correcto automáticamente. | Sí (validar cartera) |
| D3 | Alcance de tipos de compra | El piloto opera con **RFQ** (solicitud de cotización) y **RFP** (solicitud de propuesta). **RFI** (solicitud de información) queda disponible pero sin plantilla dedicada hasta que Compras defina si lo usa. (Compras indicó no haber desarrollado documentos RFI/RFP; los formatos de obra/capex compartidos se clasifican como RFP.) | El clasificador automático sugiere RFQ/RFP; el coordinador confirma. | Sí (RFI sí/no) |
| D4 | Formato de número de referencia | Ya implementado: `{TIPO}-{AÑO}-{SECUENCIA}` (ej. `SOL-2026-0001`). Sin cambio. | Trazabilidad formal de cada solicitud. | No |
| D5 | Plantillas de solicitud | Se modelarán formularios y documentos derivados de los formatos oficiales compartidos (RFQ de servicio, RFQ de obra, RFP). El membrete/estructura de los PDF se ajusta al estilo de los documentos de Compresas. | Los pedidos llegan completos y con la estructura que Compras ya maneja. | No (implementación) |
| D6 | Coordinadores: ¿ven todo? | Cada coordinador ve solo las solicitudes de sus categorías. (Confirmado en configuración; alineado con la regla de Compras.) | Separación de trabajo por comprador. | No |
| D7 | Umbral de alerta de inactividad | **5 días hábiles** sin movimiento se envía alerta automática. | Ninguna solicitud queda olvidada. | Sí (aprobación del número) |
| D8 | Dominios institucionales aceptados | Se permite el dominio **`@biabrands.co`** para solicitudes institucionales autenticadas. | Consistencia con el correo corporativo del equipo. | No |
| D9 | Tratamiento fiscal | Mantener tasa ISV 15% y validación de tratamiento fiscal en cotizaciones; exenciones/retenciones específicas se dejan para una fase posterior (no hay reglas documentadas). | Detección de cotizaciones con tratamiento fiscal irregular. | Sí (reglas adicionales si las hay) |
| D10 | Tamaño máximo de archivo | **10 MB** por adjunto. | Evita adjuntos que degraden la carga. | Sí |
| D11 | Tratamiento en la interfaz | **"Usted"** (neutro/formal). | Consistencia de comunicación. | No |

## Fuera de alcance del piloto (reconfirmado)

- Materia prima y abastecimiento productivo (sigue en los sistemas actuales).
- Integración con ERP/SAP, órdenes de compra, pagos, presupuesto de finanzas.
- Reportería KPI desde sistemas actuales (se mantiene la reportería propia del portal).

## Anexo A — Equipo y cartera propuesta (D1/D2, a validar con plantilla de categorías por comprador)

| Nombre | Rol | Correo | Categorías propuestas |
|---|---|---|---|
| Ladi Isabel Matute | Administrador | lmatute@biabrands.co | Todas (visibilidad total) |
| Bryan Bonilla | Coordinador | bbonilla@biabrands.co | Servicios logísticos, Compras administrativas |
| Carlos Melara | Coordinador | cmelara@biabrands.co | Mercadeo y publicidad, Tecnología |
| Lester Ramirez | Coordinador | lramirez@biabrands.co | Compras administrativas, Mercadeo y publicidad |
| Maria Jose Torres | Coordinador | mjtorres@biabrands.co | CAPEX e indirectos de manufactura, Tecnología |

> Nota: En el RFQ de cafetería compartido aparece el correo `lberrios@biabrands.co` junto al nombre de
> Lester; se asumió que corresponde a `lramirez@biabrands.co` (tal como está en la lista del equipo).
> Confirmar para no crear una cuenta incorrecta.

## Notas para aprobación

- Los cambios marcados "Sí" en la columna final requieren su confirmación por escrito (bastará responder a
  este documento). Los marcados "No" son decisiones internas de implementación que no requieren acción.
- Al aprobar, Intelia: (1) crea las cuentas del equipo real, (2) modela las plantillas RFQ/RFP con los
  formatos compartidos, (3) configura el umbral de alerta y el tamaño máximo, (4) deja la plataforma lista
  para el piloto en Vercel (dominio provisional).