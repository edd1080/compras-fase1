---
status: accepted
authority: technical
---

# Nomenclatura de correos: 4 del ciclo + 1 de alerta configurable

El sistema tiene **cuatro correos del ciclo** (1–4), disparados por transición de estado y que siempre se envían, **más un correo de alerta** (5, solicitud sin movimiento) disparado por un umbral de tiempo configurable — que solo se envía si el umbral está definido. Los cinco se registran en la bitácora `correo_enviado`. Esta nomenclatura distingue ciclo de alerta y corrige la ambigüedad previa ("4 tipos de correo" en doc 12; "correos del ciclo" con 5 filas en doc 20).
