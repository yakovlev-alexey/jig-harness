#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="$ROOT/skills"
MAX_SKILL_LINES=500
DESCRIPTION_PREFIX="Use when"
SKILLS_REF_VERSION="0.1.1"
ERRORS=0

error() {
  echo "ERROR: $1" >&2
  ERRORS=$((ERRORS + 1))
}

validate_description_prefix() {
  local skill_file="$1"
  local rel="${skill_file#$ROOT/}"

  if ! node -e "
    const fs = require('fs');
    const text = fs.readFileSync('$skill_file', 'utf8');
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) process.exit(1);
    const desc = match[1].split('\n').find(l => l.startsWith('description:'));
    if (!desc) process.exit(1);
    const value = desc.slice('description:'.length).trim();
    if (!value.startsWith('$DESCRIPTION_PREFIX')) process.exit(1);
  " 2>/dev/null; then
    error "$rel: description must start with '$DESCRIPTION_PREFIX'"
  fi
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

  validate_description_prefix "$skill_file"
}

validate_evals() {
  local evals_file="$1"
  local rel="${evals_file#$ROOT/}"
  local skill_dir
  skill_dir=$(dirname "$(dirname "$evals_file")")

  if [[ ! -f "$evals_file" ]]; then
    error "${skill_dir#"$ROOT/"}: missing evals/trigger_evals.json"
    return
  fi

  if ! node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$evals_file', 'utf8'));
    if (!Array.isArray(data)) throw new Error('root must be an array');
    if (data.length === 0) throw new Error('evals must be non-empty');
    for (const item of data) {
      if (typeof item.query !== 'string') throw new Error('each item needs query string');
      if (typeof item.should_trigger !== 'boolean') throw new Error('each item needs should_trigger boolean');
    }
  " 2>/dev/null; then
    error "$rel: invalid or empty trigger_evals.json"
  fi
}

validate_with_skills_ref() {
  local skill_dir="$1"
  local rel="${skill_dir#$ROOT/}"
  local venv_dir="$ROOT/.venv-skills-ref"
  local python_bin="${PYTHON:-python3}"

  if [[ ! -d "$venv_dir" ]]; then
    "$python_bin" -m venv "$venv_dir" 2>/dev/null || return 0
  fi

  # shellcheck disable=SC1091
  source "$venv_dir/bin/activate" 2>/dev/null || return 0

  if ! python -c "import skills_ref" >/dev/null 2>&1; then
    pip install --quiet --upgrade pip 2>/dev/null || return 0
    pip install --quiet "skills-ref==${SKILLS_REF_VERSION}" 2>/dev/null || return 0
  fi

  local validate_cli=""
  if [[ -x "$venv_dir/bin/agentskills" ]]; then
    validate_cli="$venv_dir/bin/agentskills"
  elif [[ -x "$venv_dir/bin/skills-ref" ]]; then
    validate_cli="$venv_dir/bin/skills-ref"
  else
    return 0
  fi

  if ! "$validate_cli" validate "$skill_dir" 2>/dev/null; then
    error "$rel: agentskills.io contract failed"
  fi
}

if [[ -d "$SKILLS_DIR" ]]; then
  skill_count=0
  while IFS= read -r -d '' skill; do
    skill_count=$((skill_count + 1))
    validate_skill "$skill"
    skill_dir=$(dirname "$skill")
    validate_evals "$skill_dir/evals/trigger_evals.json"
    if [[ "${SKILLS_REF_VALIDATE:-1}" == "1" ]]; then
      validate_with_skills_ref "$skill_dir"
    fi
  done < <(find "$SKILLS_DIR" -name 'SKILL.md' -print0)

  if [[ "$skill_count" -eq 0 ]]; then
    error "no SKILL.md files found under skills/"
  fi
else
  echo "No skills/ directory yet — skipping skill validation."
fi

if [[ "$ERRORS" -gt 0 ]]; then
  echo "validate-skills: $ERRORS error(s)" >&2
  exit 1
fi

echo "validate-skills: passed."
