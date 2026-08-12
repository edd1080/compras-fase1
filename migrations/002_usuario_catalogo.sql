-- Migración 002 — usuario y catalogo_valor
-- Fuente: doc 15, §2.1 y §2.2

-- gen_random_uuid() proviene de pgcrypto (Supabase lo habilita por defecto; aquí se garantiza en postgres genérico/dev)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE usuario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text NOT NULL UNIQUE,
  rol rol_usuario NOT NULL,
  categorias_asignadas text[] NOT NULL DEFAULT '{}',
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_usuario_email ON usuario (email);
CREATE INDEX idx_usuario_rol ON usuario (rol);

CREATE TABLE catalogo_valor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalogo text NOT NULL,
  clave text NOT NULL,
  etiqueta text NOT NULL,
  orden integer NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}',
  UNIQUE (catalogo, clave)
);
