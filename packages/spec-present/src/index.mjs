/**
 * spec-present gate: a change that touches app source (apps/<name>/src/**) must
 * also add or update at least one spec under docs/specs/**. Coarse by design:
 * it does not map code to a specific feature/slice. It fails only when app
 * source changed with zero spec change.
 */
import { execFileSync } from 'node:child_process';

export const APP_SOURCE_RE = /(^|\/)apps\/[^/]+\/src\//;
export const SPEC_RE = /(^|\/)docs\/specs\//;
export const EMPTY_BEFORE = '0000000000000000000000000000000000000000';

/**
 * Pure evaluation of a changed-file set.
 * @param {string[]} changedFiles
 * @returns {{ ok: boolean, appSourceChanged: boolean, specChanged: boolean, offenders: string[] }}
 */
export function evaluate(changedFiles) {
  const files = Array.isArray(changedFiles) ? changedFiles : [];
  const offenders = files.filter((f) => APP_SOURCE_RE.test(f));
  const appSourceChanged = offenders.length > 0;
  const specChanged = files.some((f) => SPEC_RE.test(f));
  const ok = !appSourceChanged || specChanged;
  return { ok, appSourceChanged, specChanged, offenders };
}

function isSha(ref) {
  return /^[0-9a-f]{4,40}$/i.test(ref);
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
}

function tryGit(args) {
  try {
    return git(args);
  } catch {
    return null;
  }
}

function toLines(output) {
  if (!output) return [];
  return output
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function resolveBaseRef() {
  if (process.env.SPEC_PRESENT_BASE) {
    const base = process.env.SPEC_PRESENT_BASE.trim();
    if (base && base !== EMPTY_BEFORE) return base;
  }
  if (process.env.GITHUB_BASE_REF) return `origin/${process.env.GITHUB_BASE_REF}`;
  for (const candidate of ['origin/main', 'main']) {
    if (tryGit(['rev-parse', '--verify', '--quiet', candidate]) !== null) return candidate;
  }
  return null;
}

function addCommittedChanges(set, base) {
  if (isSha(base)) {
    for (const line of toLines(tryGit(['diff', '--name-only', `${base}..HEAD`]))) {
      set.add(line);
    }
    return;
  }

  const mergeBaseOut = tryGit(['merge-base', base, 'HEAD']);
  const mergeBase = mergeBaseOut ? mergeBaseOut.trim() : base;
  for (const line of toLines(tryGit(['diff', '--name-only', `${mergeBase}...HEAD`]))) {
    set.add(line);
  }
}

export function resolveChangedFiles() {
  const set = new Set();
  const base = resolveBaseRef();

  if (base) {
    addCommittedChanges(set, base);
  }

  for (const line of toLines(tryGit(['diff', '--name-only', 'HEAD']))) set.add(line);
  for (const line of toLines(tryGit(['diff', '--name-only', '--cached']))) set.add(line);
  for (const line of toLines(tryGit(['ls-files', '--others', '--exclude-standard']))) set.add(line);

  return { base, files: [...set] };
}

export function runSpecPresent() {
  let base;
  let files;
  try {
    ({ base, files } = resolveChangedFiles());
  } catch {
    base = null;
    files = null;
  }

  if (!base && (!files || files.length === 0)) {
    console.warn('spec-present: could not resolve a git base; skipping (best-effort gate)');
    return 0;
  }

  const { ok, offenders } = evaluate(files);

  if (!ok) {
    console.error('spec-present: app source changed without a spec update.');
    console.error('Offending app-source files:');
    for (const f of offenders) console.error(`  - ${f}`);
    console.error('\nFix: add or update a spec under docs/specs/**; see the `specs` skill.');
    return 1;
  }

  console.log('spec-present: OK (no app source changed, or a spec was updated).');
  return 0;
}
