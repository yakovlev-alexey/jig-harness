import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import nodePlop from 'node-plop';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const packageRoot = dirname(fileURLToPath(import.meta.url));
const generatorsRoot = join(packageRoot, '..');

const BACKEND_SLICE_LAYERS = [
  'domain',
  'usecases',
  'commands',
  'queries',
  'endpoints',
  'plugins',
  'schemas',
];

function walkFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...walkFiles(fullPath));
    } else if (/\.(tsx|ts|jsx|js)$/.test(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function runGenerator(name, answers, destBasePath) {
  const plop = await nodePlop(join(generatorsRoot, 'turbo/generators/config.ts'), {
    destBasePath,
  });
  const generator = plop.getGenerator(name);
  return generator.runActions(answers);
}

async function lintGeneratedFiles(tempDir) {
  const eslint = new ESLint({
    cwd: generatorsRoot,
    overrideConfigFile: join(generatorsRoot, 'eslint.backend.config.js'),
  });
  const lintResults = await eslint.lintFiles(walkFiles(join(tempDir, 'src')));
  return lintResults.reduce((sum, file) => sum + file.errorCount, 0);
}

describe('backend generators L-gen', () => {
  it('endpoint output matches snapshot and passes eslint', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'jig-endpoint-gen-'));

    try {
      const result = await runGenerator(
        'endpoint',
        { slice: 'billing', name: 'create-invoice' },
        tempDir,
      );

      expect(result.failures).toHaveLength(0);

      const endpointPath = join(tempDir, 'src/slices/billing/endpoints/create-invoice-endpoint.ts');

      expect(readFileSync(endpointPath, 'utf8')).toMatchSnapshot('endpoint.ts');

      expect(await lintGeneratedFiles(tempDir)).toBe(0);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('usecase output matches snapshot and passes eslint', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'jig-usecase-gen-'));

    try {
      const result = await runGenerator(
        'usecase',
        { slice: 'billing', name: 'create-invoice' },
        tempDir,
      );

      expect(result.failures).toHaveLength(0);

      const usecasePath = join(tempDir, 'src/slices/billing/usecases/create-invoice-usecase.ts');

      expect(readFileSync(usecasePath, 'utf8')).toMatchSnapshot('usecase.ts');

      expect(await lintGeneratedFiles(tempDir)).toBe(0);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('backend-slice creates all layer folders', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'jig-backend-slice-gen-'));

    try {
      const result = await runGenerator('backend-slice', { slice: 'billing' }, tempDir);

      expect(result.failures).toHaveLength(0);

      for (const layer of BACKEND_SLICE_LAYERS) {
        expect(existsSync(join(tempDir, 'src/slices/billing', layer, '.gitkeep'))).toBe(true);
      }
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
