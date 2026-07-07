# Plan — contracts (skill QC)

Skill: [skills/convention/contracts](../../../skills/convention/contracts/SKILL.md).
Type: reference · encoded-preference · model-invoked. Shared gate & verification:
[README](./README.md). Traces to skill-testing R9, R10.

## Task A — Add an L2 retrieval eval

**Satisfies:** skill-testing R9 · **Effort:** S

Add `evals/l2-<date>.md` with retrieval cases + oracle checklist (and a lint check
where code is produced):

- "Can the frontend import `createUserUsecase` from `apps/backend`?" → oracle: no; use
  `@app/types` only; cites `ct-no-frontend-backend-impl-imports`
  (`import-x/no-restricted-paths` catches it if code is produced).
- "Should the API return the raw Prisma `User` model?" → oracle: no; map through a Zod
  response schema (`ct-no-prisma-leak`).

Grade `with_skill` vs `without_skill`.

## Task B — Grow trigger set to the near-miss floor

**Satisfies:** skill-testing R10 · **Effort:** S

`trigger_evals.json` is 6 (4+/2−). Grow to ≥10 with ≥4 near-miss negatives — boundary
against `backend-architecture` (layer placement) and `state-and-data` (client cache) —
plus positive variation.

## Coverage

A→R9, B→R10. No orphan tasks.
