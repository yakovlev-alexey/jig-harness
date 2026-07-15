# Plan — contracts skill QC

Skill: `skills/convention/contracts`. Execute after the foundation PR using the
[shared protocol](./README.md). No generator applies.

## Task A — Normalize trigger definitions and documentation

**Satisfies:** skill-testing R2, R10, R13 · **Effort:** S

Convert `evals/trigger_evals.json` to the exact v1 matrix below. Preserve the first six
queries byte-for-byte. Eleven cases are intentional: the existing React lint negative
routes to `frontend-architecture`, and four added negatives cover the other contract
boundaries.

```json
{
  "schema_version": 1,
  "cases": [
    {
      "id": "shared-users-zod-location",
      "query": "Where should shared Zod schemas for the users API live?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "frontend-imports-backend-usecase",
      "query": "Can the frontend import createUserUsecase from apps/backend?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "raw-prisma-response",
      "query": "Should the API return the raw Prisma User model?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "billing-contract-file-task",
      "query": "Add packages/types/src/slices/billing/billing-contracts.ts",
      "should_trigger": true,
      "positive_form": "terse"
    },
    {
      "id": "near-miss-react-widget-lint",
      "query": "Fix ESLint in a React widget",
      "should_trigger": false,
      "near_miss_of": "frontend-architecture"
    },
    {
      "id": "near-miss-fastify-command",
      "query": "Where do I put a Fastify command file?",
      "should_trigger": false,
      "near_miss_of": "backend-architecture"
    },
    {
      "id": "contract-boundary-terse",
      "query": "Shared API contract location?",
      "should_trigger": true,
      "positive_form": "terse"
    },
    {
      "id": "buried-checkout-contract-design",
      "query": "While adding checkout, define the request and response boundary shared by its frontend and backend without exposing persistence fields.",
      "should_trigger": true,
      "positive_form": "task_buried"
    },
    {
      "id": "near-miss-query-cache-shape",
      "query": "Where should the users query key and cache invalidation live?",
      "should_trigger": false,
      "near_miss_of": "state-and-data"
    },
    {
      "id": "near-miss-contract-test-layer",
      "query": "Choose the test layer for a Zod response schema edge case.",
      "should_trigger": false,
      "near_miss_of": "testing"
    },
    {
      "id": "near-miss-greenfield-stack",
      "query": "Choose the complete stack for a new jig monorepo.",
      "should_trigger": false,
      "near_miss_of": "project-defaults"
    }
  ]
}
```

Keep the current `SKILL.md` description unchanged because it is trigger-only. Rewrite
`evals/README.md` to the shared template and state eleven trigger cases.

## Task B — Add retrieval evals without empty support directories

**Satisfies:** skill-testing R9, R13 · **Effort:** S

Create `evals/evals.json` with these exact definitions:

```json
{
  "schema_version": 1,
  "cases": [
    {
      "id": "frontend-backend-contract-boundary",
      "kind": "retrieval",
      "prompt": "A users frontend needs the create-user request and response types. A teammate proposes importing createUserUsecase from apps/backend/src/slices/users. State the exact shared contract path and import boundary to use instead, including the role of Zod.",
      "variants": ["without_skill", "with_skill"],
      "workspace": { "kind": "none" },
      "oracle": {
        "type": "command",
        "ref": "oracles/contracts-retrieval.mjs"
      }
    },
    {
      "id": "prisma-response-boundary",
      "kind": "retrieval",
      "prompt": "The create-user endpoint currently returns its Prisma User record directly, including internal columns. Explain the concrete response-contract and mapping change required before the value reaches the client.",
      "variants": ["without_skill", "with_skill"],
      "workspace": { "kind": "none" },
      "oracle": {
        "type": "command",
        "ref": "oracles/contracts-retrieval.mjs"
      }
    }
  ]
}
```

Create only `evals/oracles/contracts-retrieval.mjs`; omit `fixtures/`. Through the
shared command-oracle adapter it grades the runner-captured raw response and returns
stable per-check evidence plus the exact response input hash; the scenario child never
grades itself. Implement these checks:

- `frontend-backend-contract-boundary`: require the vertical path
  `packages/types/src/slices/users/`, an import through `@app/types`, shared Zod request
  and response schemas/types, and an explicit rejection of a
  frontend import from `apps/backend/src/**` or of `createUserUsecase`; fail if a broad
  shared-domain package or duplicated frontend schema is recommended.
- `prisma-response-boundary`: require an explicit response Zod schema, a mapped/selected
  public response object, endpoint-boundary parse or validation, and omission of
  persistence-only fields; fail if the answer permits returning the raw Prisma model,
  spreading the entire record, or treating a Prisma type as the public API contract.

Checks must normalize Markdown/code formatting but not use subjective semantic scoring.

## Task C — Run and audit the current campaign

**Satisfies:** skill-testing R9, R13, R14 · **Effort:** M

Run each trigger separately and each retrieval case separately for both variants under
`skill-qc-contracts-v1`. Generate the runner-owned runs, canary, and paired report, pass
the provenance audit, and commit them only through shared Step 4 after all checks pass.

## Task D — Remove exact debt and verify

**Satisfies:** skill-testing R1, R15 · **Effort:** S

Delete only resolved `convention/contracts` debt tuples and run the shared checks plus
`pnpm verify`.

## Coverage

A→R2/R10/R13, B→R9/R13, C→R9/R13/R14, D→R1/R15.
