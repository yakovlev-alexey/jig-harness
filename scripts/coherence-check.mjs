#!/usr/bin/env node
/**
 * Coherence check: custom ESLint rules ↔ catalogue, catalogue ↔ plugin,
 * and skill SKILL.md own-rule IDs ↔ catalogue guidance rows.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultRoot = join(__dirname, '..');

const NON_ESLINT_ENFORCEMENT = new Set(['@jig-harness/spec-present']);
const RULE_ID_RE = /\*\*([a-z]{2,}-[a-z0-9-]+)\*\*/g;
const SKILL_NAME_RE = /^name:\s*(.+)\s*$/m;

export function parseCatalogue(cataloguePath) {
  const content = readFileSync(cataloguePath, 'utf8');
  const rows = [];
  for (const line of content.split('\n')) {
    if (!line.startsWith('|') || line.includes('---') || line.includes(' id ')) continue;
    const cols = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cols.length >= 6) {
      rows.push({
        id: cols[0],
        guidance: cols[2],
        enforcement: cols[4],
      });
    }
  }
  return rows;
}

export function listCustomRules(root) {
  const pluginDir = join(root, 'packages/eslint-plugin/src/rules');
  try {
    return readdirSync(pluginDir)
      .filter(
        (f) =>
          (f.endsWith('.ts') || f.endsWith('.js')) &&
          !f.endsWith('.test.js') &&
          !f.endsWith('.test.ts'),
      )
      .map((f) => f.replace(/\.(ts|js)$/, ''));
  } catch {
    return [];
  }
}

function ruleExistsInPlugin(ruleName, customRules) {
  return customRules.includes(ruleName);
}

export function extractRulesSection(content) {
  const lines = content.split(/\r?\n/);
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '## Rules') {
      start = i + 1;
      break;
    }
  }
  if (start < 0) return '';

  const sectionLines = [];
  for (let i = start; i < lines.length; i++) {
    if (/^## /.test(lines[i])) break;
    sectionLines.push(lines[i]);
  }
  return sectionLines.join('\n').trimEnd();
}

function isDelegatedHeader(line) {
  return /^Delegated enforcement\b/i.test(line.trim());
}

function firstTableCell(line) {
  if (!line.trimStart().startsWith('|')) return null;
  const parts = line.split('|').map((part) => part.trim());
  return parts[1] ?? null;
}

function isTableHeaderRow(line) {
  const cell = firstTableCell(line);
  return cell != null && /^rule id$/i.test(cell);
}

export function parseOwnRuleIds(rulesSection) {
  if (!rulesSection) return [];

  const ownIds = [];
  let inDelegatedBlock = false;

  for (const line of rulesSection.split('\n')) {
    const tableCell = firstTableCell(line);

    if (isDelegatedHeader(line)) {
      inDelegatedBlock = true;
      continue;
    }
    if (inDelegatedBlock && tableCell == null) continue;
    if (!line.includes('**')) continue;

    if (tableCell != null) {
      if (line.includes('---') || isTableHeaderRow(line)) continue;
      for (const match of tableCell.matchAll(RULE_ID_RE)) {
        ownIds.push(match[1]);
      }
      continue;
    }

    if (/see `[a-z0-9-]+`/i.test(line)) continue;

    const referenceIdx = line.search(/\bReference\b/i);
    const segment = referenceIdx >= 0 ? line.slice(0, referenceIdx) : line;
    for (const match of segment.matchAll(RULE_ID_RE)) {
      ownIds.push(match[1]);
    }
  }

  return [...new Set(ownIds)];
}

function parseSkillName(content) {
  const match = content.match(SKILL_NAME_RE);
  return match ? match[1].trim() : null;
}

function walkSkillFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walkSkillFiles(fullPath, files);
    } else if (entry === 'SKILL.md') {
      files.push(fullPath);
    }
  }
  return files;
}

export function collectSkillRuleOwnershipErrors(root, catalogue) {
  const skillsRoot = join(root, 'skills');
  const errors = [];

  let skillFiles = [];
  try {
    skillFiles = walkSkillFiles(skillsRoot);
  } catch {
    return errors;
  }

  for (const skillPath of skillFiles) {
    const content = readFileSync(skillPath, 'utf8');
    const skillName = parseSkillName(content);
    if (!skillName) continue;

    const rulesSection = extractRulesSection(content);
    const ownRuleIds = parseOwnRuleIds(rulesSection);
    const relPath = relative(root, skillPath);

    for (const ruleId of ownRuleIds) {
      const row = catalogue.find((entry) => entry.id === ruleId);
      if (!row) {
        errors.push(`Uncatalogued own-rule ID "${ruleId}" in ${relPath} (skill: ${skillName})`);
      } else if (row.guidance !== skillName) {
        errors.push(
          `Catalogue row "${ruleId}" guidance is "${row.guidance}", expected "${skillName}" (${relPath})`,
        );
      }
    }
  }

  return errors;
}

export function runCoherenceCheck(options = {}) {
  const root = options.root ?? defaultRoot;
  const cataloguePath = options.cataloguePath ?? join(root, 'rules-catalogue.md');
  const includeEslintChecks = options.includeEslintChecks ?? true;
  const includeSkillRuleChecks = options.includeSkillRuleChecks ?? true;

  const catalogue = parseCatalogue(cataloguePath);
  const customRules = listCustomRules(root);
  const errors = [];

  if (includeEslintChecks) {
    for (const rule of customRules) {
      const row = catalogue.find(
        (entry) => entry.enforcement === rule || entry.enforcement === `@jig-harness/${rule}`,
      );
      if (!row) {
        errors.push(`Custom rule "${rule}" has no row in rules-catalogue.md`);
      }
    }

    for (const row of catalogue) {
      if (!row.enforcement || row.enforcement === '—' || row.enforcement === '-') continue;
      if (row.enforcement.startsWith('scripts/') || NON_ESLINT_ENFORCEMENT.has(row.enforcement)) {
        continue;
      }
      const ruleName = row.enforcement.replace(/^@jig-harness\//, '');
      if (ruleName.startsWith('eslint:') || ruleName.includes('/')) continue;
      if (customRules.length > 0 && !ruleExistsInPlugin(ruleName, customRules)) {
        errors.push(
          `Catalogue row "${row.id}" cites enforcement "${row.enforcement}" but rule not found`,
        );
      }
    }
  }

  if (includeSkillRuleChecks) {
    errors.push(...collectSkillRuleOwnershipErrors(root, catalogue));
  }

  return { ok: errors.length === 0, errors };
}

function isMainModule() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(entry).href;
}

if (isMainModule()) {
  if (process.argv.includes('--test')) {
    const { spawnSync } = await import('node:child_process');
    const testPath = join(__dirname, 'coherence-check.test.mjs');
    const result = spawnSync(process.execPath, ['--test', testPath], { stdio: 'inherit' });
    process.exit(result.status ?? 1);
  }

  const { ok, errors } = runCoherenceCheck();
  if (!ok) {
    console.error('Coherence check failed:\n' + errors.map((entry) => `  - ${entry}`).join('\n'));
    process.exit(1);
  }

  console.log('Coherence check passed.');
}
