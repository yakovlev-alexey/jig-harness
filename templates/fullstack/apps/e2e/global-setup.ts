import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const templateRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function resolvePnpmRoot(): string {
  let dir = templateRoot;
  for (let i = 0; i < 4; i += 1) {
    if (existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }
    dir = path.resolve(dir, '..');
  }
  return templateRoot;
}

export default async function globalSetup(): Promise<void> {
  if (process.env.E2E_BASE_URL) {
    return;
  }

  const pnpmRoot = resolvePnpmRoot();
  const databaseUrl =
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/jig_dev?schema=public';

  execSync('pnpm --filter @app/backend db:migrate', {
    cwd: pnpmRoot,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });

  execSync('pnpm --filter @app/frontend build', {
    cwd: pnpmRoot,
    stdio: 'inherit',
    env: process.env,
  });
}
