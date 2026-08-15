---
title: Architecture — Portal de Compras BIA
status: review
authority: technical
owner: Intelia (build)
last_reviewed: 2026-08-12
---

# Arquitectura — Portal de Compras BIA

> Fuentes: documento 10 (blueprint técnico preliminar) + 22 (contexto y stack). Estimación de duración actualizada: 7–10 semanas de desarrollo, 9–12 con piloto.

## Principio estructural: autocontenido

El sistema **no lee ni escribe** en los sistemas de gestión del cliente (ERP/Dynamics) ni depende de acceso del área de tecnología. Todos los datos los genera el propio flujo. Esto elimina la dependencia más larga del proyecto.

## Vista de arquitectura de alto nivel

```
CAPA DE PRESENTACIÓN (Web)
 · Portal del solicitante (sin login, cookie de continuidad)
 · Panel del coordinador (con login)
 · Dashboard administrativo (Lady)
 · Vista pública de comparativa (link con token)
        │
        ▼
CAPA DE APLICACIÓN
 · Motor de clasificación RFI/RFQ/RFP
 · Orquestador del agente (assessment)
 · Generador de PDF membretado
 · Parser de cotizaciones (→ Markdown)
 · Generador de comparativa (Excel)
 · Servicio de correo transaccional
 · Máquina de estados + trazabilidad
        │
        ▼
CAPA DE INTELIGENCIA — OpenRouter (Gemini 2.5 Flash Lite)
 · clasificar_solicitud · assessment_requerimiento
 · extraer_cotizacion · validar_fiscal
 · detectar_discrepancias · generar_pros_contras
        │
        ▼
CAPA DE DATOS — PostgreSQL + Object Storage
 · Entidades del modelo · Archivos (adjuntos, PDFs, cotizaciones)
```

## Stack tecnológico

| Capa | Herramienta | Justificación |
|---|---|---|
| Frontend + backend | Next.js (App Router), TypeScript estricto, Tailwind | Un solo proyecto para portal, panel, API y dashboard |
| Hosting | Vercel | Despliegue continuo, manejo de dominios |
| Base de datos | PostgreSQL (hoy local vía `pg`; migrable a **Supabase Cloud**) | Relacional, auth para coordinadores, storage, RLS |
| Almacenamiento | PostgreSQL / proveedor de objetos (Supabase Storage en cloud) | Adjuntos, PDFs, cotizaciones |
| Motor de IA | OpenRouter → Gemini 2.5 Flash Lite (default), GPT-4o-mini (fallback) | 6 funciones; visión nativa, 1M contexto, $0.10/M prompt. Fallback graceful sin bloqueo |
| **Generación de PDF** | **pdfme** (@pdfme/generator, plantilla declarativa JSON) | **PDF genérico templatable**: la plantilla vive en config/datos para reemplazarla (membrete BIA) sin recodificar |
| Generación de Excel | SheetJS (xlsx) | Comparativo editable/descargable |
| Parseo de cotizaciones | Extracción nativa (PDF/DOCX) + visión (imágenes) → Markdown | |
| **Correo transaccional** | **Resend** (servicio dedicado, dominio propio) | Correos 1–5 del ciclo; evita depender del Outlook corporativo / IT |

## Pipeline de la solicitud

1. **Captura** — campos base + tipo de necesidad (P2)
2. **Clasificación** — determinación RFI/RFQ/RFP y producto/servicio (P3)
3. **Selección de plantilla** — por tipo + subtipo + categoría (P4)
4. **Assessment del agente** — investigación acotada + lista de preguntas faltantes (P5)
5. **Validación de obligatorios** — bloqueo B1/B2 (P4)
6. **Generación** — `numero_referencia`, PDF membretado (P6)
7. **Ruteo y notificación** — coordinador según regla configurable, correos 1 y 2 → `ENVIADA_A_COMPRAS` (P6)

## Pipeline de cotizaciones

1. Carga N archivos referenciados al `numero_referencia`
2. Detección de formato → extracción (nativa PDF/DOCX, visión imágenes) → Markdown
3. Extracción estructurada por IA (proveedor, neto, moneda, impuestos, plazo, especificaciones)
4. Validación fiscal (detección de desglose)
5. Detección de discrepancias (caso melamina vs madera)
6. Generación de Excel + pros/contras + sugerencia
7. Espera del campo obligatorio de recomendación del coordinador (B3) antes de habilitar envío

## RAG — decisión

**El MVP no requiere RAG con embeddings.** El contexto necesario en cada paso es acotado y cabe en una llamada a la API. Introducir pgvector se pospone hasta la memoria histórica de patrones (fuera del MVP). Lo que sí se hace desde ya: guardar toda la información en esquema limpio para que activar embeddings sea un backfill, no una migración (ver diccionario de datos, documento 15, Parte 7).

## Dominio, zona y moneda

- Español de Honduras en interfaz y documentos generados; un solo registro de tratamiento (a definir).
- Zona horaria: America/Tegucigalpa.
- Monedas: HNL y USD, sin conversión automática.
- Dominio: tema abierto (subdominio corporativo vs. dominio propio).

## Seguridad

- RLS en `solicitud`, `cotizacion`, `comparativa`, `adjunto`.
- Archivos por URL firmada con expiración corta; nunca rutas públicas permanentes.
- Token de link público ≥32 bytes aleatorios; sin indexación por buscadores.
- La vista de consulta por correo filtra estrictamente por email y nunca expone precios/cotizaciones.
- Aceptación por escrito del riesgo del link público antes de producción (riesgo asumido).

## Decisiones de arquitectura pendientes / a confirmar

| Tema | Responsable | Nota |
|---|---|---|
| Dominio de la aplicación | BIA / Tecnología | prioridad #1 de Lady; subdominio vs. dominio propio |
| Remitente de correos | Intelia | cuenta propia (recomendado) vs. integración Outlook corporativo |
| RLS (visibilidad cruzada coordinadores) | Lady | define alcance de seguridad a nivel de fila |
