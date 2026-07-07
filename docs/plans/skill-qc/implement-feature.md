# Plan — implement-feature (skill QC)

Skill: [skills/workflow/implement-feature](../../../skills/workflow/implement-feature/SKILL.md).
Type: discipline · rigid · model-invoked · process. Shared gate & verification:
[README](./README.md). Traces to skill-testing R10, R11, R12 and spec-driven R6.

## Task A — Description: triggers only (drop workflow summary)

**Satisfies:** skill-testing R10, spec-driven R6 · **Effort:** XS

```
Use when an approved implementation plan exists and its tasks are ready to execute, or the user says "do the plan" / "implement the planned feature".
```

## Task B — Catalogue the `imf-*` rule IDs

**Satisfies:** skill-testing R11, spec-driven R6 · **Effort:** S

Add rows to [rules-catalogue.md](../../../rules-catalogue.md) for `imf-plan-scoped`,
`imf-use-rails`, `imf-subagent-fresh-context`, `imf-verify` (guidance:
`implement-feature`; status `guidance-only`). Verified by
[harness-coherence-check](./harness-coherence-check.md).

## Task C — Record without-skill baseline

**Satisfies:** skill-testing R12 · **Effort:** M

Run [pressure-scenarios.md](../../../skills/workflow/implement-feature/evals/pressure-scenarios.md)
`without_skill` (RED) and `with_skill` (GREEN); oracle = `pnpm lint` + the `spec-present`
gate on the produced diff (already named in the doc's protocol). Write a dated
`evals/l2-<date>.md`.

## Task D — Deepen pressure scenarios to 3+ combined

**Satisfies:** skill-testing R12 · **Effort:** S

Rewrite scenarios A–D to combine 3+ pressures with the A/B/C "choose and act" format;
re-run Task C.

## Task E — Grow trigger set to the floor

**Satisfies:** skill-testing R10 · **Effort:** S

`trigger_evals.json` is 6 (4+/2−). Grow to ≥10 with ≥4 near-miss negatives — boundary
against `write-plan` (planning) and `review-change` (reviewing) — plus variation.

## Coverage

A→R10/R6, B→R11/R6, C→R12, D→R12, E→R10. No orphan tasks.
