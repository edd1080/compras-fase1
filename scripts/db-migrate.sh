#!/usr/bin/env bash
# Aplica las migraciones SQL en orden (001 → n) sobre la base apuntada por DATABASE_URL.
set -euo pipefail

MIGRATIONS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../migrations" && pwd)"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL no está definida. Ver .env.example" >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "ERROR: no se encontró 'psql'. Instalá el cliente de PostgreSQL." >&2
  exit 1
fi

# Crear la tabla de control si no existe
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q \
  -c "CREATE TABLE IF NOT EXISTS _migraciones (nombre text PRIMARY KEY, aplicado_en timestamptz NOT NULL DEFAULT now());"

for f in "$MIGRATIONS_DIR"/*.sql; do
  nombre="$(basename "$f")"
  ya_aplicada="$(psql "$DATABASE_URL" -At -c "SELECT 1 FROM _migraciones WHERE nombre='$nombre';")"
  if [ "$ya_aplicada" = "1" ]; then
    echo "SKIP (ya aplicada): $nombre"
    continue
  fi
  echo "Aplicando: $nombre"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -f "$f"
  psql "$DATABASE_URL" -q -c "INSERT INTO _migraciones (nombre) VALUES ('$nombre');"
done

echo "Migraciones aplicadas."
