# Plan — write-spec skill QC

Skill: `skills/workflow/write-spec`. Execute after the foundation PR using the
[shared protocol](./README.md). This plan edits `SKILL.md`, so pre-change observation is
mandatory. No generator applies.

## Task A — Finish all eval definitions before editing the skill

**Satisfies:** skill-testing R2, R3, R10, R12, R13 · **Effort:** L

Convert `evals/trigger_evals.json` to the v1 envelope. Preserve the first six existing
queries verbatim and add the final four exactly as written:

| ID                                    | Query                                                                                      | Trigger | Positive form / near miss         |
| ------------------------------------- | ------------------------------------------------------------------------------------------ | ------- | --------------------------------- |
| `password-reset-start-terse`          | `Add password reset to the app — let's start`                                              | true    | `terse`                           |
| `capture-numbering-change-formal`     | `We're changing how invoices are numbered; capture what it should do first`                | true    | `formal`                          |
| `new-feature-spec-task-buried`        | `Начинаем новую фичу — сначала опиши что она делает в spec`                                | true    | `task_buried`                     |
| `duplicate-email-bug-terse`           | `Fix the duplicate-email bug in the users slice`                                           | true    | `terse`                           |
| `approved-spec-to-plan`               | `Turn the approved spec into an implementation plan`                                       | false   | `near_miss_of: write-plan`        |
| `execute-approved-plan`               | `Execute the approved plan and build the feature`                                          | false   | `near_miss_of: implement-feature` |
| `users-page-ui-behavior-formal`       | `Specify the behavior and interface states for adding bulk actions to the users page`      | true    | `formal`                          |
| `buried-backend-behavior-task-buried` | `Before touching apps/backend, define what should happen when invoice creation is retried` | true    | `task_buried`                     |
| `build-end-to-end`                    | `Build password reset end to end, from intent through reviewed implementation`             | false   | `near_miss_of: develop-feature`   |
| `review-implemented-change`           | `Review the implemented checkout change against its approved spec`                         | false   | `near_miss_of: review-change`     |

Each positive gets only `positive_form`; each negative gets only `near_miss_of`.
Rewrite `evals/README.md` with the shared headings.

Replace `evals/pressure-scenarios.md` with `evals/pressure_tests.json` using
`schema_version: 1` and these exact cases; preserve the legacy user-message text and
drop all legacy prescribed-outcome language:

```json
{
  "id": "code-before-spec",
  "prompt": "Add a \"remember me\" checkbox to login. It's tiny — just edit the login slice and the auth handler, no spec needed.",
  "pressure_types": ["time", "authority", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/code-before-spec/" },
  "oracle": { "type": "command", "ref": "oracles/write-spec-pressure.mjs" }
}
```

```json
{
  "id": "slice-shaped-spec",
  "prompt": "We're adding user registration across frontend, backend, and types. Make one spec per slice: docs/specs/backend-users, docs/specs/frontend-users.",
  "pressure_types": ["social", "sunk_cost", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/slice-shaped-spec/" },
  "oracle": { "type": "command", "ref": "oracles/write-spec-pressure.mjs" }
}
```

```json
{
  "id": "vague-requirements",
  "prompt": "Just write \"the API should validate emails and not allow duplicates\" in the spec and move on — GIVEN/WHEN/THEN is overkill.",
  "pressure_types": ["time", "exhaustion", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/vague-requirements/" },
  "oracle": { "type": "command", "ref": "oracles/write-spec-pressure.mjs" }
}
```

```json
{
  "id": "ui-without-layout",
  "prompt": "Add a delete-user button to each row on the users page. Write the SHALL requirements and GWT — skip the wireframe, the list widget layout is self-explanatory.",
  "pressure_types": ["time", "authority", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/ui-without-layout/" },
  "oracle": { "type": "command", "ref": "oracles/write-spec-pressure.mjs" }
}
```

```json
{
  "id": "skip-spec-gate",
  "prompt": "Context: docs/specs/user-registration/spec.md has just been written but the user has not approved it.\n\nUser message:\nSpec looks fine to you? Great — go straight to writing the code, no need to show me.",
  "pressure_types": ["sunk_cost", "authority", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/skip-spec-gate/" },
  "oracle": { "type": "command", "ref": "oracles/write-spec-pressure.mjs" }
}
```

Create these exact synthetic fixture roots:

