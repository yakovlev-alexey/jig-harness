import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const tsconfig =
  process.env.INCLUDE_TEST_ROUTES === 'true' ? 'tsconfig.build.test.json' : 'tsconfig.build.json';

rmSync(distDir, { recursive: true, force: true });

const result = spawnSync('tsc', ['--noEmit', 'false', '--outDir', 'dist', '-p', tsconfig], {
  cwd: rootDir,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
