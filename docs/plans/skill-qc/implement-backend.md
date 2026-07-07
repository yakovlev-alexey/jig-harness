# Plan — implement-backend (skill QC)

Skill: [skills/workflow/implement-backend](../../../skills/workflow/implement-backend/SKILL.md).
Type: discipline · rigid · model-invoked. Shared gate & verification: [README](./README.md).
Traces to skill-testing R10, R12. Description is already triggers-only.

## Task A — Run and record the pressure scenarios (no report exists)

**Satisfies:** skill-testing R12 · **Effort:** M

[pressure-scenarios.md](../../../skills/workflow/implement-backend/evals/pressure-scenarios.md)
is written but has no run report. Run each scenario `without_skill` (RED,
rationalizations verbatim) and `with_skill` (GREEN); grade with `pnpm lint` on
`apps/backend` per the doc's oracle. Write a dated `evals/l2-<date>.md`. Confirm each
RED rationalization maps to a row in the skill's Rationalizations table.

## Task B — Deepen pressure scenarios to 3+ combined

**Satisfies:** skill-testing R12 · **Effort:** S

Scenarios A–D are 1–2 pressures each. Rewrite to combine 3+ and use the A/B/C
"choose and act" format; re-run Task A.

## Task C — Grow trigger set to the floor

**Satisfies:** skill-testing R10 · **Effort:** S

`trigger_evals.json` is 6 (4+/2−). Grow to ≥10 with ≥4 near-miss negatives — boundary
against `implement-frontend`, `backend-architecture` (rules vs workflow), and
`contracts` — plus variation.

## Coverage

A→R12, B→R12, C→R10. No orphan tasks.
