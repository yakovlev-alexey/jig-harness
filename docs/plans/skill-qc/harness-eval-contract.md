# Plan — versioned skill-eval contract and exact debt (foundation PR)

Implement the static R9–R15 contract and the option-1 rollout: strict validation from
the first foundation PR, temporarily green only through exact, monotonically decreasing
known debt. This plan lands atomically with the other foundation plans. No generator
applies.

## Task A — Build the importable validator core

**Satisfies:** skill-testing R1–R3, R9, R10, R12, R13, static R14, R15 · **Effort:** L

Create:

```text
scripts/skill-qc/canonical-json.mjs
scripts/skill-qc/diagnostic-registry.mjs
scripts/skill-qc/diagnostics.mjs
scripts/skill-qc/safe-path.mjs
scripts/skill-qc/sensitive-data.mjs
scripts/skill-qc/validate-definitions.mjs
scripts/skill-qc/validate-artifacts.mjs
scripts/skill-qc/validate-debt.mjs
scripts/validate-skill-evals.mjs
```

Pure modules return sorted diagnostics and never call `process.exit`. Export
`collectSkillEvalDiagnostics`; the public CLI discovers all
`skills/{workflow,convention}/*`, renders diagnostics, applies exact waivers only for its
registered eval-code scope, and owns the exit code. `validate-debt.mjs` exposes scoped
matching for individual CLIs and full-manifest matching for the aggregate debt command,
so unrelated waivers are not falsely called stale by a partial validator. Support
`--format text|json` and `--include-waived`; the flags never write or synthesize debt.

`diagnostic-registry.mjs` is the sole registry table. Each row fixes `code`, owner module,
waivable boolean, and stable subject template; duplicate codes or an unregistered emitted
code are non-waivable harness failures. Each diagnostic MUST contain `code`, `skill`,
repo-relative POSIX `path`, stable
`subject`, `fingerprint`, and human `message`. Define the fingerprint as SHA-256 over
canonical JSON with recursively sorted keys and LF-normalized strings:

```json
{
  "schema_version": 1,
  "code": "<stable-code>",
  "skill": "workflow/write-spec",
  "path": "skills/workflow/write-spec/evals/trigger_evals.json",
  "subject": "<case-id, field, rule-id, or legacy filename>"
}
```

Messages, timestamps, and volatile observed counts are excluded. A floor diagnostic's
subject records the stable requirement (for example `required:10`), not the current
count. Register every known code and whether it is waivable; debt-schema and harness
integrity errors are never waivable.

Validate all static requirements from R9–R15: versioned envelopes and case shapes,
skill-wide ID uniqueness, trigger floors/forms/near-misses, required convention and
workflow suites, objective oracle/workspace fields, root allowlist, README/report
headings, legacy names, normalized references and symlink escape, run path/manifest
agreement, required files, hashes, current case/subject/config hashes, selection receipt
constraints, oracle- and fixture-source hashes, detectable sensitive data,
report-to-run links, canary shape, and stale evidence. A stale run cannot count as current
or appear in a report linked as verified. Static validation can distinguish a missing or
pending persisted audit block from `audit-verified`, but it never queries thread history
or invents runtime provenance.

Emit exactly one waivable `EVAL_CURRENT_CAMPAIGN_UNVERIFIED` per installable skill from
the foundation bootstrap onward, even when its L2 definition file does not yet exist.
Use path `skills/<tier>/<skill>/evals/reports` and subject
`required:current-complete-campaign`; case IDs and observed counts belong only in the
message. Its fingerprint therefore survives the legacy-array → definitions-only
transition and disappears only when `evals/README.md` links the canonical
`skill-qc-<skill>-v1` complete, canary-valid report and that report has a successful
runner-owned provenance block. A diagnostic `*-prechange` campaign never clears it. Do
not emit new waivable case-level live-coverage codes.

Model evidence states explicitly: definition/run consistency is `static-valid`; a
matching trusted canary makes it `canary-valid`; `skill-eval:report` may aggregate those
states with provenance pending; only the history audit changes the report to
`audit-verified`. Static validation may check the persisted audit block but never claim
to reconstruct thread history itself.

## Task B — Add hermetic definition and artifact tests

**Satisfies:** skill-testing R2, R3, R9, R10, R12–R15 · **Effort:** L

Create:

```text
scripts/skill-qc/tests/definitions.test.mjs
scripts/skill-qc/tests/artifacts.test.mjs
scripts/skill-qc/tests/fixtures/README.md
```

Tests create minimal temporary repositories programmatically; the fixture README lists
the invariant each builder represents. Cover at least:

- all three definition envelopes and schemas;
- the diagnostic registry's unique codes, owners, waiver policy, and stable subject
  templates;
- trigger count, near-miss sibling/self-reference, all positive forms, and forbidden
  fields on negatives;
- duplicate IDs across suites;
- required `evals.json` and `pressure_tests.json` by skill type;
- `workspace.kind`, case-scoped fixtures, optional support directories, and oracle
  types;
- root allowlist, every legacy filename, absolute/`..` paths, and an escaping symlink;
- README and campaign-report templates;
- run directory/manifest mismatch, missing artifact, bad hash, stale case/subject/config
  hash, invalid selection receipt, missing mutable workspace metadata, and report links;
