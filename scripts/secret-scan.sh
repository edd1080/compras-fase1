#!/usr/bin/env bash
# Escaneo de secretos en el repositorio (evita credenciales committeadas).
# Uso: scripts/secret-scan.sh
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Patrones a detectar (valores, no placeholders)
PATTERNS=(
  'sk_live_'
  'sk-[A-Za-z0-9]{20,}'
  'AIza[0-9A-Za-z_-]{20,}'
  'xox[baprs]-[A-Za-z0-9-]+'
  'ghp_[A-Za-z0-9]{30,}'
  'postgres://[^:]+:[^@]+@'
  'eyJhbGciOiJIUzI1NiIs'  # jwt
  'AKIA[0-9A-Z]{16}'       # AWS access key
)

# Archivos a escanear (excluye entornos, lock y paquetes)
EXCLUDE_PATTERNS='\.git/|node_modules/|\.next/|package-lock\.json|\.env$|\.lock'

hits=0
for pat in "${PATTERNS[@]}"; do
  while IFS= read -r file; do
    echo "POSIBLE SECRETO en $file: $pat"
    hits=$((hits+1))
  done < <(grep -rInE --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.next \
    --exclude=package-lock.json --exclude='.env' --exclude='secret-scan.sh' "$pat" . 2>/dev/null || true)
done

if [ "$hits" -gt 0 ]; then
  echo "secret-scan: SE ENCONTRARON $hits coincidencia(s) potenciales."
  exit 1
fi

echo "secret-scan: OK, sin secretos en el repositorio."
