import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { manifestFromSkillsRoot, syncSkills } from './sync-skills.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(__dirname, '..');
const BUNDLED_DIR = join(PACKAGE_ROOT, 'bundled');
const MANIFEST_PATH = join(PACKAGE_ROOT, 'skills.manifest.json');
const DEFAULT_AGENTS = ['.cursor', '.codex', '.claude', '.agents'];
const SKIP_DIRS = new Set(['node_modules', 'dist', '.turbo', '.git', 'bundled']);

export function packageDeclaresSkills(dir) {
  const pkgPath = join(dir, 'package.json');
  if (!existsSync(pkgPath)) return false;

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.optionalDependencies,
  };
  return Object.prototype.hasOwnProperty.call(deps, '@jig-harness/skills');
}

export function findRepoRoot(startDir) {
  let dir = resolve(startDir);
  while (dir !== dirname(dir)) {
    if (
      existsSync(join(dir, 'skills', 'workflow')) &&
      existsSync(join(dir, 'pnpm-workspace.yaml'))
    ) {
      return dir;
    }
    dir = dirname(dir);
  }
  return null;
}

function walkForConsumers(rootDir, consumers, seen) {
  let entries;
  try {
    entries = readdirSync(rootDir);
  } catch {
    return;
  }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(rootDir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (!st.isDirectory()) continue;

    if (existsSync(join(full, 'package.json')) && packageDeclaresSkills(full)) {
      const key = resolve(full);
      if (!seen.has(key)) {
        seen.add(key);
        consumers.push(full);
      }
    }

    walkForConsumers(full, consumers, seen);
  }
}

export function findLinkRoots(options = {}) {
  const packageRoot = options.packageRoot ?? PACKAGE_ROOT;
  const initCwd = options.initCwd ?? process.env.INIT_CWD;
  const roots = [];
  const seen = new Set();

  if (initCwd) {
    const cwd = resolve(initCwd);
    if (packageDeclaresSkills(cwd)) {
      seen.add(cwd);
      roots.push(cwd);
    }

    const repoRoot = findRepoRoot(cwd) ?? findRepoRoot(packageRoot);
    if (repoRoot) {
      walkForConsumers(repoRoot, roots, seen);
    }
  }

  if (roots.length === 0) {
    let dir = process.cwd();
    while (dir !== dirname(dir)) {
      if (packageDeclaresSkills(dir)) {
        const key = resolve(dir);
        if (!seen.has(key)) {
          roots.push(dir);
        }
        break;
      }
      dir = dirname(dir);
    }
  }

  return roots;
}

