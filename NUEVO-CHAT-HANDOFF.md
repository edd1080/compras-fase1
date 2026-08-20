# HANDOFF — Sesión completa / Retomar en chat nuevo

**Fecha**: 2026-08-18
**REPO REAL (este es el bueno)**: `/Users/ecalderonl/Intelia/compras-1`
**ADVERTENCIA**: hay una COPIA VACÍA/muerta en `/Volumes/SSD/Intelia/compras-1` (sin commits, sin .git válido). Subagentes que apuntan ahí reportan "no existe código". **Siempre trabajar en la ruta real de /Users/ecalderonl.**

---

## 1. ESTADO ACTUAL (verificado, ya Commiteado)

- **Branch**: `main` — 40+ commits
- **Último commit**: `27a4d21` (S3 alertas) — los commits de la 008 están hechos, PERO hay fixes del QA **SIN COMMITEAR** en el working tree (ver punto 4).
- **NICIO del proyecto**: 2026-08-12 (sprint 0) · **hoy** 2026-08-18
- **Features cerradas (G5/G6)**: 000 sprint0, 001 frontend, 002 api, 003 design, 004 pdf/correos, 005 auth, 006 IA, 007 sprint3-ia
- **Feature ACTIVA**: `008-sprint4-dashboard-alertas` — enum: IA 008 implementada S1-S4, pero **NO está cerrada (falta T015: verificación + e2e + verification.md + commit final)**

---

## 2. QUE SE TRABAJÓ EN LA 008 (implementada y commiteada)

| Slice | Qué se hizo | Commits |
|---|---|---|
| **S1 — Decisión real por link** | repo: `crearLinkPublico`/`obtenerLinkPorToken`/`registrarAccesoLink`/`obtenerComparativaPorId`. Rutas `GET/POST /api/comparativas/[token]/` y `/decision` (valida expiración/revocado/estado ENVIADA_A_SOLICITANTE, registra y cierra). Vista pública `app/comparativa/[token]/page.tsx` real (fallback demo-2026). | `8a6d9dd`, `0043f41` |
| **S2 — Dashboard KPIs reales** | `repo.metricasDashboard(filtros)` con SQL (conversión, tiempo, activos, sin decisión, volumen/tipo). `/api/metricas` acepta filtros. Dashboard `app/admin/page.tsx` con KPIs reales + filtros. | `1f9e7d5`, `92dfaad`, `586c55a`, `8a717d8` |
| **S3 — Motor de alertas** | `lib/domain/alertas.ts` (4 tipos: inactividad, sin desglose, una sola cotización, discrepancia) + 5 tests. `GET/PATCH /api/admin/configuracion`. `POST /api/admin/alertas/ejecutar`. Página `/admin/configuracion` operativa. Botón en dashboard. | `27a4d21` |
| **S4 — Export Excel** | `lib/excel/dashboard.ts` (hojas Métricas + Procesos), ruta `/api/metricas/excel`, botón Exportar. | `92dfaad` |
| **Skill QA `validate`** | Creada en `.agents/skills/validate/SKILL.md` (QA adversario del proyecto) + regla en AGENTS.md + regla global. | `564c313` |

---

## 3. FILES CLAVE PARA RETOMAR CONTEXTO

- `.harness/STATE.md`, `.harness/HANDOFF.md` — lifecycle ADF
- `specs/008-sprint4-dashboard-alertas/{spec,plan,tasks}.md` — la feature activa
- `docs/product/{brief,prd,user-flows}.md` · `docs/decisions/` · `docs/guia-pruebas-local.md`
- `lib/db/repositorio.ts` (contrato) + `lib/db/postgres-repo.ts` (adaptador) — métodos: `registrarDecisionYCerrar`, `metricasDashboard`, links
- `lib/domain/metrics.ts`, `lib/domain/alertas.ts`, `lib/domain/comparativa.ts`
- `app/api/comparativas/[token]/{route,decision/route}.ts` · `app/api/metricas/{route,excel/route}.ts` · `app/api/admin/{configuracion,alertas/ejecutar,campos}/`
- `app/admin/page.tsx` (dashboard), `app/admin/configuracion/page.tsx`, `app/admin/campos/page.tsx`
- `app/comparativa/[token]/page.tsx`, `components/publica/VistaPublica.tsx`
- `lib/ai/*` (orquestador/schemas/prompts) — feature 006
- `components/coordinador/{CargaCotizaciones,Comparativa,DetalleSolicitud,Recomendacion}.tsx` — feature 006/007
- `middleware.ts` — protección por rol (recientemente ampliado a `/api/admin` y `/api/metricas`)
- `migrations/` 001-010 (010 = usuarios auth sincronizados)

---

## 4. ⚠️ CAMBIOS SIN COMMITEAR (los arreglos del QA adversarial — IMPORTANTE)

Los hallazgos críticos que encontró la skill `validate` (QA) YA fueron corregidos en el working tree pero **aún NO committeados**. Committearlos es el PRIMER paso al retomar:

```
D app/api/comparativas/[id]/decision/route.ts        # eliminado: colisionaba con [token]
M app/api/comparativas/[token]/decision/route.ts     # usa registrarDecisionYCerrar (atómico)
M app/api/metricas/excel/route.ts                    # tabla filtra por rango
M app/middleware.ts                                  # protección /api/admin + /api/metricas (403 si no admin)
M lib/api-client.ts                                  # registrarDecision ahora por token
M lib/db/postgres-repo.ts                            # WHERE true (SQL válido sin filtros), AVG→EXTRACT(EPOCH)/86400, +registrarDecisionYCerrar (TX)
M lib/db/repositorio.ts                              # +registrarDecisionYCerrar, FiltrosMetricas
```

**Comando de retome**: 
```bash
cd /Users/ecalderonl/Intelia/compras-1
npm run typecheck && npx eslint app lib middleware.ts --quiet && npx vitest run && npm run build
git add app/api lib middleware.ts && git commit -m "fix(008): hallazgos QA validate — SQL WHERE, AVG, transacción decisión, protección API, rutas token"
```

---

## 5. CONTEXTO DEL "BUCLE/DEGENERACIÓN" (por qué el chat anterior se rompió)

- El modelo sufrió **degeneración de generación de texto**: repetía la intención ("Escribo X", "Ejecuto X") cientos de veces SIN emitir el tool call, quemando tokens.
- **Diagnóstico**: gatillado al intentar escribir archivos largos o con mucho texto antes de las herramientas; los marcadores `Clipping:` del entorno se colaron en el stream y alimentaron la repetición.
- **Protocolo para el nuevo chat**:
  1. **1 decisión → 1 tool call** (cero texto de "voy a hacer X").
  2. Archivos largos → crear con `bash heredoc` o `Write` mínimo; refinar con `edit`.
  3. Tras el tool call → máximo 1 línea de estado. **Nunca** repetir una frase de intención sin emitir la herramienta.
  4. Verificar `typecheck` tras 1-2 pasos.
- Esto aplica SIEMPRE, especialmente al terminar cada bloque. Regla ya grabada en `.agents/skills/validate/SKILL.md` y en AGENTS.md.

---

## 6. LO QUE QUEDA / PRÓXIMOS PASOS (T015 — cierre de la 008)

```text
PASO 1 — commitear los fixes del working tree (punto 4)
PASO 2 — e2e completo: E2E_BASE_URL=http://localhost:3001 npx playwright test --reporter=list --workers=1
         (requiere app en puerto 3001: npm run dev -p 3001; credenciales abajo)
PASO 3 — correr skill validate sobre 008 (delegar a subagente apuntando SOLO a /Users/ecalderonl/Intelia/compras-1)
PASO 4 — e2e nuevos: decisión por token real, dashboard KPIs, alertas, export
PASO 5 — specs/008/verification.md + marcar tasks 15/15 + STATE a G6 cerrado + commit cierre G5/G6
PASO 6 — testing general completo de 3 roles con edge cases (lo pedido por el usuario)
PASO 7 — decidir próxima feature (Sprint 4/5 completo o piloto)
```

---

## 7. CREDENCIALES / ACCESOS (test)

- **App local**: `http://localhost:3001` (server dev: `npm run dev -p 3001`)
- **Coordinador**: login `/login/coordinador` → `coordinador@biafoods.co` / `Coordinador2026!`
- **Admin**: login `/login/admin` → `admin@biafoods.co` / `AdminBIA2026!`
- **DB local**: postgres `postgresql://ecalderonl@localhost:5432/bia` (tablas: solicitud, cotizacion, comparativa, decision, link_publico, evento_trazabilidad, configuracion, campo_catalogo, usuario)
- **Env**: `.env.local` (NO commitear; tiene NEXT_PUBLIC_SUPABASE_*, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, OPENROUTER_API_KEY)
- **IA**: OpenRouter → `google/gemini-2.5-flash-lite` (fallback `openai/gpt-4o-mini`), clave server-only
- **Conversion PDF→MD**: `.venv-md` (python 3.11 + markitdown), ruta `app/api/convertir`

---

## 8. ESTADO DE PRUEBAS (base)

- 78 unit tests verdes (15 files) · 6 skipped (requieren DB)
- e2e existentes: `e2e/{solicitante,coordinador,admin,explorador,comparativa}.spec.ts` — estaban 22/22 antes de S1-S4 de 008
- Explorador QA: 10/10 rutas

**NOTA IMPORTANTE**: la operación de seed/auth real dejó cuentas `@compras.bia.local` en la tabla `usuario` y `@biafoods.co` en Supabase Auth; la migración `010_sincronizar_usuarios_auth.sql` las une. La bandeja del coordinador resuelve por email → el coordinador real de Supabase es `coordinador@biafoods.co`.