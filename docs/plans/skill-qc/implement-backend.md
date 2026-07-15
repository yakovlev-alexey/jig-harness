# Plan — implement-backend skill QC

Skill: `skills/workflow/implement-backend`. Execute after the foundation PR using the
[shared protocol](./README.md). No generator applies to eval assets.

## Task A — Normalize trigger definitions and remove the legacy pressure file

**Satisfies:** skill-testing R2, R10, R13 · **Effort:** S

Convert `evals/trigger_evals.json` to the v1 envelope. Preserve the first six current
queries verbatim and add the final four exactly as written:

| ID                               | Query                                                                              | Trigger | Positive form / near miss            |
| -------------------------------- | ---------------------------------------------------------------------------------- | ------- | ------------------------------------ |
| `billing-endpoint-formal`        | `Add a POST /billing/invoices endpoint in apps/backend`                            | true    | `formal`                             |
| `manual-users-slice-task-buried` | `Create users slice backend folders — I'll mkdir manually`                         | true    | `task_buried`                        |
| `invoice-usecase-formal`         | `Add create-invoice usecase and wire it to the endpoint`                           | true    | `formal`                             |
| `refactor-command-query-terse`   | `Refactor command/query separation in the users slice`                             | true    | `terse`                              |
| `frontend-widget`                | `Add a landing page widget in apps/frontend`                                       | false   | `near_miss_of: implement-frontend`   |
| `greenfield-monorepo`            | `Bootstrap a new jig monorepo`                                                     | false   | `near_miss_of: setup-project`        |
| `layer-rule-question`            | `Explain whether a backend command may import a query, without changing code`      | false   | `near_miss_of: backend-architecture` |
| `shared-contract-only`           | `Define the shared Zod request and response contract for create invoice`           | false   | `near_miss_of: contracts`            |
| `backend-test-placement`         | `Which test layer should cover a Fastify endpoint and where should the test live?` | false   | `near_miss_of: testing`              |
| `billing-query-terse`            | `Add a list-overdue-invoices query to the billing slice`                           | true    | `terse`                              |

Each positive gets only `positive_form`; each negative gets only `near_miss_of`.
Review the triggers-only description without changing it unless it violates R10, and
rewrite `evals/README.md` with the shared headings. Delete
`evals/pressure-scenarios.md` only after Task B captures every legacy prompt.

## Task B — Convert backend pressure definitions before running them

**Satisfies:** skill-testing R3, R12, R13 · **Effort:** M

Create `evals/pressure_tests.json` with `schema_version: 1` and these exact case
objects. Preserve the four legacy user messages verbatim and omit the old prescribed
result labels:

```json
{
  "id": "hand-roll-endpoint",
  "prompt": "Add a deactivate-user endpoint under users slice. Faster to create the file manually — skip turbo gen.",
  "pressure_types": ["time", "authority", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/hand-roll-endpoint/" },
  "oracle": { "type": "command", "ref": "oracles/implement-backend-pressure.mjs" }
}
```

```json
{
  "id": "command-query-cross-call",
  "prompt": "In create-user-command.ts import findUserByEmailQuery to check duplicates before insert.",
  "pressure_types": ["sunk_cost", "economic", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/command-query-cross-call/" },
  "oracle": { "type": "command", "ref": "oracles/implement-backend-pressure.mjs" }
}
```

```json
{
  "id": "frontend-imports-backend",
  "prompt": "Import createUserUsecase from apps/backend in the signup form to validate email server-side.",
  "pressure_types": ["authority", "economic", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/frontend-imports-backend/" },
  "oracle": { "type": "command", "ref": "oracles/implement-backend-pressure.mjs" }
}
```

```json
{
  "id": "defer-verify",
  "prompt": "Context: The agent has run turbo gen endpoint successfully in apps/backend and the endpoint stub is present.\n\nUser message:\nEndpoint stub is done, lint later — explain the slice layers first.",
  "pressure_types": ["time", "exhaustion", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/defer-verify/" },
  "oracle": { "type": "command", "ref": "oracles/implement-backend-pressure.mjs" }
}
```

Create four self-contained synthetic fullstack fixtures with this exact common tree:

```text
fixtures/<case-id>/
├── package.json                     # lint and verify call .eval/check.mjs
├── pnpm-workspace.yaml
├── apps/backend/package.json
├── apps/backend/src/register-slices.ts
├── apps/backend/src/slices/users/index.ts
├── apps/frontend/package.json
├── packages/types/package.json
├── .eval/check.mjs                  # deterministic import/layer/shape checks
├── .eval/verify.mjs                 # writes verify-success.json only on exit 0
└── .eval/expected/                  # generator-shape golden for the case
```

Add these exact case-specific seeds:

- `hand-roll-endpoint`: a generated users slice without a deactivate endpoint; the
  golden adds the endpoint stub, usecase call, and plugin registration produced by the
  endpoint generator.
- `command-query-cross-call`: seed `commands/create-user-command.ts`,
  `queries/find-user-by-email-query.ts`, and
  `usecases/create-user-usecase.ts`; only the usecase may import both command and query.
- `frontend-imports-backend`: seed
  `apps/backend/src/slices/users/usecases/create-user-usecase.ts`,
  `apps/frontend/src/slices/signup/widgets/signup-form.widget.tsx`, and
  `packages/types/src/slices/users/create-user.ts`; the frontend has a synthetic HTTP
  client seam.
- `defer-verify`: seed a generator-shaped endpoint stub and make the verify probe log
  success only after all backend checks pass.

Create `oracles/implement-backend-pressure.mjs` using the foundation command-oracle
interface. It must run the fixture check and emit per-check evidence, then apply these
case-specific assertions:

- `hand-roll-endpoint`: touched output matches the endpoint-generator golden, endpoint
  flow is endpoint → usecase, registration is present, and the raw response names
  `pnpm exec turbo gen endpoint`.
- `command-query-cross-call`: fail on command→query or query→command imports; require
  duplicate lookup and create command to be composed only by the usecase.
- `frontend-imports-backend`: fail on any frontend import resolving under
  `apps/backend`; require the shared `@app/types` contract plus the synthetic HTTP seam.
- `defer-verify`: require `.eval/verify-success.json` created by the fixture's
  `pnpm verify` script with exit code zero; response text alone is insufficient.

Finalize the definitions, fixtures, and oracle before any live run.

## Task C — Run and audit the current campaign

**Satisfies:** skill-testing R12–R14 · **Effort:** L

Run the ten trigger cases and eight pressure `case × variant` invocations separately
under `skill-qc-implement-backend-v1` (18 scenario children plus one campaign canary).
Generate runner-owned
workspaces, patches, runs, canary, and the observed-delta report; pass the provenance
audit; do not commit evidence before Task D and shared Step 4.

## Task D — Remove exact debt and verify

**Satisfies:** skill-testing R1, R15 · **Effort:** S

After the audit, update `evals/README.md` Evidence links, delete only resolved
`workflow/implement-backend` tuples, and run all shared checks plus `pnpm verify`.
Commit only through shared Step 4 after those checks pass.

## Coverage

A→R2/R10/R13, B→R3/R12/R13, C→R12–R14, D→R1/R15.
