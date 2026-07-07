# Plan — Skill QC hardening

Transient implementation plan derived from the 2026-07-07 skill-library QC review.
Traces to [skill-testing spec](../specs/skill-testing/spec.md) (R1–R12) and
[spec-driven-workflow spec](../specs/spec-driven-workflow/spec.md) (R1, R6).
Rationale: [skill-testing decisions](../specs/skill-testing/decisions.md);
rule model [ADR 0003](../adr/0003-three-layer-rule-model.md).

**Gate:** Do not implement any task until this plan is explicitly approved.

**Final verification gate (implement-feature):** `pnpm run validate-skills`,
`pnpm run coherence`, and `pnpm verify` green in jig-harness; recorded eval reports
present for every skill whose task claims a run.

Tasks are ordered by leverage (MAJOR → MINOR). Each task is scoped to skill/eval/doc
files only — no app source changes, so the `spec-present` gate stays green on the
spec edits already made.

---

## Task 1 — Strip workflow summaries from the five spine descriptions

**Satisfies:** spec-driven R6, skill-testing R10 · **Severity:** MAJOR · **Effort:** XS

Edit the `description` frontmatter in each spine `SKILL.md` to state triggers/symptoms
only (drop everything after the em-dash that describes the procedure):

| File                                                                           | New description (triggers only)                                                                                                                                            |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [write-spec/SKILL.md](../../skills/workflow/write-spec/SKILL.md)               | `Use when adding a feature, changing behavior, fixing a bug, or starting any change to app source in an existing jig app, and no current spec covers it.`                  |
| [write-plan/SKILL.md](../../skills/workflow/write-plan/SKILL.md)               | `Use when an approved feature spec exists and needs breaking into implementation steps, or the user asks for a task breakdown or "how are we going to build this".`        |
| [implement-feature/SKILL.md](../../skills/workflow/implement-feature/SKILL.md) | `Use when an approved implementation plan exists and its tasks are ready to execute, or the user says "do the plan" / "implement the planned feature".`                    |
| [review-change/SKILL.md](../../skills/workflow/review-change/SKILL.md)         | `Use when an implemented change needs review before handoff to the user, when verifying a diff against its feature spec, or as the final review stage of develop-feature.` |
| [develop-feature/SKILL.md](../../skills/workflow/develop-feature/SKILL.md)     | `Use when asked to build or ship a feature or fix end to end ("build X", "ship Y"), or to take a change from intent to reviewed result, and no single phase is named.`     |

The procedural "how" already lives in each body's Overview/Procedure — no content is
lost. Re-run `pnpm run validate-skills` (descriptions still start with "Use when").

---

## Task 2 — Fix factual and dangling-reference drift

**Satisfies:** skill-testing R11 (coherence intent) + doc hygiene · **Severity:** MINOR · **Effort:** XS

- [setup-project/SKILL.md](../../skills/workflow/setup-project/SKILL.md) line 32:
  `React Router` → `TanStack Router (file-based, src/routes/)` to match `pd-router`.
- [setup-project/evals/l2-report-2026-07-04.md](../../skills/workflow/setup-project/evals/l2-report-2026-07-04.md)
  and [l2-report-2026-07-04-postgres.md](../../skills/workflow/setup-project/evals/l2-report-2026-07-04-postgres.md):
  replace `Oracle checklist (DESIGN §6.7)` with `Oracle checklist (skill-testing spec R3)`.
- [implement-frontend/SKILL.md](../../skills/workflow/implement-frontend/SKILL.md) line 23:
  drop "when available" (implement-backend is shipped).
- [project-defaults/evals/trigger-eval-report-2026-07-04.md](../../skills/convention/project-defaults/evals/trigger-eval-report-2026-07-04.md):
  fix the "negative" label on the shadcn query (it is `should_trigger: true`).
- [write-spec/evals/pressure-scenarios.md](../../skills/workflow/write-spec/evals/pressure-scenarios.md):
  reorder scenarios so they read A, B, C, D, E.

---

## Task 3 — Catalogue the spine + react-composition rule IDs and extend coherence-check

**Satisfies:** skill-testing R11, spec-driven R6 · **Severity:** MAJOR · **Effort:** M

1. Add rows to [rules-catalogue.md](../../rules-catalogue.md) for every own-rule ID
   currently missing (guidance = owning skill; capability `—`; enforcement `—` except
   where a gate applies; tests = the L2/L3 eval id; status `guidance-only`):
   - `ws-spec-before-code`, `ws-feature-scoped`, `ws-gwt`, `ws-ui-layout`,
     `ws-decisions-colocated`, `ws-user-gate` (guidance: `write-spec`)
   - `wp-approved-spec-first`, `wp-trace-to-spec`, `wp-zero-context-detail`,
     `wp-user-gate` (guidance: `write-plan`)
   - `imf-plan-scoped`, `imf-use-rails`, `imf-subagent-fresh-context`, `imf-verify`
     (guidance: `implement-feature`)
   - `rv-two-stage`, `rv-spec-compliance-first`, `rv-quality-via-verify`, `rv-fix-loop`
     (guidance: `review-change`)
   - `df-chain-phases`, `df-respect-gates`, `df-delegate` (guidance: `develop-feature`)
2. Resolve `rc-components-are-presentational` in
   [react-composition/SKILL.md](../../skills/convention/react-composition/SKILL.md):
   it duplicates the catalogued, enforced `sd-no-store-in-presentational`. Preferred:
   drop the local ID and keep the existing cross-reference to `state-and-data`. (No new
   catalogue row; it becomes an exempt cross-reference under R11.)
