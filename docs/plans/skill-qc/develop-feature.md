# Plan — develop-feature (skill QC)

Skill: [skills/workflow/develop-feature](../../../skills/workflow/develop-feature/SKILL.md).
Type: discipline/meta · rigid · model-invoked · orchestrator. Shared gate &
verification: [README](./README.md). Traces to skill-testing R10, R11, R12 and
spec-driven R1, R6. This is the only discipline skill with **no** `pressure-scenarios.md`.

## Task A — Description: triggers only (drop the chain summary)

**Satisfies:** skill-testing R10, spec-driven R6 · **Effort:** XS

```
Use when asked to build or ship a feature or fix end to end ("build X", "ship Y"), or to take a change from intent to reviewed result, and no single phase is named.
```

## Task B — Catalogue the `df-*` rule IDs

**Satisfies:** skill-testing R11, spec-driven R6 · **Effort:** XS

Add rows to [rules-catalogue.md](../../../rules-catalogue.md) for `df-chain-phases`,
`df-respect-gates`, `df-delegate` (guidance: `develop-feature`; status `guidance-only`).
Verified by [harness-coherence-check](./harness-coherence-check.md).

## Task C — Add pressure-scenarios.md (currently missing)

**Satisfies:** skill-testing R3, R12, spec-driven R1 · **Effort:** M

Create `evals/pressure-scenarios.md` with 3+ scenarios that tempt collapsing
spec → plan → implement into one step under combined pressure (time + authority + sunk
cost), each in the A/B/C "choose and act" format. Oracle = tool-trace: did the agent run
the phases in order and honor the user-verify gates (`df-chain-phases`,
`df-respect-gates`)?

## Task D — Record without-skill baseline

**Satisfies:** skill-testing R12 · **Effort:** M

Run the new scenarios `without_skill` (RED, rationalizations verbatim) and `with_skill`
(GREEN). If the RED baseline does not fail (agent chains phases anyway), note possible
capability saturation and shift effort to enforcement. Write a dated `evals/l2-<date>.md`.

## Task E — Grow trigger set to the floor

**Satisfies:** skill-testing R10 · **Effort:** S

`trigger_evals.json` is 6 (4+/2−). Grow to ≥10 with ≥4 near-miss negatives — the sharp
boundary is single-phase requests (`write-spec` / `write-plan` / `implement-feature` /
`review-change`) as negatives — plus variation.

## Coverage

A→R10/R6, B→R11/R6, C→R3/R12/R1, D→R12, E→R10. No orphan tasks.
