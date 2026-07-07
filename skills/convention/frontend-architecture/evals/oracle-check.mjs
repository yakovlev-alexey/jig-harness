#!/usr/bin/env node
/**
 * Structural oracle for frontend-architecture L2 application evals.
 * Exit 0 = pass, 1 = fail. Used by evals/l2-2026-07-07.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.join(__dirname, 'l2-fixtures');

function walk(dir, pred, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, pred, acc);
    else if (pred(full, entry.name)) acc.push(full);
  }
  return acc;
}

function fail(checks, name, ok, detail) {
  checks.push({ name, ok, detail });
}

function checkCase1(root, checks) {
  const base = path.join(fixturesRoot, root, 'src');
  const commonHelper = path.join(base, 'common/utils/format-currency.ts');
  fail(checks, 'helper in common/', fs.existsSync(commonHelper), commonHelper);

  const tsFiles = walk(base, (_, name) => name.endsWith('.ts') || name.endsWith('.tsx'));
  const indexFiles = tsFiles.filter((f) => /[/\\]index\.tsx?$/.test(f));
  fail(
    checks,
    'no index.ts barrels (fe-no-index)',
    indexFiles.length === 0,
    indexFiles.join(', ') || 'none',
  );

  const reexportOnly = tsFiles.filter((f) => {
    const body = fs.readFileSync(f, 'utf8').trim();
    return /^export\s+\{[^}]+\}\s+from\s+['"]/.test(body) && !body.includes('\n');
  });
  fail(
    checks,
    'no re-export-only modules (fe-no-reexport)',
    reexportOnly.length === 0,
    reexportOnly.join(', ') || 'none',
  );

  const crossSlice = tsFiles.filter((f) => {
    const body = fs.readFileSync(f, 'utf8');
    const m = f.replace(/\\/g, '/').match(/slices\/([^/]+)\//);
    if (!m) return false;
    const slice = m[1];
    return [...body.matchAll(/from\s+['"]([^'"]+)['"]/g)].some(([, imp]) => {
      const sm = imp.match(/slices\/([^/]+)\//);
      if (sm) return sm[1] !== slice;
      if (!imp.startsWith('.')) return false;
      const resolved = path.resolve(path.dirname(f), imp).replace(/\\/g, '/');
      const target = resolved.match(/slices\/([^/]+)\//);
      return target && target[1] !== slice;
    });
  });
  fail(
    checks,
    'no cross-slice imports (fe-no-cross-slice-imports)',
    crossSlice.length === 0,
    crossSlice.join(', ') || 'none',
  );
}

function checkCase2(root, checks) {
  const base = path.join(fixturesRoot, root, 'src/slices/landing/components');
  const dirs = fs.existsSync(base)
    ? fs.readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory())
    : [];
  fail(
    checks,
    'exactly one component folder',
    dirs.length === 1,
    dirs.map((d) => d.name).join(', '),
  );

  const folder = dirs[0]?.name ?? '';
  fail(
    checks,
    'kebab-case folder (fe-kebab-case)',
    /^[a-z0-9]+(-[a-z0-9]+)*$/.test(folder),
    folder,
  );

  const componentFile = path.join(base, folder, `${folder}.tsx`);
  fail(checks, 'component file matches folder name', fs.existsSync(componentFile), componentFile);

  const body = fs.existsSync(componentFile) ? fs.readFileSync(componentFile, 'utf8') : '';
  fail(
    checks,
    'named export (fe-named-exports)',
    /export\s+function\s+[A-Z]/.test(body) && !/export\s+default/.test(body),
    body.slice(0, 120),
  );

  const indexFiles = walk(base, (_, name) => name === 'index.ts' || name === 'index.tsx');
  fail(
    checks,
    'no index.ts (fe-no-index)',
    indexFiles.length === 0,
    indexFiles.join(', ') || 'none',
  );
}

const scenario = process.argv[2];
const runners = {
  'case1-with-skill': (checks) => checkCase1('case1-with-skill', checks),
  'case1-without-skill': (checks) => checkCase1('case1-without-skill', checks),
  'case2-with-skill': (checks) => checkCase2('case2-with-skill', checks),
  'case2-without-skill': (checks) => checkCase2('case2-without-skill', checks),
};

if (!scenario || !runners[scenario]) {
  console.error(
    'Usage: node oracle-check.mjs <case1-with-skill|case1-without-skill|case2-with-skill|case2-without-skill>',
  );
  process.exit(2);
}

const checks = [];
runners[scenario](checks);
for (const check of checks) {
  console.log(
    `${check.ok ? 'PASS' : 'FAIL'} ${check.name}${check.detail ? `: ${check.detail}` : ''}`,
  );
}
process.exit(checks.every((c) => c.ok) ? 0 : 1);
