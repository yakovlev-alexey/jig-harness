# Skill Testing

## Purpose

Prove that jig skills, enforcement rules, and generators work as a coherent system
across five test levels (L0–L2, L-enf, L-gen) plus template integration jobs.
The harness MUST catch structural skill drift, wrong skill activation, behavior
regressions graded by lint, custom-rule violations, generator output drift, and
broken scaffold resolution — before changes ship.

## Slices touched

Reference only — the harness enforces no spec↔slice mapping.

- `scripts/validate-skills.sh` — L0 structural skill validation.
- `scripts/validate-skill-evals.mjs` — eval definition, artifact, and debt
  validation.
- `scripts/run-skill-eval.mjs` — one-case, one-variant external runner.
- `scripts/audit-skill-eval-provenance.mjs` — live child-thread audit.
- `scripts/check-skill-qc-debt.mjs` — deletion-only CI debt comparison.
- `scripts/coherence-check.mjs` — L0 catalogue ↔ rule coherence.
- `scripts/skill-qc-known-debt.json` — exact, monotonically decreasing migration
  debt.
- `rules-catalogue.md` — rule ↔ layer ↔ test crosswalk.
- `skills/**/evals/trigger_evals.json` — L1 trigger definitions.
- `skills/**/evals/evals.json` — L2 application and retrieval definitions.
- `skills/**/evals/pressure_tests.json` — L2 discipline pressure definitions.
- `skills/**/evals/{fixtures,oracles,runs,reports}/` — optional reusable inputs
  and checks, per-run evidence, and summaries.
- `.codex/agents/skill-eval-runner.toml` — pinned evaluation subagent.
- `packages/eslint-plugin/src/rules/*.test.js` — L-enf `RuleTester` fixtures.
- `packages/generators/src/__snapshots__/` — L-gen golden snapshots.
- `scripts/template-dogfood.sh`, `scripts/scaffold-and-verify.mjs` — integration
  proof jobs.
- `.github/workflows/ci.yml` — CI wiring for all levels.
- `templates/fullstack/` — dogfood and scaffold target.

## Requirements

### R1 — L0 SHALL validate skill structure and catalogue coherence in CI

Every push and pull request MUST run `pnpm run validate-skills` and
`pnpm run coherence`. `validate-skills.sh` MUST check each `skills/**/SKILL.md`
for frontmatter, line limits, description prefix, non-empty
static portions of the eval contract in R13–R15, and (when available)
agentskills.io contract validation. `coherence-check.mjs` MUST ensure every custom
ESLint rule has a catalogue row, every catalogue enforcement id references an
existing rule, and every owned skill rule id is catalogued per R11.

#### Scenario: invalid skill frontmatter fails L0

- **GIVEN** a `skills/**/SKILL.md` file missing the `description:` frontmatter key
- **WHEN** `pnpm run validate-skills` runs
- **THEN** the script exits non-zero and reports the offending skill path

#### Scenario: empty trigger evals fail L0

- **GIVEN** a skill directory whose `evals/trigger_evals.json` has an empty
  `cases` array
- **WHEN** `pnpm run validate-skills` runs
- **THEN** the script exits non-zero with an invalid-or-empty evals error

#### Scenario: orphan custom rule fails coherence

- **GIVEN** a rule file exists under `packages/eslint-plugin/src/rules/` with no
  matching `rules-catalogue.md` row
- **WHEN** `pnpm run coherence` runs
- **THEN** the script exits non-zero citing the uncatalogued rule

#### Scenario: catalogue cites missing enforcement id

- **GIVEN** a catalogue row lists an ESLint enforcement id that does not exist in
  the plugin
- **WHEN** `pnpm run coherence` runs
- **THEN** the script exits non-zero citing the missing enforcement reference

### R2 — L1 SHALL define trigger evals for workflow and convention skills

Each installable skill under `skills/` MUST ship `evals/trigger_evals.json` using
the R13 envelope and case schema. L1 evals verify that the skill activates for the
right user queries and stays silent for unrelated ones. Each case MUST have a stable
`id`, a `query`, and `should_trigger`; R10 defines the positive-form and near-miss
coverage requirements.

#### Scenario: workflow skill eval covers its entry intent

- **GIVEN** `skills/workflow/setup-project/evals/trigger_evals.json`
- **WHEN** an L1 eval runner processes the file
- **THEN** at least one item has `should_trigger: true` for a new-project bootstrap
  query (e.g. "start a new fullstack app")
- **THEN** at least one item has `should_trigger: false` for an unrelated query

#### Scenario: convention skill eval covers its domain

- **GIVEN** `skills/convention/testing/evals/trigger_evals.json`
- **WHEN** an L1 eval runner processes the file
- **THEN** at least one item has `should_trigger: true` for a test-layer or
  test-location question
- **THEN** at least one item has `should_trigger: false` for an off-topic query

### R3 — L2 pressure tests SHALL use objective oracles

Every skill under `skills/workflow/**` MUST define its pressure cases in
`evals/pressure_tests.json`. Each case MUST define one user message, its pressure
types, the `without_skill` and `with_skill` variants, and an objective oracle. The
oracle MUST prefer the enforcement suite (`pnpm lint` and applicable gates such as
`spec-present`) or a deterministic structural check. A documented checklist MAY be
used only when the result cannot be checked by command. Variant names describe the
run configuration; they MUST NOT predeclare RED or GREEN outcomes.

