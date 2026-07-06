import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluate } from './src/index.mjs';

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
