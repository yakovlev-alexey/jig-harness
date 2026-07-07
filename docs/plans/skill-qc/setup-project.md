# Plan — setup-project (skill QC)

Skill: [skills/workflow/setup-project](../../../skills/workflow/setup-project/SKILL.md).
Type: discipline · rigid · model-invoked · process. Shared gate & verification:
[README](./README.md). Traces to skill-testing R10, R12. Description is already
triggers-only — no SDO fix needed.

## Task A — Fix the router factual drift

**Satisfies:** doc hygiene (pd-router consistency) · **Effort:** XS

[SKILL.md:32](../../../skills/workflow/setup-project/SKILL.md) says "React Router";
the stack is TanStack Router (`pd-router`). Change to
`Vite + React + TanStack Router (file-based, src/routes/) + TanStack Query`.

## Task B — Fix dangling DESIGN refs and relabel design-time report

**Satisfies:** skill-testing R12 · **Effort:** XS

In [l2-report-2026-07-04.md](../../../skills/workflow/setup-project/evals/l2-report-2026-07-04.md)
and [l2-report-2026-07-04-postgres.md](../../../skills/workflow/setup-project/evals/l2-report-2026-07-04-postgres.md):
replace `Oracle checklist (DESIGN §6.7)` with `Oracle checklist (skill-testing spec R3)`.
Mark the Postgres (Scenario E) report `unverified — design-time` per R12 until a live
baseline exists.

## Task C — Record without-skill baselines

**Satisfies:** skill-testing R12 · **Effort:** M

The current report is GREEN-only ("skill loaded"). Run scenarios A–E without the skill
in fresh context, record the choice + rationalizations verbatim, and confirm each
rationalization maps to a row in the skill's Rationalizations table. Add the RED
baseline beside the existing GREEN result.

## Task D — Deepen pressure scenarios to 3+ combined

**Satisfies:** skill-testing R12 · **Effort:** M

[pressure-scenarios.md](../../../skills/workflow/setup-project/evals/pressure-scenarios.md)
labels 1–2 pressures each. Rewrite each to combine 3+ (time + authority + sunk cost,
etc.) and use the explicit A/B/C "choose and act" format. Re-run Task C after.

## Task E — Grow trigger set to the floor

**Satisfies:** skill-testing R10 · **Effort:** S

`trigger_evals.json` is 9 (7+/2−). Add ≥1 case to reach ≥10 and ensure ≥4 near-miss
negatives (existing-app work: `implement-frontend`/`implement-backend`).

## Coverage

A→hygiene, B→R12, C→R12, D→R12, E→R10. No orphan tasks.
