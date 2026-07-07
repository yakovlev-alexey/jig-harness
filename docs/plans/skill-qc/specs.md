# Plan — specs (skill QC)

Skill: [skills/convention/specs](../../../skills/convention/specs/SKILL.md).
Type: reference/technique · encoded-preference · model-invoked. Shared gate &
verification: [README](./README.md). Traces to skill-testing R9, R10.

## Task A — Add an L2 application eval (structure oracle)

**Satisfies:** skill-testing R9 · **Effort:** M

Add `evals/l2-<date>.md` with an application case graded by a structural check:

- "Write `docs/specs/user-registration/spec.md` for a duplicate-email rule." → oracle
  (deterministic structure check): feature-scoped folder name (intent, not slice);
  `## Purpose`; numbered `SHALL`/`MUST` requirements; every requirement has ≥1
  `GIVEN`/`WHEN`/`THEN` scenario; no rationale duplicated from `decisions.md`.

A small script asserting the headings/pattern is the oracle. Grade `with_skill` vs
`without_skill`.

## Task B — Grow trigger set to the near-miss floor

**Satisfies:** skill-testing R10 · **Effort:** S

`trigger_evals.json` is 6 (4+/2−). Grow to ≥10 with ≥4 near-miss negatives — the sharp
boundary is `write-spec` (the workflow that _does_ the writing) vs `specs` (the format
rulebook), plus `write-plan`. Add positive variation.

## Coverage

A→R9, B→R10. No orphan tasks.
