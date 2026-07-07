#!/usr/bin/env bash
# Objective L2 retrieval oracle for project-defaults (R9).
set -euo pipefail

SKILL="${1:-$(dirname "$0")/../SKILL.md}"
text="$(cat "$SKILL")"

pass=0
total=0

check() {
  local label="$1"
  shift
  total=$((total + 1))
  if "$@"; then
    pass=$((pass + 1))
    echo "  [ok] $label"
  else
    echo "  [FAIL] $label"
  fi
}

echo "case1: greenfield stack checklist"
check "pnpm" grep -qi 'pnpm' <<<"$text"
check "TypeScript" grep -qi 'TypeScript' <<<"$text"
check "React + Vite" grep -qi 'React' <<<"$text" && grep -qi 'Vite' <<<"$text"
check "TanStack Router src/routes" grep -qi 'TanStack Router' <<<"$text" && grep -q 'src/routes/' <<<"$text"
check "Fastify + Zod" grep -qi 'Fastify' <<<"$text" && grep -qi 'Zod' <<<"$text"
check "packages/types contracts" grep -q 'packages/types' <<<"$text"
check "BEM colocated CSS" grep -qi 'BEM' <<<"$text" && grep -qi 'colocated' <<<"$text"
check "Turborepo monorepo shape" grep -qi 'Turborepo' <<<"$text" && grep -q 'apps/' <<<"$text" && grep -q 'packages/' <<<"$text"

if [[ $pass -eq $total ]]; then
  echo "case1: ${pass}/${total} PASS"
else
  echo "case1: ${pass}/${total} FAIL"
  exit 1
fi

echo "case2: contracts slice path"
pass2=0
total2=1
if grep -q 'packages/types/src/slices/' <<<"$text"; then
  pass2=1
  echo "  [ok] packages/types/src/slices/<area>/"
else
  echo "  [FAIL] packages/types/src/slices/<area>/"
  exit 1
fi
echo "case2: ${pass2}/${total2} PASS"
