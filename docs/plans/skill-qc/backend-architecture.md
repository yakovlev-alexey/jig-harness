# Plan — backend-architecture skill QC

Skill: `skills/convention/backend-architecture`. Execute only after the foundation PR
and follow the [shared per-skill protocol](./README.md). No generator applies to the eval
assets; the evaluated agent may use the backend generators named by the skill.

## Task A — Normalize trigger definitions and documentation

**Satisfies:** skill-testing R2, R10, R13 · **Effort:** S

Edit `skills/convention/backend-architecture/evals/trigger_evals.json` to use this exact
v1 matrix. Preserve the first six queries byte-for-byte and add the final four:

```json
{
  "schema_version": 1,
  "cases": [
    {
      "id": "fastify-endpoint-placement",
      "query": "Where should I put a new Fastify endpoint for user registration?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "command-query-cross-call",
      "query": "Can my command call findUserByEmailQuery directly?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "backend-layer-segments",
      "query": "What layer segments are allowed under src/slices/users?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "domain-prisma-client-import",
      "query": "Should domain code import prisma client?",
      "should_trigger": true,
      "positive_form": "terse"
    },
    {
      "id": "near-miss-frontend-hero",
      "query": "Add a hero banner component to the landing slice",
      "should_trigger": false,
      "near_miss_of": "implement-frontend"
    },
    {
      "id": "near-miss-project-bootstrap",
      "query": "Bootstrap a new fullstack monorepo from scratch",
      "should_trigger": false,
      "near_miss_of": "setup-project"
    },
    {
      "id": "duplicate-email-usecase-placement",
      "query": "While fixing user registration, decide where duplicate-email lookup and creation are composed.",
      "should_trigger": true,
      "positive_form": "task_buried"
    },
    {
      "id": "transaction-composition-terse",
      "query": "Transaction boundary for two backend writes?",
      "should_trigger": true,
      "positive_form": "terse"
    },
    {
      "id": "near-miss-shared-response-contract",
      "query": "Define the shared Zod response contract for user registration.",
      "should_trigger": false,
      "near_miss_of": "contracts"
    },
    {
      "id": "near-miss-backend-test-layer",
      "query": "Choose the test layer for duplicate-email HTTP behavior.",
      "should_trigger": false,
      "near_miss_of": "testing"
    }
  ]
}
```

Keep the current `SKILL.md` description unchanged because it is already trigger-only.
Rewrite `evals/README.md` to the R13 template and state ten trigger cases.

## Task B — Add the application eval and deterministic oracle

**Satisfies:** skill-testing R9, R13 · **Effort:** M

Create `skills/convention/backend-architecture/evals/evals.json` with this exact
definition:

```json
{
  "schema_version": 1,
  "cases": [
    {
      "id": "duplicate-email-usecase",
      "kind": "application",
      "prompt": "Complete duplicate-email handling in the seeded users backend slice. POST /users must return 409 without creating a row when the email exists and create the user otherwise. Keep HTTP, orchestration, reads, writes, and pure domain concerns in their proper layers; make the changes in the workspace.",
      "variants": ["without_skill", "with_skill"],
      "workspace": {
        "kind": "fixture_copy",
        "source": "fixtures/duplicate-email-usecase/"
      },
      "oracle": {
        "type": "command",
        "ref": "oracles/duplicate-email-usecase.mjs"
      }
    }
  ]
}
```

Create the exact support tree:

```text
evals/
├── fixtures/duplicate-email-usecase/
│   ├── apps/backend/src/
│   │   ├── common/prisma.ts
│   │   └── slices/users/
│   │       ├── commands/create-user-command.ts
│   │       ├── domain/duplicate-email-error.ts
│   │       ├── endpoints/create-user-endpoint.ts
│   │       ├── plugins/users-plugin.ts
│   │       ├── queries/find-user-by-email-query.ts
│   │       └── usecases/create-user-usecase.ts
│   └── packages/types/src/slices/users/user-contracts.ts
└── oracles/duplicate-email-usecase.mjs
```

Seed `user-contracts.ts` with synthetic Zod request/response schemas; `prisma.ts` with a
typed fake client interface; query and command files with one read and one write that
accept the fake client; `duplicate-email-error.ts` with a pure named error type; the
usecase with TODO orchestration; the endpoint with request parsing and a TODO call into
the usecase; and the plugin with endpoint registration. No DB, network, environment, or
package-install dependency belongs in the fixture.

`duplicate-email-usecase.mjs` must run deterministic syntax/import checks over every
listed TypeScript file and the backend ESLint rules that do not require a built app. It
must require endpoint → usecase, usecase → query and command, the query to own the read,
the command to own the write, and the endpoint to map the typed duplicate error to 409.
It must reject Prisma access in endpoint/usecase/domain, any command↔query import,
Fastify/HTTP/`process.env`/external-I/O imports in domain, non-kebab-case paths, default
exports, top-level controller/service/repository folders, and additional operations
grouped into the seeded command/query files. Emit stable check evidence plus the exact
workspace input hash; never accept a child-authored quality judgment.

## Task C — Run and audit the current campaign

**Satisfies:** skill-testing R9, R13, R14 · **Effort:** M

Run every trigger case separately and run `duplicate-email-usecase` separately as
`without_skill` and `with_skill` under campaign
`skill-qc-backend-architecture-v1`. Generate the runner-owned runs, canary, and paired
report, pass `skill-eval:audit`, and commit them only through shared Step 4 after all
checks pass.

## Task D — Remove exact debt and verify

**Satisfies:** skill-testing R1, R15 · **Effort:** S

Delete from `scripts/skill-qc-known-debt.json` only the
`convention/backend-architecture` tuples whose diagnostics are absent from the aggregate
raw diagnostic output, then run all shared validation commands and `pnpm verify`.

## Coverage

A→R2/R10/R13, B→R9/R13, C→R9/R13/R14, D→R1/R15.
