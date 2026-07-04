#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MAX_ATTEMPTS="${DB_WAIT_ATTEMPTS:-30}"

compose_cmd() {
  if docker compose version >/dev/null 2>&1; then
    echo "docker compose"
  elif docker-compose version >/dev/null 2>&1; then
    echo "docker-compose"
  elif podman compose version >/dev/null 2>&1; then
    echo "podman compose"
  else
    echo "ERROR: install Docker Compose or Podman Compose" >&2
    exit 1
  fi
}

cd "$ROOT"

for _ in $(seq 1 "$MAX_ATTEMPTS"); do
  if $(compose_cmd) exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
    exit 0
  fi
  sleep 1
done

echo "ERROR: Postgres did not become ready in ${MAX_ATTEMPTS}s" >&2
exit 1
