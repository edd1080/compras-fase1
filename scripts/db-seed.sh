#!/usr/bin/env bash
# Ejecuta solo el seed de la migración 006 (catálogos, configuración, coordinadores).
set -euo pipefail

SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL no está definida." >&2
  exit 1
fi

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q \
  -f "$SCRIPTS_DIR/../migrations/006_configuracion_seed.sql"

echo "Seed aplicado."
