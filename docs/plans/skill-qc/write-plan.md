# Plan — write-plan (skill QC)

Skill: [skills/workflow/write-plan](../../../skills/workflow/write-plan/SKILL.md).
Type: discipline · rigid · model-invoked · process. Shared gate & verification:
[README](./README.md). Traces to skill-testing R10, R11, R12 and spec-driven R6.

## Task A — Description: triggers only (drop workflow summary)

**Satisfies:** skill-testing R10, spec-driven R6 · **Effort:** XS

```
Use when an approved feature spec exists and needs breaking into implementation steps, or the user asks for a task breakdown or "how are we going to build this".
```

## Task B — Catalogue the `wp-*` rule IDs

**Satisfies:** skill-testing R11, spec-driven R6 · **Effort:** S

Add rows to [rules-catalogue.md](../../../rules-catalogue.md) for
`wp-approved-spec-first`, `wp-trace-to-spec`, `wp-zero-context-detail`, `wp-user-gate`
(guidance: `write-plan`; status `guidance-only`). Verified by
[harness-coherence-check](./harness-coherence-check.md).

## Task C — Record without-skill baseline

**Satisfies:** skill-testing R12 · **Effort:** M

Run [pressure-scenarios.md](../../../skills/workflow/write-plan/evals/pressure-scenarios.md)
`without_skill` (RED, rationalizations verbatim) and `with_skill` (GREEN); oracle =
plan-structure check (every task cites a `SHALL`/`MUST` id; every requirement covered).
Write a dated `evals/l2-<date>.md`.

## Task D — Deepen pressure scenarios to 3+ combined

**Satisfies:** skill-testing R12 · **Effort:** S

Rewrite scenarios A–D to combine 3+ pressures with the A/B/C "choose and act" format;
re-run Task C.

## Task E — Grow trigger set to the floor

**Satisfies:** skill-testing R10 · **Effort:** S

`trigger_evals.json` is 6 (4+/2−). Grow to ≥10 with ≥4 near-miss negatives — boundary
against `write-spec` (still shaping) and `implement-feature` (executing) — plus
variation.

## Coverage

A→R10/R6, B→R11/R6, C→R12, D→R12, E→R10. No orphan tasks.
