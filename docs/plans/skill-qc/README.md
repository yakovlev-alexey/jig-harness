# Plans — Skill QC hardening

Implementation decomposition for the approved
[skill-testing spec](../../specs/skill-testing/spec.md). The durable contract is in the
spec; these files describe the disposable implementation order and exact touched files.
No generator applies to this tooling-and-skill migration.

The change covers skill-testing R1–R15 and the relevant spine guarantees in the
[spec-driven-workflow spec](../../specs/spec-driven-workflow/spec.md). R4–R8 are already
implemented; the foundation plan regression-checks them rather than redesigning them.

## User-verify gate

Do not implement any plan in this folder until this complete plan set is explicitly
approved. After approval, implement the foundation PR atomically, stop for review, and
then migrate exactly one skill per PR. Do not batch multiple skill migrations.

## Rollout

### Stage 1 — one validator-first foundation PR

Implement these four plans in one PR:

1. [harness-eval-contract](./harness-eval-contract.md) — versioned definitions,
   artifacts, stable diagnostics, exact known debt, package scripts, and CI.
2. [harness-validate-skills](./harness-validate-skills.md) — keep the shell L0 entrypoint
   and delegate eval validation to the importable Node validator.
3. [harness-coherence-check](./harness-coherence-check.md) — implement the exact R11
   owned-rule grammar and fixtures.
4. [harness-eval-runner](./harness-eval-runner.md) — one-case runner, isolated resolver
   and workspace, runner-owned evidence, runtime canary, and provenance audit.

Inside that atomic PR, execute the cross-plan dependencies in this order: contract Tasks
A–B; validate-skills Tasks A–B and coherence Tasks A–C; contract Tasks C–E; runner Tasks
A–I; then validate-skills Task C, coherence Task D, and contract Task F. This lets the
debt manifest enumerate both eval and coherence diagnostics and keeps every referenced
module present before the final checks.

The PR ships strict checks immediately and records only current exact skill violations
in `scripts/skill-qc-known-debt.json`. It MUST finish with `pnpm verify` green. Repository
or harness-infrastructure failures are fixed in this PR; they are not waived as skill
debt. A real runtime canary is a pre-handoff smoke check. If the current Codex runtime
cannot expose trusted effective model and effort fields, the infrastructure may still
be reviewed, but all live campaigns remain unverified and Stage 2 MUST NOT start.

### Stage 2 — one PR per skill

After the foundation PR is merged and a canary passes, migrate skills in this order:

1. Spine workflow skills: `write-spec`, `write-plan`, `implement-feature`,
   `review-change`, `develop-feature`.
2. Other workflow skills: `setup-project`, `implement-frontend`, `implement-backend`.
3. Convention skills with application oracles: `backend-architecture`,
   `frontend-architecture`, `react-composition`, `state-and-data`, `specs`.
4. Convention skills with retrieval response oracles: `project-defaults`, `contracts`,
   `testing`.

Each PR removes only that skill's resolved exact debt entries. New or broadened waivers
are forbidden. After the last skill is clean, delete the debt manifest only if no real
debt remains. Keep the comparison command as a permanent closed-state guard: once its
base contains the comparator but no manifest, any later manifest is a forbidden debt
reintroduction. Strict current-state validation stays enabled.

The exact matrices below require 260 current-campaign scenario children: 166 trigger
children, 26 convention L2 children, and 68 workflow pressure children. The six
pre-change campaigns add 51 diagnostic scenario children. With one canary for each of 16
current and six pre-change campaigns, the rollout requires 333 direct child invocations
in total. Do not reduce the count by batching cases.

## Shared per-skill implementation protocol

Every skill plan below supplies the skill-specific cases and oracles. Execute these
steps in order.

### 1. Finish definitions before any live run

Edit the named skill and its `evals/` tree plus only the root files explicitly named by
that skill plan (for example `rules-catalogue.md` and the shared debt manifest):

- convert `evals/trigger_evals.json` from the legacy root array to
  `{ "schema_version": 1, "cases": [...] }`;
- give every case a skill-wide unique stable ID;
- preserve existing trigger intent, reach at least 10 cases and four sibling near-miss
  negatives, and cover `formal`, `terse`, and `task_buried` positive forms;
- create `evals/evals.json` for a convention skill or `evals/pressure_tests.json` for a
  workflow skill;
