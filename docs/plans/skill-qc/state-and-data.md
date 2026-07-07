# Plan — state-and-data (skill QC)

Skill: [skills/convention/state-and-data](../../../skills/convention/state-and-data/SKILL.md).
Type: pattern · encoded-preference · model-invoked. Shared gate & verification:
[README](./README.md). Traces to skill-testing R9, R10.

## Task A — Add an L2 application eval (lint oracle)

**Satisfies:** skill-testing R9 · **Effort:** M

Add `evals/l2-<date>.md` with application cases graded by the enforced lint rule:

- "A shared UI filter is needed by two widgets on one page — wire it." → oracle: filter
  lives in a Nano Store atom; hooks live in `*.widget.tsx` (container); presenters take
  props only; passes `sd-no-store-in-presentational` lint; no server data mirrored into
  the store (`sd-no-server-data-in-stores`).
- "Create a user and refresh the list." → oracle: `useMutation({ mutationFn: command })`
  with `onSuccess` invalidation of the exported query key.

Grade `with_skill` vs `without_skill`; the `sd-no-store-in-presentational` rule is the
deterministic oracle.

## Task B — Grow trigger set to the near-miss floor

**Satisfies:** skill-testing R10 · **Effort:** S

`trigger_evals.json` is 6 (4+/2−). Grow to ≥10 with ≥4 near-miss negatives — boundary
against `react-composition` (presentation), `backend-architecture` (server logic), and
`contracts` (schemas) — plus positive variation.

## Coverage

A→R9, B→R10. No orphan tasks.
