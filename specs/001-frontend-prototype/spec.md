# Feature Specification: 001-Frontend-Prototype

**Feature Branch**: `001-frontend-prototype`

**Created**: 2026-08-12

**Status**: Approved (G2 — 2026-08-12)

**Input**: Portar el prototipo HTML (`documentacion inicial/prototipo-compras-bia.html`, 1065 líneas, vanilla JS) a React, reutilizando el sistema de diseño del Sprint 0, implementando las rutas reales de `docs/product/user-flows.md` y elevando la interfaz a nivel enterprise (elegante, formal, seria, accesible AA, responsiva móvil primero) con la funcionalidad oficial — **sin mock data**.

**Fuentes autoritativas**: `docs/product/prd.md` (RF-01…RF-58), `docs/product/user-flows.md` (§2 rutas, §3 flujos por rol), `docs/references/architecture.md` (stack), sistema de diseño Sprint 0 (`styles/globals.css`, `components/`), prototipo HTML (referencia visual), documentación 14/17/20/24.

## User Scenarios & Testing

> **Modelo de aplicación**: una sola app Next.js con **portales internos por rol** (publico-solicitante, coordinador, admin). El router del prototipo (pantalla de demo para elegir flujo) **no se porta a producción**. En su lugar, cada rol entra a su portal según sesión/rol y solo se renderiza lo permitido (rutas protegidas). "Solicitante sin login" usa cookie de continuidad (30 días).
>
> **Orden de construcción**: primero el **cerebro** (capa de dominio TypeScript pura: máquina de estados, reglas, catálogo, comparativa, métricas — test-first), luego cada rol se porta consumiendo ese cerebro. Backend de infraestructura (Supabase auth real, API routes, IA) = Sprint 2+, pero **la lógica del negocio se define ahora y es la misma que expondrán las API**.
>
> Las historias se organizan por **rol** (igual que el prototipo) como subflujos implementables de forma independiente, sobre el cerebro común. Sin mock data: fixtures tipados que reflejan el modelo real.

### User Story 0 — Cerebro: capa de dominio y motor de flujos (Prioridad P0)

Funciones TypeScript puras, sin dependencias de Next/Supabase, test-first: máquina de estados de solicitud, reglas de negocio y bloqueos duros (B1/B2/B3), catálogo de campos, motor de comparativa (fiscal, discrepancias, pros/contras/sugerencia) y métricas del dashboard. Es la capa que la UI consume y que las API expondrán después.

**Why this priority**: sin esta capa, la UI no tendría lógica real al portar; definirla ahora evita rehacer cuando llegue el backend.
**Independent Test**: los módulos del dominio tienen unit tests que prueban transiciones válidas/inválidas, bloqueos, reglas y cálculos, sin red.
**Acceptance Scenarios**:
1. Dado `estado = BORRADOR`, **Cuando** se ejecuta la transición a `ENVIADA_A_COMPRAS`, **Entonces** es válida; a `CANCELADA` directo es inválida.
2. Dado un borrador con `lleva_branding = true` sin `archivo_logo`, **Cuando** se valida el paso P4, **Entonces** la regla B2 retorna bloqueado.
3. Dado 3 cotizaciones (una sin desglose ISV), **Cuando** el motor valida fiscal, **Entonces** genera la observación y las discrepancias antes de precios.
4. Dado un set de solicitudes, **Cuando** se calculan métricas, **Entonces** conversión = cerradas-con-decisión ÷ enviadas.

### User Story 1 — Sistema de diseño y shell (Prioridad P1)

Migrar los tokens y componentes del prototipo al sistema de diseño React del Sprint 0 y el shell compartido (topbar, layouts por rol). Cualquier pantalla del producto hereda de aquí.

**Why this priority**: es la base visual de todo; sin tokens/componentes/shell ningún flujo puede renderizarse con identidad.
**Independent Test**: los componentes (`Button`, `Field`, `Segmented`, `Chip`, `Switch`, `Stepper`, `Modal`, `Toast`, `Badge`, `DataTable`, `MetricCard`, `BarChart`, `Card`, `Alert`, `Avatar`, `Timeline`, `EmptyState`) renderizan y su snapshot/unit tests pasan.
**Acceptance Scenarios**:
1. Dado el `@theme` actualizado, **Cuando** se consultan los tokens, **Entonces** contienen la paleta fusión (azul institucional + brass/clay/sage) y las var CSS del prototipo.
2. Dado el shell, **Cuando** se navega a una ruta de rol, **Entonces** la topbar muestra eyebrow/título/sub correctos y el layout responde.

### User Story 2 — Flujo del solicitante (Prioridad P1)

Wizard real de creación de solicitud (P1→P7 en `user-flows.md`): identificación por correo, captura, clasificación, assessment, documento y confirmación. **Sin mock data**: validaciones y bloqueos duros B1/B2 reales.

