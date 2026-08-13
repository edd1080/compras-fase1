---
title: Design System — BIA Compras Enterprise
status: review
authority: reference
owner: Intelia (design)
last_reviewed: 2026-08-13
---

# BIA Compras — Enterprise Design System

> **Fuente única de verdad:** los archivos en `docs/identidad/referencias/` (DESIGN.md + designsystem.html + flujo-admin.html + flujo-coordinadores.html + solicitud-de-compra.html). Este documento consolida los tokens y reglas que el frontend React debe replicar al 100%.

## Principios
Plataforma enterprise de compras: clean, high-density, **glassmorphism** con paleta restringida (slate + naranja + sky) y motion ambiental sutil (blobs). Equilibra densidad de datos con estética moderna.

## Tokens

### Colores
| Token | Valor | Uso |
|---|---|---|
| **Primary (solicitante)** | Naranja `#FD6703` | CTAs y estados activos del flujo de requisición |
| **Accent (coord/admin)** | Sky `#0EA5E9` | Distinguished coordinator/admin workspace |
| **Slate 50** | `#F8F9FA` | Superficie/fondo |
| **Slate 100** | `#F1F5F9` | Surfaces suaves |
| **Slate 200** | `#E2E8F0` | Bordes |
| **Slate 900** | `#0F172A` | Tipografía primaria / botones primarios |
| **Success** | Emerald `#10B981` | Éxitos |
| **Warning** | Amber `#F59E0B` | "waiting"/draft |
| **Error** | Rose `#EF4444` | Alertas urgentes |
| **Glass** | `rgba(255,255,255,0.7)` | Fondos translúcidos con blur |

### Tipografía
- **Inter** — interfaz (weights 400/500/600).
- **JetBrains Mono** — referencias (`RFQ-2026-014`) y timestamps (precisión).
- Jerarquía: headlines con tracking-tight font-medium; labels uppercase tracking-wider.

### Radii
`8px` (sm) · `12px` (md) · `16px` (lg) · `24px` (xl) · `2.5rem` (contenedores principales) · `9999px` (pills/botones).

### Sombras
Soft, low-diffusion: `0 8px 40px rgb(0,0,0,0.06)`. Elevación por `backdrop-blur-3xl` + `bg-white/70`.

## Layout
- **Solicitante:** sidebar izquierda (`280–320px`) con **progress tracker vertical** + input area (formulario multi-paso). Contenedores `max-w-[1024px]` públicos, `1180px` coord/admin.
- **Coordinator/Admin:** login screen → **sidebar de navegación persistente** + tabla/estadísticas.
- **Densidad alta:** font 11–13px, grid 12–20px.

## Componentes clave (patrones)
- **Botones:** pill `rounded-full`; primario `bg-slate-900` (o sky/naranja por rol); con ícono.
- **Input:** `bg-slate-50 border-slate-200 rounded-xl` con ícono a la izquierda; focus ring (naranja solicitante / sky admin).
- **Card:** `bg-white/70 rounded-2xl/3xl border-white shadow-sm backdrop-blur-3xl`.
- **Stat cards:** valor grande + label + trend.
- **Data table:** header `bg-slate-50`, row-hover, badges de estado.
- **AI Suggestion box:** borde gradiente con ícono "magic stick"; etiqueta "Sugerencia del asistente (IA)".
- **File upload zone:** borde dashed → solid green al adjuntar.
- **Progress tracker:** nodos verticales con estados activo/completado/upcoming.
- **Badges estado:** Nueva (sky) · Activa (slate) · Esperando cotizaciones (amber) · Esperando decisión (indigo) · Cerrada (green).
- **Toast:** flotante inferior para "borrador guardado".

## Motion
- **Blobs fluidos** (`animate-fluid-blob`: morph+rspin 12s/24s).
- **Transiciones de paso:** `fade-in-up` 0.4s.
- Hover: shifts de color y scale.

## Do's / Don'ts
- Usar JetBrains Mono para todos los IDs/referencias.
- Alto contraste texto primario (slate-900) vs metadata (slate-500).
- **No** esquinas afiladas: mínimo 8px.
- Requester view: lineal y focalizada, sin métricas admin.
