#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="$ROOT/skills"
MAX_SKILL_LINES=500
ERRORS=0

error() {
  echo "ERROR: $1" >&2
  ERRORS=$((ERRORS + 1))
}

validate_skill() {
  local skill_file="$1"
  local rel="${skill_file#$ROOT/}"

  if [[ ! -f "$skill_file" ]]; then
    error "$rel: file not found"
    return
  fi

  local lines
  lines=$(wc -l < "$skill_file" | tr -d ' ')
  if [[ "$lines" -gt "$MAX_SKILL_LINES" ]]; then
    error "$rel: exceeds $MAX_SKILL_LINES lines ($lines)"
  fi

  if ! head -1 "$skill_file" | grep -q '^---$'; then
    error "$rel: missing YAML frontmatter opening ---"
  fi

  if ! grep -q '^name:' "$skill_file"; then
    error "$rel: missing 'name:' in frontmatter"
  fi

  if ! grep -q '^description:' "$skill_file"; then
    error "$rel: missing 'description:' in frontmatter"
  fi
}

validate_evals() {
  local evals_file="$1"
  local rel="${evals_file#$ROOT/}"

  if [[ ! -f "$evals_file" ]]; then
    return
  fi

  if ! node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$evals_file', 'utf8'));
    if (!Array.isArray(data)) throw new Error('root must be an array');
    for (const item of data) {
      if (typeof item.query !== 'string') throw new Error('each item needs query string');
      if (typeof item.should_trigger !== 'boolean') throw new Error('each item needs should_trigger boolean');
    }
  " 2>/dev/null; then
    error "$rel: invalid evals.json schema"
  fi
}

if [[ -d "$SKILLS_DIR" ]]; then
  while IFS= read -r -d '' skill; do
    validate_skill "$skill"
    skill_dir=$(dirname "$skill")
    validate_evals "$skill_dir/evals/evals.json"
  done < <(find "$SKILLS_DIR" -name 'SKILL.md' -print0)
else
  echo "No skills/ directory yet — skipping skill validation."
fi

if [[ "$ERRORS" -gt 0 ]]; then
  echo "validate-skills: $ERRORS error(s)" >&2
  exit 1
fi

echo "validate-skills: passed."