**Why this priority**: es el flujo primario del producto y el que el prototipo más detalla (6 pasos).
**Independent Test**: un colaborador puede completar la solicitud de principio a fin con validación (email válido, fecha no pasada), clasificación corregible, assessment, y bloqueo B2 si branding sin logo.
**Acceptance Scenarios**:
1. Dado P1, **Cuando** se ingresa un correo inválido, **Entonces** el botón Continuar está deshabilitado con mensaje de error.
2. Dado P2, **Cuando** la fecha es pasada, **Entonces** se bloquea el campo.
3. Dado P4 con branding activo sin logo, **Cuando** se intenta continuar, **Entonces** se aplica el bloqueo duro B2 (botón deshabilitado + mensaje).
4. Dado P6, **Cuando** todas las validaciones pasan, **Entonces** se genera el documento con número de referencia y se guía a la confirmación.

### User Story 3 — Panel del coordinador (Prioridad P1)

Bandeja de solicitudes asignadas y detalle con etapas (carga de cotizaciones, comparativa, recomendación). Bloqueo duro B3 real.

**Why this priority**: flujo de gestión del equipo de Compras; el prototipo lo cubre con stage-tabs y slots.
**Independent Test**: un coordinador ve su bandeja, abre un detalle, carga cotizaciones y genera comparativa; el botón Enviar queda deshabilitado hasta escribir la recomendación (B3).
**Acceptance Scenarios**:
1. Dado el panel, **Cuando** la bandeja carga sin datos, **Entonces** se muestra un estado vacío claro (EmptyState).
2. Dado el detalle en etapa de cotizaciones, **Cuando** hay menos de 2 cotizaciones, **Entonces** el botón Generar comparativa está deshabilitado.
3. Dado el detalle en la etapa de recomendación, **Cuando** la recomendación está vacía, **Entonces** el botón Enviar está deshabilitado (B3).
4. Dado el detalle con recomendación escrita, **Cuando** se envía, **Entonces** se confirma el envío y la solicitud pasa a espera de decisión.

### User Story 4 — Vista pública de decisión (Prioridad P2)

Página pública (`/comparativa/[token]`): comparativa con estándar del prototipo (recomendación destacada, tarjetas por proveedor, discrepancia antes que precios), decisión con confirmación y estado de "ninguna me sirve".

**Why this priority**: cierre del ciclo del solicitante; depende de comparativa del coordinador.
**Independent Test**: un solicitante ve la comparativa por enlace público y selecciona una opción con confirmación.
**Acceptance Scenarios**:
1. Dado un token válido, **Cuando** se abre la vista pública, **Entonces** se muestra la recomendación del coordinador arriba y las tarjetas por proveedor.
2. Dado un proveedor seleccionado, **Cuando** se confirma, **Entonces** se registra la decisión y se muestra confirmación.
3. Dada la opción "ninguna me sirve", **Cuando** se elige, **Entonces** se notifica a Compras sin cerrar con decisión.

### User Story 5 — Dashboard de trazabilidad (Prioridad P2)

Dashboard administrativo real: métricas de conversión, tiempo de ciclo, solicitudes activas; filtros; distribución por tipo/coordinador; tabla de procesos exportable; estados vacíos reales.

**Why this priority**: la "cereza del pastel" de Lady; se construye sobre datos reales.
**Independent Test**: Lady ve métricas calculadas desde datos (no mock) y estados vacíos cuando no hay datos.
**Acceptance Scenarios**:
1. Dado el dashboard sin datos, **Cuando** se carga, **Entonces** se muestran estados vacíos explicativos sin ceros engañosos (EmptyState).
2. Dado el dashboard con datos, **Cuando** se filtra por período/coordinador, **Entonces** las métricas y la tabla se actualizan.
3. Dada la vista filtrada, **Cuando** se exporta, **Entonces** se descarga el Excel (si se implementa exportación).

### Edge Cases

- **Sesión del solicitante**: cookie de continuidad (30 días); correo sin solicitudes; retomar borrador.
- **Bloqueos duros**: B1/B2/B3 deshabilitan la acción y explican qué falta.
- **IA caída**: si el assessment falla o >15 s, el flujo continúa sin error visible (P6 directo).
- **Fallo de PDF**: la solicitud NO cambia de estado; mensaje específico + reintento.
- **Error de datos**: nunca mostrar cero cuando el dato no existe → "no especificado".
- **Responsive**: portal del solicitante y vista pública móvil primero; panel y dashboard escritorio primero.
- **Accesibilidad**: contraste AA, teclado completo, foco visible, etiquetas asociadas, color nunca única señal; `prefers-reduced-motion` ya cubierto por el sistema.
- **Preferencia de movimiento reducido**: respetada (tokens/animation).

## Requirements

### Functional Requirements

