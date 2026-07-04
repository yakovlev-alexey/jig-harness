#!/usr/bin/env node
/**
 * Verify turbo gen works in a scaffolded apps/web workspace.
 * Usage: node scripts/verify-turbo-gen.mjs <apps/web-path>
 */
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import nodePlop from 'node-plop';

const webRoot = process.argv[2];
if (!webRoot) {
  console.error('Usage: verify-turbo-gen.mjs <apps/web-path>');
  process.exit(1);
}

const genConfig = join(webRoot, 'turbo/generators/config.ts');
if (!statSync(genConfig, { throwIfNoEntry: false })?.isFile()) {
  console.error(`Missing generator config: ${genConfig}`);
  process.exit(1);
}

const tempDir = mkdtempSync(join(tmpdir(), 'jig-turbo-gen-verify-'));

try {
  const plop = await nodePlop(genConfig, { destBasePath: webRoot });
  const generator = plop.getGenerator('component');
  const result = await generator.runActions({ slice: 'landing', name: 'gen-smoke-test' });

  if (result.failures.length > 0) {
    console.error('turbo gen component failures:', result.failures);
    process.exit(1);
  }

  const lint = spawnSync(
    'pnpm',
    ['exec', 'eslint', 'src/slices/landing/components/gen-smoke-test'],
    {
      cwd: webRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    },
  );

  if (lint.status !== 0) process.exit(lint.status ?? 1);

  rmSync(join(webRoot, 'src/slices/landing/components/gen-smoke-test'), {
    recursive: true,
    force: true,
  });

  console.log('verify-turbo-gen: passed.');
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
