#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Running template dogfood verify from monorepo root..."
cd "$ROOT"

export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/jig_test?schema=public}"

if [ "${CI:-}" != "true" ]; then
  bash templates/fullstack/scripts/db-up.sh 2>/dev/null || true
  export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/jig_dev?schema=public}"
fi

if ! pnpm --filter @app/backend exec prisma migrate deploy; then
  if [ "${CI:-}" = "true" ]; then
    exit 1
  fi
  echo "WARN: Postgres unavailable — skipping migrate; static checks only"
fi

pnpm --dir templates/fullstack verify

echo "template-dogfood: passed."
