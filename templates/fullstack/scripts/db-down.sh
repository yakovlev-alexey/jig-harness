#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

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
$(compose_cmd) stop postgres 2>/dev/null || true
echo "Postgres stopped (volume preserved)."
