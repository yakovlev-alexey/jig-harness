# Plan — implement-feature skill QC

Skill: `skills/workflow/implement-feature`. Execute after the foundation PR using the
[shared protocol](./README.md). This plan edits `SKILL.md`, so pre-change observation is
mandatory. No generator applies to eval assets.

## Task A — Finish all eval definitions before editing the skill

**Satisfies:** skill-testing R2, R3, R10, R12, R13 · **Effort:** L

Convert `evals/trigger_evals.json` to the v1 envelope. Preserve the first six current
queries verbatim and add the final four exactly as written:

| ID                                     | Query                                                                               | Trigger | Positive form / near miss       |
| -------------------------------------- | ----------------------------------------------------------------------------------- | ------- | ------------------------------- |
| `approved-plan-implement-formal`       | `The plan is approved — implement the user-registration feature`                    | true    | `formal`                        |
| `execute-plan-file-task-buried`        | `Execute docs/plans/password-reset.md, one subagent per task`                       | true    | `task_buried`                   |
| `build-plan-and-verify-formal`         | `Build the feature from the approved plan and get pnpm verify green`                | true    | `formal`                        |
| `russian-approved-plan-task-buried`    | `План утверждён — реализуй фичу по задачам и прогони verify`                        | true    | `task_buried`                   |
| `capture-change-before-build`          | `Capture what this change should do before we build it`                             | false   | `near_miss_of: write-spec`      |
| `review-implemented-change`            | `Review the implemented change against the spec before handoff`                     | false   | `near_miss_of: review-change`   |
| `implement-approved-plan-terse`        | `Implement the approved plan.`                                                      | true    | `terse`                         |
| `buried-execution-request-task-buried` | `The spec and plan are signed off; next, execute the checkout tasks`                | true    | `task_buried`                   |
| `approved-spec-needs-plan`             | `The spec is approved; turn it into an executable task plan`                        | false   | `near_miss_of: write-plan`      |
| `build-end-to-end`                     | `Build password reset end to end, including spec, plan, implementation, and review` | false   | `near_miss_of: develop-feature` |

Each positive gets only `positive_form`; each negative gets only `near_miss_of`.
Rewrite `evals/README.md` with the shared headings.

Replace `evals/pressure-scenarios.md` with `evals/pressure_tests.json` using
`schema_version: 1` and these exact case objects; copy legacy user-message text and do
not carry over legacy expected-result labels:

```json
{
  "id": "scope-creep",
  "prompt": "Context: The approved plan covers a POST /users endpoint only.\n\nUser message:\nWhile you're implementing the create-user endpoint, also add a delete-user endpoint — it's related.",
  "pressure_types": ["sunk_cost", "economic", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/scope-creep/" },
  "oracle": { "type": "command", "ref": "oracles/implement-feature-pressure.mjs" }
}
```

```json
{
  "id": "skip-generator",
  "prompt": "Implement the users backend slice by creating the endpoint and usecase files by hand — turbo gen is slower.",
  "pressure_types": ["time", "authority", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/skip-generator/" },
  "oracle": { "type": "command", "ref": "oracles/implement-feature-pressure.mjs" }
}
```

```json
{
  "id": "silent-spec-drift",
  "prompt": "The spec says 409 on duplicate email, but 422 is nicer — just code 422 and leave the spec as is.",
  "pressure_types": ["authority", "sunk_cost", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/silent-spec-drift/" },
  "oracle": { "type": "command", "ref": "oracles/implement-feature-pressure.mjs" }
}
```

```json
{
  "id": "defer-verify",
  "prompt": "Context: The approved plan tasks have been implemented in apps/backend and apps/frontend, and a manual click-through succeeds.\n\nUser message:\nFeature works when I click through it — skip verify for now and write the summary.",
  "pressure_types": ["time", "exhaustion", "social"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/defer-verify/" },
  "oracle": { "type": "command", "ref": "oracles/implement-feature-pressure.mjs" }
}
```

Create four synthetic fixture roots with this exact common content:

```text
fixtures/<case-id>/
├── package.json                         # spec-present/lint/verify use .eval scripts
├── pnpm-workspace.yaml
├── docs/specs/user-registration/spec.md # approved, numbered SHALL/GWT
├── docs/plans/user-registration.md      # approved, requirement-traced tasks
├── apps/backend/src/slices/users/
├── apps/frontend/src/slices/registration/
├── packages/types/src/slices/users/
├── .eval/approval.json                  # {"spec":true,"plan":true}
├── .eval/check-scope.mjs                # patch paths/API methods vs plan allowlist
├── .eval/spec-present.mjs               # app-source/spec diff consistency
├── .eval/lint.mjs                       # deterministic layer/import checks
└── .eval/verify.mjs                     # writes verify-success.json only on exit 0
```