#### Scenario: pressure definition declares variants and oracle

- **GIVEN** a workflow skill with L2 coverage (e.g. `implement-feature`)
- **WHEN** its `evals/pressure_tests.json` is validated
- **THEN** every case declares `without_skill` and `with_skill`, at least three
  pressure types, and an objective oracle

#### Scenario: enforcement grades a seeded violation

- **GIVEN** an agent output that changes app source under `apps/*/src/**` without
  touching `docs/specs/**`
- **WHEN** `pnpm run spec-present` runs on that diff
- **THEN** the gate exits non-zero (machine-measurable L2 failure)

#### Scenario: skill-on output passes enforcement

- **GIVEN** an agent followed the skill and produced lint-clean, convention-aligned
  code
- **WHEN** `pnpm run lint` runs on the touched paths
- **THEN** ESLint exits zero (machine-measurable L2 success)

### R4 — L-enf SHALL ship RuleTester RED/GREEN fixtures for every custom ESLint rule

Each custom rule in `@jig-harness/eslint-plugin` MUST have a colocated
`*.test.js` using ESLint `RuleTester` with at least one `valid` (GREEN) and one
`invalid` (RED) fixture. L-enf tests MUST run as part of `pnpm run test` in CI.

#### Scenario: custom rule has RED and GREEN fixtures

- **GIVEN** `packages/eslint-plugin/src/rules/no-reexport-only.js` is a shipped
  custom rule
- **WHEN** `no-reexport-only.test.js` runs under vitest
- **THEN** `RuleTester` reports passing `valid` cases for compliant modules
- **THEN** `RuleTester` reports failing `invalid` cases for re-export-only modules

#### Scenario: all custom rules are fixture-tested

- **GIVEN** the set of rule files under `packages/eslint-plugin/src/rules/`
  excluding `*.test.*`
- **WHEN** CI runs `pnpm run test` for the eslint-plugin package
- **THEN** every custom rule file has a matching `*.test.js` that executes
  `RuleTester.run`

### R5 — L-gen SHALL snapshot generator output and verify lint cleanliness

Each shipped generator in `@jig-harness/generators` MUST have snapshot tests
(`__snapshots__/*.snap`) asserting stable output structure. Generator output MUST
pass ESLint when generated into a real app workspace (smoke-tested via
`scripts/verify-turbo-gen.mjs` and package-level generator tests).

#### Scenario: generator snapshot matches golden output

- **GIVEN** the `component` generator test suite in `packages/generators`
- **WHEN** `pnpm run test` runs for the generators package
- **THEN** generated file contents match the committed snapshot
- **THEN** the test exits zero

#### Scenario: generated code passes lint in app workspace

- **GIVEN** `turbo gen component` runs in `templates/fullstack/apps/frontend`
- **WHEN** `scripts/verify-turbo-gen.mjs` executes the smoke action
- **THEN** ESLint passes on the generated directory before cleanup

### R6 — Template dogfood SHALL run the full verify stack on the in-repo template

CI MUST include a `template-dogfood` job (after monorepo `verify`) that runs
`pnpm run template:dogfood` against `templates/fullstack` with Postgres available.
The job MUST execute lint, typecheck, unit tests, frontend integration tests, and
build for template app filters.

#### Scenario: template dogfood passes on green template

- **GIVEN** `templates/fullstack` is unchanged and Postgres is available in CI
- **WHEN** the `template-dogfood` job runs
- **THEN** `pnpm run template:dogfood` exits zero

#### Scenario: template dogfood runs frontend integration

- **GIVEN** the dogfood script reaches the test phase
- **WHEN** it executes against `@app/frontend`
- **THEN** `pnpm --filter @app/frontend test:integration` runs as part of the job

### R7 — Scaffold-then-verify SHALL prove create-app resolution end to end

CI MUST include a `scaffold-then-verify` job that packs harness packages, scaffolds
a fresh app via the create-app transform (rewriting `workspace:*` / `catalog:` to
published versions), installs dependencies, and runs the scaffolded app's verify
suite.

#### Scenario: fresh scaffold passes verify

- **GIVEN** harness packages pack successfully and Postgres is available
- **WHEN** `pnpm run scaffold:verify` runs (`scripts/scaffold-and-verify.mjs`)
- **THEN** a temporary app is scaffolded, `pnpm install` succeeds, and the scaffolded
  `pnpm verify` (or equivalent check sequence) exits zero

#### Scenario: scaffold rewrites workspace specifiers

- **GIVEN** the create-app copy step runs on `templates/fullstack`
- **WHEN** the scaffolded `package.json` files are inspected
- **THEN** `@jig-harness/*` dependencies use concrete version specifiers, not
  `workspace:*` or `catalog:`

### R8 — CI SHALL orchestrate all levels in dependency order

The main `verify` job MUST run L0 (`coherence`, `validate-skills`), enforcement
static checks (`lint`, `typecheck`), L-enf/L-gen (via `pnpm run test`), and build
before `template-dogfood` and `scaffold-then-verify`. PR-only E2E MUST depend on
`verify` and run against the template with test routes enabled.

