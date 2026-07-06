#!/usr/bin/env node
/**
 * Coherence check: every custom eslint rule must have a catalogue row,
 * and every catalogue enforcement id must reference an existing rule.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function parseCatalogue() {
  const content = readFileSync(join(root, 'rules-catalogue.md'), 'utf8');
  const rows = [];
  for (const line of content.split('\n')) {
    if (!line.startsWith('|') || line.includes('---') || line.includes(' id ')) continue;
    const cols = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cols.length >= 6) {
      rows.push({
        id: cols[0],
        enforcement: cols[4],
      });
    }
  }
  return rows;
}

function listCustomRules() {
  const pluginDir = join(root, 'packages/eslint-plugin/src/rules');
  try {
    return readdirSync(pluginDir)
      .filter(
        (f) =>
          (f.endsWith('.ts') || f.endsWith('.js')) &&
          !f.endsWith('.test.js') &&
          !f.endsWith('.test.ts'),
      )
      .map((f) => f.replace(/\.(ts|js)$/, ''));
  } catch {
    return [];
  }
}

function ruleExistsInPlugin(ruleName) {
  const rules = listCustomRules();
  return rules.includes(ruleName);
}

const NON_ESLINT_ENFORCEMENT = new Set(['@jig-harness/spec-present']);

const catalogue = parseCatalogue();
const customRules = listCustomRules();
const errors = [];

for (const rule of customRules) {
  const row = catalogue.find(
    (r) => r.enforcement === rule || r.enforcement === `@jig-harness/${rule}`,
  );
  if (!row) {
    errors.push(`Custom rule "${rule}" has no row in rules-catalogue.md`);
  }
}

for (const row of catalogue) {
  if (!row.enforcement || row.enforcement === '—' || row.enforcement === '-') continue;
  if (row.enforcement.startsWith('scripts/') || NON_ESLINT_ENFORCEMENT.has(row.enforcement)) {
    continue;
  }
  const ruleName = row.enforcement.replace(/^@jig-harness\//, '');
  if (ruleName.startsWith('eslint:') || ruleName.includes('/')) continue;
  if (customRules.length > 0 && !ruleExistsInPlugin(ruleName)) {
    errors.push(
      `Catalogue row "${row.id}" cites enforcement "${row.enforcement}" but rule not found`,
    );
  }
}

if (errors.length > 0) {
  console.error('Coherence check failed:\n' + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}

console.log('Coherence check passed.');
