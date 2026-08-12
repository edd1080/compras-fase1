-- Migración 004 — solicitud, respuesta_campo, adjunto
-- Fuente: doc 15, §2.6–2.8

CREATE TABLE solicitud (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_referencia text UNIQUE,
  tipo tipo_solicitud,
  subtipo subtipo_solicitud,
  categoria text,
  estado estado_solicitud NOT NULL DEFAULT 'BORRADOR',
  titulo text NOT NULL,
  descripcion text,
  solicitante_email text NOT NULL,
  solicitante_nombre text NOT NULL,
  area_solicitante text,
  coordinador_id uuid REFERENCES usuario (id),
  plantilla_id uuid REFERENCES plantilla (id),
  fecha_requerida date,
  fecha_creacion timestamptz NOT NULL DEFAULT now(),
  fecha_envio timestamptz,
  fecha_cierre timestamptz,
  clasificacion_confianza numeric(3,2),
  clasificacion_corregida boolean NOT NULL DEFAULT false,
  motivo_cancelacion text,
  notificacion_fallida boolean NOT NULL DEFAULT false
);

CREATE INDEX idx_solicitud_referencia ON solicitud (numero_referencia);
CREATE INDEX idx_solicitud_estado ON solicitud (estado);
CREATE INDEX idx_solicitud_coordinador ON solicitud (coordinador_id);
CREATE INDEX idx_solicitud_email ON solicitud (solicitante_email);
CREATE INDEX idx_solicitud_creacion ON solicitud (fecha_creacion);
CREATE INDEX idx_solicitud_categoria ON solicitud (categoria);

CREATE TABLE respuesta_campo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id uuid NOT NULL REFERENCES solicitud (id) ON DELETE CASCADE,
  campo_key text NOT NULL,
  campo_label text NOT NULL,
  valor text,
  valor_numerico numeric,
  origen origen_campo NOT NULL,
  UNIQUE (solicitud_id, campo_key)
);

CREATE TABLE adjunto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id uuid NOT NULL REFERENCES solicitud (id) ON DELETE CASCADE,
  tipo tipo_adjunto NOT NULL,
  campo_key text,
  nombre_archivo text NOT NULL,
  ruta_almacenamiento text NOT NULL,
  mime_type text,
  tamano_bytes bigint,
  subido_por_email text
);
