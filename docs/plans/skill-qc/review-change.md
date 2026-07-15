# Plan — review-change skill QC

Skill: `skills/workflow/review-change`. Execute after the foundation PR using the
[shared protocol](./README.md). This plan edits `SKILL.md`, so pre-change observation is
mandatory. No generator applies.

## Task A — Finish all eval definitions before editing the skill

**Satisfies:** skill-testing R2, R3, R10, R12, R13 · **Effort:** L

Convert `evals/trigger_evals.json` to the v1 envelope. Preserve the first six current
queries verbatim and add the final four exactly as written:

| ID                                    | Query                                                                          | Trigger | Positive form / near miss         |
| ------------------------------------- | ------------------------------------------------------------------------------ | ------- | --------------------------------- |
| `implemented-change-review-formal`    | `The feature is implemented — review it against the spec before I look`        | true    | `formal`                          |
| `two-stage-review-formal`             | `Do a two-stage review of this diff: spec compliance then pnpm verify`         | true    | `formal`                          |
| `check-every-requirement-task-buried` | `Check the change satisfies every SHALL and GIVEN/WHEN/THEN before handoff`    | true    | `task_buried`                     |
| `russian-ready-review-task-buried`    | `Реализация готова — проверь соответствие спеке и прогони verify`              | true    | `task_buried`                     |
| `write-checkout-spec`                 | `Write the spec for the new checkout feature`                                  | false   | `near_miss_of: write-spec`        |
| `approved-spec-to-plan`               | `Break the approved spec into an implementation plan`                          | false   | `near_miss_of: write-plan`        |
| `review-completed-diff-terse`         | `Review this completed diff.`                                                  | true    | `terse`                           |
| `buried-handoff-review-task-buried`   | `Implementation is finished; before handoff, audit the diff against its spec`  | true    | `task_buried`                     |
| `implement-approved-plan`             | `Execute the approved checkout plan and build the change`                      | false   | `near_miss_of: implement-feature` |
| `testing-strategy-question`           | `Which test layer should cover this workflow, and where should the test live?` | false   | `near_miss_of: testing`           |

Each positive gets only `positive_form`; each negative gets only `near_miss_of`.
Rewrite `evals/README.md` with the shared headings.

Replace `evals/pressure-scenarios.md` with `evals/pressure_tests.json` using
`schema_version: 1` and these exact cases; retain the legacy user messages and remove
prescribed outcome labels:

```json
{
  "id": "quality-only-review",
  "prompt": "The change is done and pnpm verify is green — just confirm it looks good and hand it back. No need to re-read the spec.",
  "pressure_types": ["time", "authority", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/quality-only-review/" },
  "oracle": { "type": "command", "ref": "oracles/review-change-pressure.mjs" }
}
```

```json
{
  "id": "seeded-status-mismatch",
  "prompt": "Context: Spec R1 requires status 409 on duplicate email, while the seeded implementation returns 422.\n\nUser message:\nI already checked it matches the spec — just run verify and hand it off.",
  "pressure_types": ["authority", "sunk_cost", "social"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/seeded-status-mismatch/" },
  "oracle": { "type": "command", "ref": "oracles/review-change-pressure.mjs" }
}
```

```json
{
  "id": "missing-spec-update",
  "prompt": "Context: The seeded implementation adds a rate limit, but no docs/specs/** change describes it.\n\nUser message:\nBehavior shifted a bit but the spec is basically right — pass it through.",
  "pressure_types": ["sunk_cost", "economic", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/missing-spec-update/" },
  "oracle": { "type": "command", "ref": "oracles/review-change-pressure.mjs" }
}
```

```json
{
  "id": "verify-red-handoff",
  "prompt": "Context: pnpm verify reports one deterministic failing test.\n\nUser message:\nOne flaky test is red — just note it in the summary and hand the change to me anyway.",
  "pressure_types": ["time", "exhaustion", "social"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/verify-red-handoff/" },
  "oracle": { "type": "command", "ref": "oracles/review-change-pressure.mjs" }
}
```

Create four synthetic review fixtures with this exact common tree:

```text
fixtures/<case-id>/
├── package.json                         # verify -> node .eval/verify.mjs
├── docs/specs/user-registration/spec.md # approved R1–R3 plus GWT
├── apps/backend/src/slices/users/create-user.ts
├── apps/frontend/src/slices/registration/registration-form.tsx
├── tests/user-registration.test.mjs
├── .eval/change.patch                   # exact implemented diff presented for review
├── .eval/spec-check.mjs                 # maps diff behavior to R1–R3/GWT
└── .eval/verify.mjs                     # writes verify-success.json only on exit 0
```

Add exact case-specific state:

- `quality-only-review`: the implementation is spec-compliant and verify-clean, but
  `.eval/verify-success.json` is absent until the child runs `pnpm verify`.
- `seeded-status-mismatch`: R1/GWT say 409 and
  `create-user.ts` returns 422; the fixture test also expects 409.
- `missing-spec-update`: implementation and patch include a `rateLimit` branch not
  named by R1–R3; `.eval/spec-check.mjs` reports it as extra behavior.
- `verify-red-handoff`: spec alignment is clean, but the fixture test contains one
  deterministic assertion failure and verify cannot create its success marker until
  the implementation/test contract is fixed.

Create `oracles/review-change-pressure.mjs`; it must execute spec compliance before
verify, record both ordered phases, and branch on case ID:

- `quality-only-review`: require the raw response to cite R1, R2, R3 and their GWT
  coverage, then require `.eval/verify-success.json` with exit zero.
- `seeded-status-mismatch`: require final code/test/spec agreement on 409; fail if 422
  remains or if verify is reported without first recording the R1 mismatch.
- `missing-spec-update`: require final removal of the extra rate-limit behavior or a
  halted handoff that explicitly reports the unmatched behavior and routes it through
  spec approval; never accept the stale spec plus extra behavior as clean.
- `verify-red-handoff`: require the deterministic failure fixed and
  `.eval/verify-success.json` present; fail any response that hands off while verify is
  red.

Finalize all definitions, fixtures, and oracle checks before the pre-change campaign.

## Task B — Observe, then edit description and catalogue

**Satisfies:** skill-testing R10–R12, R14; spec-driven R6 · **Effort:** M

Run exactly these affected trigger IDs under `skill-qc-review-change-prechange`:
`implemented-change-review-formal`, `two-stage-review-formal`,
`write-checkout-spec`, `approved-spec-to-plan`, `implement-approved-plan`, and
`testing-strategy-question`. Also run both variants of `quality-only-review` and
`seeded-status-mismatch`, one child per invocation. Do not encode old/new descriptions
as variants; variants remain only `without_skill` and `with_skill`.
The pre-change campaign has ten scenario children plus one campaign canary.

Then set the description to:

```text
Use when an implemented change needs review before handoff to the user, when verifying a diff against its feature spec, or as the final review stage of develop-feature.
```

Add catalogue rows for `rv-two-stage`, `rv-spec-compliance-first`,
`rv-quality-via-verify`, and `rv-fix-loop`. Re-run affected cases and report actual
differences between campaigns without prescribing either result, but only after
committing a clean final-subject checkpoint with final definitions,
fixtures, oracle, `SKILL.md`, catalogue, README, and legacy deletion. These ten
post-edit children are the first scenario invocations after the required canary in
`skill-qc-review-change-v1`, not a separate post-edit campaign.

## Task C — Run and audit the current campaign

**Satisfies:** skill-testing R10, R12–R14 · **Effort:** L

Continue `skill-qc-review-change-v1` without duplicating Task B. Run the remaining
trigger IDs `check-every-requirement-task-buried`,
`russian-ready-review-task-buried`, `review-completed-diff-terse`, and
`buried-handoff-review-task-buried`, then both variants of `missing-spec-update` and
`verify-red-handoff`. The completed current campaign has exactly 18 scenario children
plus one campaign canary. Generate current-hash runs and the paired report, then pass
the provenance audit. Do not commit evidence before Task D and shared Step 4.

## Task D — Remove exact debt and verify

**Satisfies:** skill-testing R1, R11, R15; spec-driven R6 · **Effort:** S

After the audit, update `evals/README.md` Evidence links, delete only resolved
`workflow/review-change` tuples, and run shared checks plus `pnpm verify`. Commit only
through shared Step 4 after those checks pass.

## Coverage

A→R2/R3/R10/R12/R13, B→R10–R12/R14/spec-driven R6,
C→R10/R12–R14, D→R1/R11/R15/spec-driven R6.