#### Scenario: verify job includes L0 gates

- **GIVEN** a pull request targets `main`
- **WHEN** the `verify` CI job runs
- **THEN** steps include `pnpm run coherence` and `pnpm run validate-skills` before
  `pnpm run lint`

#### Scenario: integration jobs wait for verify

- **GIVEN** a push to `main`
- **WHEN** CI schedules `template-dogfood` and `scaffold-then-verify`
- **THEN** both jobs declare `needs: verify`

#### Scenario: E2E is PR-only

- **GIVEN** a push to `main` (not a pull_request event)
- **WHEN** the CI workflow evaluates the `e2e` job
- **THEN** the job is skipped (`if: github.event_name == 'pull_request'`)

### R9 — Convention skills SHALL ship L2 output evals, not trigger evals alone

Every convention skill under `skills/convention/**` is a reference/pattern/technique
skill whose primary success metric is L2 (application or retrieval), not L1
triggering. Each MUST ship `evals/evals.json` with at least one application or
retrieval case graded by an **objective oracle** — never a subjective "output is
good". Each case MUST declare `with_skill` and `without_skill` variants. Completed
runs and their observed delta MUST use the R13–R14 artifact contract; a campaign
report MUST summarize those runs but MUST NOT replace them.

#### Scenario: convention skill ships an L2 eval

- **GIVEN** `skills/convention/state-and-data`
- **WHEN** its `evals/` directory is inspected
- **THEN** `evals/evals.json` contains at least one application or retrieval case

#### Scenario: L2 case uses an objective oracle

- **GIVEN** an L2 case for a convention skill
- **WHEN** the case is graded
- **THEN** pass/fail is decided by an observable check (lint on produced code, a
  structural/file check, or a documented retrieval checklist), not "looks good"

#### Scenario: L2 case records a baseline delta

- **GIVEN** an L2 case for a convention skill
- **WHEN** the case's run artifacts are inspected
- **THEN** separate `without_skill` and `with_skill` runs record their observed
  results and the required campaign report links both run IDs

### R10 — Skill descriptions SHALL state triggers only, and trigger sets SHALL cover near-misses

Each `SKILL.md` `description` MUST state when-to-use triggers and symptoms and MUST
NOT summarize the skill's procedure or workflow (a workflow summary makes agents
follow the description and skip the body). Each `evals/trigger_evals.json` MUST
contain at least 10 cases, including at least 4 near-miss negatives drawn from
sibling skills. Each near-miss negative MUST carry a machine-checkable
`near_miss_of` string naming an existing sibling skill it should route to; it MUST
NOT name the skill under test. Every positive MUST carry `positive_form` with one of
`formal`, `terse`, or `task_buried`, and the set MUST contain at least one of each.
Negatives MUST NOT carry `positive_form`. `validate-skills.sh` MUST enforce these
machine-checkable requirements.

#### Scenario: description carries no workflow summary

- **GIVEN** a `SKILL.md` description
- **WHEN** it is reviewed
- **THEN** it names triggers/symptoms only and does not enumerate the steps the
  skill performs

#### Scenario: trigger set meets the near-miss floor

- **GIVEN** a skill's `trigger_evals.json`
- **WHEN** it is validated
- **THEN** it has at least 10 cases and at least 4 near-miss negatives from sibling
  skills
- **THEN** each near-miss negative has `near_miss_of` naming the sibling skill

#### Scenario: trigger positives cover all required forms

- **GIVEN** a skill's `trigger_evals.json`
- **WHEN** it is validated
- **THEN** its positive cases include `formal`, `terse`, and `task_buried`
  `positive_form` values
- **THEN** no negative case carries `positive_form`

### R11 — Skill rule IDs SHALL be coherent with the catalogue

Every rule ID that a `SKILL.md` declares as its own MUST have a row in
`rules-catalogue.md` whose guidance column names that skill. The declaration grammar
MUST be deterministic:

- an owned declaration section is a level-two heading named `Rules` or whose text
  ends in ` Rules` or ` Defaults`;
- a table declares owned IDs only from its first column;
- a bullet declares owned IDs only from the prefix between the list marker and the
  first em dash, unless that prefix begins with `Reference` or `See`;
- text after the first em dash, including `Reference` or `see` clauses, is
  reference-only;
- a heading or standalone label beginning `Delegated enforcement` makes the
  immediately following contiguous list or table reference-only; a heading-scoped
  block ends at the next heading of the same or higher level, while a label-scoped
  block ends at the next non-list/table block.

A rule mentioned only as a cross-reference is exempt. `coherence-check.mjs` MUST
fail on an uncatalogued owned rule ID while ignoring reference-only IDs and
rule-like tokens outside declaration sections, including filenames in examples.

#### Scenario: uncatalogued own-rule ID fails coherence

- **GIVEN** a `SKILL.md` Rules section declares id `xx-foo` and no catalogue row has
  id `xx-foo`
- **WHEN** `pnpm run coherence` runs
- **THEN** it exits non-zero citing the uncatalogued skill rule id

