# Active Handoff

**Feature 008-Sprint4-Dashboard-Alertas — CERRADA (G5/G6)**

## Estado
- Feature 008 cerrada con evidencia completa (`specs/008-sprint4-dashboard-alertas/verification.md`).
- Batería final: 80 unit tests ✅ (18 files, 6 skipped requieren DB) · 22 e2e ✅ (workers=1) · typecheck ✅ · lint ✅ · build ✅.
- QA adversarial (skill `validate`) cerró 4 críticos: RN-01 (recomendación persistida), envío atómico (link antes de transicionar), token criptográfico, y fuga de seguridad en API interna (protegida por rol con nuevo `lib/api-guard.ts`).
- Fix latente de zona horaria en `filaSolicitud` (`gmt-0600` al re-parametrizar fechas).
- Decisión humana tomada: se aplicó la opción A (proteger API interna por rol + ajustar e2e para autenticarse).

## Cambios clave de la 008
- Decisión real por link: `crearLinkPublico`/`obtenerLinkPorToken` en repo; ruta GET/POST `/api/comparativas/[token]`; `VistaPublica` fuera de demo.
- Envío de comparativa real: `Recomendacion`/`DetalleSolicitud` ahora persisten la recomendación y exponen el link/token real.
- Dashboard KPIs reales + filtros (S2), motor de alertas + config operativa (S3), export Excel (S4).
- Seguridad: `guardApi` en cotizaciones, comparativa/excel, listar todas; envío anónimo del solicitante sigue público.

## Próximos pasos
- Seleccionar la próxima feature (Sprint 4/5 completo o piloto) vía `.harness/STATE.md`/`session-start`.
- Commits pendientes de cierre: `.harness/STATE.md`, `specs/.../tasks.md`, `specs/.../verification.md` (ver git status; el commit final los agrupa). Excluir `qa/report-explorador.md` (artifact regenerado por e2e).