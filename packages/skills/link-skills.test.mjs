import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { linkSkills, linkSkillsForProject, loadAgentRoots } from './scripts/link-skills.mjs';
import { syncSkills } from './scripts/sync-skills.mjs';

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