#### Scenario: cross-referenced rule needs no new row

- **GIVEN** a declaration bullet owns `wp-own` before an em dash and references
  `sd-borrowed` after it
- **WHEN** `pnpm run coherence` runs
- **THEN** `wp-own` requires an owning catalogue row and `sd-borrowed` does not

#### Scenario: alternate declaration headings are scanned

- **GIVEN** a skill declares rule IDs under `## Stack Defaults` or
  `## Composition Rules`
- **WHEN** `pnpm run coherence` runs
- **THEN** the first-column and bullet-prefix IDs are treated as owned declarations

#### Scenario: delegated and explicit reference bullets stay borrowed

- **GIVEN** a Rules section contains a standalone `Delegated enforcement:` label
  followed by borrowed IDs and a bullet beginning `Reference **wf-borrowed**`
- **WHEN** `pnpm run coherence` runs
- **THEN** neither the delegated IDs nor `wf-borrowed` require an owning catalogue
  row for the current skill

#### Scenario: rule-like filenames are ignored

- **GIVEN** a reference snippet contains a filename such as
  `assert-user-can-be-created.ts`
- **WHEN** `pnpm run coherence` scans skill artifacts
- **THEN** it does not report `be-created` or any other filename fragment as a
  missing rule id

### R12 — Workflow pressure tests SHALL record observed baselines

Every skill under `skills/workflow/**` MUST ship `evals/pressure_tests.json`. Each
case MUST combine at least three pressure types and MUST be run separately as
`without_skill` and `with_skill` per R14. Both variants MUST record the actual agent
response and observed oracle result. The baseline is not required to fail: if the
`without_skill` run passes, the result MUST be retained rather than relabeled RED.
The paired campaign report MUST record the actual delta: capability saturation or
zero delta when both variants pass, and a regression or negative delta when
`with_skill` fails after a passing baseline. A case with no live runs is
`unverified — design-time` and MUST NOT count as test evidence.

#### Scenario: missing live runs remain unverified

- **GIVEN** a pressure definition has no completed `without_skill` and
  `with_skill` run pair
- **WHEN** its coverage is validated
- **THEN** it is reported as `unverified — design-time` and does not satisfy the
  required live-run coverage

#### Scenario: baseline preserves rationalizations verbatim

- **GIVEN** a workflow skill's `without_skill` response contains rationalizations
- **WHEN** its run and report are inspected
- **THEN** every quoted rationalization appears verbatim in `response.md`, and any
  claimed mapping names an entry in the skill's rationalization table

#### Scenario: workflow scenario combines pressure types

- **GIVEN** a skill under `skills/workflow/**` with `pressure_tests.json`
- **WHEN** a scenario is inspected
- **THEN** it names at least three pressure types, such as time, sunk cost,
  authority, economic, exhaustion, social, or pragmatic pressure

### R13 — Skill eval definitions and artifacts SHALL use one versioned contract

Every installable skill MUST use the following names and locations under `evals/`:

```text
evals/
├── README.md
├── trigger_evals.json
├── evals.json
├── pressure_tests.json
├── fixtures/
│   └── <case-id>/...
├── oracles/
│   └── <oracle-id>.mjs|sh|json
├── runs/
│   └── <campaign-id>/<suite>/<case-id>/<variant>/<run-id>/
│       ├── manifest.json
│       ├── prompt.md
│       ├── response.md
│       ├── events.jsonl
│       ├── oracle.json
│       ├── workspace.json
│       └── patch.diff
└── reports/
    ├── <campaign-id>.md
    └── <campaign-id>.runtime-canary.json
```

`README.md` and `trigger_evals.json` are required for every skill. `evals.json` is
required for convention skills and MAY also cover non-pressure workflow behavior.
`pressure_tests.json` is required for every skill under `skills/workflow/**`.
`fixtures/` is optional reusable input state for cases that need files or a sample
project; when used, it MUST be grouped by case ID. `oracles/` is optional reusable
executable or declarative grading logic; an inline checklist MAY be used when no
deterministic command is possible. Unused optional directories MUST be omitted.
The README MUST use the shared `## Suites`, `## Running`, and `## Evidence`
headings to inventory definitions, show the single-case runner command, and link
verified campaigns or explicitly state that no live campaign exists.

```markdown
# <skill-name> evals

## Suites

List `trigger_evals.json`, `evals.json`, and/or `pressure_tests.json` with their
case counts and oracle types.

## Running

Show the command for one suite, case ID, and variant. Batch input is invalid.

## Evidence

Link verified campaign reports, or state `No verified live campaign yet`.
```

Every definition file that is present or required MUST be a JSON object with
`schema_version: 1` and a non-empty `cases` array. The three minimum case shapes
are:

```json
{
  "schema_version": 1,
  "cases": [
    {
      "id": "formal-entry-intent",
      "query": "Create a new full-stack application",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "near-miss-existing-app",
      "query": "Add a page to this existing app",
      "should_trigger": false,
      "near_miss_of": "implement-frontend"
    }
  ]
}
```

