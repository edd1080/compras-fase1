-- Migración 006 — configuracion (valores iniciales) y datos semilla
-- Fuente: doc 15, §2.16 y §6

CREATE TABLE configuracion (
  clave text PRIMARY KEY,
  valor jsonb NOT NULL,
  descripcion text,
  actualizado_por uuid REFERENCES usuario (id)
);

-- Claves iniciales de configuración (algunas pendientes de definición con el cliente, Q1–Q9)
INSERT INTO configuracion (clave, valor, descripcion) VALUES
  ('tasa_isv', '0.15', 'Tasa del Impuesto Sobre Ventas de Honduras'),
  ('expiracion_link_dias', '90', 'Vigencia del link público de comparativa'),
  ('formato_numero_referencia', '"{{TIPO}}-{{ANIO}}-{{SECUENCIA}}"', 'Patrón de generación del número de referencia (Q5, pendiente de definir)'),
  ('umbral_dias_sin_movimiento', 'null', 'Días antes de alertar por inactividad (Q3, sin definir)'),
  ('regla_asignacion', '"por_categoria"', 'Regla de asignación de coordinadores (Q1)'),
  ('coordinadores_ven_todo', 'false', 'Si los coordinadores ven solicitudes ajenas (Q2)'),
  ('dominios_institucionales', '[]', 'Dominios de correo institucionales aceptados (Q4, sin definir)'),
  ('tamano_max_archivo_mb', 'null', 'Límite de tamaño por archivo (Q8, sin definir)');

-- Datos semilla: catálogos de valores (doc 14 §1.7)
INSERT INTO catalogo_valor (catalogo, clave, etiqueta, orden) VALUES
  ('area', 'mercadeo', 'Mercadeo', 1),
  ('area', 'ventas', 'Ventas', 2),
  ('area', 'manufactura', 'Manufactura', 3),
  ('area', 'logistica', 'Logística', 4),
  ('area', 'finanzas', 'Finanzas', 5),
  ('area', 'gente', 'Gente y Gestión', 6),
  ('area', 'tecnologia', 'Tecnología', 7),
  ('area', 'compras', 'Compras', 8),
  ('area', 'otra', 'Otra', 99),

  ('categoria', 'materia_prima', 'Materia prima y empaque', 1),
  ('categoria', 'servicios_logisticos', 'Servicios logísticos', 2),
  ('categoria', 'administrativa', 'Compras administrativas', 3),
  ('categoria', 'mercadeo_publicidad', 'Mercadeo y publicidad', 4),
  ('categoria', 'capex_indirectos', 'CAPEX e indirectos de manufactura', 5),
  ('categoria', 'tecnologia', 'Tecnología', 6),
  ('categoria', 'otra', 'Otra', 99),

  ('unidad_medida', 'unidades', 'Unidades', 1),
  ('unidad_medida', 'kilogramos', 'Kilogramos', 2),
  ('unidad_medida', 'libras', 'Libras', 3),
  ('unidad_medida', 'litros', 'Litros', 4),
  ('unidad_medida', 'metros', 'Metros', 5),
  ('unidad_medida', 'metros_cuadrados', 'Metros cuadrados', 6),
  ('unidad_medida', 'cajas', 'Cajas', 7),
  ('unidad_medida', 'rollos', 'Rollos', 8),
  ('unidad_medida', 'servicio', 'Servicio', 9),
  ('unidad_medida', 'otra', 'Otra', 99),

  ('tecnica_aplicacion', 'bordado', 'Bordado', 1),
  ('tecnica_aplicacion', 'serigrafia', 'Serigrafía', 2),
  ('tecnica_aplicacion', 'sublimacion', 'Sublimación', 3),
  ('tecnica_aplicacion', 'impresion_digital', 'Impresión digital', 4),
  ('tecnica_aplicacion', 'grabado_laser', 'Grabado láser', 5),
  ('tecnica_aplicacion', 'vinil', 'Vinil', 6),
  ('tecnica_aplicacion', 'por_definir', 'Por definir', 99),

  ('modalidad', 'presencial', 'Presencial', 1),
  ('modalidad', 'remoto', 'Remoto', 2),
  ('modalidad', 'mixto', 'Mixto', 3);

-- Datos semilla: 4 coordinadores (UUID fijos para que el fixture de sesión temporal
-- en lib/session.js coincida; el auth real reemplazará esto en Sprint 3).
-- u1..u5 = 00000000-0000-4000-8000-000000000001 .. 00000000-0000-4000-8000-000000000005
INSERT INTO usuario (id, nombre, email, rol, categorias_asignadas, activo) VALUES
  ('00000000-0000-4000-8000-000000000001', 'Coordinador 1', 'coordinador1@compras.bia.local', 'coordinador', '{materia_prima,servicios_logisticos}', true),
  ('00000000-0000-4000-8000-000000000002', 'Coordinador 2', 'coordinador2@compras.bia.local', 'coordinador', '{administrativa,mercadeo_publicidad}', true),
  ('00000000-0000-4000-8000-000000000003', 'Coordinador 3', 'coordinador3@compras.bia.local', 'coordinador', '{capex_indirectos,tecnologia}', true),
  ('00000000-0000-4000-8000-000000000004', 'Coordinador 4', 'coordinador4@compras.bia.local', 'coordinador', '{tecnologia}', true),
  ('00000000-0000-4000-8000-000000000005', 'Lady Matute', 'lady.matute@compras.bia.local', 'admin', '{}', true);
