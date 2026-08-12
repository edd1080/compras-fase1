-- Migración 003 — campo_catalogo, plantilla, plantilla_campo
-- Fuente: doc 15, §2.3–2.5

CREATE TABLE campo_catalogo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campo_key text NOT NULL UNIQUE,
  label text NOT NULL,
  ayuda text,
  tipo_dato tipo_dato_campo NOT NULL,
  catalogo_opciones text,
  obligatorio boolean NOT NULL DEFAULT false,
  origen origen_campo NOT NULL,
  seccion_pdf text,
  orden integer NOT NULL DEFAULT 0,
  validacion jsonb NOT NULL DEFAULT '{}',
  activo boolean NOT NULL DEFAULT true
);

CREATE TABLE plantilla (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  tipo tipo_solicitud NOT NULL,
  subtipo subtipo_solicitud,
  categoria text,
  version integer NOT NULL DEFAULT 1,
  activa boolean NOT NULL DEFAULT true,
  creada_por uuid REFERENCES usuario (id),
  UNIQUE (tipo, subtipo, categoria, version)
);

CREATE TABLE plantilla_campo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plantilla_id uuid NOT NULL REFERENCES plantilla (id) ON DELETE CASCADE,
  campo_id uuid NOT NULL REFERENCES campo_catalogo (id),
  orden integer NOT NULL DEFAULT 0,
  obligatorio_override boolean,
  label_override text,
  UNIQUE (plantilla_id, campo_id)
);
