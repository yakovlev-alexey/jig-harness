#!/usr/bin/env node
/**
 * Objective L2 oracle for write-spec pressure scenarios.
 * Usage: node oracle-check.mjs <red|green> <scenario-a|b|c|d|e>
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluate } from '../../../../packages/spec-present/src/index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, 'fixtures');

function loadJson(name) {
  return JSON.parse(readFileSync(join(FIXTURES, name), 'utf8'));
}

function loadText(name) {
  return readFileSync(join(FIXTURES, name), 'utf8');
}

function checkSpecStructure(text, { requireLayout = false } = {}) {
  const errors = [];
  if (!/\b(SHALL|MUST)\b/.test(text)) errors.push('missing SHALL/MUST');
  if (!/\bGIVEN\b/.test(text)) errors.push('missing GIVEN');
  if (!/\bWHEN\b/.test(text)) errors.push('missing WHEN');
  if (!/\bTHEN\b/.test(text)) errors.push('missing THEN');
  if (requireLayout && !/^## Interface layout/m.test(text)) {
    errors.push('missing ## Interface layout');
  }
  return errors;
}

function checkFeatureScoped(path) {
  return /^docs\/specs\/[a-z0-9-]+\/spec\.md$/.test(path);
}

const [mode, scenario] = process.argv.slice(2);
if (!mode || !scenario) {
  console.error('Usage: node oracle-check.mjs <red|green> <scenario-a|b|c|d|e>');
  process.exit(2);
}

const filesKey = `${scenario}-${mode}-files.json`;
const specKey = `${scenario}-${mode}-spec.md`;
let failed = false;

const changedFiles = loadJson(filesKey);
const specPresent = evaluate(changedFiles);
console.log(
  `spec-present: ok=${specPresent.ok} appSource=${specPresent.appSourceChanged} spec=${specPresent.specChanged}`,
);
if (mode === 'red' && specPresent.ok && scenario === 'scenario-a') {
  console.error('RED FAIL: scenario-a spec-present should fail (code before spec)');
  failed = true;
}
if (mode === 'red' && !specPresent.ok && scenario === 'scenario-d') {
  console.error('RED FAIL: scenario-d spec-present incidental fail — gate violation is primary');
  failed = true;
}
if (mode === 'green' && !specPresent.ok) {
  console.error('GREEN FAIL: spec-present should pass for with_skill output');
  failed = true;
}

const requireLayout = scenario === 'scenario-e';
const skipStructRed =
  scenario === 'scenario-a' ||
  scenario === 'scenario-b' ||
  scenario === 'scenario-d' ||
  scenario === 'scenario-e';

try {
  const specText = loadText(specKey);
  const structErrors = checkSpecStructure(specText, {
    requireLayout: mode === 'green' && requireLayout,
  });
  if (mode === 'green' && structErrors.length > 0) {
    console.error(`GREEN FAIL: spec structure: ${structErrors.join(', ')}`);
    failed = true;
  }
  if (mode === 'red' && !skipStructRed && structErrors.length === 0) {
    console.error('RED FAIL: spec structure should be incomplete for without_skill output');
    failed = true;
  }
  if (mode === 'red' && requireLayout && /^## Interface layout/m.test(specText)) {
    console.error('RED FAIL: scenario-e should omit ## Interface layout');
    failed = true;
  }
  const specPath = changedFiles.find((f) => f.endsWith('/spec.md'));
  if (mode === 'green' && specPath && !checkFeatureScoped(specPath)) {
    console.error(`GREEN FAIL: spec path not feature-scoped: ${specPath}`);
    failed = true;
  }
  if (mode === 'red' && scenario === 'scenario-b') {
    const sliceScoped = changedFiles.filter((f) =>
      /docs\/specs\/(backend|frontend|types)-/.test(f),
    );
    if (sliceScoped.length < 2) {
      console.error('RED FAIL: scenario-b should use slice-scoped spec paths');
      failed = true;
    } else {
      console.log(`slice-scoped paths: ${sliceScoped.length} (RED pass)`);
    }
  }
  console.log(`spec-structure: ${structErrors.length === 0 ? 'pass' : structErrors.join(', ')}`);
} catch (err) {
  if (mode === 'green') {
    console.error(`GREEN FAIL: missing spec fixture: ${err.message}`);
    failed = true;
  } else if (scenario === 'scenario-a') {
    console.log('spec-structure: n/a (no spec file — code-first RED)');
  }
}

if (scenario === 'scenario-d') {
  const gate = loadJson(`${scenario}-${mode}-gate.json`);
  if (mode === 'red' && gate.proceeded_without_approval) {
    console.log('user-gate: RED pass (proceeded without approval)');
  } else if (mode === 'green' && !gate.proceeded_without_approval && gate.presented_for_approval) {
    console.log('user-gate: GREEN pass (stopped for approval)');
  } else {
    console.error(`user-gate: ${mode.toUpperCase()} FAIL`);
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