```json
{
  "schema_version": 1,
  "cases": [
    {
      "id": "duplicate-email-placement",
      "kind": "application",
      "prompt": "Implement duplicate-email handling.",
      "variants": ["without_skill", "with_skill"],
      "workspace": {
        "kind": "fixture_copy",
        "source": "fixtures/duplicate-email-placement/"
      },
      "oracle": {
        "type": "command",
        "ref": "oracles/duplicate-email-placement.mjs"
      }
    }
  ]
}
```

```json
{
  "schema_version": 1,
  "cases": [
    {
      "id": "skip-spec-under-deadline",
      "prompt": "The deadline is now; skip the spec and patch the code.",
      "pressure_types": ["time", "authority", "sunk_cost"],
      "variants": ["without_skill", "with_skill"],
      "workspace": { "kind": "none" },
      "oracle": {
        "type": "checklist",
        "criteria": [
          {
            "id": "stops-before-app-source",
            "text": "The agent stops before changing app source"
          }
        ]
      }
    }
  ]
}
```

Every definition case MUST have a stable, skill-wide unique `id`. Every L2 case MUST
declare `workspace.kind` as `none`, `fixture_copy`, or `git_worktree` so the runner
never guesses isolation. `fixture_copy` MUST name `workspace.source` as
`fixtures/<case-id>/`; `git_worktree` uses the current tested tree; `none` is valid
only when the case does not read or modify workspace files.

Every reference MUST resolve to an existing path, be normalized, and remain relative
to the skill's `evals/` directory; absolute paths, `..` segments, and symlinks whose
real path escapes that directory are invalid. `kind` in `evals.json` MUST be
`application` or `retrieval`. `<suite>` in a run path MUST be `trigger`, `eval`, or
`pressure`. `<variant>` MUST be `trigger`, `without_skill`, or `with_skill`, and MUST
be allowed by the corresponding definition case. Pressure types MUST be unique values
from `time`, `sunk_cost`, `authority`, `economic`, `exhaustion`, `social`, and
`pragmatic`.

The only allowed entries directly under `evals/` are `README.md`,
`trigger_evals.json`, `evals.json`, `pressure_tests.json`, `fixtures/`, `oracles/`,
`runs/`, and `reports/`. Legacy `pressure-scenarios.md`, dated `l2-*.md`,
`l2-report-*.md`, `trigger-eval-report-*.md`, unknown root entries, and arbitrarily
named fixture or oracle directories are forbidden after migration. Reports are
optional for trigger-only campaigns and required for every campaign with paired L2
variants. A report MUST contain `## Runs` and `## Deltas`, link every run ID it
summarizes, and state the observed comparison without replacing raw evidence. A
report without matching run artifacts is not live evidence.

```markdown
# <campaign-id>

Runtime canary: [`<campaign-id>.runtime-canary.json`](./<campaign-id>.runtime-canary.json)

## Runs

| Suite | Case | Variant | Run ID | Verdict |
| ----- | ---- | ------- | ------ | ------- |

## Deltas

For each paired case, link both run IDs and record the observed difference or zero
delta.
```

#### Scenario: definition files follow the shared schema

- **GIVEN** a convention skill with trigger and L2 cases
- **WHEN** `pnpm run validate-skills` runs
- **THEN** `trigger_evals.json` and `evals.json` use `schema_version: 1`, contain
  stable case IDs, and reference only existing fixture and oracle paths
- **THEN** every L2 case declares a valid workspace kind and any fixture-copy source

#### Scenario: optional support directories are purposeful

- **GIVEN** a prompt-only retrieval case with an inline checklist
- **WHEN** its eval directory is inspected
- **THEN** the case is valid without empty `fixtures/` or `oracles/` directories

#### Scenario: shared documentation and report templates are enforced

- **GIVEN** a skill has definitions and a completed paired L2 campaign
- **WHEN** its eval artifacts are validated
- **THEN** the README has `Suites`, `Running`, and `Evidence` sections and the
  campaign report has `Runs` and `Deltas` sections linking both variants

#### Scenario: legacy names and colliding IDs fail migration

- **GIVEN** a skill has duplicate case IDs across suites, `pressure-scenarios.md`,
  or a root-level `l2-report-<date>.md`
- **WHEN** its eval artifacts are validated after its debt waiver is removed
- **THEN** validation fails with the duplicate-ID or legacy-artifact diagnostic

#### Scenario: fixture and oracle references cannot escape the eval directory

- **GIVEN** a case references an absolute path, a `..` segment, or an escaping
  symlink
- **WHEN** its definition is validated
- **THEN** validation fails without reading or executing the escaped target

### R14 — Every scenario variant SHALL run in one pinned subagent

Each trigger case and each declared L2 variant MUST execute in its own subagent
invocation. Trigger cases use the `trigger` variant; paired L2 cases use distinct
`without_skill` and `with_skill` invocations. One invocation MUST NOT execute or
grade multiple case IDs or variants. `scripts/run-skill-eval.mjs` MUST accept scalar
suite, case, and variant inputs, reject arrays or batches, spawn a fresh child without
forked turns, and be the sole writer of provenance, hashes, and run artifacts. The
child MUST NOT write or amend its own manifest, lifecycle evidence, or oracle result.

