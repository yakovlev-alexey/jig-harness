#!/usr/bin/env bash
# Plan-structure oracle for write-plan L2 evals.
# Usage: oracle-plan-structure.sh <plan.md> <spec.md>
# Exit 0 when every plan task cites a spec requirement id and every requirement is covered.
set -euo pipefail

plan="${1:?plan path required}"
spec="${2:?spec path required}"

if [[ ! -f "$plan" ]]; then
  echo "FAIL: plan file not found: $plan" >&2
  exit 1
fi
if [[ ! -f "$spec" ]]; then
  echo "FAIL: spec file not found: $spec" >&2
  exit 1
fi

req_ids=$(grep -E '^### R[0-9]+' "$spec" | sed -E 's/^### (R[0-9]+).*/\1/' | sort -u)
if [[ -z "$req_ids" ]]; then
  echo "FAIL: no R* requirements found in spec" >&2
  exit 1
fi

task_titles=$(grep -E '^## Task ' "$plan" || true)
if [[ -z "$task_titles" ]]; then
  echo "FAIL: no ## Task sections found in plan" >&2
  exit 1
fi

task_count=$(echo "$task_titles" | wc -l | tr -d ' ')

python3 - "$plan" <<'PY' || exit 1
import re
import sys

plan_path = sys.argv[1]
text = open(plan_path, encoding="utf-8").read()
parts = re.split(r"(?=^## Task )", text, flags=re.M)
tasks = [p for p in parts if p.startswith("## Task ")]
if not tasks:
    print("FAIL: no ## Task sections found in plan", file=sys.stderr)
    sys.exit(1)
for task in tasks:
    if not re.search(r"(?<![0-9])R[0-9]+(?![0-9])", task):
        first = task.splitlines()[0]
        print(f"FAIL: task block cites no requirement id: {first}", file=sys.stderr)
        sys.exit(1)
print(f"OK: {len(tasks)} task blocks cite requirement ids")
PY

while IFS= read -r rid; do
  [[ -z "$rid" ]] && continue
  if ! grep -qE "(^|[^0-9])${rid}([^0-9]|$)" "$plan"; then
    echo "FAIL: requirement ${rid} from spec is not cited in plan" >&2
    exit 1
  fi
done <<< "$req_ids"

echo "PASS: ${task_count} task(s); all spec requirements covered (${req_ids//$'\n'/ })"
