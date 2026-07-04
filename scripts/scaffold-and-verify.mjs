#!/usr/bin/env node
/**
 * CI helper: pack @jig-harness packages, scaffold a fresh app, run verify.
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TARBALLS_DIR = join(ROOT, '.scaffold-tarballs');

function run(cmd, args, cwd = ROOT) {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const packages = [
  '@jig-harness/tsconfig',
  '@jig-harness/prettier-config',
  '@jig-harness/eslint-plugin',
  '@jig-harness/eslint-config',
  '@jig-harness/stylelint-config',
  '@jig-harness/generators',
];

rmSync(TARBALLS_DIR, { recursive: true, force: true });
run('mkdir', ['-p', TARBALLS_DIR]);

for (const pkg of packages) {
  run('pnpm', ['--filter', pkg, 'pack', '--pack-destination', TARBALLS_DIR]);
}

const tmpDir = mkdtempSync(join(tmpdir(), 'jig-scaffold-'));
const projectDir = join(tmpDir, 'test-app');

try {
  run('node', [
    join(ROOT, 'packages/create-app/bin/create-app.js'),
    projectDir,
    '--tarballs-dir',
    TARBALLS_DIR,
    '--skip-git',
  ]);
  run('pnpm', ['verify'], projectDir);
  run('node', [join(ROOT, 'scripts/verify-turbo-gen.mjs'), join(projectDir, 'apps/web')]);
  console.log('scaffold-and-verify: passed.');
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
  rmSync(TARBALLS_DIR, { recursive: true, force: true });
}
