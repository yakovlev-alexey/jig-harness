#!/usr/bin/env node
/**
 * Structural oracle for be-layer-flow on a users create-user slice.
 * Exit 0 = pass, 1 = fail. Used by evals/l2-2026-07-07.md.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2];
if (!root) {
  console.error('usage: node oracle-check.mjs <slice-root>');
  process.exit(2);
}

const sliceRoot = path.resolve(root);
const errors = [];

function read(rel) {
  const file = path.join(sliceRoot, rel);
  if (!fs.existsSync(file)) {
    errors.push(`missing file: ${rel}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function assertNoImport(content, rel, forbidden) {
  for (const segment of forbidden) {
    const pattern = new RegExp(`from ['\"][^'\"]*${segment}[^'\"]*['\"]`);
    if (pattern.test(content)) {
      errors.push(`${rel}: forbidden import path contains "${segment}"`);
    }
  }
}

function assertImport(content, rel, required) {
  const pattern = new RegExp(`from ['\"][^'\"]*${required}[^'\"]*['\"]`);
  if (!pattern.test(content)) {
    errors.push(`${rel}: expected import path containing "${required}"`);
  }
}

function assertKebab(rel) {
  const base = path.basename(rel);
  if (base !== base.toLowerCase() || /[A-Z]/.test(base)) {
    errors.push(`${rel}: filename must be kebab-case`);
  }
}

const endpoint = read('endpoints/create-user-endpoint.ts');
const usecase = read('usecases/create-user-usecase.ts');

assertNoImport(endpoint, 'endpoints/create-user-endpoint.ts', [
  '/commands/',
  '/queries/',
  '/domain/',
]);
assertImport(endpoint, 'endpoints/create-user-endpoint.ts', '/usecases/');
assertImport(usecase, 'usecases/create-user-usecase.ts', '/queries/');
assertImport(usecase, 'usecases/create-user-usecase.ts', '/commands/');

for (const rel of [
  'endpoints/create-user-endpoint.ts',
  'usecases/create-user-usecase.ts',
  'commands/create-user-command.ts',
  'queries/find-user-by-email-query.ts',
]) {
  assertKebab(rel);
}

if (errors.length) {
  for (const err of errors) console.error(`FAIL: ${err}`);
  process.exit(1);
}

console.log('PASS: be-layer-flow structural checks');
process.exit(0);
