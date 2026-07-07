# Spec-Driven Workflow

## Purpose

Turn the "build X" loop into jig workflow skills, durable spec artifacts, and a
machine-enforced spec-present gate so every app-source change carries an updated
feature spec.

## Slices touched

- `packages/spec-present`
- `skills/convention/specs`
- `skills/workflow/write-spec`
- `skills/workflow/write-plan`
- `skills/workflow/implement-feature`
- `skills/workflow/review-change`
- `skills/workflow/develop-feature`
- `templates/fullstack/docs/specs/` (scaffolded artifact layout)
- `docs/adr/` (project-wide decisions)

## Requirements

### R1 — The workflow spine SHALL chain four phase skills with an orchestrator

The harness MUST ship workflow skills `write-spec`, `write-plan`,
`implement-feature`, and `review-change`, plus a thin `develop-feature`
orchestrator that chains them in order with user-verify gates between phases.
Each phase MUST dispatch to convention skills (notably `specs`) rather than
inlining their logic.

#### Scenario: develop-feature runs phases in order

- **GIVEN** a user asks to build a feature end to end
- **WHEN** the agent follows the `develop-feature` skill
- **THEN** it runs `write-spec` → `write-plan` → `implement-feature` →
  `review-change` in sequence, stopping for user approval after spec and plan

#### Scenario: write-spec produces durable artifacts

- **GIVEN** a feature needs specification
- **WHEN** the agent follows the `write-spec` skill
- **THEN** it creates or updates `docs/specs/<feature>/spec.md` with
  `SHALL`/`MUST` requirements and `GIVEN`/`WHEN`/`THEN` scenarios, recording
  feature-scoped decisions in `docs/specs/<feature>/decisions.md` or project-wide
  decisions in `docs/adr/`

### R2 — The spec-present gate SHALL require a spec change when app source changes

`@jig-harness/spec-present` MUST fail when any changed file matches
`apps/<name>/src/**` and no changed file matches `docs/specs/**`.

#### Scenario: app source and spec both changed (GREEN)

- **GIVEN** a change set includes `apps/backend/src/slices/users/endpoints/create-user-endpoint.ts`
  and `docs/specs/users/spec.md`
- **WHEN** the spec-present gate evaluates the change set
- **THEN** the gate passes (`ok` is true)

#### Scenario: only non-app files changed (GREEN)

- **GIVEN** a change set includes only `README.md` and `scripts/foo.mjs`
- **WHEN** the spec-present gate evaluates the change set
- **THEN** the gate passes

#### Scenario: only a spec changed (GREEN)

- **GIVEN** a change set includes only `docs/specs/users/spec.md`
- **WHEN** the spec-present gate evaluates the change set
- **THEN** the gate passes

#### Scenario: scaffolded-app source with spec (GREEN)

- **GIVEN** a change set includes `apps/frontend/src/slices/users/widgets/user-list/user-list.widget.tsx`
  and `docs/specs/users/spec.md`
- **WHEN** the spec-present gate evaluates the change set
- **THEN** the gate passes

#### Scenario: app source changed without spec (RED)

- **GIVEN** a change set includes `templates/fullstack/apps/backend/src/slices/users/commands/create-user-command.ts`
  and no file under `docs/specs/**`
- **WHEN** the spec-present gate evaluates the change set
- **THEN** the gate fails (`ok` is false) and lists the offending app-source files

#### Scenario: scaffolded-app source changed without spec (RED)

- **GIVEN** a change set includes `apps/frontend/src/slices/users/store/queries/users-query.ts`
  and no file under `docs/specs/**`
- **WHEN** the spec-present gate evaluates the change set
- **THEN** the gate fails and lists the offending app-source files

### R3 — The spec-present gate SHALL be coarse

The gate MUST check only that at least one file under `docs/specs/**` changed
when app source changed. It MUST NOT map changed code paths to a specific
feature or slice.

#### Scenario: any spec satisfies the gate

- **GIVEN** app source under `apps/backend/src/**` changed
- **WHEN** any file under `docs/specs/**` is also in the change set (regardless of feature name)
- **THEN** the gate passes even though no path-to-feature mapping was evaluated

### R4 — The spec-present gate SHALL be wired into `pnpm verify`

The template and harness MUST include spec-present in the verify pipeline so local
runs and CI enforce the gate before merge.

#### Scenario: verify CLI exits cleanly when gate passes

- **GIVEN** no app-source files changed relative to the resolved git base
- **WHEN** the spec-present CLI runs as part of verify
- **THEN** it exits `0` and prints `spec-present: OK`

#### Scenario: verify fails when gate is violated

- **GIVEN** app-source files changed without any `docs/specs/**` change
- **WHEN** the spec-present CLI runs
- **THEN** it exits non-zero with a message listing offending app-source files

### R5 — CI on push to main SHALL set `SPEC_PRESENT_BASE`

When CI runs the spec-present gate on a push to `main`, it MUST set
`SPEC_PRESENT_BASE` to `github.event.before` so the gate diffs the pushed
commits instead of an empty `origin/main..HEAD` range.

#### Scenario: main push diffs the pushed commit range

- **GIVEN** a push to `main` with `github.event.before` set to the prior commit SHA
- **WHEN** CI runs the spec-present gate
- **THEN** `SPEC_PRESENT_BASE` equals that SHA and changed files are resolved from
  `before..HEAD`, not from an uninitialized base
