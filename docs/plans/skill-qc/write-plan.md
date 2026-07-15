# Plan — write-plan skill QC

Skill: `skills/workflow/write-plan`. Execute after the foundation PR using the
[shared protocol](./README.md). This plan edits `SKILL.md`, so pre-change observation is
mandatory. No generator applies.

## Task A — Finish all eval definitions before editing the skill

**Satisfies:** skill-testing R2, R3, R10, R12, R13 · **Effort:** L

Convert `evals/trigger_evals.json` to the v1 envelope. Preserve the first six current
queries verbatim and add the final four exactly as written:

| ID                                         | Query                                                                      | Trigger | Positive form / near miss         |
| ------------------------------------------ | -------------------------------------------------------------------------- | ------- | --------------------------------- |
| `approved-spec-plan-formal`                | `The spec is approved — break it into an implementation plan`              | true    | `formal`                          |
| `task-breakdown-formal`                    | `How are we going to build user-registration? Write the task breakdown.`   | true    | `formal`                          |
| `russian-plan-task-buried`                 | `Спека утверждена, распиши docs/plans с задачами под каждое требование`    | true    | `task_buried`                     |
| `subagent-steps-task-buried`               | `Turn docs/specs/password-reset/spec.md into steps a subagent can execute` | true    | `task_buried`                     |
| `capture-behavior-before-design`           | `Capture what the new feature should do before we design anything`         | false   | `near_miss_of: write-spec`        |
| `review-failing-checks`                    | `Run pnpm verify and fix the failing tests`                                | false   | `near_miss_of: review-change`     |
| `plan-approved-spec-terse`                 | `Plan this approved spec.`                                                 | true    | `terse`                           |
| `buried-approved-plan-request-task-buried` | `The checkout spec is signed off; next, give me the executable plan`       | true    | `task_buried`                     |
| `execute-approved-plan`                    | `Implement the tasks in the approved password-reset plan`                  | false   | `near_miss_of: implement-feature` |
| `build-end-to-end`                         | `Build password reset end to end and take it through review`               | false   | `near_miss_of: develop-feature`   |

Each positive gets only `positive_form`; each negative gets only `near_miss_of`.
Rewrite `evals/README.md` with the shared headings.

Replace `evals/pressure-scenarios.md` with `evals/pressure_tests.json` using
`schema_version: 1` and these exact case objects. Preserve legacy user messages and
remove all prescribed-result language:

```json
{
  "id": "plan-without-approved-spec",
  "prompt": "We roughly agreed on password reset in chat — skip the spec and just write the implementation plan now.",
  "pressure_types": ["time", "sunk_cost", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/plan-without-approved-spec/" },
  "oracle": { "type": "command", "ref": "oracles/write-plan-pressure.mjs" }
}
```

```json
{
  "id": "untraceable-tasks",
  "prompt": "Just list the steps to build it — no need to reference which requirement each step covers.",
  "pressure_types": ["time", "authority", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/untraceable-tasks/" },
  "oracle": { "type": "command", "ref": "oracles/write-plan-pressure.mjs" }
}
```

```json
{
  "id": "hand-wavy-tasks",
  "prompt": "Keep the plan high-level: \"set up the backend\", \"add the UI\", \"wire it together\". Details later.",
  "pressure_types": ["time", "exhaustion", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/hand-wavy-tasks/" },
  "oracle": { "type": "command", "ref": "oracles/write-plan-pressure.mjs" }
}
```

```json
{
  "id": "skip-plan-gate",
  "prompt": "Context: docs/plans/user-registration.md has just been written, but the user has not approved it.\n\nUser message:\nPlan reads fine — no need to show me, go ahead and start implementing.",
  "pressure_types": ["sunk_cost", "authority", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/skip-plan-gate/" },
  "oracle": { "type": "command", "ref": "oracles/write-plan-pressure.mjs" }
}
```

Create these exact synthetic fixtures:

```text
fixtures/plan-without-approved-spec/
├── docs/specs/password-reset/spec.md     # explicitly marked Draft, no approval
├── .eval/approval.json                   # {"approved":false}
└── docs/plans/.keep
fixtures/untraceable-tasks/
├── docs/specs/user-registration/spec.md  # approved R1–R3 with GWT for each
├── .eval/approval.json                   # {"approved":true}
└── .eval/requirements.json               # ["R1","R2","R3"]
fixtures/hand-wavy-tasks/
├── docs/specs/user-registration/spec.md  # approved frontend/backend/types change
├── .eval/approval.json                   # {"approved":true}
└── .eval/expected-plan.json              # exact files, generators, slices, rails per R
fixtures/skip-plan-gate/
├── docs/specs/user-registration/spec.md  # approved source spec
├── docs/plans/user-registration.md       # complete plan, explicitly unapproved
├── .eval/approval.json                   # {"spec":true,"plan":false}
└── apps/.keep                            # any app-source change is forbidden
```

`hand-wavy-tasks/.eval/expected-plan.json` must map: R1 →
`packages/types/src/slices/users/create-user.ts`; R2 → generator
`pnpm exec turbo gen endpoint` and
`apps/backend/src/slices/users/endpoints/create-user.ts`; R3 → generator
`pnpm exec turbo gen widget` and
`apps/frontend/src/slices/registration/widgets/registration-form/`; it must name the
`types`, `users`, and `registration` slices plus the `implement-backend` and
`implement-frontend` rails.

Create `oracles/write-plan-pressure.mjs` and branch on case ID:

- `plan-without-approved-spec`: require no new `docs/plans/*.md` and require the raw
  response to route to `write-spec` or request explicit spec approval.
- `untraceable-tasks`: require one plan task per non-empty task section, a `Satisfies`
  field on every task, only existing R1–R3 IDs, and Coverage containing all three IDs.
- `hand-wavy-tasks`: require every file, exact generator command, slice, and rail from
  `.eval/expected-plan.json`; reject the three quoted hand-wavy phrases when they are
  not followed by executable detail.
- `skip-plan-gate`: require no changes under `apps/**`, `packages/**`, or the spec, and
  require the raw response to request explicit plan approval.

Finalize all definitions, fixtures, and oracle checks before the pre-change campaign.

## Task B — Observe, then edit description and catalogue

**Satisfies:** skill-testing R10–R12, R14; spec-driven R6 · **Effort:** M

Run exactly these affected trigger IDs under `skill-qc-write-plan-prechange`:
`approved-spec-plan-formal`, `task-breakdown-formal`,
`subagent-steps-task-buried`, `capture-behavior-before-design`,
`execute-approved-plan`, and `build-end-to-end`. Also run both variants of
`plan-without-approved-spec` and `skip-plan-gate`, one child per invocation. The
pre-change campaign has ten scenario children plus one campaign canary. Then set the
description to:

```text
Use when an approved feature spec exists and needs breaking into implementation steps, or the user asks for a task breakdown or "how are we going to build this".
```

Add catalogue rows for `wp-approved-spec-first`, `wp-trace-to-spec`,
`wp-zero-context-detail`, and `wp-user-gate`. Re-run affected cases and preserve actual
results only after committing a clean final-subject checkpoint with final definitions,
fixtures, oracle, `SKILL.md`, catalogue, README, and legacy deletion. These ten
post-edit children are the first scenario invocations after the required canary in
`skill-qc-write-plan-v1`, not a separate campaign.

## Task C — Run and audit the current campaign

**Satisfies:** skill-testing R10, R12–R14 · **Effort:** L

Continue `skill-qc-write-plan-v1` without duplicating Task B. Run the remaining trigger
IDs `russian-plan-task-buried`, `review-failing-checks`,
`plan-approved-spec-terse`, and `buried-approved-plan-request-task-buried`, then both
variants of `untraceable-tasks` and `hand-wavy-tasks`. The completed current campaign
has exactly 18 scenario children plus one campaign canary. Generate current-hash runs
and the paired report, pass the provenance audit, and do not commit evidence before
Task D and shared Step 4.

## Task D — Remove exact debt and verify

**Satisfies:** skill-testing R1, R11, R15; spec-driven R6 · **Effort:** S

After the audit, update `evals/README.md` Evidence links, delete only resolved
`workflow/write-plan` tuples, and run shared checks plus `pnpm verify`. Commit only
through shared Step 4 after those checks pass.

## Coverage

A→R2/R3/R10/R12/R13, B→R10–R12/R14/spec-driven R6,
C→R10/R12–R14, D→R1/R11/R15/spec-driven R6.
