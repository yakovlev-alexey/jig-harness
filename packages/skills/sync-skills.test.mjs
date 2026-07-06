import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { discoverSkills, syncSkills } from './scripts/sync-skills.mjs';

function writeSkill(skillsRoot, tier, folder, name) {
  const dir = join(skillsRoot, tier, folder);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'SKILL.md'),
    `---
name: ${name}
description: Use when testing sync
---

# ${name}
`,
  );
}

test('syncSkills copies SKILL.md and references, excludes evals', () => {
  const skillsRoot = mkdtempSync(join(tmpdir(), 'jig-skills-src-'));
  const outRoot = mkdtempSync(join(tmpdir(), 'jig-skills-out-'));
  const bundledDir = join(outRoot, 'bundled');
  const manifestPath = join(outRoot, 'skills.manifest.json');

  writeSkill(skillsRoot, 'workflow', 'demo-skill', 'demo-skill');
  mkdirSync(join(skillsRoot, 'workflow', 'demo-skill', 'references'), { recursive: true });
  writeFileSync(join(skillsRoot, 'workflow', 'demo-skill', 'references', 'extra.md'), '# extra');
  mkdirSync(join(skillsRoot, 'workflow', 'demo-skill', 'evals'), { recursive: true });
  writeFileSync(join(skillsRoot, 'workflow', 'demo-skill', 'evals', 'trigger_evals.json'), '[]');

  const { manifest } = syncSkills({ skillsRoot, bundledDir, manifestPath });

  assert.equal(manifest.length, 1);
  assert.equal(manifest[0].name, 'demo-skill');
  assert.ok(existsSync(join(bundledDir, 'workflow', 'demo-skill', 'SKILL.md')));
  assert.ok(existsSync(join(bundledDir, 'workflow', 'demo-skill', 'references', 'extra.md')));
  assert.equal(existsSync(join(bundledDir, 'workflow', 'demo-skill', 'evals')), false);

  rmSync(skillsRoot, { recursive: true, force: true });
  rmSync(outRoot, { recursive: true, force: true });
});

test('syncSkills fails on duplicate skill names', () => {
  const skillsRoot = mkdtempSync(join(tmpdir(), 'jig-skills-dup-'));
  const outRoot = mkdtempSync(join(tmpdir(), 'jig-skills-dup-out-'));

  writeSkill(skillsRoot, 'workflow', 'one', 'same-name');
  writeSkill(skillsRoot, 'convention', 'two', 'same-name');

  assert.throws(
    () =>
      syncSkills({
        skillsRoot,
        bundledDir: join(outRoot, 'bundled'),
        manifestPath: join(outRoot, 'manifest.json'),
      }),
    /Duplicate skill name/,
  );

  rmSync(skillsRoot, { recursive: true, force: true });
  rmSync(outRoot, { recursive: true, force: true });
});

test('discoverSkills finds repo skills when run from package', () => {
  const skills = discoverSkills();
  assert.ok(skills.length >= 10);
  assert.ok(skills.some((s) => s.name === 'setup-project'));
});
