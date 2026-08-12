#!/usr/bin/env bash
# Reinicia la base en limpio (solo para desarrollo/Sprint 0): recrea el esquema y aplica 001..n.
set -euo pipefail

SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL no está definida." >&2
  exit 1
fi

if [ -n "${PRODUCTION:-}" ] && [ "${PRODUCTION:-}" = "1" ]; then
  echo "ERROR: db:reset está prohibido en producción." >&2
  exit 1
fi

echo ">> Drop y recreación del esquema (Sprint 0: sin datos reales)"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q \
  -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;" \
  -c "DROP TYPE IF EXISTS tipo_solicitud CASCADE;" 2>/dev/null || true

echo ">> Aplicando migraciones"
bash "$SCRIPTS_DIR/db-migrate.sh"

echo "db:reset completo."
