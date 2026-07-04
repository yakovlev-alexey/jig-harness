#!/usr/bin/env node
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parse as parseYaml } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = resolve(__dirname, '../../..');
const TEMPLATE_DIR = join(MONOREPO_ROOT, 'templates/fullstack');
const PACKAGES_DIR = join(MONOREPO_ROOT, 'packages');
const HARNESS_PACKAGES = [
  '@jig-harness/tsconfig',
  '@jig-harness/prettier-config',
  '@jig-harness/eslint-plugin',
  '@jig-harness/eslint-config',
  '@jig-harness/stylelint-config',
  '@jig-harness/generators',
];

function parseArgs(argv) {
  const args = { targetDir: null, skipGit: false, skipInstall: false, tarballsDir: null };
  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--skip-git') args.skipGit = true;
    else if (arg === '--skip-install') args.skipInstall = true;
    else if (arg === '--tarballs-dir') args.tarballsDir = argv[++i];
    else if (arg.startsWith('--')) throw new Error(`Unknown flag: ${arg}`);
    else positional.push(arg);
  }

  if (positional.length === 0) {
    console.error(
      'Usage: create-jig-harness-app <project-name> [--tarballs-dir <dir>] [--skip-git] [--skip-install]',
    );
    process.exit(1);
  }

  args.targetDir = resolve(process.cwd(), positional[0]);
  return args;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

function loadCatalog(workspaceYamlPath) {
  const content = readFileSync(workspaceYamlPath, 'utf8');
  const doc = parseYaml(content);
  return doc.catalog ?? {};
}

function loadHarnessVersions() {
  const versions = {};
  for (const dir of readdirSync(PACKAGES_DIR)) {
    const pkgPath = join(PACKAGES_DIR, dir, 'package.json');
    if (!existsSync(pkgPath)) continue;
    const pkg = readJson(pkgPath);
    if (pkg.name?.startsWith('@jig-harness/')) {
      versions[pkg.name] = pkg.version;
    }
  }
  return versions;
}

function findTarball(tarballsDir, packageName) {
  const files = readdirSync(tarballsDir);
  const scoped = packageName.replace('@', '').replace('/', '-');
  const match = files.find((f) => f.startsWith(scoped) && f.endsWith('.tgz'));
  if (!match) throw new Error(`No tarball found for ${packageName} in ${tarballsDir}`);
  return join(tarballsDir, match);
}

function rewriteDeps(obj, { catalog, harnessVersions, tarballsDir, targetDir }) {
  if (!obj || typeof obj !== 'object') return;

  for (const section of [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ]) {
    const deps = obj[section];
    if (!deps) continue;

    for (const [name, spec] of Object.entries(deps)) {
      if (typeof spec !== 'string') continue;

      if (spec === 'workspace:*' && name.startsWith('@jig-harness/')) {
        if (tarballsDir) {
          const tarball = findTarball(tarballsDir, name);
          deps[name] = `file:${tarball}`;
        } else {
          deps[name] = `^${harnessVersions[name] ?? '0.0.0'}`;
        }
        continue;
      }

      if (spec === 'workspace:*' && name.startsWith('@app/')) {
        deps[name] = 'workspace:*';
        continue;
      }

      if (spec.startsWith('catalog:')) {
        const key = spec.slice('catalog:'.length);
        const version = catalog[key] ?? catalog[name];
        if (!version) throw new Error(`No catalog entry for ${name} (${spec})`);
        deps[name] = version;
      }
    }
  }
}

function walkAndRewrite(dir, context) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === '.turbo') continue;
      walkAndRewrite(full, context);
      continue;
    }
    if (entry === 'package.json') {
      const pkg = readJson(full);
      rewriteDeps(pkg, context);
      writeJson(full, pkg);
    }
    if (entry === 'pnpm-workspace.yaml') {
      let content = readFileSync(full, 'utf8');
      content = content.replace(/^catalog:[\s\S]*/m, '').trimEnd();
      writeFileSync(full, `${content}\n`);
    }
  }
}

function copyTemplate(targetDir) {
  if (existsSync(targetDir)) {
    throw new Error(`Target directory already exists: ${targetDir}`);
  }
  mkdirSync(dirname(targetDir), { recursive: true });
  cpSync(TEMPLATE_DIR, targetDir, { recursive: true });
}

function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const catalog = loadCatalog(join(TEMPLATE_DIR, 'pnpm-workspace.yaml'));
  const harnessVersions = loadHarnessVersions();

  console.log(`Scaffolding project in ${args.targetDir}...`);
  copyTemplate(args.targetDir);

  const context = {
    catalog,
    harnessVersions,
    tarballsDir: args.tarballsDir ? resolve(args.tarballsDir) : null,
    targetDir: args.targetDir,
  };

  walkAndRewrite(args.targetDir, context);

  const rootPkg = readJson(join(args.targetDir, 'package.json'));
  rootPkg.name = basename(args.targetDir);

  if (args.tarballsDir) {
    const localTarballs = join(args.targetDir, '.jig-tarballs');
    mkdirSync(localTarballs, { recursive: true });
    const overrides = {};
    for (const pkgName of HARNESS_PACKAGES) {
      const tarball = findTarball(args.tarballsDir, pkgName);
      const dest = join(localTarballs, basename(tarball));
      cpSync(tarball, dest);
      overrides[pkgName] = `file:${dest}`;
    }
    rootPkg.pnpm = { ...rootPkg.pnpm, overrides };
  }

  writeJson(join(args.targetDir, 'package.json'), rootPkg);

  if (!args.skipInstall) {
    console.log('Installing dependencies...');
    run('pnpm', ['install'], args.targetDir);
  }

  if (!args.skipGit) {
    console.log('Initializing git repository...');
    run('git', ['init'], args.targetDir);
  }

  console.log(`Done! Next steps:\n  cd ${basename(args.targetDir)}\n  pnpm verify`);
}

main();
