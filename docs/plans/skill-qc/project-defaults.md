# Plan — project-defaults skill QC

Skill: `skills/convention/project-defaults`. Execute after the foundation PR using the
[shared protocol](./README.md). No generator applies.

## Task A — Normalize triggers and remove the legacy report

**Satisfies:** skill-testing R2, R10, R13 · **Effort:** S

Convert `evals/trigger_evals.json` to the v1 envelope, preserve and ID the six cases,
then add the four cases shown below. Use this exact matrix; the first six queries stay
byte-for-byte equal to their current values:

```json
{
  "schema_version": 1,
  "cases": [
    {
      "id": "greenfield-fullstack-stack",
      "query": "What stack should I use for a new fullstack app?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "greenfield-shared-zod-location",
      "query": "Where do shared Zod schemas go?",
      "should_trigger": true,
      "positive_form": "terse"
    },
    {
      "id": "post-scaffold-types-explanation",
      "query": "Explain packages/types after scaffold",
      "should_trigger": true,
      "positive_form": "terse"
    },
    {
      "id": "greenfield-shadcn-choice",
      "query": "Should I use shadcn in this jig project?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "near-miss-react-refactor",
      "query": "Refactor this React component to use hooks",
      "should_trigger": false,
      "near_miss_of": "frontend-architecture"
    },
    {
      "id": "near-miss-existing-api-prisma",
      "query": "Add Prisma to the existing API",
      "should_trigger": false,
      "near_miss_of": "backend-architecture"
    },
    {
      "id": "greenfield-monorepo-defaults",
      "query": "New pnpm monorepo: React frontend, Fastify API — which jig defaults apply?",
      "should_trigger": true,
      "positive_form": "terse"
    },
    {
      "id": "buried-new-jig-stack-decision",
      "query": "Before we scaffold the new jig app, decide its router, CSS approach, database setup, and package layout.",
      "should_trigger": true,
      "positive_form": "task_buried"
    },
    {
      "id": "near-miss-existing-contract-location",
      "query": "Where should shared Zod request and response schemas live in this existing app?",
      "should_trigger": false,
      "near_miss_of": "contracts"
    },
    {
      "id": "near-miss-review-completed-change",
      "query": "Review the completed user-registration change before handoff.",
      "should_trigger": false,
      "near_miss_of": "review-change"
    }
  ]
}
```

Keep the current `SKILL.md` description unchanged: it already names activation intents
without summarizing a procedure. Validation must prove the three positive forms and four
near-miss targets.

Delete `evals/trigger-eval-report-2026-07-04.md`; do not repair its obsolete prose.
Rewrite `evals/README.md` to the shared template.

## Task B — Add prompt-only stack retrieval evals

**Satisfies:** skill-testing R9, R13 · **Effort:** S

Create `evals/evals.json` with exactly these definitions:

```json
{
  "schema_version": 1,
  "cases": [
    {
      "id": "greenfield-stack-retrieval",
      "kind": "retrieval",
      "prompt": "We are starting a new jig full-stack TypeScript monorepo. Recommend the package manager, monorepo tool, frontend framework, build tool, router, server-state library, backend framework, validation library, shared-contract location, styling approach, and local database setup. Also state whether Tailwind, shadcn/ui, Astro, and OpenAPI codegen are jig defaults.",
      "variants": ["without_skill", "with_skill"],
      "workspace": { "kind": "none" },
      "oracle": {
        "type": "command",
        "ref": "oracles/project-defaults-retrieval.mjs"
      }
    },
    {
      "id": "shared-contract-location",
      "kind": "retrieval",
      "prompt": "For a new jig monorepo with billing frontend and backend slices, where exactly should shared Zod request and response contracts live, how should frontend and backend import them, and which implementation imports must remain forbidden?",
      "variants": ["without_skill", "with_skill"],
      "workspace": { "kind": "none" },
      "oracle": {
        "type": "command",
        "ref": "oracles/project-defaults-retrieval.mjs"
      }
    }
  ]
}
```

Create only `evals/oracles/project-defaults-retrieval.mjs`; do not create a fixture
tree. Through the shared command-oracle adapter it consumes the runner-captured raw
response, not a child-authored grade, and returns stable check IDs plus one verdict.
Implement these checks:

- `greenfield-stack-retrieval`: require `pnpm`, TypeScript, Turborepo, React, Vite,
  TanStack Router with `src/routes/`, TanStack Query, Fastify, Zod,
  `packages/types/src/slices/<product-area>/`, colocated plain CSS with BEM, Prisma with
  PostgreSQL, `compose.yaml`, and `pnpm db:setup`; fail if the response recommends npm or
  Yarn in place of pnpm, or describes Tailwind, shadcn/ui, Astro, or OpenAPI codegen as a
  shipped jig default.
- `shared-contract-location`: require
  `packages/types/src/slices/billing/`, an `@app/types` import on both sides, and an
  explicit ban on frontend imports from `apps/backend/src/**`; fail if it proposes a
  broad shared-domain package or a frontend import of a backend usecase.

The command oracle must report one evidence record for every listed check and the exact
response input hash required by the shared independent-grading contract. The existing
`ss-backend-frontend-entry-only` catalogue row needs no new skill declaration: R11 is
one-way from owned declarations to catalogue rows.

## Task C — Run and audit the current campaign

**Satisfies:** skill-testing R9, R13, R14 · **Effort:** M

Run every trigger and every retrieval `case × variant` separately under
`skill-qc-project-defaults-v1`. Generate runner-owned runs, canary, and report, pass the
audit, and commit them only through shared Step 4 after all checks pass.

## Task D — Remove exact debt and verify

**Satisfies:** skill-testing R1, R15 · **Effort:** S

Delete only resolved `convention/project-defaults` tuples and run the shared checks plus
`pnpm verify`.

## Coverage

A→R2/R10/R13, B→R9/R13, C→R9/R13/R14, D→R1/R15.
