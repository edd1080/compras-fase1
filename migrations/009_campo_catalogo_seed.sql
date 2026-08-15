-- Migración 009 — Seed de campos del catálogo (campo_catalogo)
-- Fuente: doc 14 (catálogo de campos) + assessment IA. Campos assessment que el agente
-- pregunta dinámicamente según el rubro; plantilla son los base de la solicitud.

INSERT INTO campo_catalogo (campo_key, label, ayuda, tipo_dato, catalogo_opciones, obligatorio, origen, seccion_pdf, orden, validacion, activo) VALUES
  -- Plantilla (siempre en el formulario)
  ('titulo', 'Título de la solicitud', 'Nombre corto y descriptivo', 'texto', NULL, true, 'plantilla', 'Identificación', 10, '{}', true),
  ('descripcion', 'Descripción', 'Detalle de lo que se necesita', 'texto_largo', NULL, true, 'plantilla', 'Identificación', 20, '{}', true),
  ('fecha_requerida', 'Fecha requerida', 'Para cuándo se necesita', 'fecha', NULL, false, 'plantilla', 'Identificación', 30, '{}', true),

  -- Producto — dimensiones, materiales, cantidad
  ('dimensiones', 'Dimensiones', 'Alto, ancho, largo o tallas', 'texto', NULL, false, 'assessment', 'Especificaciones', 110, '{}', true),
  ('materiales', 'Materiales', 'Material o composición sugerida', 'texto', NULL, false, 'assessment', 'Especificaciones', 120, '{}', true),
  ('cantidad', 'Cantidad', 'Unidades estimadas', 'numero', NULL, false, 'assessment', 'Especificaciones', 130, '{}', true),
  ('color_acabado', 'Color y acabado', 'Color espectral, acabado mate/brillo', 'texto', NULL, false, 'assessment', 'Especificaciones', 140, '{}', true),
  ('calidad', 'Calidad', 'Nivel de calidad esperado', 'seleccion', 'Estándar,Premium', false, 'assessment', 'Especificaciones', 150, '{}', true),
  ('marca_branding', '¿Lleva marca o branding?', 'Material POP, uniformes, empaques', 'booleano', NULL, false, 'assessment', 'Especificaciones', 160, '{"bloqueante": false}', true),
  ('archivo_logo', 'Archivo del logo', 'PNG, JPG, PDF, SVG, AI, EPS', 'archivo', NULL, false, 'assessment', 'Especificaciones', 170, '{"dependeDe": "marca_branding", "valorRequerido": false, "bloqueante": true}', true),

  -- Servicio — alcance, lugar, periodicidad
  ('alcance_servicio', 'Alcance del servicio', 'Qué incluye y qué excluye', 'texto_largo', NULL, false, 'assessment', 'Servicio', 210, '{}', true),
  ('lugar_prestacion', 'Lugar de prestación', 'Dónde se ejecuta', 'texto', NULL, false, 'assessment', 'Servicio', 220, '{}', true),
  ('periodicidad', 'Periodicidad', 'Único, mensual, trimestral…', 'seleccion', 'Único,Mensual,Bimestral,Trimestral,Semestral,Anual', false, 'assessment', 'Servicio', 230, '{}', true),
  ('duracion_contrato', 'Duración del contrato', 'Meses o plazo estimado', 'texto', NULL, false, 'assessment', 'Servicio', 240, '{}', true)
ON CONFLICT (campo_key) DO NOTHING;