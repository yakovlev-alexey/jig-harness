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

load_installed_skill_names() {
  node -e "
    const fs = require('fs');
    const path = require('path');
    const { execSync } = require('child_process');
    const root = '$ROOT';
    const skillsDir = path.join(root, 'skills');
    if (!fs.existsSync(skillsDir)) {
      console.log('');
      process.exit(0);
    }
    const files = execSync('find skills -name SKILL.md', { cwd: root, encoding: 'utf8' })
      .trim()
      .split('\\n')
      .filter(Boolean);
    const names = [];
    for (const rel of files) {
      const text = fs.readFileSync(path.join(root, rel), 'utf8');
      const match = text.match(/^---\\r?\\n([\\s\\S]*?)\\r?\\n---/);
      const nameLine = match && match[1].split('\\n').find((l) => l.startsWith('name:'));
      const name = nameLine ? nameLine.slice('name:'.length).trim() : null;
      if (name) names.push(name);
    }
    console.log(names.join('\\n'));
  "
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

  local installed_skill_names
  installed_skill_names=$(load_installed_skill_names)

  local validation_output
  if ! validation_output=$(
    node -e "
      const fs = require('fs');
      const evalsFile = process.argv[1];
      const installed = process.argv[2]
        .split('\\n')
        .map((name) => name.trim())
        .filter(Boolean);
      const installedSkillNames = new Set(installed);
      const data = JSON.parse(fs.readFileSync(evalsFile, 'utf8'));
      const errors = [];

      if (!Array.isArray(data)) {
        errors.push('root must be an array');
      } else if (data.length === 0) {
        errors.push('evals must be non-empty');
      } else {
        let positives = 0;
        let negatives = 0;
        let nearMissNegatives = 0;

        data.forEach((item, index) => {
          const label = 'case ' + (index + 1);

          if (typeof item.query !== 'string') {
            errors.push(label + ': query must be a string');
          }
          if (typeof item.should_trigger !== 'boolean') {
            errors.push(label + ': should_trigger must be a boolean');
          }

          const hasNearMissOf = Object.prototype.hasOwnProperty.call(item, 'near_miss_of');

          if (item.should_trigger === true) {
            positives += 1;
            if (hasNearMissOf) {
              errors.push(label + ': positive case must not carry near_miss_of');
            }
          } else if (item.should_trigger === false) {
            negatives += 1;
            if (hasNearMissOf) {
              if (typeof item.near_miss_of !== 'string' || item.near_miss_of.trim() === '') {
                errors.push(label + ': near_miss_of must be a non-empty string');
              } else if (!installedSkillNames.has(item.near_miss_of)) {
                errors.push(
                  label +
                    ': near_miss_of \"' +
                    item.near_miss_of +
                    '\" names no installed skill under skills/',
                );
              } else {
                nearMissNegatives += 1;
              }
            }
          }
        });

        if (data.length < 10) {
          errors.push('need at least 10 cases (found ' + data.length + ')');
        }
        if (positives < 1) {
          errors.push('need at least one positive case (should_trigger: true)');
        }
        if (negatives < 1) {
          errors.push('need at least one negative case (should_trigger: false)');
        }
        if (nearMissNegatives < 4) {
          errors.push(
            'need at least 4 negative near-miss cases with near_miss_of (found ' +
              nearMissNegatives +
              ')',
          );
        }
      }

      if (errors.length > 0) {
        console.log(errors.join('\\n'));
        process.exit(1);
      }
    " "$evals_file" "$installed_skill_names" 2>&1
  ); then
    error "$rel: invalid trigger_evals.json"
    while IFS= read -r detail; do
      [[ -n "$detail" ]] && error "$rel: $detail"
    done <<< "$validation_output"
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

validate_unique_skill_names() {
  node -e "
    const fs = require('fs');
    const path = require('path');
    const { execSync } = require('child_process');
    const root = '$ROOT';
    const files = execSync(\"find skills -name SKILL.md\", { cwd: root, encoding: 'utf8' })
      .trim()
      .split('\\n')
      .filter(Boolean);
    const names = new Map();
    for (const rel of files) {
      const text = fs.readFileSync(path.join(root, rel), 'utf8');
      const match = text.match(/^---\\r?\\n([\\s\\S]*?)\\r?\\n---/);
      const nameLine = match && match[1].split('\\n').find((l) => l.startsWith('name:'));
      const name = nameLine ? nameLine.slice('name:'.length).trim() : null;
      if (!name) {
        console.error('ERROR: ' + rel + ': missing name in frontmatter');
        process.exit(1);
      }
      if (names.has(name)) {
        console.error('ERROR: duplicate skill name \"' + name + '\" in ' + rel + ' and ' + names.get(name));
        process.exit(1);
      }
      names.set(name, rel);
    }
  " 2>/dev/null || error "duplicate or missing skill names under skills/"
}

if [[ "${1:-}" == "--evals-only" ]]; then
  if [[ $# -ne 2 ]]; then
    echo "usage: $0 --evals-only <path/to/trigger_evals.json>" >&2
    exit 2
  fi
  evals_path="$2"
  if [[ "$evals_path" != /* ]]; then
    evals_path="$ROOT/$evals_path"
  fi
  validate_evals "$evals_path"
  if [[ "$ERRORS" -gt 0 ]]; then
    echo "validate-skills: $ERRORS error(s)" >&2
    exit 1
  fi
  echo "validate-skills: passed."
  exit 0
fi

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

  validate_unique_skill_names
else
  echo "No skills/ directory yet — skipping skill validation."
fi

if [[ "$ERRORS" -gt 0 ]]; then
  echo "validate-skills: $ERRORS error(s)" >&2
  exit 1
fi

echo "validate-skills: passed."
