-- Migración 008 — cotizacion, comparativa, link_publico, decision
-- Fuente: doc 15, §2.10 – §2.13

CREATE TABLE cotizacion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id uuid NOT NULL REFERENCES solicitud (id),
  proveedor_nombre text NOT NULL,
  proveedor_identificacion_fiscal text,
  proveedor_contacto text,
  archivo_original_ruta text,
  formato_original formato_cotizacion NOT NULL,
  markdown_extraido text,
  valor_neto numeric(14,2),
  moneda text,
  impuestos_desglosados boolean,
  monto_isv numeric(14,2),
  monto_otros_impuestos numeric(14,2),
  valor_total numeric(14,2),
  plazo_entrega text,
  forma_pago text,
  vigencia_oferta text,
  garantia text,
  especificaciones_ofertadas jsonb NOT NULL DEFAULT '{}',
  observaciones_fiscales text,
  confianza_extraccion jsonb NOT NULL DEFAULT '{}',
  editada_manualmente boolean NOT NULL DEFAULT false,
  fecha_cotizacion date,
  fecha_carga timestamptz NOT NULL DEFAULT now(),
  cargada_por uuid REFERENCES usuario (id)
);

CREATE TABLE comparativa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id uuid NOT NULL UNIQUE REFERENCES solicitud (id),
  ruta_excel text,
  pros_contras jsonb NOT NULL DEFAULT '{}',
  discrepancias_detectadas jsonb NOT NULL DEFAULT '[]',
  sugerencia_ia text,
  cotizacion_sugerida_id uuid REFERENCES cotizacion (id),
  recomendacion_comprador text,
  fecha_recomendacion timestamptz,
  fecha_generacion timestamptz NOT NULL DEFAULT now(),
  fecha_envio_solicitante timestamptz
);

CREATE TABLE link_publico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comparativa_id uuid NOT NULL REFERENCES comparativa (id),
  token text NOT NULL UNIQUE,
  fecha_expiracion timestamptz,
  veces_accedido integer NOT NULL DEFAULT 0,
  ultimo_acceso timestamptz,
  revocado boolean NOT NULL DEFAULT false
);

CREATE TABLE decision (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comparativa_id uuid NOT NULL UNIQUE REFERENCES comparativa (id),
  cotizacion_seleccionada_id uuid REFERENCES cotizacion (id),
  decidido_por_email text NOT NULL,
  fecha_decision timestamptz NOT NULL DEFAULT now(),
  ninguna_opcion boolean NOT NULL DEFAULT false,
  comentario text
);

CREATE INDEX idx_cotizacion_solicitud ON cotizacion (solicitud_id);
CREATE INDEX idx_link_token ON link_publico (token);
CREATE INDEX idx_comparativa_solicitud ON comparativa (solicitud_id);