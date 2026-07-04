import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import nodePlop from 'node-plop';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const packageRoot = dirname(fileURLToPath(import.meta.url));
const generatorsRoot = join(packageRoot, '..');

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
  const eslint = new ESLint({ cwd: generatorsRoot });
  const lintResults = await eslint.lintFiles(walkFiles(join(tempDir, 'src')));
  return lintResults.reduce((sum, file) => sum + file.errorCount, 0);
}

describe('generators L-gen', () => {
  it('component output matches snapshot and passes eslint', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'jig-component-gen-'));

    try {
      const result = await runGenerator('component', { slice: 'demo', name: 'demo-card' }, tempDir);

      expect(result.failures).toHaveLength(0);

      const tsxPath = join(tempDir, 'src/slices/demo/components/demo-card/demo-card.tsx');
      const cssPath = join(tempDir, 'src/slices/demo/components/demo-card/demo-card.css');

      expect(readFileSync(tsxPath, 'utf8')).toMatchSnapshot('component.tsx');
      expect(readFileSync(cssPath, 'utf8')).toMatchSnapshot('component.css');

      expect(await lintGeneratedFiles(tempDir)).toBe(0);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('widget output matches snapshot and passes eslint', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'jig-widget-gen-'));

    try {
      const result = await runGenerator('widget', { slice: 'demo', name: 'stats-panel' }, tempDir);

      expect(result.failures).toHaveLength(0);

      const widgetPath = join(
        tempDir,
        'src/slices/demo/widgets/stats-panel/stats-panel.widget.tsx',
      );

      expect(readFileSync(widgetPath, 'utf8')).toMatchSnapshot('widget.tsx');

      expect(await lintGeneratedFiles(tempDir)).toBe(0);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