The repository MUST define `.codex/agents/skill-eval-runner.toml` with required
`name = "skill_eval_runner"`, a narrow `description`, batch-rejecting
`developer_instructions`, `model = "gpt-5.6-terra"`, and
`model_reasoning_effort = "medium"`. The name field, not the filename, is the agent
type used by the spawn request.

Before spawning, the external runner MUST construct an explicit skill resolver set
and hash every available skill's runtime payload: `SKILL.md` plus supporting files,
excluding `evals/`. `with_skill` MUST inject the exact subject payload;
`without_skill` MUST remove or disable every resolver entry for the subject,
including globally installed duplicates. A `trigger` run makes the subject and
relevant sibling skills available without forcing their selection. No run MAY
inherit prior conversation turns. The child MUST return a structured single-case
selection receipt naming the skills it selected; the runner copies that observation
from the raw response into the manifest rather than asking the child to self-write
provenance. The receipt MUST contain one scalar `case_id`, one scalar `variant`, a
`selected_skills` array, the task result, and any rationalizations; a mismatched or
missing receipt makes the run invalid.

Application and pressure cases that operate on files MUST receive one isolated
writable workspace per child: either a fresh copy of `fixtures/<case-id>/` or a clean
temporary Git worktree. No two child threads MAY share a mutable workspace. The
oracle MUST run in that workspace after the child completes. The runner MUST save a
normalized `patch.diff` when files changed and a `workspace.json` containing
`schema_version`, an opaque workspace ID, workspace kind, source hash, relative
oracle cwd, timeout, changed-file records, and cleanup status. Each changed-file
record MUST name `change` as `added`, `modified`, `deleted`, or `renamed`, record the
before and after hashes with null on the nonexistent side, and include
`previous_path` for a rename. It MUST then remove the temporary workspace.
Prompt-only trigger and retrieval cases do not need workspace files and MUST run
read-only; mutable cases receive write access only to their isolated workspace.
Fixtures and persisted artifacts MUST use synthetic data and MUST NOT contain
credentials, auth/session material, secrets, or private keys.

Each completed invocation with a valid selection receipt and an executed oracle MUST
publish exactly one final run directory containing the five core files in R13. An
argument or case-definition rejection before spawn MUST publish no run. After spawn
is accepted, the runner MUST stage artifacts outside `evals/runs/`; a spawn,
lifecycle, receipt, or oracle-infrastructure failure MUST exit non-zero, remove the
staging directory, and publish no final run. An executed oracle whose observed
verdict is `fail` is still a valid completed run and MUST be published. Any retry of
a failed attempt MUST use a new invocation; the failed attempt MUST NOT masquerade as
completed evidence. `workspace.json` is additionally required for a completed case
that uses a mutable workspace, and `patch.diff` is required when that workspace
changes.
`prompt.md` and `response.md` MUST preserve the materialized prompt and raw child
response.
`events.jsonl` MUST be a runner-produced allowlist export of verbatim spawn, child
start, child completion, and selection-receipt lifecycle records; it is not a copied
Codex rollout or session file and MUST omit unrelated tool payloads, credentials,
secrets, hidden reasoning, and unrelated runtime or session payloads. Allowed records
MUST contain only their event type, timestamps, case and variant, root and child
thread IDs, child source kind and status, agent type, Codex runtime version, config
hash, and selection receipt or its hash. `manifest.json` MUST minimally contain:

```json
{
  "schema_version": 1,
  "run_id": "run-unique-id",
  "campaign_id": "2026-07-skill-qc",
  "skill": "workflow/write-spec",
  "suite": "pressure",
  "case_id": "skip-spec-under-deadline",
  "variant": "without_skill",
  "status": "completed",
  "started_at": "2026-07-15T09:00:00Z",
  "completed_at": "2026-07-15T09:01:00Z",
  "git_sha": "full-git-sha",
  "case_sha256": "sha256",
  "subject_skill_sha256": "sha256",
  "injected_subject_skill_sha256": null,
  "available_skill_set_sha256": "sha256",
  "available_skills": [{ "name": "write-plan", "skill_sha256": "sha256" }],
  "selected_skills": [],
  "agent": {
    "harness": "codex-subagent",
    "agent_type": "skill_eval_runner",
    "context_mode": "fresh",
    "root_thread_id": "root-thread-id",
    "subagent_thread_id": "child-thread-id",
    "model": "gpt-5.6-terra",
    "reasoning_effort": "medium",
    "config_sha256": "sha256",
    "runtime_version": "codex-cli 0.142.2",
    "runtime_canary_sha256": "sha256"
  },
  "artifacts": {
    "prompt": { "path": "prompt.md", "sha256": "sha256" },
    "response": { "path": "response.md", "sha256": "sha256" },
    "events": { "path": "events.jsonl", "sha256": "sha256" },
    "oracle": { "path": "oracle.json", "sha256": "sha256" }
  }
}
```

When present, `workspace.json` and `patch.diff` MUST also appear as hashed
`workspace` and `patch` entries in the manifest's `artifacts` object.

For a mutable case, the minimum `workspace.json` is:

