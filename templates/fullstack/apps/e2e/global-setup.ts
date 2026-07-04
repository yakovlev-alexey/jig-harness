import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const templateRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export default async function globalSetup(): Promise<void> {
  if (process.env.E2E_BASE_URL) {
    return;
  }

  const databaseUrl =
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/jig_dev?schema=public';

  execSync('pnpm --filter @app/backend db:migrate', {
    cwd: templateRoot,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });

  execSync('pnpm --filter @app/frontend build', {
    cwd: templateRoot,
    stdio: 'inherit',
  });
}
