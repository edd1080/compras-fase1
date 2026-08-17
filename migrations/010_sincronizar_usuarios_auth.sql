-- Migración 010 — Sincroniza usuarios locales con las cuentas de Supabase Auth
-- Fuente: scripts/seed-auth.mjs. El auth real se autentica con @biafoods.co;
-- la bandeja del coordinador resuelve el id local por email (app/panel/layout.tsx).
-- Sin estos registros, localId queda indefinido y el panel muestra spinner infinito.

INSERT INTO usuario (id, nombre, email, rol, categorias_asignadas, activo) VALUES
  ('00000000-0000-4000-8000-0000000000A1', 'Coordinador BIA', 'coordinador@biafoods.co', 'coordinador',
   '{materia_prima,servicios_logisticos,administrativa,mercadeo_publicidad,capex_indirectos,tecnologia}', true),
  ('00000000-0000-4000-8000-0000000000A2', 'Admin BIA', 'admin@biafoods.co', 'admin', '{}', true)
ON CONFLICT (email) DO NOTHING;