```json
{
  "schema_version": 1,
  "workspace_id": "opaque-run-local-id",
  "kind": "fixture_copy",
  "source_sha256": "sha256",
  "oracle_cwd": ".",
  "timeout_seconds": 300,
  "changed_files": [
    {
      "path": "apps/backend/src/example.ts",
      "change": "modified",
      "before_sha256": "sha256",
      "after_sha256": "sha256",
      "previous_path": null
    }
  ],
  "cleanup_status": "removed"
}
```

For an added file, `before_sha256` MUST be null; for a deleted file,
`after_sha256` MUST be null. A renamed file MUST record its old relative path in
`previous_path`. A non-rename MUST use null `previous_path`.

The minimum command `oracle.json` is:

```json
{
  "schema_version": 1,
  "type": "command",
  "verdict": "pass",
  "command": "pnpm lint",
  "exit_code": 0,
  "stdout": "lint completed successfully",
  "stderr": "",
  "checks": [],
  "rationalizations": []
}
```

Every live campaign MUST include a runner-owned
`reports/<campaign-id>.runtime-canary.json`:

```json
{
  "schema_version": 1,
  "runtime_version": "codex-cli 0.142.2",
  "agent_type": "skill_eval_runner",
  "config_sha256": "sha256",
  "effective_model": "gpt-5.6-terra",
  "effective_reasoning_effort": "medium",
  "root_thread_id": "root-thread-id",
  "subagent_thread_id": "child-thread-id",
  "source_kind": "subAgent",
  "captured_at": "2026-07-15T09:00:00Z",
  "runtime_event_sha256": "sha256"
}
```

`subject_skill_sha256` MUST hash the tested runtime payload supplied to the run.
`git_sha` is provenance metadata; static validation MUST NOT require that it remains
reachable after a squash. A run is current evidence only while the subject hash
matches the present runtime payload and the case hash matches the present definition.
For `with_skill`, `injected_subject_skill_sha256` MUST equal the subject hash, the
resolver set MUST contain that exact version, and `selected_skills` MUST include the
subject. For `without_skill`, the injected hash MUST be null and neither
`available_skills` nor `selected_skills` may contain the subject. For `trigger`, the
injected hash is null and `selected_skills` records the instrumented selection result
rather than copying the expectation.

`case_sha256` MUST hash the validator's canonical JSON serialization of the current
case, `available_skill_set_sha256` MUST hash the ordered name-and-hash resolver set,
and `config_sha256` MUST hash the custom-agent TOML bytes. Directory components MUST
match the manifest's campaign, suite, case, variant, and run IDs. Prompts and
responses MUST be non-empty, artifact hashes MUST match the named files, and run and
subagent thread IDs MUST be globally unique.

`oracle.json` MUST use `schema_version: 1`, record the observed `pass` or `fail`
verdict, and use one of three oracle types: `command` with command and exit code;
`checklist` with individual results and evidence; or `activation` for trigger cases.
Command oracles MUST preserve sanitized stdout and stderr in `oracle.json`.
Checklist definitions MUST give every criterion a stable ID. Checklist results MUST
record one result and artifact-backed evidence per criterion plus a runner-captured
`grader` object with `kind` (`command` or `human`), an opaque grader ID, grading time,
and the SHA-256 of the exact prompt, response, and criteria input. The scenario child
MUST NOT grade its own checklist. Missing independent grader evidence makes the
attempt invalid and prevents publication of a completed run.
The activation oracle is derived from `should_trigger`: the target skill MUST be
present in the selection receipt exactly when `should_trigger` is true. A negative
case with `near_miss_of` additionally requires the named sibling to be selected and
the target to be absent. The oracle MUST record expected and observed skill names.
It MUST also contain `rationalizations`, an array of `{ quote, maps_to }` objects;
every non-empty quote MUST occur verbatim in `response.md`, and every non-null
`maps_to` value MUST identify an entry in the skill's rationalization table.

The static validator can prove artifact consistency but cannot by itself prove that
a recorded thread ID was not invented. `scripts/audit-skill-eval-provenance.mjs`
MUST use Codex thread history to prove that every recorded child is a direct child
of its recorded root with a `subAgent*` source kind and completed status. The config
hash proves requested settings only. Before any campaign can count as verified, a
fresh canary child on the same Codex runtime version and config hash MUST produce a
trusted runtime event that reports effective agent type `skill_eval_runner`, model
`gpt-5.6-terra`, and medium reasoning; the external runner captures only the
allowlisted canary fields and event hash. A child self-report is not sufficient. If
the runtime does not expose those effective fields, the canary and campaign are
unverified and MUST fail closed.

Each run's runner-owned spawn capture MUST match the canary's agent type, runtime
version, and config hash. The audit MUST NOT claim that thread-list metadata exposes
model or effort fields it does not provide. One root MAY coordinate multiple cases
only when each case and variant has its own unique child thread and run directory.
Missing local history or a missing/mismatched canary makes the run unverified, not
accepted evidence.

#### Scenario: batched subagent run is rejected

- **GIVEN** an eval-runner request contains two case IDs or two variants
- **WHEN** the custom agent or runner validates its input
- **THEN** it exits without running the cases and reports the one-case-one-variant
  violation

#### Scenario: trigger activation is graded from the selection receipt

- **GIVEN** a negative trigger case names `near_miss_of: "write-plan"`
- **WHEN** its `trigger` run is graded
- **THEN** the activation oracle passes only when the raw selection receipt names
  `write-plan` and omits the skill under test

