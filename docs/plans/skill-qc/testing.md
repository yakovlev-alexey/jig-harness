# Plan — testing skill QC

Skill: `skills/convention/testing`. Execute after the foundation PR using the
[shared protocol](./README.md). No generator applies.

## Task A — Normalize trigger definitions and documentation

**Satisfies:** skill-testing R2, R10, R13 · **Effort:** S

Convert `evals/trigger_evals.json` to the exact v1 matrix below. Preserve the first six
queries byte-for-byte. Eleven cases are intentional: the existing hero negative routes
to `react-composition`, and three new negatives cover contracts, state, and review.

```json
{
  "schema_version": 1,
  "cases": [
    {
      "id": "frontend-integration-tool",
      "query": "How should frontend integration tests run in the jig template — Playwright or React Testing Library?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "database-required-no-skip",
      "query": "Can I skip backend integration tests when DATABASE_URL is unset?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "parallel-e2e-isolation",
      "query": "How do parallel E2E tests isolate data without a global DB reset?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "verify-versus-e2e",
      "query": "What is the difference between pnpm verify and pnpm test:e2e?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "near-miss-fastify-command",
      "query": "Where should I put a new Fastify command file?",
      "should_trigger": false,
      "near_miss_of": "backend-architecture"
    },
    {
      "id": "near-miss-hero-component",
      "query": "Add a hero banner component to the landing slice",
      "should_trigger": false,
      "near_miss_of": "react-composition"
    },
    {
      "id": "test-layer-terse",
      "query": "Unit, integration, or E2E?",
      "should_trigger": true,
      "positive_form": "terse"
    },
    {
      "id": "buried-checkout-test-strategy",
      "query": "While adding checkout, place its pure price cases, HTTP behavior, browser states, and main purchase path in the right test layers.",
      "should_trigger": true,
      "positive_form": "task_buried"
    },
    {
      "id": "near-miss-zod-contract-shape",
      "query": "Define the shared Zod response schema for checkout.",
      "should_trigger": false,
      "near_miss_of": "contracts"
    },
    {
      "id": "near-miss-query-invalidation",
      "query": "Wire users query invalidation after createUser succeeds.",
      "should_trigger": false,
      "near_miss_of": "state-and-data"
    },
    {
      "id": "near-miss-review-completed-change",
      "query": "Review the completed checkout implementation before handoff.",
      "should_trigger": false,
      "near_miss_of": "review-change"
    }
  ]
}
```

Keep the current `SKILL.md` description unchanged because it enumerates test-related
activation intents only. Rewrite `evals/README.md` to the shared template and state
eleven trigger cases.

## Task B — Add prompt-only test-strategy retrieval cases

**Satisfies:** skill-testing R9, R13 · **Effort:** S

Create `evals/evals.json` with these exact definitions:

```json
{
  "schema_version": 1,
  "cases": [
    {
      "id": "duplicate-email-test-layer",
      "kind": "retrieval",
      "prompt": "We need to verify that POST /users returns 409 and creates no second row for an existing email. Choose the primary test layer and exact jig tooling, database model, assertions, isolation, and cleanup. State what should not be used for this case.",
      "variants": ["without_skill", "with_skill"],
      "workspace": { "kind": "none" },
      "oracle": {
        "type": "command",
        "ref": "oracles/testing-retrieval.mjs"
      }
    },
    {
      "id": "database-required-in-ci",
      "kind": "retrieval",
      "prompt": "Backend integration tests fail in CI because DATABASE_URL is unset and PostgreSQL is not migrated. A teammate proposes conditionally skipping the suite. Give the required CI response and concrete repair steps.",
      "variants": ["without_skill", "with_skill"],
      "workspace": { "kind": "none" },
      "oracle": {
        "type": "command",
        "ref": "oracles/testing-retrieval.mjs"
      }
    }
  ]
}
```

Create only `evals/oracles/testing-retrieval.mjs`; omit `fixtures/`. Through the
shared command-oracle adapter it consumes the runner-captured response and emits stable
per-check evidence plus the exact response input hash. Implement these checks:

- `duplicate-email-test-layer`: require backend integration, vitest, Fastify
  `app.inject`, a real migrated PostgreSQL database, assertions for both HTTP 409 and no
  second persisted row, a unique per-test namespace in the email, and targeted
  delete-by-prefix cleanup; fail if it recommends E2E as the primary layer, mocked
  Prisma, a global reset/truncate, `test.skip`, or global row-count assertions.
- `database-required-in-ci`: require a hard failure rather than a skip, provisioning
  PostgreSQL, setting `DATABASE_URL`, applying migrations (or `pnpm db:setup` in the
  supported environment), and rerunning integration tests; fail if it permits
  `test.skip`, conditional suite omission, a mocked database replacement, or treating
  the integration suite as optional.

The response oracle normalizes Markdown/code formatting only; it must not delegate
grading to the scenario child or use subjective similarity scoring.

## Task C — Run and audit the current campaign

**Satisfies:** skill-testing R9, R13, R14 · **Effort:** M

Run every trigger and every retrieval `case × variant` separately under
`skill-qc-testing-v1`. Generate runner-owned runs, canary, and report, pass the audit, and
commit them only through shared Step 4 after all checks pass. The audit updates only the
runner-owned `Provenance` block in the existing report.

## Task D — Remove exact debt and verify

**Satisfies:** skill-testing R1, R15 · **Effort:** S

Delete only resolved `convention/testing` tuples and run shared checks plus
`pnpm verify`.

## Task E — Close the migration at zero debt

**Satisfies:** skill-testing R15 · **Effort:** S

Because `testing` is the final skill migration, run:

```bash
node scripts/check-skill-qc-debt.mjs --format json --include-waived
```

Require the aggregate raw diagnostic set in that JSON output to be empty before
continuing; a green exit after waiver application is insufficient. Commit the completed
testing migration and its last tuple deletions while
`scripts/skill-qc-known-debt.json` still exists, and keep that checkpoint clean. Record
that checkpoint SHA, delete `scripts/skill-qc-known-debt.json`, then run the comparator
with `SKILL_QC_BASE` set to the recorded checkpoint so it proves deletion of the base
manifest rather than a no-base local check:

```bash
SKILL_QC_BASE=<clean-zero-diagnostic-checkpoint-sha> pnpm run skill-qc:debt
pnpm run test:skill-validators
pnpm run coherence
pnpm run validate-skills
pnpm verify
```

Commit the manifest deletion only after all commands pass. Do not remove
`scripts/check-skill-qc-debt.mjs` or its CI wiring: when the comparison base contains
the comparator but no manifest, it is the permanent closed-state guard and must reject
any future manifest reintroduction.

## Coverage

A→R2/R10/R13, B→R9/R13, C→R9/R13/R14, D→R1/R15, E→R15.
