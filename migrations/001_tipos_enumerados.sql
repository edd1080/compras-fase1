-- Migración 001 — Tipos enumerados
-- Fuente: documentación (doc 15, Parte 1)

CREATE TYPE tipo_solicitud AS ENUM ('RFI', 'RFQ', 'RFP');
CREATE TYPE subtipo_solicitud AS ENUM ('producto', 'servicio', 'mixto');

CREATE TYPE estado_solicitud AS ENUM (
  'BORRADOR',
  'ENVIADA_A_COMPRAS',
  'EN_COTIZACION',
  'COMPARATIVA_LISTA',
  'ENVIADA_A_SOLICITANTE',
  'CERRADA_CON_DECISION',
  'CERRADA_SIN_DECISION',
  'CANCELADA'
);

CREATE TYPE tipo_dato_campo AS ENUM (
  'texto', 'texto_largo', 'numero', 'fecha', 'seleccion',
  'seleccion_multiple', 'booleano', 'archivo', 'moneda'
);

CREATE TYPE origen_campo AS ENUM ('plantilla', 'assessment');
CREATE TYPE tipo_adjunto AS ENUM ('logo', 'imagen_referencia', 'anexo', 'otro');
CREATE TYPE formato_cotizacion AS ENUM ('pdf', 'docx', 'imagen', 'manual');
CREATE TYPE rol_usuario AS ENUM ('coordinador', 'admin');
CREATE TYPE tipo_evento AS ENUM (
  'creacion', 'cambio_estado', 'carga_cotizacion', 'generacion_documento',
  'generacion_comparativa', 'envio_correo', 'acceso_link', 'decision',
  'reasignacion', 'cancelacion', 'error'
);