#### Scenario: without-skill run is fresh and resolver-isolated

- **GIVEN** a `without_skill` variant for a skill also installed globally
- **WHEN** `run-skill-eval` spawns its child
- **THEN** the child has no forked turns, every resolver entry for the subject is
  disabled or absent, and the manifest records the hashed available-skill set

#### Scenario: mutable cases use independent workspaces

- **GIVEN** two application variants can modify files concurrently
- **WHEN** their children and command oracles run
- **THEN** each receives a different materialized workspace, its own patch and file
  hashes are recorded, and both workspaces are removed after completion

#### Scenario: deleted and renamed files have unambiguous workspace records

- **GIVEN** a mutable case deletes one file and renames another
- **WHEN** the runner writes `workspace.json`
- **THEN** the deleted file has null `after_sha256`, the renamed file names its
  `previous_path`, and all existing before/after versions have hashes

#### Scenario: failed attempts do not become completed evidence

- **GIVEN** a scalar case passes argument validation but its child fails to spawn or
  returns a mismatched receipt
- **WHEN** the runner handles the attempt
- **THEN** it exits non-zero, removes staging, and publishes no final run directory
- **THEN** an observed oracle verdict of `fail` remains publishable when the child and
  receipt completed validly

#### Scenario: checklist grading is independent of the scenario child

- **GIVEN** a retrieval case uses a checklist oracle
- **WHEN** the attempt is graded
- **THEN** every criterion has runner-captured independent evidence bound to the exact
  prompt and response hashes
- **THEN** a child self-verdict or missing grader record cannot publish a completed run

#### Scenario: runtime canary proves effective model and effort

- **GIVEN** a campaign requests agent type `skill_eval_runner` from the pinned config
- **WHEN** a fresh canary runs on the campaign's Codex runtime
- **THEN** a trusted runtime event confirms effective model `gpt-5.6-terra` and
  medium reasoning, or the campaign remains unverified and cannot count as evidence

#### Scenario: recorded run maps to one real child thread

- **GIVEN** a completed run manifest and available Codex thread history
- **WHEN** provenance is audited by `root_thread_id`
- **THEN** one unique completed direct `subAgent*` child matches
  `subagent_thread_id`, and the child's single-case selection receipt matches the
  manifest's case and variant

### R15 — Validators SHALL enforce the contract and migration debt SHALL only decrease

The harness MUST provide importable Node validators with stable diagnostic codes
and hermetic `node:test` fixtures for the machine-checkable portions of R9–R15,
including the R11 coherence grammar and debt behavior. `pnpm run
test:skill-validators` MUST execute those tests, and `pnpm verify` MUST run the tests
plus the repository-wide skill and coherence validators before lint. Fixture tests
MUST assert the expected diagnostic code, not only a non-zero exit.

While existing skills migrate, `scripts/skill-qc-known-debt.json` MAY waive only
exact normalized violations by skill path, diagnostic code, and fingerprint. The
validator MUST fail on an unwaived violation, a waiver with no matching violation,
an unknown diagnostic code, a duplicate waiver, or a changed fingerprint. Once the
manifest exists on the comparison base, validation MUST reject added or broadened
waivers; only deletion is allowed. A new skill therefore cannot add debt. When debt
reaches zero, strict validation MUST remain enabled without requiring an empty
waiver file.

```json
{
  "schema_version": 1,
  "waivers": [
    {
      "skill": "workflow/write-spec",
      "code": "EVAL_TRIGGER_CASE_FLOOR",
      "fingerprint": "sha256"
    }
  ]
}
```

Repository validation always checks that current violations and waivers match
exactly. CI MUST additionally set `SKILL_QC_BASE` to the pull request base SHA or the
push event's previous SHA and run `scripts/check-skill-qc-debt.mjs` to enforce the
deletion-only comparison. A local run without `SKILL_QC_BASE` performs the exact and
stale-waiver checks but MUST NOT claim it verified monotonic history.

#### Scenario: migration is green with exact known debt

- **GIVEN** the debt manifest is present while existing skills are still migrating
- **WHEN** repository validation finds only violations exactly listed in the
  debt manifest
- **THEN** validation reports the debt and exits zero

#### Scenario: new or stale debt fails

- **GIVEN** a violation has no exact waiver, or a waiver no longer matches a
  violation
- **WHEN** `pnpm run validate-skills` runs
- **THEN** it exits non-zero with the stable diagnostic code and skill path

#### Scenario: malformed debt entry fails by its own diagnostic

- **GIVEN** the debt manifest contains an unknown code, duplicate waiver, or a
  fingerprint that differs from the normalized current violation
- **WHEN** debt validation runs
- **THEN** it exits non-zero with the corresponding unknown-code, duplicate, or
  fingerprint diagnostic rather than accepting the waiver

#### Scenario: debt can only decrease after bootstrap

- **GIVEN** `SKILL_QC_BASE` points to a comparison base that already contains the
  known-debt manifest
- **WHEN** a change adds or broadens a waiver
- **THEN** the monotonic debt check exits non-zero; deleting resolved waivers passes
