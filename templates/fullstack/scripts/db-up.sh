#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

compose_cmd() {
  if docker compose version >/dev/null 2>&1; then
    echo "docker compose"
  elif podman compose version >/dev/null 2>&1; then
    echo "podman compose"
  else
    echo "ERROR: install Docker Compose or Podman Compose" >&2
    exit 1
  fi
}

cd "$ROOT"
$(compose_cmd) up -d postgres

if [ -f "$ROOT/scripts/db-wait.sh" ]; then
  bash "$ROOT/scripts/db-wait.sh"
fi

echo "Postgres is up (DATABASE_URL in apps/backend/.env.example)."