- **FR-000**: Capa de dominio pura (`lib/domain/*`): tipos del diccionario, máquina de estados de `solicitud` (transiciones válidas del diccionario 15), reglas de negocio RN-01…08 y bloqueos B1/B2/B3 como funciones puras, catálogo de campos, motor de comparativa (validación fiscal, discrepancias, pros/contras/sugerencia) y métricas — **test-first** y **sin dependencias de Next/Supabase**, para ser reutilizable por UI y por futuras API routes.
- **FR-001**: Sistema de diseño React que reúna los tokens del prototipo + DOC 21 (colores, tipografías Space Grotesk/DM Sans/DM Mono, espaciado, radios, sombras) y los componentes base enterprise.
- **FR-002**: Shell compartido con topbar contextual (eyebrow/título/sub), navegación por rol y states de logout/login (mock de sesión por fixture).
- **FR-003**: Ruta `/` (P1 identificación) pública, sin login, con validación de correo y advertencia de dominio no institucional.
- **FR-004**: Wizard del solicitante de 7 pasos reales (P1–P7) con barra de progreso stepper, guardado de estado (React state → API cuando exista), retomable.
- **FR-005**: Clasificación RFI/RFQ/RFP con chips corregibles y razonamiento breve (sin preselección si confianza baja).
- **FR-006**: Assessment con spinner de "revisando" y formulario de hasta 6 preguntas; fallo → continúa sin error visible.
- **FR-007**: Bloqueos duros B1 (obligatorio), B2 (branding sin logo) verificados en cliente y servidor.
- **FR-008**: Bandeja del coordinador con solicitudes asignadas (filtros de estado/tipo), badges y estados.
- **FR-009**: Detalle de solicitud del coordinador con 3 etapas (cotizaciones, comparativa, recomendación) y stage-tabs.
- **FR-010**: Carga de hasta N cotizaciones (PDF/Word/imagen) con estados por archivo (subiendo/procesando/listo/ilegible); extracción editable por campo con confianza.
- **FR-011**: Comparativa en pantalla con la estructura del prototipo (neto arriba, impuestos abajo, observación fiscal, discretamente la discrepancia antes que precios).
- **FR-012**: Recomendación del coordinador: campo obligatorio, bloqueo B3.
- **FR-013**: Vista pública `/comparativa/[token]`: recomendación destacada, tarjetas por proveedor, decisión con confirmación y "ninguna me sirve".
- **FR-014**: Dashboard `/admin` con métricas (conversión, ciclo, activas), filtros por período/coordinador, barras por coordinador/tipo y tabla de procesos.
- **FR-015**: Estados vacíos reales en bandeja, dashboard y consultas (sin ceros ni gráficos vacíos).
- **FR-016**: Accesibilidad AA (teclado, foco, contraste, etiquetas, ARIA), responsive móvil primero en público y escritorio primero en panel/admin.
- **FR-017**: Persistencia de estado del wizard en cookie de continuidad (30 días) para retomar borrador.

### Key Entities

- **Solicitud**: estado, tipo/subtipo, campos, coordinador, fecha, referencia, trazabilidad.
- **Cotización**: proveedor, montos, moneda, tratamiento fiscal, especificaciones, confianza/edición.
- **Comparativa**: hoja/estructura del prototipo, sugerencia IA, recomendación humana.
- **Decisión**: proveedor elegido, timestamp, ninguna_opcion.
- **Métricas** (dashboard): conversión, ciclo, volumen por coordinador/tipo — calculadas desde datos.

## Success Criteria

### Measurable Outcomes

- **SC-000**: La capa de dominio (`lib/domain/*`) tiene unit tests verdes (máquina de estados, B1/B2/B3, comparativa, métricas) y es importable sin entorno Next.
- **SC-001**: Todas las historias (US0–US5) se implementan consumiendo `lib/domain` y sin mock data: usan fixtures tipados del proyecto que reflejan el modelo real.
- **SC-002**: `npm run typecheck`, `npm run lint` y `npm run test` pasan sobre el frontend portado.
- **SC-003**: Las rutas de `user-flows.md` responden organizadas en los 3 portales por rol (público, panel, admin) y navegan correctamente.
- **SC-004**: Los 3 bloqueos duros (B1/B2/B3) se implementan llamando a las funciones de `lib/domain` (misma lógica en cliente y servidor).
- **SC-005**: La interfaz cumple contraste AA, es operable por teclado y respeta `prefers-reduced-motion`.
- **SC-006**: La paleta y componentes del prototipo se conservan visualmente (referencia screenshot del prototipo comparada con el port React).
- **SC-007**: El estado de sesión/wizard es persistente (cookie 30 días) y retomable.

## Assumptions

- El port reutiliza el sistema de diseño del Sprint 0 (tokens + componentes base existentes) y lo expande; no se crea otro diseño paralelo.
- Se usan fixtures del proyecto (basados en el modelo real) hasta que las API next del backend existan; los fixtures NO son el mock del prototipo (están tipados y siguen las entidades del diccionario).
- La IA (assessment, extracción, sugerencia) se integra en Sprint 2+; en el port se simula el contrato (JSON con la forma de la API) para que la UI quede lista.
- La autenticación real de coordinador/admin se integra en Sprint 2+; en el port se usa una sesión simulada por fixtura.
- No se implementa aún la generación real de PDF/Excel (Sprint 2+); el port muestra el contrato visual y placeholder.
- El nombre de producto es **Portal de Compras BIA** (no "Portal de Solicitudes de Compra").