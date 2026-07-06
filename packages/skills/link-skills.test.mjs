import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { linkSkills, linkSkillsForProject, loadAgentRoots, validateAgentRoots } from './scripts/link-skills.mjs';
import { manifestFromSkillsRoot, syncSkills } from './scripts/sync-skills.mjs';

const envBackup = { ...process.env };
const tempDirs = [];

afterEach(() => {
  process.env = { ...envBackup };
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function makeTemp(prefix) {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

function setupProjectWithSkills() {
  const skillsRoot = makeTemp('jig-link-src-');
  const projectRoot = makeTemp('jig-link-proj-');
  const packageRoot = makeTemp('jig-link-pkg-');
  const bundledDir = join(packageRoot, 'bundled');
  const manifestPath = join(packageRoot, 'skills.manifest.json');

  mkdirSync(join(skillsRoot, 'workflow', 'setup-project'), { recursive: true });
  writeFileSync(
    join(skillsRoot, 'workflow', 'setup-project', 'SKILL.md'),
    `---
name: setup-project
description: Use when testing link
---

# Setup
`,
  );

  syncSkills({ skillsRoot, bundledDir, manifestPath });

  writeFileSync(
    join(projectRoot, 'package.json'),
    JSON.stringify(
      {
        name: 'test-app',
        devDependencies: {
          '@jig-harness/skills': 'workspace:*',
        },
      },
      null,
      2,
    ),
  );

  return { projectRoot, packageRoot, bundledDir, manifestPath };
}

test('linkSkillsForProject creates symlinks under default agent roots', () => {
  const { projectRoot, packageRoot, bundledDir, manifestPath } = setupProjectWithSkills();

  const result = linkSkillsForProject(projectRoot, {
    packageRoot,
    bundledDir,
    manifestPath,
    agentRoots: ['.cursor'],
  });

  const linkPath = join(projectRoot, '.cursor', 'skills', 'setup-project', 'SKILL.md');
  assert.ok(existsSync(linkPath));
  assert.ok(result.links.some((l) => l.action === 'linked'));

  const stat = lstatSync(join(projectRoot, '.cursor', 'skills', 'setup-project'));
  assert.ok(stat.isSymbolicLink());
});

test('linkSkillsForProject is idempotent on second run', () => {
  const { projectRoot, packageRoot, bundledDir, manifestPath } = setupProjectWithSkills();

  linkSkillsForProject(projectRoot, {
    packageRoot,
    bundledDir,
    manifestPath,
    agentRoots: ['.cursor'],
  });
  const second = linkSkillsForProject(projectRoot, {
    packageRoot,
    bundledDir,
    manifestPath,
    agentRoots: ['.cursor'],
  });

  assert.ok(second.links.every((l) => l.action === 'noop'));
});

test('linkSkillsForProject skips existing user directory', () => {
  const { projectRoot, packageRoot, bundledDir, manifestPath } = setupProjectWithSkills();

  const userDir = join(projectRoot, '.cursor', 'skills', 'setup-project');
  mkdirSync(userDir, { recursive: true });
  writeFileSync(join(userDir, 'SKILL.md'), '# user owned');

  const result = linkSkillsForProject(projectRoot, {
    packageRoot,
    bundledDir,
    manifestPath,
    agentRoots: ['.cursor'],
  });

  assert.equal(readFileSync(join(userDir, 'SKILL.md'), 'utf8'), '# user owned');
  assert.ok(result.warnings.some((w) => w.includes('Skipping')));
});

test('linkSkills respects JIG_SKIP_SKILLS_LINK', () => {
  process.env.JIG_SKIP_SKILLS_LINK = '1';
  const result = linkSkills();
  assert.equal(result.skipped, true);
});

test('loadAgentRoots respects JIG_SKILLS_AGENTS', () => {
  process.env.JIG_SKILLS_AGENTS = '.cursor,.codex';
  assert.deepEqual(loadAgentRoots('/tmp'), ['.cursor', '.codex']);
});

test('loadAgentRoots reads .jig-skills.json', () => {
  delete process.env.JIG_SKILLS_AGENTS;
  const projectRoot = makeTemp('jig-link-config-');
  writeFileSync(join(projectRoot, '.jig-skills.json'), JSON.stringify({ agents: ['.agents'] }));
  assert.deepEqual(loadAgentRoots(projectRoot), ['.agents']);
});

test('validateAgentRoots rejects absolute paths', () => {
  assert.throws(
    () => validateAgentRoots('/tmp/project', ['/etc/passwd']),
    /must be relative to project root/,
  );
});

test('validateAgentRoots rejects paths outside project root', () => {
  const projectRoot = makeTemp('jig-link-validate-');
  assert.throws(
    () => validateAgentRoots(projectRoot, ['../outside']),
    /must stay within project root/,
  );
});

test('linkSkillsForProject rejects traversal agent roots from config', () => {
  const { projectRoot, packageRoot, bundledDir, manifestPath } = setupProjectWithSkills();
  writeFileSync(
    join(projectRoot, '.jig-skills.json'),
    JSON.stringify({ agents: ['../outside'] }),
  );

  assert.throws(
    () =>
      linkSkillsForProject(projectRoot, {
        packageRoot,
        bundledDir,
        manifestPath,
      }),
    /must stay within project root/,
  );
});

test('linkSkillsForProject links canonical skills without bundled/', () => {
  const skillsRoot = makeTemp('jig-link-canonical-src-');
  const projectRoot = makeTemp('jig-link-canonical-proj-');
  const packageRoot = makeTemp('jig-link-canonical-pkg-');

  mkdirSync(join(skillsRoot, 'workflow', 'setup-project'), { recursive: true });
  writeFileSync(
    join(skillsRoot, 'workflow', 'setup-project', 'SKILL.md'),
    `---
name: setup-project
description: Use when testing canonical link
---

# Setup
`,
  );

  const manifest = manifestFromSkillsRoot(skillsRoot);
  const result = linkSkillsForProject(projectRoot, {
    packageRoot,
    manifest,
    source: 'canonical',
    skillsRoot,
    agentRoots: ['.cursor'],
  });

  const linkPath = join(projectRoot, '.cursor', 'skills', 'setup-project');
  assert.ok(existsSync(join(linkPath, 'SKILL.md')));
  assert.equal(result.source, 'canonical');
  assert.ok(result.links.some((l) => l.action === 'linked'));
  assert.equal(
    resolve(realpathSync(linkPath)),
    resolve(realpathSync(join(skillsRoot, 'workflow', 'setup-project'))),
  );
});

test('linkSkillsForProject relinks bundled symlinks to canonical source', () => {
  const repoRoot = makeTemp('jig-relink-repo-');
  const skillsRoot = join(repoRoot, 'skills');
  const projectRoot = repoRoot;
  const packageRoot = makeTemp('jig-relink-pkg-');
  const bundledDir = join(packageRoot, 'bundled');
  const manifestPath = join(packageRoot, 'skills.manifest.json');

  mkdirSync(join(skillsRoot, 'workflow', 'setup-project'), { recursive: true });
  writeFileSync(
    join(skillsRoot, 'workflow', 'setup-project', 'SKILL.md'),
    `---
name: setup-project
description: Use when testing relink
---

# Canonical
`,
  );
  writeFileSync(join(repoRoot, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');

  syncSkills({ skillsRoot, bundledDir, manifestPath });

  linkSkillsForProject(projectRoot, {
    packageRoot,
    bundledDir,
    manifestPath,
    agentRoots: ['.cursor'],
    source: 'bundled',
  });

  const linkPath = join(projectRoot, '.cursor', 'skills', 'setup-project');
  assert.ok(realpathSync(linkPath).includes('bundled'));

  writeFileSync(
    join(skillsRoot, 'workflow', 'setup-project', 'SKILL.md'),
    `---
name: setup-project
description: Use when testing relink
---

# Canonical updated
`,
  );

  const result = linkSkillsForProject(projectRoot, {
    packageRoot,
    manifest: manifestFromSkillsRoot(skillsRoot),
    source: 'canonical',
    skillsRoot,
    agentRoots: ['.cursor'],
  });

  assert.ok(result.links.some((l) => l.action === 'relinked'));
  assert.equal(
    resolve(realpathSync(linkPath)),
    resolve(realpathSync(join(skillsRoot, 'workflow', 'setup-project'))),
  );
  assert.match(readFileSync(join(linkPath, 'SKILL.md'), 'utf8'), /Canonical updated/);
});
