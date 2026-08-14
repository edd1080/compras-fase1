-- Migración 007 — documento_generado y correo_enviado
-- Fuente: doc 15, §2.9 y §2.15

CREATE TABLE IF NOT EXISTS documento_generado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id uuid NOT NULL REFERENCES solicitud (id),
  tipo tipo_solicitud NOT NULL,
  ruta_pdf text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  plantilla_version integer NOT NULL DEFAULT 1,
  fecha_generacion timestamptz NOT NULL DEFAULT now(),
  UNIQUE (solicitud_id, version)
);

CREATE TABLE IF NOT EXISTS correo_enviado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id uuid REFERENCES solicitud (id),
  tipo_correo text NOT NULL,
  destinatario text NOT NULL,
  asunto text,
  estado_envio text NOT NULL DEFAULT 'enviado',
  intentos integer NOT NULL DEFAULT 1,
  error_detalle text,
  fecha_envio timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_documento_solicitud ON documento_generado (solicitud_id);
CREATE INDEX idx_correo_solicitud ON correo_enviado (solicitud_id);