#!/usr/bin/env node
/**
 * Verify turbo gen backend generators work in a scaffolded apps/backend workspace.
 * Usage: node scripts/verify-backend-gen.mjs <apps/backend-path>
 */
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import nodePlop from 'node-plop';

const backendRoot = process.argv[2];
if (!backendRoot) {
  console.error('Usage: verify-backend-gen.mjs <apps/backend-path>');
  process.exit(1);
}

const genConfig = join(backendRoot, 'turbo/generators/config.ts');
if (!statSync(genConfig, { throwIfNoEntry: false })?.isFile()) {
  console.error(`Missing generator config: ${genConfig}`);
  process.exit(1);
}

const tempDir = mkdtempSync(join(tmpdir(), 'jig-backend-gen-verify-'));

try {
  const plop = await nodePlop(genConfig, { destBasePath: backendRoot });
  const generator = plop.getGenerator('endpoint');
  const result = await generator.runActions({ slice: 'health', name: 'gen-smoke-test' });

  if (result.failures.length > 0) {
    console.error('turbo gen endpoint failures:', result.failures);
    process.exit(1);
  }

  const lint = spawnSync(
    'pnpm',
    ['exec', 'eslint', 'src/slices/health/endpoints/gen-smoke-test-endpoint.ts'],
    {
      cwd: backendRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    },
  );

  if (lint.status !== 0) process.exit(lint.status ?? 1);

  rmSync(join(backendRoot, 'src/slices/health/endpoints/gen-smoke-test-endpoint.ts'), {
    force: true,
  });

  console.log('verify-backend-gen: passed.');
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
