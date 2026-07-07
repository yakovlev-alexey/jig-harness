#!/usr/bin/env node
/**
 * Objective oracle for specs L2 eval — structural checks on a feature spec.md.
 * Usage: node oracle-check-spec-structure.mjs <spec-path>
 * Exit 0 = pass, 1 = fail (errors printed to stderr).
 */
import fs from 'node:fs';
import path from 'node:path';

const specPath = process.argv[2];
if (!specPath) {
  console.error('Usage: node oracle-check-spec-structure.mjs <spec-path>');
  process.exit(1);
}

const errors = [];
const text = fs.readFileSync(specPath, 'utf8');
const folder = path.basename(path.dirname(specPath));

// Feature-scoped folder name by intent (not slice-oriented).
const sliceLike = /(?:^|[-_])(?:backend|frontend|api|slice|apps)[-_]/i;
if (sliceLike.test(folder) || /-slice$/i.test(folder)) {
  errors.push(
    `folder "${folder}" looks slice-oriented; name by feature intent (e.g. user-registration)`,
  );
}

if (!/^## Purpose\s*$/m.test(text)) {
  errors.push('missing ## Purpose heading');
}

const requirementsSection = text.match(/^## Requirements\s*\n([\s\S]*)/m)?.[1] ?? '';
const requirementBlocks = [
  ...requirementsSection.matchAll(/^### (R\d+[^\n]*)\n([\s\S]*?)(?=\n### R\d+|$)/g),
];
if (requirementBlocks.length === 0) {
  errors.push('no numbered requirements (### R1 — …)');
}

for (const [, title, body] of requirementBlocks) {
  if (!/\b(SHALL|MUST)\b/.test(body)) {
    errors.push(`${title.trim()}: requirement body lacks SHALL or MUST`);
  }
  const scenarios = [...body.matchAll(/^#### Scenario:/gm)];
  if (scenarios.length === 0) {
    errors.push(`${title.trim()}: no #### Scenario block`);
    continue;
  }
  for (const scenario of scenarios) {
    const start = scenario.index;
    const next = body.indexOf('#### Scenario:', start + 1);
    const chunk = body.slice(start, next === -1 ? undefined : next);
    for (const kw of ['GIVEN', 'WHEN', 'THEN']) {
      if (!new RegExp(`\\*\\*${kw}\\*\\*`).test(chunk)) {
        errors.push(`${title.trim()}: scenario missing **${kw}**`);
        break;
      }
    }
  }
}

// Rationale belongs in decisions.md, not spec.md.
const rationaleMarkers = [
  /\*\*Alternatives considered:\*\*/i,
  /\*\*Rationale:\*\*/i,
  /— rejected:/i,
  /rejected because/i,
];
for (const re of rationaleMarkers) {
  if (re.test(text)) {
    errors.push(`spec duplicates decision rationale (${re})`);
    break;
  }
}

if (errors.length > 0) {
  for (const e of errors) console.error(`FAIL: ${e}`);
  process.exit(1);
}

console.log('PASS: spec structure oracle');
process.exit(0);
