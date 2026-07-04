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

const isCI = process.env.CI === 'true';
const DEFAULT_DATABASE_URL = isCI
  ? 'postgresql://postgres:postgres@localhost:5432/jig_test?schema=public'
  : 'postgresql://postgres:postgres@localhost:5432/jig_dev?schema=public';

function run(cmd, args, cwd = ROOT, env = process.env) {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function tryRun(cmd, args, cwd = ROOT, env = process.env) {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env,
  });
  return result.status === 0;
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

const scaffoldEnv = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
};

try {
  run(
    'node',
    [
      join(ROOT, 'packages/create-app/bin/create-app.js'),
      projectDir,
      '--tarballs-dir',
      TARBALLS_DIR,
      '--skip-git',
    ],
    ROOT,
    scaffoldEnv,
  );

  if (!isCI) {
    tryRun('pnpm', ['db:up'], projectDir, scaffoldEnv);
  }

  if (
    !tryRun(
      'pnpm',
      ['--filter', '@app/backend', 'exec', 'prisma', 'migrate', 'deploy'],
      projectDir,
      scaffoldEnv,
    )
  ) {
    if (isCI) {
      process.exit(1);
    }
    console.warn('WARN: Postgres unavailable — skipping migrate; static verify only');
  }

  if (isCI) {
    run(
      'pnpm',
      [
        '--filter',
        '@app/frontend',
        'exec',
        'playwright',
        'install',
        'chromium',
        '--with-deps',
      ],
      projectDir,
      scaffoldEnv,
    );
  }

  run('pnpm', ['verify'], projectDir, scaffoldEnv);
  run('node', [join(ROOT, 'scripts/verify-turbo-gen.mjs'), join(projectDir, 'apps/frontend')]);
  run('node', [join(ROOT, 'scripts/verify-backend-gen.mjs'), join(projectDir, 'apps/backend')]);
  console.log('scaffold-and-verify: passed.');
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
  rmSync(TARBALLS_DIR, { recursive: true, force: true });
}
