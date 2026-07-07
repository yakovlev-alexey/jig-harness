#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FIXTURES_DIR="$ROOT/scripts/validate-skills-fixtures"
VALIDATOR="$ROOT/scripts/validate-skills.sh"

failures=0

assert_pass() {
  local fixture="$1"
  local rel="${fixture#$ROOT/}"
  if "$VALIDATOR" --evals-only "$fixture" >/dev/null 2>&1; then
    echo "PASS (expected): $rel"
  else
    echo "FAIL: expected $rel to pass validation" >&2
    failures=$((failures + 1))
  fi
}

assert_fail() {
  local fixture="$1"
  local rel="${fixture#$ROOT/}"
  if "$VALIDATOR" --evals-only "$fixture" >/dev/null 2>&1; then
    echo "FAIL: expected $rel to fail validation" >&2
    failures=$((failures + 1))
  else
    echo "PASS (expected failure): $rel"
  fi
}

assert_pass "$FIXTURES_DIR/pass-10-cases.json"
assert_fail "$FIXTURES_DIR/fail-too-few-cases.json"
assert_fail "$FIXTURES_DIR/fail-too-few-near-miss.json"
assert_fail "$FIXTURES_DIR/fail-unknown-sibling.json"
assert_fail "$FIXTURES_DIR/fail-positive-near-miss.json"

if [[ "$failures" -gt 0 ]]; then
  echo "validate-skills fixtures: $failures failure(s)" >&2
  exit 1
fi

echo "validate-skills fixtures: all checks passed."
