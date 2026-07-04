#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Running template dogfood verify from monorepo root..."
cd "$ROOT"

pnpm --filter @app/web --filter @app/api --filter @app/types run lint
pnpm --filter @app/web --filter @app/api --filter @app/types run typecheck
pnpm --filter @app/web --filter @app/api --filter @app/types run test
pnpm --filter @app/web run build
pnpm --filter @app/api run build

echo "template-dogfood: passed."
