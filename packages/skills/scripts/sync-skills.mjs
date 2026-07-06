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
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(__dirname, '..');
const DEFAULT_SKILLS_ROOT = resolve(PACKAGE_ROOT, '../../skills');
const BUNDLED_DIR = join(PACKAGE_ROOT, 'bundled');
const MANIFEST_PATH = join(PACKAGE_ROOT, 'skills.manifest.json');
const TIERS = ['workflow', 'convention'];

export function parseSkillName(skillMdPath) {
  const content = readFileSync(skillMdPath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    throw new Error(`${skillMdPath}: missing YAML frontmatter`);
  }
  const nameMatch = match[1].match(/^name:\s*(.+)$/m);
  if (!nameMatch) {
    throw new Error(`${skillMdPath}: missing name in frontmatter`);
  }
  return nameMatch[1].trim();
}

export function discoverSkills(skillsRoot = DEFAULT_SKILLS_ROOT) {
  const skills = [];

  for (const tier of TIERS) {
    const tierDir = join(skillsRoot, tier);
    if (!existsSync(tierDir)) continue;

    for (const folder of readdirSync(tierDir)) {
      const skillDir = join(tierDir, folder);
      if (!statSync(skillDir).isDirectory()) continue;

      const skillMd = join(skillDir, 'SKILL.md');
      if (!existsSync(skillMd)) continue;

      skills.push({
        name: parseSkillName(skillMd),
        tier,
        folder,
        sourcePath: skillDir,
        bundledPath: join(BUNDLED_DIR, tier, folder),
        bundledRelative: `${tier}/${folder}`,
      });
    }
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

function copySkillDir(sourcePath, destPath) {
  rmSync(destPath, { recursive: true, force: true });
  mkdirSync(destPath, { recursive: true });

  for (const entry of readdirSync(sourcePath)) {
    if (entry === 'evals') continue;

    const src = join(sourcePath, entry);
    const dest = join(destPath, entry);
    if (statSync(src).isDirectory()) {
      cpSync(src, dest, { recursive: true });
    } else {
      cpSync(src, dest);
    }
  }
}

export function syncSkills(options = {}) {
  const skillsRoot = options.skillsRoot ?? DEFAULT_SKILLS_ROOT;
  const bundledDir = options.bundledDir ?? BUNDLED_DIR;
  const manifestPath = options.manifestPath ?? MANIFEST_PATH;

  if (!existsSync(skillsRoot)) {
    throw new Error(`Skills source not found: ${skillsRoot}`);
  }

  const skills = discoverSkills(skillsRoot);
  if (skills.length === 0) {
    throw new Error(`No skills found under ${skillsRoot}`);
  }

  const names = new Set();
  for (const skill of skills) {
    if (names.has(skill.name)) {
      throw new Error(`Duplicate skill name "${skill.name}"`);
    }
    names.add(skill.name);
  }

  rmSync(bundledDir, { recursive: true, force: true });
  mkdirSync(bundledDir, { recursive: true });

  const manifest = [];

  for (const skill of skills) {
    const destPath = join(bundledDir, skill.tier, skill.folder);
    copySkillDir(skill.sourcePath, destPath);

    if (existsSync(join(destPath, 'evals'))) {
      throw new Error(`evals/ must not be bundled for ${skill.name}`);
    }

    manifest.push({
      name: skill.name,
      tier: skill.tier,
      folder: skill.folder,
      path: `${skill.tier}/${skill.folder}`,
    });
  }

  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  return { skills, manifest, bundledDir, manifestPath };
}

export function manifestFromSkillsRoot(skillsRoot = DEFAULT_SKILLS_ROOT) {
  return discoverSkills(skillsRoot).map((skill) => ({
    name: skill.name,
    tier: skill.tier,
    folder: skill.folder,
    path: skill.bundledRelative,
    sourcePath: skill.sourcePath,
  }));
}

function isMain(moduleUrl) {
  if (!process.argv[1]) return false;
  return resolve(process.argv[1]) === fileURLToPath(moduleUrl);
}

if (isMain(import.meta.url)) {
  const { manifest } = syncSkills();
  console.log(
    `sync-skills: bundled ${manifest.length} skills to ${relative(PACKAGE_ROOT, BUNDLED_DIR)}/`,
  );
}
