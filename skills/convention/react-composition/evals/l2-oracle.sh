#!/usr/bin/env bash
# Objective oracle for react-composition L2 widget-reuse case.
# Usage: l2-oracle.sh <fixture-dir>
# Exit 0 = pass all checks; non-zero = fail (prints failing rule ids).
set -euo pipefail

FIXTURE="${1:?fixture directory required}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
FRONTEND="$ROOT/templates/fullstack/apps/frontend"
WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

copy_fixture() {
  mkdir -p "$WORKDIR/src/routes" "$WORKDIR/src/slices"
  if [[ -d "$FIXTURE/routes" ]]; then
    cp -r "$FIXTURE/routes/." "$WORKDIR/src/routes/"
  fi
  if [[ -d "$FIXTURE/slices" ]]; then
    cp -r "$FIXTURE/slices/." "$WORKDIR/src/slices/"
  fi
}

check_colocated_css() {
  local fail=0
  while IFS= read -r -d '' tsx; do
    [[ "$tsx" == *.widget.tsx ]] && continue
    local css="${tsx%.tsx}.css"
    if [[ ! -f "$css" ]]; then
      echo "FAIL rc-colocated-css: missing ${css#$WORKDIR/}"
      fail=1
    fi
  done < <(find "$WORKDIR/src" -name '*.tsx' -print0)
  return "$fail"
}

check_widget_suffix() {
  local fail=0
  while IFS= read -r -d '' dir; do
    local has_entry=0
    while IFS= read -r -d '' entry; do
      has_entry=1
      if [[ "$entry" != *.widget.tsx ]]; then
        echo "FAIL rc-widget-suffix: widget entry ${entry#$WORKDIR/} must use .widget.tsx"
        fail=1
      fi
    done < <(find "$dir" -maxdepth 1 -name '*.widget.tsx' -print0)
    if [[ "$has_entry" -eq 0 ]]; then
      echo "FAIL rc-widget-suffix: ${dir#$WORKDIR/} missing *.widget.tsx entry"
      fail=1
    fi
  done < <(find "$WORKDIR/src/slices" -type d -path '*/widgets/*' -print0 2>/dev/null || true)
  return "$fail"
}

check_no_widget_imports_widget() {
  local fail=0
  while IFS= read -r -d '' entry; do
    if grep -Eq "from ['\"][^'\"]*\\.widget['\"]|from ['\"][^'\"]*\\.widget\\.tsx['\"]" "$entry"; then
      echo "FAIL rc-no-widget-imports-widget: ${entry#$WORKDIR/} imports another widget entry"
      fail=1
    fi
  done < <(find "$WORKDIR/src/slices" -name '*.widget.tsx' -print0 2>/dev/null || true)
  return "$fail"
}

run_eslint() {
  if [[ ! -d "$FRONTEND/node_modules" ]]; then
    echo "SKIP eslint: run pnpm install at repo root first"
    return 2
  fi
  (
    cd "$FRONTEND"
    pnpm exec eslint \
      --no-error-on-unmatched-pattern \
      --config eslint.config.js \
      "$WORKDIR/src/**/*.{ts,tsx}" 2>&1
  )
}

copy_fixture

STRUCT_FAIL=0
check_colocated_css || STRUCT_FAIL=1
check_widget_suffix || STRUCT_FAIL=1
check_no_widget_imports_widget || STRUCT_FAIL=1

LINT_OUT="$(run_eslint || true)"
LINT_RC=$?
LINT_FAIL=0
if [[ "$LINT_RC" -eq 0 ]]; then
  : # clean
elif [[ "$LINT_RC" -eq 2 ]]; then
  echo "$LINT_OUT"
else
  LINT_FAIL=1
fi
if [[ "$LINT_RC" -eq 0 ]] && echo "$LINT_OUT" | grep -qE '\berror\b'; then
  LINT_FAIL=1
fi

if [[ "$STRUCT_FAIL" -eq 0 && ( "$LINT_RC" -eq 2 || "$LINT_FAIL" -eq 0 ) ]]; then
  echo "PASS: structural checks${LINT_RC:+ (+ eslint when available)}"
  [[ "$LINT_RC" -eq 0 ]] && echo "$LINT_OUT" | tail -1
  exit 0
fi

echo "--- structural ---"
[[ "$STRUCT_FAIL" -eq 0 ]] && echo "PASS structural" || true
echo "--- eslint ---"
echo "$LINT_OUT"
exit 1