- create only the case-scoped `fixtures/` and reusable `oracles/` named by the plan;
- rewrite `evals/README.md` with exactly the shared `Suites`, `Running`, and `Evidence`
  sections from R13;
- delete every legacy root report and `pressure-scenarios.md` named by the plan.

Do not create empty `fixtures/`, `oracles/`, `runs/`, or `reports/` directories.
Definitions and fixture inputs MUST be final before their hashes are used in a campaign.
Use `node scripts/check-skill-qc-debt.mjs --format json --include-waived` to compare all
raw eval and coherence diagnostics with the manifest, then delete only this skill's exact
tuples whose violations the definition edit resolved. Do this reconciliation before exact
validation: a stale waiver is expected to fail and therefore cannot be left in place until
the end of the PR. Do not delete the still-matching live-evidence tuples and never add or
broaden a tuple.

Run `pnpm run test:skill-validators`, `pnpm run validate-skills`, `pnpm run coherence`,
and `pnpm run skill-qc:debt` after that reconciliation. Commit the definitions, fixtures,
oracles, README with `No verified live campaign yet`, the reconciled debt manifest, and
unchanged skill payload as a clean checkpoint before any campaign. Here “clean
checkpoint” means every hashed campaign input equals that commit; unrelated pre-existing
user paths may remain dirty because the runner neither copies them into the capsule nor
uses them for provenance.

### 2. Observe before editing `SKILL.md`

When a plan changes `SKILL.md`, first run the affected cases against the unchanged
runtime payload in a `skill-qc-<skill>-prechange` campaign. Record actual results; never
relabel a pass as RED. Generate its partial paired report without `--require-complete`,
pass provenance audit, and then make the minimum skill edit justified by the approved
spec and the observation. Pre-change runs are diagnostic and cannot clear debt after the
subject hash changes.

Audit and commit the pre-change evidence as a diagnostic checkpoint before editing
`SKILL.md`. After recording the observation, remove that campaign's runs, report, and
canary from the final tree: the checkpoint remains reviewable in Git history, while stale
pre-change hashes cannot be presented as current evidence. Make the minimum
skill/catalogue edit, reconcile only newly resolved exact tuples, run static validation,
and commit the final subject payload and pre-change artifact removal as a second clean
checkpoint. Current campaigns MUST start from this checkpoint. Run the same affected
cases first in the current `skill-qc-<skill>-v1` campaign; the skill plan's current-campaign
task then runs only the remaining definitions, so a case/variant is never duplicated.
While a campaign runs, hashed inputs may not change and only runner-owned artifacts for
that campaign may change within the tested scope. Pre-existing unrelated paths are
snapshotted by path/status, kept inaccessible to the child, and ignored if unchanged.

An R10 structural violation still must be fixed when the no-guidance control shows
capability saturation; the report records saturation instead of inventing failure.

### 3. Run the current campaign one child at a time

Use campaign ID `skill-qc-<skill>-v1`. The public command added by the foundation PR is:

```bash
pnpm run skill-eval:run -- --skill <tier>/<skill> --suite <trigger|eval|pressure> --case <case-id> --variant <trigger|without_skill|with_skill> --campaign skill-qc-<skill>-v1
```

Invoke it separately for every trigger case with variant `trigger`, then separately for
every declared L2 `case × variant`. Arrays, repeated case flags, and batch files are
invalid. Do not hand-edit runner-owned files. The runner creates:

```text
evals/runs/<campaign>/<suite>/<case>/<variant>/<run-id>/
  manifest.json
  prompt.md
  response.md
  events.jsonl
  oracle.json
  workspace.json  # mutable cases only
  patch.diff       # changed mutable cases only
```

The first invocation creates or verifies
`evals/reports/<campaign>.runtime-canary.json`. After all scalar runs complete, Step 4
generates one convention or workflow L2 report with `Runs` and `Deltas` sections. It
states observed pass, fail, saturation, zero delta, regression, or negative delta; it
never prescribes `without_skill = RED` or replaces raw runs.

If `SKILL.md`, a supporting runtime file, a case, fixture, oracle implementation, or
custom-agent config changes after a run, the affected evidence is stale and MUST be
rerun. The manifest binds these through the subject, case, oracle-source, fixture-source,
resolver-set, and config hashes; `git_sha` alone is not a freshness check.

### 4. Audit, remove exact debt, and verify

Run:

