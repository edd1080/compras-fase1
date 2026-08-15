# Guía de pruebas local — Portal de Compras BIA

Fecha: 2026-08-15 — valida la feature 006 (integración IA) y los 3 roles.

## Pre-requisitos de una sola vez

```bash
# 1. Dependencias
npm install

# 2. Base de datos local (PostgreSQL en localhost:5432, db "bia")
cp .env.example .env.local   # llenar DATABASE_URL, Supabase, RESEND, OPENROUTER
npm run db:migrate           # o: bash scripts/db-migrate.sh

# 3. Python para conversión de documentos (PDF → Markdown)
uv venv .venv-md --python 3.11
uv pip install --python .venv-md/bin/python "markitdown[pdf]"

# 4. Usuarios en Supabase Auth (coordinador + admin)
node scripts/seed-auth.mjs
```

## Levantar el app en local

```bash
npm run dev   # http://localhost:3000
```

> Si otro proceso ocupa el puerto, usá `npx next dev -p 3001`.
> La IA requiere `OPENROUTER_API_KEY` en `.env.local` (server-only, nunca expuesta al navegador).

## Pruebas automáticas (rápidas)

```bash
npm run typecheck && npm run lint && npm run test   # unit: 65 tests
npm run build
npx playwright install chromium                     # la primera vez
npx playwright test                                  # e2e completo (los 3 roles)
```

> Para apuntar los e2e a un server en otro puerto: `E2E_BASE_URL=http://localhost:3001 npx playwright test`

## Prueba manual — Rol SOLICITANTE

1. Abrí `http://localhost:3000`
2. **P1**: correo `maria.reyes@bia.hn`, nombre, área → Continuar
3. **P2**: título "5000 camisetas estampadas con el logo", categoría "Mercadeo y publicidad", fecha → Continuar
4. **P3 Clasificación IA** (verificar):
   - Badge muestra "Sugerencia IA" con **% de confianza** real (no "Confianza Alta" fijo)
   - Texto: "Esto parece una RFQ" + "Razón: ..."
   - Si el texto es ambigüo → aparece "No pudimos determinar" y podés elegir manualmente
5. **P4 Details IA**: confirmada la clasificación, aparecen "preguntas del asistente"
   (dimensiones, materiales, cantidad...) relevantes al rubro, con opción "No lo sé"
6. P5 → Enviar → P6 Confirmación

**Qué validar de IA**: el badge de confianza, el razonamiento y las preguntas dinámicas.

## Prueba de rol COORDINADOR

1. Entrar `http://localhost:3000/login/coordinador`
   `coordinador@biafoods.co` / `Coordinador2026!`
2. Panel → abrir una solicitud en "Esperando cotizaciones"
3. **07 · Carga cotizaciones (IA)**: atribuir archivo real (PDF/DOCX o imagen):
   - Se ve "Convirtiendo a texto…" → "Extrayendo datos con IA…" → "Cargado"
   - Verificá el estado "cotización cargada" y los datos extraídos en la DB
4. 2 cotizaciones → "Generar comparativa"
5. **08 · Comparativa (IA)**: verificar que la sugerencia dice "Generada por el sistema: ..." (razonada, NO solo el precio más barato) y que hay pros/contras por proveedor + discrepancias si difieren
6. **09 · Recomendación**: escribir criterio (B3) → Enviar compareativa al solicitante

## Prueba — rol ADMIN

1. Entrar `http://localhost:3000/login/admin`
   `admin@biafoods.co` / `AdminBIA2026!`
2. Dashboard con métricas, tablas, trazabilidad del proceso
3. Páginas: procesos, coordinadores, configuración, ajustes

## Qué hace cada función IA (dónde verla)

| Función | Dónde la ves | Si falla → qué pasa |
|---|---|---|
| `clasificar_solicitud` | P3 del solicitante | Sin preselección (elige manual) |
| `assessment_requerimiento` | P4 del solicitante | Solo campos base del catálogo |
| `extraer_cotizacion` | 07 · Carga cotizaciones | Persiste metadata, captura manual |
| `generar_comparativa` | 08 · Comparativa | Determinístico (menor precio) |

**Principio**: ninguna función de IA bloquea el flujo (doc 16, disponibilidad).

## Verificación de datos

```bash
psql "postgresql://TU_USUARIO@localhost:5432/bia" -c "SELECT proveedor_nombre, valor_neto, valor_total, confianza_extraccion FROM cotizacion"
psql ... -c "SELECT sugerencia_ia FROM comparativa ORDER BY fecha_generacion DESC LIMIT 3"
```