3. Extend [scripts/coherence-check.mjs](../../scripts/coherence-check.mjs): after the
   existing ESLint-rule check, scan each `skills/**/SKILL.md` Rules table for own-rule
   IDs (id shown in bold that is not marked as a "see `<skill>`" reference) and assert a
   catalogue row exists with that id. Fail listing any uncatalogued own-rule id.
4. Run `pnpm run coherence` — expect green after rows are added.

---

## Task 4 — Record without-skill baselines and add develop-feature pressure scenarios

**Satisfies:** skill-testing R3, R12; spec-driven R1 · **Severity:** MAJOR · **Effort:** M–L

- Add [develop-feature/evals/pressure-scenarios.md](../../skills/workflow/develop-feature/evals/pressure-scenarios.md)
  (currently missing — R3 violation): 3+ scenarios that tempt collapsing
  spec → plan → implement into one step (time + authority + sunk cost), with an
  explicit A/B/C "choose and act" format and a tool-trace oracle (did the agent run the
  phases and honor the gates).
- Run each unrun pressure set with a fresh-context subagent, capturing a `without_skill`
  RED baseline (rationalizations verbatim) and a `with_skill` GREEN result, and write
  dated reports for: `write-spec`, `write-plan`, `implement-feature`, `review-change`,
  `implement-backend`, plus a **real** run for `implement-frontend` (its current report
  is spec-review only).
- Re-label GREEN-only / design-time reports per R12: mark
  [setup-project/evals/l2-report-2026-07-04-postgres.md](../../skills/workflow/setup-project/evals/l2-report-2026-07-04-postgres.md)
  and [implement-frontend/evals/l2-report-2026-07-04.md](../../skills/workflow/implement-frontend/evals/l2-report-2026-07-04.md)
  as `unverified — design-time` until a live baseline is added, or add the baseline.

---

## Task 5 — Add L2 output evals to the eight convention skills

**Satisfies:** skill-testing R9 · **Severity:** MAJOR · **Effort:** L

For each `skills/convention/**`, add an L2 artifact (`evals/evals.json` or dated
`evals/l2-*.md`) with 1–3 application/retrieval cases and an **objective oracle**.
Start with the highest-judgment skills:

| Skill                                                                       | L2 case seed                                               | Oracle                                                                                   |
| --------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [state-and-data](../../skills/convention/state-and-data/evals/)             | "shared filter needed by two widgets on one page; wire it" | produced code keeps hooks in `*.widget.tsx`; passes `sd-no-store-in-presentational` lint |
| [backend-architecture](../../skills/convention/backend-architecture/evals/) | "add a create-user usecase that checks duplicates"         | `be-no-command-query-cross-calls` + `be-domain-no-io` lint pass on output                |
| [react-composition](../../skills/convention/react-composition/evals/)       | "add a widget that reuses a presentational block"          | no widget-imports-widget; colocated CSS present                                          |
| [testing](../../skills/convention/testing/evals/)                           | "where does an edge-case test for duplicate email go?"     | retrieval checklist: names unit/integration, not E2E; cites namespacing                  |
| project-defaults, frontend-architecture, contracts, specs                   | one retrieval case each                                    | documented retrieval checklist                                                           |

Prefer deterministic oracles (lint/produced-file) over LLM-judge; run `with_skill` vs
`without_skill` and record the delta.

---

## Task 6 — Grow trigger sets to the near-miss floor

**Satisfies:** skill-testing R10 · **Severity:** MINOR · **Effort:** M

For all 16 [trigger_evals.json](../../skills/) files, extend to ≥10 cases with ≥4
near-miss negatives and positive variation (casual/terse phrasing, task buried in a
longer chain, non-obvious connection). Add the spine-collision probe (a bug-fix query
that should route to `write-spec`/`develop-feature`, tested against both). Keep the
existing good near-miss negatives. Re-run `pnpm run validate-skills`.

---

## Task 7 — Deepen pressure scenarios to 3+ combined pressures

**Satisfies:** skill-testing R12 · **Severity:** MINOR · **Effort:** M

Revise every `evals/pressure-scenarios.md` so each scenario combines 3+ pressure types
(time, sunk cost, authority, economic, exhaustion, social, pragmatic) and uses the
explicit A/B/C "IMPORTANT: this is a real scenario — choose and act" format from the L3
framework. Re-run the affected baselines from Task 4.

---

## Requirement coverage matrix

| Requirement                                      | Task(s) |
| ------------------------------------------------ | ------- |
| skill-testing R3 (pressure reports)              | 4, 7    |
| skill-testing R9 (convention L2)                 | 5       |
| skill-testing R10 (descriptions + trigger floor) | 1, 6    |
| skill-testing R11 (rule-ID coherence)            | 2, 3    |
| skill-testing R12 (baselines)                    | 4, 7    |
| spec-driven R1 (develop-feature coverage)        | 4       |
| spec-driven R6 (spine descriptions + IDs)        | 1, 3    |

Every task cites a requirement; every new/changed requirement is covered. No orphan tasks.

---

## Out of scope

- Machine `rules.json` registry (P4 in `docs/STATUS.md`).
- A large eval sweep beyond the recorded baselines in Task 4 (expensive; run only what
  each task claims).
- Promoting the rule-ID-coherence decision from a feature decision to an ADR amendment —
  offered in [decisions.md](../specs/skill-testing/decisions.md); do only if requested.
- Rewriting skill bodies (they are already strong); this plan changes descriptions,
  evals, catalogue rows, and one script — not the rule prose.

---

## User-verify gate

Present this plan (and the spec/decisions edits it traces to) for approval before
starting Task 1. After implementation, run:

```bash
pnpm run validate-skills
pnpm run coherence
pnpm verify
```

and confirm the recorded eval reports exist for every skill whose task claims a run.
