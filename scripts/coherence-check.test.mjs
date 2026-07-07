import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectSkillRuleOwnershipErrors,
  extractRulesSection,
  parseCatalogue,
  parseOwnRuleIds,
  runCoherenceCheck,
} from './coherence-check.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesRoot = join(__dirname, 'coherence-check', 'fixtures');

function runSkillRuleCheck(fixtureName) {
  const root = join(fixturesRoot, fixtureName);
  return runCoherenceCheck({
    root,
    cataloguePath: join(root, 'rules-catalogue.md'),
    includeEslintChecks: false,
    includeSkillRuleChecks: true,
  });
}

test('RED: uncatalogued own-rule ID in bullet Rules section', () => {
  const { ok, errors } = runSkillRuleCheck('red-uncatalogued-bullet');
  assert.equal(ok, false);
  assert.match(errors.join('\n'), /fx-missing-rule/);
});

test('RED: uncatalogued own-rule ID in table Rules section', () => {
  const { ok, errors } = runSkillRuleCheck('red-uncatalogued-table');
  assert.equal(ok, false);
  assert.match(errors.join('\n'), /fx-table-missing/);
});

test('GREEN: catalogued own rules, cross-references, and filename snippets pass', () => {
  const { ok, errors } = runSkillRuleCheck('green-pass');
  assert.equal(ok, true, errors.join('\n'));
});

test('parseOwnRuleIds ignores cross-references and delegated enforcement', () => {
  const rulesSection = `
- **fx-own-rule** — own. Reference **wf-borrowed-rule**: elsewhere.

Delegated enforcement (graded by lint):

- **sd-delegated-rule** — see \`state-and-data\`
- **fe-named-exports** — see \`frontend-architecture\`

| Rule ID         | Convention                                      |
| --------------- | ----------------------------------------------- |
| **fx-table-ok** | see \`other-skill\` / **ot-cross-ref-only**.    |
`;
  assert.deepEqual(parseOwnRuleIds(rulesSection), ['fx-own-rule', 'fx-table-ok']);
});

test('extractRulesSection stops at the next heading and ignores other sections', () => {
  const content = `---
name: fixture-skill
---

## Overview

assert-user-can-be-created.ts must stay outside Rules parsing.

## Rules

- **fx-good-rule** — owned.

## Examples

More assert-user-can-be-created.ts references.
`;
  const rulesSection = extractRulesSection(content);
  assert.match(rulesSection, /\*\*fx-good-rule\*\*/);
  assert.doesNotMatch(rulesSection, /assert-user-can-be-created/);
});

test('collectSkillRuleOwnershipErrors requires guidance column to name the skill', () => {
  const root = join(fixturesRoot, 'green-pass');
  const catalogue = parseCatalogue(join(root, 'rules-catalogue.md'));
  const wrongGuidance = catalogue.map((row) =>
    row.id === 'fx-good-rule' ? { ...row, guidance: 'other-skill' } : row,
  );
  const errors = collectSkillRuleOwnershipErrors(root, wrongGuidance);
  assert.ok(errors.some((entry) => entry.includes('fx-good-rule')));
});

test('coherence-check --test runs this file', () => {
  assert.equal(typeof runCoherenceCheck, 'function');
});
