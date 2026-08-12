-- Migración 005 — evento_trazabilidad (tabla de solo escritura)
-- Fuente: doc 15, §2.14

CREATE TABLE evento_trazabilidad (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id uuid REFERENCES solicitud (id),
  tipo_evento tipo_evento NOT NULL,
  estado_anterior estado_solicitud,
  estado_nuevo estado_solicitud,
  actor_tipo text,
  actor_identificador text,
  nota text,
  metadata jsonb NOT NULL DEFAULT '{}',
  timestamp timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_evento_solicitud ON evento_trazabilidad (solicitud_id);
CREATE INDEX idx_evento_tipo ON evento_trazabilidad (tipo_evento);
CREATE INDEX idx_evento_timestamp ON evento_trazabilidad (timestamp);

COMMENT ON TABLE evento_trazabilidad IS
  'Tabla de solo escritura. Nunca se actualiza ni se borra; un error se corrige con un evento compensatorio (ADR 0005/arquitectura, doc 15).';
