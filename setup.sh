#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

corepack enable

install_yarn_project() {
  local project_dir="$1"
  local label="$2"

  echo "Installing dependencies for $label..."
  cd "$project_dir"
  yarn install
}

install_yarn_project "$ROOT_DIR" "root orchestration"
install_yarn_project "$ROOT_DIR/services/db" "database tooling"
install_yarn_project "$ROOT_DIR/services/api" "API"
install_yarn_project "$ROOT_DIR/apps/web" "web"
install_yarn_project "$ROOT_DIR/apps/mobile" "mobile"

cd "$ROOT_DIR"

echo "Repository dependencies and scripts are ready."
echo "Next steps:"
echo "  1. Add the root .env file"
echo "  2. Run yarn dev:api from the repo root, or cd services/db && yarn infra:start for DB-only control"
