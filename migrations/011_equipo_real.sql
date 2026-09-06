-- Migración 011 — Equipo real de Compras BIA + dominios institucionales
-- Fuente: respuesta de Compras (lista del equipo) + decisiones del piloto (D1, D2, D8).
-- Se actualizan los asientos ficticios (Coordinador 1-4, Lady Matute) a las personas reales,
-- manteniendo las cuentas QA (000...0A1 Coordinador BIA / 0A2 Admin BIA, @biafoods.co)
-- para pruebas automatizadas de desarrollo.

UPDATE usuario SET
  nombre = 'Bryan Bonilla',
  email = 'bbonilla@biabrands.co',
  categorias_asignadas = '{servicios_logisticos,administrativa}'
WHERE id = '00000000-0000-4000-8000-000000000001';

UPDATE usuario SET
  nombre = 'Carlos Melara',
  email = 'cmelara@biabrands.co',
  categorias_asignadas = '{mercadeo_publicidad,tecnologia}'
WHERE id = '00000000-0000-4000-8000-000000000002';

UPDATE usuario SET
  nombre = 'Lester Ramirez',
  email = 'lramirez@biabrands.co',
  categorias_asignadas = '{administrativa,mercadeo_publicidad}'
WHERE id = '00000000-0000-4000-8000-000000000003';

UPDATE usuario SET
  nombre = 'Maria Jose Torres',
  email = 'mjtorres@biabrands.co',
  categorias_asignadas = '{capex_indirectos,tecnologia}'
WHERE id = '00000000-0000-4000-8000-000000000004';

UPDATE usuario SET
  nombre = 'Ladi Isabel Matute',
  email = 'lmatute@biabrands.co'
WHERE id = '00000000-0000-4000-8000-000000000005';

-- D8: dominios institucionales aceptados para solicitantes autenticados y validación de correo.
UPDATE configuracion SET valor = '["biabrands.co"]'
WHERE clave = 'dominios_institucionales';