- checklist criterion IDs plus independent grader/input-hash evidence;
- rationalization quotes present verbatim in `response.md` and non-null `maps_to` values
  naming real entries in the tested skill's rationalization table;
- added/deleted/renamed workspace records with null on the nonexistent hash side;
- invalid spawn/receipt/oracle-infrastructure attempts absent from final `runs/`, while a
  completed oracle verdict of `fail` remains valid evidence;
- a valid prompt-only retrieval case with no empty support directories;
- a valid run whose `git_sha` is no longer reachable but whose subject, case,
  oracle-source, fixture-source, resolver-set, and config hashes still match;
- secret/private-key/auth/session fixture and artifact rejection before it can count as
  evidence;
- a valid complete paired campaign fixture.

Add a migration-transition fixture that starts with a legacy trigger root array and no
L2 suite, captures the exact debt set, then creates valid definitions without runs. Its
post-definition waivable tuples MUST be a subset of the bootstrap tuples and the
`EVAL_CURRENT_CAMPAIGN_UNVERIFIED` fingerprint MUST be unchanged; no case-level live
waiver may appear. Cover `static-valid` → `canary-valid` → report-pending →
`audit-verified`, including rejection of a hand-edited or run-set-mismatched provenance
block.

Assert exact code, skill, path, subject, and fingerprint stability, not only failure.

## Task C — Implement exact current-state debt

**Satisfies:** skill-testing R15 · **Effort:** M

Create `scripts/skill-qc-known-debt.json` and populate it only after Tasks A–B and the R11
coherence collector from the companion foundation plan run against the unchanged sixteen
skills. Every entry is exactly `{ skill, code, fingerprint }` and must match one current
waivable eval or coherence diagnostic.

`validate-debt.mjs` MUST fail on unwaived, stale, unknown-code, duplicate, malformed,
or fingerprint-mismatched entries. It computes violations before applying waivers. A
missing manifest is valid only when real debt is zero; an empty manifest is not required
after debt reaches zero.

Add `scripts/skill-qc/tests/debt.test.mjs` for exact match, stale waiver, unknown code,
duplicate tuple, changed fingerprint, unwaived violation, and zero-debt manifest
removal.

## Task D — Enforce deletion-only history

**Satisfies:** skill-testing R15 · **Effort:** M

Create `scripts/check-skill-qc-debt.mjs`. Import both
`collectSkillEvalDiagnostics` and the coherence collector, perform the full exact/stale
manifest check, then compare tuple sets `(skill, code, fingerprint)` from the current
manifest and `SKILL_QC_BASE`:

- when the base has neither a manifest nor this comparator, allow the one foundation
  bootstrap manifest but still require exact current-state validation;
- once the base has a manifest, require current tuples to be a subset of base tuples;
- when the base contains this comparator but no manifest, treat migration as permanently
  closed and reject any reintroduced manifest;
- treat a changed fingerprint as deletion plus a forbidden addition;
- ignore entry order;
- fail closed when a supplied base SHA is invalid or unavailable;
- without `SKILL_QC_BASE`, run exact/stale checks and clearly state that monotonic history
  was not verified.

Support `--format text|json` and `--include-waived` here too, always showing the complete
combined current diagnostic set before the exit status and never mutating the manifest.

Add bootstrap, deletion, addition, broadening, reordered, invalid-base, no-base, and
closed-zero/reintroduction cases to `scripts/skill-qc/tests/debt.test.mjs`. Use temporary
Git repositories for history tests; do not depend on the working tree's branch state.

## Task E — Wire package scripts and CI

**Satisfies:** skill-testing R1, R8, R15 · **Effort:** S

Edit `package.json` to add:

```json
{
  "test:skill-validators": "node --test scripts/skill-qc/tests/*.test.mjs",
  "skill-qc:debt": "node scripts/check-skill-qc-debt.mjs",
  "skill-eval:probe": "node scripts/probe-skill-eval-runtime.mjs",
  "skill-eval:run": "node scripts/run-skill-eval.mjs",
  "skill-eval:report": "node scripts/report-skill-eval-campaign.mjs",
  "skill-eval:audit": "node scripts/audit-skill-eval-provenance.mjs"
}
```

Place `test:skill-validators`, `coherence`, `validate-skills`, and `skill-qc:debt`
before lint in root `verify`.

Edit `.github/workflows/ci.yml` because it lists steps explicitly. Set
`SKILL_QC_BASE` to `github.event.pull_request.base.sha` for pull requests and to the
non-zero `github.event.before` SHA for pushes. Add `pnpm run test:skill-validators`
before coherence and `pnpm run skill-qc:debt` after validation. Keep `fetch-depth: 0`.

## Task F — Regression-check the established harness levels

**Satisfies:** skill-testing R1, R4–R8, R15 · **Effort:** S

Run, in order:

```bash
pnpm run test:skill-validators
pnpm run coherence
pnpm run validate-skills
pnpm run skill-qc:debt
pnpm verify
```

Inspect `.github/workflows/ci.yml` to confirm existing template-dogfood,
scaffold-then-verify, and PR-only E2E dependency order remains unchanged. Simulate one
forbidden debt addition and assert the deletion-only command fails with the expected
stable code, then restore the fixture state.

## Coverage

A→R1–R3/R9/R10/R12–R15, B→R2/R3/R9/R10/R12–R15, C→R15,
D→R15, E→R1/R8/R15, F→R1/R4–R8/R15.