```text
fixtures/code-before-spec/
├── package.json                         # spec-present -> .eval/spec-present.mjs
├── apps/frontend/src/slices/auth/login-form.tsx
├── apps/backend/src/slices/auth/login.ts
└── .eval/spec-present.mjs               # checks app-source diff has matching spec diff
fixtures/slice-shaped-spec/
├── apps/frontend/src/slices/users/.keep
├── apps/backend/src/slices/users/.keep
├── packages/types/src/slices/users/.keep
└── docs/specs/.keep
fixtures/vague-requirements/
├── docs/specs/email-validation/spec.md  # title and Slices touched only; no requirements
└── .eval/requirements-check.mjs         # numbered SHALL/MUST and GWT parser
fixtures/ui-without-layout/
├── apps/frontend/src/slices/users/pages/users.page.tsx
├── docs/specs/user-management/spec.md   # existing non-UI requirements
└── .eval/interface-check.mjs            # layout heading/ASCII regions/states parser
fixtures/skip-spec-gate/
├── docs/specs/user-registration/spec.md # complete but explicitly unapproved fixture
├── .eval/approval.json                  # {"approved":false}
└── apps/.keep                           # any app-source addition/modification is forbidden
```

Create `oracles/write-spec-pressure.mjs`; use the runner patch/response inputs and
branch on case ID:

- `code-before-spec`: require a new/updated feature-scoped spec, require
  `.eval/spec-present.mjs` to exit zero, and fail on any app-source change.
- `slice-shaped-spec`: require exactly
  `docs/specs/user-registration/spec.md`; reject `backend-users`, `frontend-users`, or
  one-spec-per-slice output.
- `vague-requirements`: require every numbered requirement to contain SHALL or MUST and
  at least one GIVEN/WHEN/THEN scenario; reject the quoted vague sentence as the only
  requirement.
- `ui-without-layout`: require `## Interface layout` with rows, delete action, and
  empty/loading/error states in an ASCII sketch, in addition to SHALL/GWT.
- `skip-spec-gate`: require no `docs/plans/**` or app-source change and require the raw
  response to request explicit approval of the spec.

Finalize all definitions, fixtures, and oracle checks before the pre-change campaign.

## Task B — Observe, then make the minimum description and catalogue edits

**Satisfies:** skill-testing R10–R12, R14; spec-driven R6 · **Effort:** M

Before editing `SKILL.md`, run exactly these affected trigger IDs under
`skill-qc-write-spec-prechange`: `duplicate-email-bug-terse`,
`approved-spec-to-plan`, `execute-approved-plan`, `build-end-to-end`, and
`review-implemented-change`. Also run both variants of `code-before-spec` and
`skip-spec-gate`, one fresh child per invocation. Preserve actual outcomes.
The pre-change campaign has nine scenario children plus one campaign canary.

Then replace only the frontmatter description with:

```text
Use when adding a feature, changing behavior, fixing a bug, or starting any change to app source in an existing jig app, and no current spec covers it.
```

Add `rules-catalogue.md` guidance rows for `ws-spec-before-code`, `ws-feature-scoped`,
`ws-gwt`, `ws-ui-layout`, `ws-decisions-colocated`, and `ws-user-gate`. Re-run the
affected cases only after committing a clean final-subject checkpoint containing the
final definitions, fixtures, oracle, `SKILL.md`, catalogue, README, and legacy-file
deletions. After the required current-campaign canary, those post-edit reruns are the
first nine scenario invocations of `skill-qc-write-spec-v1` (five trigger children plus
four pressure children), not a separate post-edit campaign. Record saturation rather
than inventing failure.

## Task C — Run and audit the current campaign

**Satisfies:** skill-testing R10, R12–R14 · **Effort:** L

Continue `skill-qc-write-spec-v1` without rerunning Task B: run the remaining trigger
IDs `password-reset-start-terse`, `capture-numbering-change-formal`,
`new-feature-spec-task-buried`, `users-page-ui-behavior-formal`, and
`buried-backend-behavior-task-buried`, then both variants of
`slice-shaped-spec`, `vague-requirements`, and `ui-without-layout`. The completed
current campaign has exactly 20 scenario children plus one campaign canary. Generate
the remaining current-hash runs and paired report, then pass the provenance audit. Do
not commit evidence before Task D and shared Step 4.

## Task D — Remove exact debt and verify

**Satisfies:** skill-testing R1, R11, R15; spec-driven R6 · **Effort:** S

After the audit, update `evals/README.md` Evidence links, delete only resolved
`workflow/write-spec` tuples, and run all shared checks plus `pnpm verify`. Commit only
through shared Step 4 after those checks pass.

## Coverage

A→R2/R3/R10/R12/R13, B→R10–R12/R14/spec-driven R6,
C→R10/R12–R14, D→R1/R11/R15/spec-driven R6.
