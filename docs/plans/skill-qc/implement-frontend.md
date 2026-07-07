# Plan — implement-frontend (skill QC)

Skill: [skills/workflow/implement-frontend](../../../skills/workflow/implement-frontend/SKILL.md).
Type: discipline · rigid · model-invoked. Shared gate & verification: [README](./README.md).
Traces to skill-testing R10, R12. Description is already triggers-only.

## Task A — Drop stale "when available"

**Satisfies:** doc hygiene · **Effort:** XS

[SKILL.md:23](../../../skills/workflow/implement-frontend/SKILL.md) says use
`implement-backend` "when available" — it is shipped (P2b). Remove the qualifier.

## Task B — Run a real pressure baseline (not spec-review)

**Satisfies:** skill-testing R12 · **Effort:** M

[l2-report-2026-07-04.md](../../../skills/workflow/implement-frontend/evals/l2-report-2026-07-04.md)
is a "skill specification review", not an agent run. Until a live run exists, mark it
`unverified — design-time`. Then run
[pressure-scenarios.md](../../../skills/workflow/implement-frontend/evals/pressure-scenarios.md)
`without_skill` (RED, rationalizations verbatim) and `with_skill` (GREEN), grading with
`pnpm --filter @app/frontend run lint` on the produced files. Deepen scenarios to 3+
combined pressures.

## Task C — Grow trigger set to the floor

**Satisfies:** skill-testing R10 · **Effort:** S

`trigger_evals.json` is 6 (4+/2−). Grow to ≥10 with ≥4 near-miss negatives — boundary
against `implement-backend`, `setup-project`, and `state-and-data` — plus variation.

## Coverage

A→hygiene, B→R12, C→R10. No orphan tasks.
