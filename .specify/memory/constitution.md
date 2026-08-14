# Portal de Compras BIA — Constitution

> Proyecto: Portal de Compras BIA (COM-1 v2.0, Fase 1) · Cliente BIA Honduras · Proveedor Intelia.

## Core Principles

### I. La decisión final es humana
La recomendación del comparativo la escribe una persona, nunca el sistema. La IA sugiere; la palabra final es del coordinador y del solicitante. Es un bloqueo duro verificado en cliente y servidor.

### II. El agente nunca se sale del estándar de Compras
El agente solo puede pedir campos que existan en el catálogo vigente. No crea campos, no autocompleta valores de negocio, no amplía el estándar. Validación dura en servidor.

### III. Nunca se inventan cifras (NON-NEGOTIABLE)
Un dato ausente es `NULL` o "no especificado", jamás cero. No se calculan impuestos ausentes. No se convierten monedas automáticamente. Un dato inventado decide una compra real.

### IV. La IA nunca bloquea
Los únicos tres bloqueos duros (campo obligatorio, arte de marca, recomendación del coordinador) no dependen de la IA. Si una función del agente falla o excede su tiempo, el flujo continúa sin error visible. Degradar funcionalidad, nunca disponibilidad.

### V. Autocontenido — cero sistemas externos
El sistema no lee ni escribe en el ERP del cliente ni depende de acceso del área de tecnología del cliente. Todos los datos los genera el propio flujo.

## Configuración, no código (sostenibilidad)

Campos, plantillas, catálogos, reglas de asignación, umbrales de alerta y formato del número de referencia viven en la base de datos. Cambiarlos no requiere despliegue. El catálogo de campos es la única fuente de verdad de formularios y documentos.

## Seguridad y privacidad

- La información de cotizaciones es comercialmente sensible: no se usa para entrenar modelos y no sale del entorno del proyecto.
- Solicitudes con marca sin arte oficial adjunto NO avanzan (bloqueo duro, caso real de gorras con logotipo incorrecto).
- Toda transición de estado escribe un evento de trazabilidad en la misma transacción; la tabla es de solo escritura.

## Reglas de negocio no negociables (RN-01 … RN-08)

Ver `docs/product/prd.md`, sección Business rules: RN-01 decisión humana, RN-02 agente dentro del catálogo, RN-03 arte de marca, RN-04 clasificación corregible, RN-05 sin sesión/link público, RN-06 sin inventar cifras ni convertir monedas, RN-07 autocontenido, RN-08 producto y servicio con igual calidad de plantilla.

## Governance

- La constitución y el PRD prevalecen ante cualquier otra fuente; ante contradicción se reporta y se espera instrucción, no se resuelve por cuenta propia.
- Todo se implementa configurable; los temas abiertos del cliente (Q1–Q9) se implementan con un valor inicial razonable y nunca fijo en código.
- Los códigos RFI/RFQ/RFP no aparecen en la interfaz del solicitante.
- Un solo registro de tratamiento (voseo/tuteo/neutro) en toda la interfaz; los documentos a proveedores usan registro formal neutro.

## Versionado git — cuándo recomendar un commit

El agente **debe recomendar** un commit cuando se cumpla alguna de estas condiciones, y explicar el porqué junto con `git status`/`git diff`. Nunca committear sin autorización explícita de la persona, pero sí ofrecerlo proactivamente.

**Cuándo recomendar commit (frecuencia recomendada):**

- **Al completar una tarea o historia** del contrato: un commit por unidad de trabajo terminada y verificada (typecheck/lint/test en verde) es el ritmo ideal.
- **Después de cada cambio de configuración del entorno** (package.json, tsconfig, CI/CD, scripts): para dejar el entorno reproducible y fácil de revertir.
- **Tras cada migración nueva** o cambio de esquema de base de datos: las migraciones son cambios de bajo nivel pero de alto impacto; versionarlas aisladas facilita el rollback.
- **Antes de cerrar un sprint o una fase** (p. ej., al terminar Sprint 0 / G5): como punto de control, con un mensaje que resuma el entregable.
- **Cada vez que se corrige un bug** que altera el comportamiento: commit acotado a la corrección (+ su test si aplica).

**Qué NO justifica un commit aislado:**

- Cambios triviales en curso a mitad de una tarea (mejor concentrarlos al terminar la tarea).
- Archivos de configuración local que están en `.gitignore` (`.env`, `node_modules`, `.next`).
- Ningún secreto ni dato real: el commit se revisa para excluir credenciales antes de recomendarlo.

**Regla de oro:** prefiero commit **pequeños y frecuentes con mensajes claros y atómicos** sobre commits grandes y tardíos. Un commit atómico es aquel donde la prueba (`typecheck`/`lint`/`test`) pasa y el cambio tiene un único propósito que el mensaje describe con exactitud. Cuando la persona aprueba un commit, el mensaje sigue la convención del repo (prefijo de tipo corto, en el idioma de los mensajes existentes).

## Verificación y aprobación antes de commit (obligatorio)

**Antes de proponer o realizar cualquier commit de una feature completada, el agente DEBE:**
1. **Probar manualmente el flujo principal** (el usuario lo hará en paralelo; el agente lo verifica) y ejecutar **pruebas automatizadas de interfaz con Playwright** (`e2e/`) que recorran los flujos oficiales y sus edge cases: wizard del solicitante, bandeja/detalle del coordinador (incluidos bloqueos B1/B2/B3), vista pública de decisión, y dashboard de admin.
2. Confirmar que la **batería de verificación** pasa: `typecheck`, `lint`, `test` (unit/integration), `build`, `adf doctor`, `secret-scan`.
3. **Buscar la aprobación explícita de la persona antes de commitear**, presentando: resumen de la feature, evidencia de las pruebas (Playwright + unit), y el `git diff`/`git status`.

**Nunca commitear** sin esa aprobación explícita posterior a la verificación. Si el usuario hizo pruebas manuales y encontró fallos, se corrigen y se vuelve a verificar antes de proponer el commit.

**Nota:** las pruebas e2e con Playwright no sustituyen a las pruebas unitarias/integración; son una capa adicional de confirmación del funcionamiento oficial y de los edge cases de cada solución desarrollada.

**Version**: 0.3 · **Estado**: borrador de intake, pendiente de ratificación por el dueño del proceso (Lady Matute).
