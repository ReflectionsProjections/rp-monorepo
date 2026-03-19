#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

bash -n "$ROOT_DIR/setup.sh"
bash -n "$ROOT_DIR/scripts/rp"

if command -v docker >/dev/null 2>&1 && [ -f "$ROOT_DIR/.env" ]; then
  docker compose -f "$ROOT_DIR/docker-compose.yml" config >/dev/null
elif command -v docker >/dev/null 2>&1; then
  echo "root .env not found; skipping docker compose config"
else
  echo "docker not found; skipping docker compose config"
fi
