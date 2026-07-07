# Plan — review-change (skill QC)

Skill: [skills/workflow/review-change](../../../skills/workflow/review-change/SKILL.md).
Type: discipline · rigid · model-invoked · process. Shared gate & verification:
[README](./README.md). Traces to skill-testing R10, R11, R12 and spec-driven R6.
This skill has the most severe SDO trap (its description reproduces the canonical
two-stage-review summary) — Task A is the highest-leverage single fix in the library.

## Task A — Description: triggers only (drop the two-stage summary)

**Satisfies:** skill-testing R10, spec-driven R6 · **Effort:** XS

```
Use when an implemented change needs review before handoff to the user, when verifying a diff against its feature spec, or as the final review stage of develop-feature.
```

## Task B — Catalogue the `rv-*` rule IDs

**Satisfies:** skill-testing R11, spec-driven R6 · **Effort:** S

Add rows to [rules-catalogue.md](../../../rules-catalogue.md) for `rv-two-stage`,
`rv-spec-compliance-first`, `rv-quality-via-verify`, `rv-fix-loop` (guidance:
`review-change`; status `guidance-only`). Verified by
[harness-coherence-check](./harness-coherence-check.md).

## Task C — Record without-skill baseline (Stage-1 skip is the key failure)

**Satisfies:** skill-testing R12 · **Effort:** M

Run [pressure-scenarios.md](../../../skills/workflow/review-change/evals/pressure-scenarios.md)
`without_skill` (RED) and `with_skill` (GREEN). Scenario B (seeded 409-vs-422) is the
oracle case: does the agent run Stage-1 spec-compliance and catch it? Ideally run once
with the **current** description and once with the Task-A description to quantify the SDO
effect. Write a dated `evals/l2-<date>.md`.

## Task D — Deepen pressure scenarios to 3+ combined

**Satisfies:** skill-testing R12 · **Effort:** S

Rewrite scenarios A–D to combine 3+ pressures with the A/B/C "choose and act" format;
re-run Task C.

## Task E — Grow trigger set to the floor

**Satisfies:** skill-testing R10 · **Effort:** S

`trigger_evals.json` is 6 (4+/2−). Grow to ≥10 with ≥4 near-miss negatives — boundary
against `implement-feature` (building) and convention skills (pure format Qs) — plus
variation.

## Coverage

A→R10/R6, B→R11/R6, C→R12, D→R12, E→R10. No orphan tasks.
