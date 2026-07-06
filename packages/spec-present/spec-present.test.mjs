import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { evaluate } from './src/index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const binPath = join(__dirname, 'bin/spec-present.mjs');

test('GREEN: app source + spec both changed', () => {
  const { ok } = evaluate([
    'templates/fullstack/apps/backend/src/slices/users/endpoints/create-user-endpoint.ts',
    'docs/specs/users/spec.md',
  ]);
  assert.equal(ok, true);
});

test('GREEN: only non-app files changed', () => {
  const { ok } = evaluate(['README.md', 'scripts/foo.mjs']);
  assert.equal(ok, true);
});

test('GREEN: only a spec changed', () => {
  const { ok } = evaluate(['docs/specs/users/spec.md']);
  assert.equal(ok, true);
});

test('GREEN: scaffolded-app layout with spec', () => {
  const { ok } = evaluate([
    'apps/frontend/src/slices/users/widgets/user-list/user-list.widget.tsx',
    'docs/specs/users/spec.md',
  ]);
  assert.equal(ok, true);
});

test('RED: app source changed, no spec', () => {
  const { ok, offenders } = evaluate([
    'templates/fullstack/apps/backend/src/slices/users/commands/create-user-command.ts',
  ]);
  assert.equal(ok, false);
  assert.ok(offenders.length > 0);
});

test('RED: scaffolded-app source changed, no spec', () => {
  const { ok, offenders } = evaluate([
    'apps/frontend/src/slices/users/store/queries/users-query.ts',
  ]);
  assert.equal(ok, false);
  assert.ok(offenders.length > 0);
});

test('CLI bin runs and exits 0 when no app source changed', () => {
  const result = spawnSync(process.execPath, [binPath], {
    encoding: 'utf8',
    env: { ...process.env, SPEC_PRESENT_BASE: process.env.SPEC_PRESENT_BASE ?? 'HEAD' },
  });
  assert.equal(
    result.status,
    0,
    `bin should exit 0; stderr: ${result.stderr}\nstdout: ${result.stdout}`,
  );
  assert.match(result.stdout, /spec-present: OK/);
});