export function loadAgentRoots(projectRoot) {
  if (process.env.JIG_SKILLS_AGENTS) {
    return process.env.JIG_SKILLS_AGENTS.split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const configPath = join(projectRoot, '.jig-skills.json');
  if (existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    if (Array.isArray(config.agents) && config.agents.length > 0) {
      return config.agents;
    }
  }

  return DEFAULT_AGENTS;
}

export function loadManifest(manifestPath = MANIFEST_PATH, bundledDir = BUNDLED_DIR) {
  if (existsSync(manifestPath)) {
    return JSON.parse(readFileSync(manifestPath, 'utf8'));
  }

  const manifest = [];
  for (const tier of ['workflow', 'convention']) {
    const tierDir = join(bundledDir, tier);
    if (!existsSync(tierDir)) continue;
    for (const folder of readdirSync(tierDir)) {
      const skillMd = join(tierDir, folder, 'SKILL.md');
      if (!existsSync(skillMd)) continue;
      const content = readFileSync(skillMd, 'utf8');
      const nameMatch = content.match(/^name:\s*(.+)$/m);
      manifest.push({
        name: nameMatch?.[1]?.trim() ?? folder,
        tier,
        folder,
        path: `${tier}/${folder}`,
      });
    }
  }
  return manifest;
}

function resolveBundledPath(projectRoot, packageRoot, manifestEntry) {
  const hoisted = join(
    projectRoot,
    'node_modules',
    '@jig-harness',
    'skills',
    'bundled',
    manifestEntry.path,
  );
  if (existsSync(hoisted)) return hoisted;

  const localBundled = join(packageRoot, 'bundled', manifestEntry.path);
  if (existsSync(localBundled)) return localBundled;

  return localBundled;
}

function resolveSkillPath(projectRoot, packageRoot, entry, source) {
  if (source === 'canonical' && entry.sourcePath) {
    return resolve(entry.sourcePath);
  }
  return resolve(resolveBundledPath(projectRoot, packageRoot, entry));
}

function isManagedSkillTarget(resolvedPath) {
  const normalized = resolve(resolvedPath).replace(/\\/g, '/');
  return (
    /\/bundled\/(workflow|convention)\//.test(normalized) ||
    /\/skills\/(workflow|convention)\//.test(normalized) ||
    normalized.includes('@jig-harness/skills/bundled')
  );
}

function createDirSymlink(target, linkPath) {
  mkdirSync(dirname(linkPath), { recursive: true });
  rmSync(linkPath, { recursive: true, force: true });
  const relTarget = relative(dirname(linkPath), target);
  const type = process.platform === 'win32' ? 'junction' : 'dir';
  symlinkSync(relTarget, linkPath, type);
}

export function linkSkillsForProject(projectRoot, options = {}) {
  const packageRoot = options.packageRoot ?? PACKAGE_ROOT;
  const bundledDir = options.bundledDir ?? BUNDLED_DIR;
  const manifestPath = options.manifestPath ?? MANIFEST_PATH;
  const source = options.source ?? 'bundled';
  const agentRoots = options.agentRoots ?? loadAgentRoots(projectRoot);
  const manifest =
    options.manifest ??
    (source === 'canonical' && options.skillsRoot
      ? manifestFromSkillsRoot(options.skillsRoot)
      : loadManifest(manifestPath, bundledDir));

  const links = [];
  const warnings = [];

  for (const agentRoot of agentRoots) {
    for (const entry of manifest) {
      const linkPath = join(projectRoot, agentRoot, 'skills', entry.name);
      const skillPath = resolveSkillPath(projectRoot, packageRoot, entry, source);

      if (!existsSync(skillPath)) {
        warnings.push(`Missing skill "${entry.name}" at ${skillPath}`);
        continue;
      }

      if (existsSync(linkPath)) {
        try {
          const stat = lstatSync(linkPath);
          if (stat.isSymbolicLink()) {
            const currentTarget = resolve(dirname(linkPath), readlinkSync(linkPath));
            if (currentTarget === skillPath) {
              links.push({
                agentRoot,
                skill: entry.name,
                linkPath,
                skillPath,
                source,
                action: 'noop',
              });
              continue;
            }
            if (isManagedSkillTarget(currentTarget)) {
              createDirSymlink(skillPath, linkPath);
              links.push({
                agentRoot,
                skill: entry.name,
                linkPath,
                skillPath,
                source,
                action: 'relinked',
              });
              continue;
            }
            warnings.push(`Skipping ${linkPath}: symlink not managed by @jig-harness/skills`);
            continue;
          }
          warnings.push(`Skipping ${linkPath}: path exists and is not a managed symlink`);
          continue;
        } catch {
          warnings.push(`Skipping ${linkPath}: unable to inspect existing path`);
          continue;
        }
      }

      createDirSymlink(skillPath, linkPath);
      links.push({
        agentRoot,
        skill: entry.name,
        linkPath,
        skillPath,
        source,
        action: 'linked',
      });
    }
  }

  const statePath = join(projectRoot, '.jig-skills-linked.json');
  writeFileSync(
    statePath,
    `${JSON.stringify(
      {
        version: options.version ?? readPackageVersion(packageRoot),
        source,
        linkedAt: new Date().toISOString(),
        agentRoots,
        links: links.map(
          ({ agentRoot, skill, linkPath, skillPath, source: linkSource, action }) => ({
            agentRoot,
            skill,
            linkPath,
            skillPath,
            source: linkSource,
            action,
          }),
        ),
      },
      null,
      2,
    )}\n`,
  );

  return { links, warnings, statePath, source, manifest };
}

function readPackageVersion(packageRoot) {
  try {
    const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

export function linkSkills(options = {}) {
  if (process.env.JIG_SKIP_SKILLS_LINK === '1') {
    return { skipped: true, projects: [] };
  }

  const packageRoot = options.packageRoot ?? PACKAGE_ROOT;
  const bundledDir = options.bundledDir ?? BUNDLED_DIR;

  if (!existsSync(bundledDir) || readdirSync(bundledDir).length === 0) {
    const repoRoot = findRepoRoot(packageRoot);
    if (repoRoot && existsSync(join(repoRoot, 'skills'))) {
      syncSkills({ skillsRoot: join(repoRoot, 'skills'), bundledDir, manifestPath: MANIFEST_PATH });
    } else if (!options.allowMissingBundled) {
      console.warn('@jig-harness/skills: bundled/ missing — skipping link');
      return { skipped: true, projects: [] };
    }
  }

  const projects = findLinkRoots({ packageRoot, initCwd: options.initCwd });
  if (projects.length === 0) {
    return { skipped: false, projects: [] };
  }

  const results = [];
  for (const projectRoot of projects) {
    const result = linkSkillsForProject(projectRoot, {
      packageRoot,
      bundledDir,
      source: 'bundled',
    });
    for (const warning of result.warnings) {
      console.warn(`@jig-harness/skills: ${warning}`);
    }
    results.push({ projectRoot, ...result });
  }

  return { skipped: false, projects: results };
}

export function linkSkillsDogfood(options = {}) {
  const packageRoot = options.packageRoot ?? PACKAGE_ROOT;
  const repoRoot =
    options.repoRoot ??
    findRepoRoot(options.initCwd ?? process.env.INIT_CWD ?? process.cwd()) ??
    findRepoRoot(packageRoot);

  if (!repoRoot) {
    throw new Error('@jig-harness/skills: dogfood link requires jig-harness monorepo');
  }

  const skillsRoot = join(repoRoot, 'skills');
  if (!existsSync(skillsRoot)) {
    throw new Error(`@jig-harness/skills: canonical skills/ not found at ${skillsRoot}`);
  }

  const manifest = manifestFromSkillsRoot(skillsRoot);
  const projectRoot = options.projectRoot ?? repoRoot;

  const result = linkSkillsForProject(projectRoot, {
    packageRoot,
    manifest,
    source: 'canonical',
    skillsRoot,
  });

  for (const warning of result.warnings) {
    console.warn(`@jig-harness/skills: ${warning}`);
  }

  console.log(
    `@jig-harness/skills: dogfood linked ${manifest.length} skills from ${skillsRoot} → ${projectRoot}`,
  );

  return { repoRoot, projectRoot, skillsRoot, ...result };
}

function isMain(moduleUrl) {
  if (!process.argv[1]) return false;
  return resolve(process.argv[1]) === fileURLToPath(moduleUrl);
}

if (isMain(import.meta.url)) {
  linkSkills();
}
