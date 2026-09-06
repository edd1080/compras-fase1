-- Migración 012 — Plantillas RFQ/RFP derivadas de documentos oficiales de Compras
-- Fuente: formatos compartidos (RFQ cafetería, RFQ obra/fachadas, RFP dosificación/capex).
-- Se agregan campos comerciales al catálogo y se modelan plantillas por tipo para el wizard.
-- Nota: la tabla plantilla aún no se consume en el wizard; la integración se completa en H4.2.
-- RFI queda sin plantilla hasta que Compras confirme su uso (D3).

INSERT INTO campo_catalogo (campo_key, label, ayuda, tipo_dato, catalogo_opciones, obligatorio, origen, seccion_pdf, orden, validacion, activo) VALUES
  ('modalidad_entrega', 'Modalidad de entrega', 'Llave en mano, por fases, mixto…', 'texto', NULL, false, 'assessment', 'Comercial', 310, '{}', true),
  ('precio_maximo', 'Precio máximo o tope', 'Tope presupuestario, si aplica', 'moneda', NULL, false, 'assessment', 'Comercial', 320, '{}', true),
  ('credito_dias', 'Días de crédito requeridos', 'Plazo de crédito comercial, si aplica', 'numero', NULL, false, 'assessment', 'Comercial', 330, '{}', true),
  ('cobertura_geografica', 'Cobertura geográfica', 'Ciudades o regiones de cobertura', 'texto', NULL, false, 'assessment', 'Comercial', 340, '{}', true),
  ('opciones_a_cotizar', 'Opciones o paquetes a cotizar', 'Ej. Opción A/B/C/D con distintos alcances', 'texto_largo', NULL, false, 'assessment', 'Comercial', 350, '{}', true),
  ('plazo_entrega', 'Plazo de entrega esperado', 'Días, semanas o meses', 'texto', NULL, false, 'assessment', 'Comercial', 360, '{}', true),
  ('forma_pago', 'Forma de pago esperada', 'Ej. 0% anticipo, 65/35 contra avance', 'texto', NULL, false, 'assessment', 'Comercial', 370, '{}', true),
  ('garantias', 'Garantías requeridas', 'Garantía técnica, vicios ocultos, buen uso de anticipo', 'texto', NULL, false, 'assessment', 'Comercial', 380, '{}', true),
  ('documentacion_solicitada', 'Documentación al proveedor', 'Legal, portafolio, certificados, cotizaciones referenciales', 'texto_largo', NULL, false, 'assessment', 'Comercial', 390, '{}', true),
  ('visita_sitio', '¿Requiere visita a sitio o planta?', 'Inspección obligatoria del proveedor', 'booleano', NULL, false, 'assessment', 'Comercial', 400, '{}', true)
ON CONFLICT (campo_key) DO NOTHING;

-- Plantillas de formulario por tipo.
INSERT INTO plantilla (nombre, tipo, subtipo, categoria, version, activa) VALUES
  ('Cotización de servicio (RFQ)', 'RFQ', 'servicio', NULL, 1, true),
  ('Cotización de obra (RFQ)', 'RFQ', 'mixto', NULL, 1, true),
  ('Propuesta técnica-económica (RFP)', 'RFP', 'mixto', NULL, 1, true)
ON CONFLICT (tipo, subtipo, categoria, version) DO NOTHING;

-- Vínculo plantilla ↔ campos (solo los que existen en el catálogo).
INSERT INTO plantilla_campo (plantilla_id, campo_id, orden)
SELECT p.id, c.id, c.orden
FROM plantilla p
JOIN (
  SELECT 'RFQ'::tipo_solicitud AS tipo, 'servicio'::subtipo_solicitud AS subtipo,
         ARRAY['alcance_servicio','lugar_prestacion','periodicidad','duracion_contrato','precio_maximo','credito_dias','cobertura_geografica','forma_pago','documentacion_solicitada'] AS claves
  UNION ALL SELECT 'RFQ'::tipo_solicitud, 'mixto'::subtipo_solicitud,
         ARRAY['modalidad_entrega','alcance_servicio','lugar_prestacion','plazo_entrega','forma_pago','garantias','visita_sitio','documentacion_solicitada','precio_maximo']
  UNION ALL SELECT 'RFP'::tipo_solicitud, 'mixto'::subtipo_solicitud,
         ARRAY['modalidad_entrega','alcance_servicio','opciones_a_cotizar','plazo_entrega','forma_pago','garantias','visita_sitio','documentacion_solicitada']
) t ON t.tipo = p.tipo AND t.subtipo = p.subtipo
JOIN campo_catalogo c ON c.campo_key = ANY(t.claves)
WHERE NOT EXISTS (
  SELECT 1 FROM plantilla_campo pc WHERE pc.plantilla_id = p.id AND pc.campo_id = c.id
);