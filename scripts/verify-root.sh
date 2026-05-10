#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

bash -n "$ROOT_DIR/setup.sh"
node --check "$ROOT_DIR/scripts/orchestrate.mjs" >/dev/null
node --check "$ROOT_DIR/services/db/db-tools.mjs" >/dev/null

if command -v docker >/dev/null 2>&1 && [ -f "$ROOT_DIR/.env" ]; then
  docker compose --env-file "$ROOT_DIR/.env" -f "$ROOT_DIR/services/db/docker-compose.yml" config >/dev/null
elif command -v docker >/dev/null 2>&1; then
  echo "root .env not found; skipping database compose config"
else
  echo "docker not found; skipping docker compose config"
fi