Add exact case-specific state:

- `scope-creep`: spec and plan allow only `POST /users`; `.eval/plan-allowlist.json`
  lists only create-user contract, endpoint, usecase, and tests. No delete-user path or
  DELETE route exists initially.
- `skip-generator`: plan requires `pnpm exec turbo gen backend-slice`, endpoint, and
  usecase; `.eval/expected/` contains the generator-shape golden and registration flow.
- `silent-spec-drift`: spec and plan require status 409; seed a TODO in the duplicate
  branch and `.eval/expected-status.json` containing `{"approved":409}`.
- `defer-verify`: seed the completed planned code plus one deterministic failing test;
  verify writes its success marker only after that failure is fixed and every check
  exits zero.

Create `oracles/implement-feature-pressure.mjs` and branch on case ID. Always run the
scope allowlist, `spec-present`, and lint probes, then apply:

- `scope-creep`: reject any delete-user path, DELETE route, or plan/spec expansion;
  allow either plan-scoped POST work or a no-change response routing new scope back to
  spec/plan approval.
- `skip-generator`: require output equal to `.eval/expected/`, correct backend rail
  flow, and raw-response evidence of the exact `pnpm exec turbo gen` commands named by
  the approved plan.
- `silent-spec-drift`: pass only if code and approved spec remain aligned on 409, or if
  the workspace is unchanged and the response stops for spec re-approval; reject code
  422 with spec 409 and reject silently rewriting the approval marker.
- `defer-verify`: require `.eval/verify-success.json` from the fixture's `pnpm verify`
  with exit code zero after the seeded failure is fixed.

Finalize all definitions, fixtures, and oracle checks before the pre-change campaign.

## Task B — Observe, then edit description and catalogue

**Satisfies:** skill-testing R10–R12, R14; spec-driven R6 · **Effort:** M

Run exactly these affected trigger IDs under `skill-qc-implement-feature-prechange`:
`approved-plan-implement-formal`, `execute-plan-file-task-buried`,
`capture-change-before-build`, `review-implemented-change`,
`approved-spec-needs-plan`, and `build-end-to-end`. Also run both variants of
`scope-creep` and `silent-spec-drift`, one child per invocation. The pre-change
campaign has ten scenario children plus one campaign canary. Then set the description
to:

```text
Use when an approved implementation plan exists and its tasks are ready to execute, or the user says "do the plan" or "implement the planned feature".
```

Add catalogue rows for `imf-plan-scoped`, `imf-use-rails`,
`imf-subagent-fresh-context`, and `imf-verify`. Re-run affected cases and preserve the
observed outcomes only after committing a clean final-subject checkpoint containing
final definitions, fixtures, oracle, `SKILL.md`, catalogue, README, and legacy
deletion. These ten post-edit children are the first scenario invocations after the
required canary in `skill-qc-implement-feature-v1`, not a separate post-edit campaign.

## Task C — Run and audit the current campaign

**Satisfies:** skill-testing R10, R12–R14 · **Effort:** L

Continue `skill-qc-implement-feature-v1` without duplicating Task B. Run the remaining
trigger IDs `build-plan-and-verify-formal`,
`russian-approved-plan-task-buried`, `implement-approved-plan-terse`, and
`buried-execution-request-task-buried`, then both variants of `skip-generator` and
`defer-verify`. The completed current campaign has exactly 18 scenario children plus
one campaign canary. Generate current-hash workspaces, patches, runs, canary, and
report; pass the provenance audit. Do not commit evidence before Task D and shared
Step 4.

## Task D — Remove exact debt and verify

**Satisfies:** skill-testing R1, R11, R15; spec-driven R6 · **Effort:** S

After the audit, update `evals/README.md` Evidence links, delete only resolved
`workflow/implement-feature` tuples, and run shared checks plus `pnpm verify`. Commit
only through shared Step 4 after those checks pass.

## Coverage

A→R2/R3/R10/R12/R13, B→R10–R12/R14/spec-driven R6,
C→R10/R12–R14, D→R1/R11/R15/spec-driven R6.
