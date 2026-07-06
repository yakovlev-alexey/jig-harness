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
- `scripts/coherence-check.mjs` — L0 catalogue ↔ custom-rule coherence.
- `rules-catalogue.md` — rule ↔ layer ↔ test crosswalk.
- `skills/**/evals/trigger_evals.json` — L1 trigger eval fixtures.
- `skills/**/evals/pressure-scenarios.md` — L2 pressure scenario definitions.
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
`evals/trigger_evals.json` schema, and (when available) agentskills.io contract
validation. `coherence-check.mjs` MUST ensure every custom ESLint rule has a
catalogue row and every catalogue enforcement id references an existing rule.

#### Scenario: invalid skill frontmatter fails L0

- **GIVEN** a `skills/**/SKILL.md` file missing the `description:` frontmatter key
- **WHEN** `pnpm run validate-skills` runs
- **THEN** the script exits non-zero and reports the offending skill path

#### Scenario: empty trigger evals fail L0

- **GIVEN** a skill directory whose `evals/trigger_evals.json` is an empty array
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

Each installable skill under `skills/` MUST ship `evals/trigger_evals.json`: a
non-empty array of `{ query, should_trigger }` items. L1 evals are run manually
or by agent harnesses to verify the skill activates for the right user queries and
stays silent for unrelated ones.

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

### R3 — L2 pressure scenarios SHALL be graded by the enforcement suite

Shipped workflow skills MUST document L2 pressure scenarios in
`evals/pressure-scenarios.md`. Each scenario defines a user message, the expected
RED violation without the skill, and the GREEN expectation with the skill. The
oracle MUST include running the enforcement suite (`pnpm lint` and applicable
gates such as `spec-present`) on the agent's output — skill-off vs skill-on
violation counts measure behavior change.

#### Scenario: pressure doc declares RED/GREEN protocol

- **GIVEN** a workflow skill with L2 coverage (e.g. `implement-feature`)
- **WHEN** its `evals/pressure-scenarios.md` is read
- **THEN** it documents a RED pass (skill off), a GREEN pass (skill on), and names
  the lint-based oracle

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

- **GIVEN** `packages/eslint-plugin/src/rules/no-reexport-only.ts` is a shipped
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