```bash
pnpm run skill-eval:report -- --skill <tier>/<skill> --campaign skill-qc-<skill>-v1 --require-complete
pnpm run skill-eval:audit -- --skill <tier>/<skill> --campaign skill-qc-<skill>-v1
```

After the provenance audit succeeds, update `evals/README.md` `Evidence` to link the
verified report. Use the raw diagnostic output to delete only the now-resolved remaining
tuples for this skill:

```bash
node scripts/check-skill-qc-debt.mjs --format json --include-waived
```

Then run:

```bash
pnpm run test:skill-validators
pnpm run coherence
pnpm run validate-skills
pnpm run skill-qc:debt
pnpm verify
```

Checks are intentionally after tuple deletion so no stale waiver can deadlock the
migration. Commit the current runs, report with its verified provenance block, README
link, and debt deletion together. Stop for review before starting the next skill.

## Plans

| Plan                                                    | Type       | Skill-specific work                        | Requirements           |
| ------------------------------------------------------- | ---------- | ------------------------------------------ | ---------------------- |
| [harness-eval-contract](./harness-eval-contract.md)     | tooling    | contract validator, artifacts, debt, CI    | R1–R3, R9–R10, R12–R15 |
| [harness-validate-skills](./harness-validate-skills.md) | tooling    | L0 shell entrypoint and trigger policy     | R1, R2, R10, R13, R15  |
| [harness-coherence-check](./harness-coherence-check.md) | tooling    | owned-rule grammar                         | R1, R11, R15           |
| [harness-eval-runner](./harness-eval-runner.md)         | tooling    | child runtime and provenance               | R9, R12–R15            |
| [project-defaults](./project-defaults.md)               | convention | stack retrieval                            | R2, R9, R10, R13–R15   |
| [frontend-architecture](./frontend-architecture.md)     | convention | placement application                      | R2, R9, R10, R13–R15   |
| [react-composition](./react-composition.md)             | convention | composition application and rule ownership | R2, R9–R11, R13–R15    |
| [state-and-data](./state-and-data.md)                   | convention | state application                          | R2, R9, R10, R13–R15   |
| [backend-architecture](./backend-architecture.md)       | convention | backend application                        | R2, R9, R10, R13–R15   |
| [contracts](./contracts.md)                             | convention | contract retrieval                         | R2, R9, R10, R13–R15   |
| [specs](./specs.md)                                     | convention | spec-format application                    | R2, R9, R10, R13–R15   |
| [testing](./testing.md)                                 | convention | test-strategy retrieval                    | R2, R9, R10, R13–R15   |
| [setup-project](./setup-project.md)                     | workflow   | setup pressure                             | R2, R3, R10, R12–R15   |
| [implement-frontend](./implement-frontend.md)           | workflow   | frontend pressure                          | R2, R3, R10, R12–R15   |
| [implement-backend](./implement-backend.md)             | workflow   | backend pressure                           | R2, R3, R10, R12–R15   |
| [write-spec](./write-spec.md)                           | workflow   | spec gate and rule ownership               | R2, R3, R10–R15        |
| [write-plan](./write-plan.md)                           | workflow   | plan gate and rule ownership               | R2, R3, R10–R15        |
| [implement-feature](./implement-feature.md)             | workflow   | plan-scoped execution and rule ownership   | R2, R3, R10–R15        |
| [review-change](./review-change.md)                     | workflow   | two-stage review and rule ownership        | R2, R3, R10–R15        |
| [develop-feature](./develop-feature.md)                 | workflow   | phase orchestration and rule ownership     | R2, R3, R10–R15        |

## Requirement coverage

| Requirement | Plan coverage                                                           |
| ----------- | ----------------------------------------------------------------------- |
| R1–R3       | foundation plans plus all applicable skill migrations                   |
| R4–R8       | foundation final regression task via existing `pnpm verify` and CI jobs |
| R9          | eight convention plans, contract validator, and runner                  |
| R10         | all sixteen skill plans and trigger validator                           |
| R11         | coherence plan plus plans that repair owned declarations/catalogue rows |
| R12         | eight workflow plans, contract validator, and runner                    |
| R13         | contract plan plus all sixteen eval-tree migrations                     |
| R14         | runner plan plus every skill's one-child campaign task                  |
| R15         | all foundation plans; each skill PR deletes only resolved exact debt    |

Every implementation task in the child plans cites at least one approved requirement;
R1–R15 are covered and no hygiene-only task remains.
