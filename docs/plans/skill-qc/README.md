# Plans — Skill QC hardening (per-skill)

Vertical decomposition of the 2026-07-07 skill-library QC review: **one plan per
skill**, each listing everything to improve for that skill (description, trigger set,
L2 eval, pressure scenarios, baseline recording, catalogue rows). One cross-cutting
plan (`harness-coherence-check.md`) covers the shared verifier that is not a skill.

Traces to [skill-testing spec](../../specs/skill-testing/spec.md) R9–R12 and
[spec-driven-workflow spec](../../specs/spec-driven-workflow/spec.md) R1, R6.
Rationale: [skill-testing decisions](../../specs/skill-testing/decisions.md);
rule model [ADR 0003](../../adr/0003-three-layer-rule-model.md).

## Shared user-verify gate

Each plan is approved and implemented independently. Do **not** implement a plan until
it is explicitly approved. Implement one skill at a time; finish it green before the
next. This index is not itself a work item.

## Shared verification (every plan)

Run after each skill's changes; scope the eval commands to the touched skill:

```bash
pnpm run validate-skills   # L0 structure (descriptions, trigger schema, line limits)
pnpm run coherence         # rule-ID ↔ catalogue (after harness-coherence-check lands)
pnpm verify                # docs/eval changes stay green
```

Plus: the eval report the plan claims must exist on disk (dated `l2-*.md` /
`*-report-*.md`), and any `without_skill` baseline recorded verbatim (R12).

## Plans

| Plan                                                    | Tier    | What improves                                                                                    | Requirements                  |
| ------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------ | ----------------------------- |
| [project-defaults](./project-defaults.md)               | conv    | L2 retrieval eval · triggers→10 · catalogue `ss-*` anchor · report label                         | R9, R10, R11                  |
| [frontend-architecture](./frontend-architecture.md)     | conv    | L2 application eval · triggers→10                                                                | R9, R10                       |
| [react-composition](./react-composition.md)             | conv    | L2 application eval · drop `rc-components-are-presentational` · triggers→10                      | R9, R10, R11                  |
| [state-and-data](./state-and-data.md)                   | conv    | L2 application eval (lint oracle) · triggers→10                                                  | R9, R10                       |
| [backend-architecture](./backend-architecture.md)       | conv    | L2 application eval (lint oracle) · triggers→10                                                  | R9, R10                       |
| [contracts](./contracts.md)                             | conv    | L2 retrieval eval · triggers→10                                                                  | R9, R10                       |
| [specs](./specs.md)                                     | conv    | L2 application eval (structure oracle) · triggers→10                                             | R9, R10                       |
| [testing](./testing.md)                                 | conv    | L2 retrieval eval · triggers→10                                                                  | R9, R10                       |
| [setup-project](./setup-project.md)                     | wf      | React Router fix · baselines · DESIGN-ref fix · deepen pressure · triggers→10                    | R10, R12                      |
| [implement-frontend](./implement-frontend.md)           | wf      | drop "when available" · real pressure run + baseline · triggers→10                               | R10, R12                      |
| [implement-backend](./implement-backend.md)             | wf      | pressure run + baseline (no report yet) · triggers→10                                            | R10, R12                      |
| [write-spec](./write-spec.md)                           | wf      | description triggers-only · `ws-*` rows · baseline · reorder+deepen pressure · triggers→10       | R10, R11, R12, sdw-R6         |
| [write-plan](./write-plan.md)                           | wf      | description triggers-only · `wp-*` rows · baseline · deepen pressure · triggers→10               | R10, R11, R12, sdw-R6         |
| [implement-feature](./implement-feature.md)             | wf      | description triggers-only · `imf-*` rows · baseline · deepen pressure · triggers→10              | R10, R11, R12, sdw-R6         |
| [review-change](./review-change.md)                     | wf      | description triggers-only · `rv-*` rows · baseline · deepen pressure · triggers→10               | R10, R11, R12, sdw-R6         |
| [develop-feature](./develop-feature.md)                 | wf      | description triggers-only · `df-*` rows · **add** pressure-scenarios.md · baseline · triggers→10 | R10, R11, R12, sdw-R1, sdw-R6 |
| [harness-coherence-check](./harness-coherence-check.md) | tooling | extend `coherence-check.mjs` to enforce skill-rule-ID coherence                                  | R11, sdw-R6                   |

## Suggested order (waves)

1. **Wave 1 — XS quick wins:** description fixes (5 spine plans, task A) + factual fixes
   (`setup-project` React Router, `implement-frontend` "when available"). No eval infra.
2. **Wave 2 — coherence:** `harness-coherence-check` first (the verifier), then the
   catalogue-row tasks in the 5 spine plans + `project-defaults`/`react-composition`.
3. **Wave 3 — L2:** the 8 convention plans' L2 evals (highest-judgment first:
   `state-and-data`, `backend-architecture`, `react-composition`, `testing`).
4. **Wave 4 — baselines & pressure:** the R12 tasks (baseline recording + 3+-pressure
   rewrites) across the workflow plans, including `develop-feature`'s new scenarios.

Trigger-set growth (R10) rides along inside each plan; it needs no cross-plan ordering.

## Requirement coverage

| Requirement                                           | Covered by                                                                                         |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| skill-testing R9 (convention L2)                      | all 8 convention plans                                                                             |
| skill-testing R10 (triggers-only + ≥10 near-miss set) | all 16 skill plans                                                                                 |
| skill-testing R11 (rule-ID coherence)                 | `project-defaults`, `react-composition`, the 5 spine plans, `harness-coherence-check`              |
| skill-testing R12 (baselines + 3+ pressure)           | `setup-project`, `implement-frontend`, `implement-backend`, 4 spine phase plans, `develop-feature` |
| spec-driven R1 (develop-feature coverage)             | `develop-feature`                                                                                  |
| spec-driven R6 (spine descriptions + IDs)             | 5 spine plans + `harness-coherence-check`                                                          |

Every requirement maps to at least one plan; no plan is orphaned from a requirement.
