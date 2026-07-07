# Plan — testing (skill QC)

Skill: [skills/convention/testing](../../../skills/convention/testing/SKILL.md).
Type: reference · encoded-preference · model-invoked. Shared gate & verification:
[README](./README.md). Traces to skill-testing R9, R10.

## Task A — Add an L2 retrieval eval

**Satisfies:** skill-testing R9 · **Effort:** S

Add `evals/l2-<date>.md` with retrieval cases + oracle checklist:

- "Where does an edge-case test for duplicate-email rejection go?" → oracle: unit or
  backend integration (`app.inject` + real DB), **not** E2E (`test-trophy-order`,
  `test-e2e-happy-paths`); names namespacing; no RTL/jsdom.
- "Postgres is down in CI — can I skip the integration tests?" → oracle: no; hard
  failure, fix `DATABASE_URL`/`db:setup` (`test-db-required`).

Grade `with_skill` vs `without_skill`.

## Task B — Grow trigger set to the near-miss floor

**Satisfies:** skill-testing R10 · **Effort:** S

`trigger_evals.json` is 6 (4+/2−). Grow to ≥10 with ≥4 near-miss negatives — boundary
against `backend-architecture` (slice layout) and `contracts` (schema shape) — plus
positive variation.

## Coverage

A→R9, B→R10. No orphan tasks.
