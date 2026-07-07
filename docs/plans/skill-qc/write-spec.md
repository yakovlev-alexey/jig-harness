# Plan — write-spec (skill QC)

Skill: [skills/workflow/write-spec](../../../skills/workflow/write-spec/SKILL.md).
Type: discipline · rigid · model-invoked · process. Shared gate & verification:
[README](./README.md). Traces to skill-testing R10, R11, R12 and spec-driven R6.

## Task A — Description: triggers only (drop workflow summary)

**Satisfies:** skill-testing R10, spec-driven R6 · **Effort:** XS

Replace the `description` frontmatter with triggers/symptoms only (the "how" already
lives in the body):

```
Use when adding a feature, changing behavior, fixing a bug, or starting any change to app source in an existing jig app, and no current spec covers it.
```

## Task B — Catalogue the `ws-*` rule IDs

**Satisfies:** skill-testing R11, spec-driven R6 · **Effort:** S

Add rows to [rules-catalogue.md](../../../rules-catalogue.md) for `ws-spec-before-code`,
`ws-feature-scoped`, `ws-gwt`, `ws-ui-layout`, `ws-decisions-colocated`, `ws-user-gate`
(guidance: `write-spec`; capability `—`; enforcement `—` except where `spec-present`
applies; tests: the L2/L3 eval id; status `guidance-only`). Verified by
[harness-coherence-check](./harness-coherence-check.md).

## Task C — Record without-skill baseline

**Satisfies:** skill-testing R12 · **Effort:** M

Run [pressure-scenarios.md](../../../skills/workflow/write-spec/evals/pressure-scenarios.md)
`without_skill` (RED, rationalizations verbatim) and `with_skill` (GREEN); oracle =
`spec-present` gate + a spec-structure check. Write a dated `evals/l2-<date>.md`.

## Task D — Reorder and deepen pressure scenarios

**Satisfies:** skill-testing R12 · **Effort:** S

Fix the scenario order (currently A, B, C, E, D) and rewrite each to combine 3+
pressures with the A/B/C "choose and act" format. Re-run Task C.

## Task E — Grow trigger set to the floor

**Satisfies:** skill-testing R10 · **Effort:** S

`trigger_evals.json` is 6 (4+/2−). Grow to ≥10 with ≥4 near-miss negatives — the spine
collision zone: `write-plan` / `implement-feature` / `develop-feature` queries as
negatives, plus a bug-fix positive ("fix the duplicate-email bug") — plus variation.

## Coverage

A→R10/R6, B→R11/R6, C→R12, D→R12, E→R10. No orphan tasks.
