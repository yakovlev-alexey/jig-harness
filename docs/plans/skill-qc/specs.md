# Plan — specs skill QC

Skill: `skills/convention/specs`. Execute after the foundation PR using the
[shared protocol](./README.md). No generator applies.

## Task A — Normalize trigger definitions and documentation

**Satisfies:** skill-testing R2, R10, R13 · **Effort:** S

Convert `evals/trigger_evals.json` to this exact v1 matrix. Preserve the first six
queries byte-for-byte and add the final four:

```json
{
  "schema_version": 1,
  "cases": [
    {
      "id": "new-feature-spec-format",
      "query": "How do I write a spec.md for a new user-registration feature?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "requirement-gwt-format",
      "query": "What format should feature requirements use — SHALL with GIVEN/WHEN/THEN scenarios?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "update-feature-spec-after-api",
      "query": "I need to update the spec for the users feature after changing the API",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "feature-decision-or-adr",
      "query": "Should this go in docs/specs/<feature>/decisions.md or a project-wide ADR?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "near-miss-project-bootstrap",
      "query": "Bootstrap a new jig monorepo",
      "should_trigger": false,
      "near_miss_of": "setup-project"
    },
    {
      "id": "near-miss-landing-widget",
      "query": "Add a landing page widget",
      "should_trigger": false,
      "near_miss_of": "implement-frontend"
    },
    {
      "id": "spec-format-terse",
      "query": "Feature spec format?",
      "should_trigger": true,
      "positive_form": "terse"
    },
    {
      "id": "buried-checkout-decision-record",
      "query": "While defining checkout behavior, record its accepted retry decision without mixing rationale into the living requirements.",
      "should_trigger": true,
      "positive_form": "task_buried"
    },
    {
      "id": "near-miss-workflow-write-spec",
      "query": "Start the spec-first workflow for a new user-registration change and stop for my approval.",
      "should_trigger": false,
      "near_miss_of": "write-spec"
    },
    {
      "id": "near-miss-implementation-plan",
      "query": "Turn the approved user-registration spec into an implementation plan.",
      "should_trigger": false,
      "near_miss_of": "write-plan"
    }
  ]
}
```

Keep the current `SKILL.md` description unchanged because it states artifact triggers,
not a procedure. Rewrite `evals/README.md` to the shared template and state ten trigger
cases.

## Task B — Add an isolated feature-spec application case

**Satisfies:** skill-testing R9, R13 · **Effort:** M

Create `evals/evals.json` with this exact definition:

```json
{
  "schema_version": 1,
  "cases": [
    {
      "id": "duplicate-email-feature-spec",
      "kind": "application",
      "prompt": "Using PRODUCT-BRIEF.md and the existing accepted decision, create the living feature spec for user registration at the correct path. Cover duplicate and new email behavior with testable requirements and scenarios. Do not rewrite the accepted decision or create an implementation plan; make the change in the workspace.",
      "variants": ["without_skill", "with_skill"],
      "workspace": {
        "kind": "fixture_copy",
        "source": "fixtures/duplicate-email-feature-spec/"
      },
      "oracle": {
        "type": "command",
        "ref": "oracles/duplicate-email-feature-spec.mjs"
      }
    }
  ]
}
```

Create the exact support tree:

```text
evals/
├── fixtures/duplicate-email-feature-spec/
│   ├── PRODUCT-BRIEF.md
│   └── docs/specs/user-registration/decisions.md
└── oracles/duplicate-email-feature-spec.mjs
```

Seed `PRODUCT-BRIEF.md` with synthetic facts only: purpose “create an account with a
unique email”; touched slices `apps/backend/src/slices/users`,
`apps/frontend/src/slices/users`, and `packages/types/src/slices/users`; duplicate email
returns 409 and creates no row; new email returns 201 and persists one user. Seed
`decisions.md` with one dated accepted entry choosing a DB unique constraint, including
alternatives and rationale; the oracle embeds the seed file's exact SHA-256 so any edit
fails.

`duplicate-email-feature-spec.mjs` must require exactly
`docs/specs/user-registration/spec.md`; `# User Registration`, `## Purpose`,
`## Slices touched`, and `## Requirements`; numbered `R1`/`R2` headings whose bodies use
SHALL or MUST; and at least one complete GIVEN/WHEN/THEN scenario nested under each
requirement. It must observe the 409/no-second-row and 201/persist outcomes from the
brief, require all three touched slices, reject `docs/plans/**`, versioned/archive spec
copies, rationale or alternatives copied into `spec.md`, and any modification to
`decisions.md`. Emit stable command-oracle evidence plus the workspace input hash; do
not accept child self-grading.

## Task C — Run and audit the current campaign

**Satisfies:** skill-testing R9, R13, R14 · **Effort:** M

Run every trigger and both application variants separately under `skill-qc-specs-v1`.
Generate runner-owned evidence, pass the audit, and commit it only through shared Step 4
after all checks pass.

## Task D — Remove exact debt and verify

**Satisfies:** skill-testing R1, R15 · **Effort:** S

Delete only resolved `convention/specs` tuples and run the shared checks plus
`pnpm verify`.

## Coverage

A→R2/R10/R13, B→R9/R13, C→R9/R13/R14, D→R1/R15.
