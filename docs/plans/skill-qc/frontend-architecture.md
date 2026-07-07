# Plan — frontend-architecture (skill QC)

Skill: [skills/convention/frontend-architecture](../../../skills/convention/frontend-architecture/SKILL.md).
Type: pattern/reference · encoded-preference · model-invoked. Shared gate &
verification: [README](./README.md). Traces to skill-testing R9, R10.

## Task A — Add an L2 application eval

**Satisfies:** skill-testing R9 · **Effort:** M

Add `evals/l2-<date>.md` with 2 application cases and a lint-based oracle (run on the
produced files in the template dogfood, or a documented structural check):

- "A helper is used by two widgets in different slices — where does it go, and how is it
  imported?" → oracle: lands in `common/` (or minimal duplication), no cross-slice
  import, no barrel (`fe-no-index`, `fe-no-reexport`).
- "Add a presentational component to the `landing` slice — show the folder and export."
  → oracle: `components/<name>/` kebab-case, named export (`fe-named-exports`), no
  `index.ts`.

Grade `with_skill` vs `without_skill`.

## Task B — Grow trigger set to the near-miss floor

**Satisfies:** skill-testing R10 · **Effort:** S

`trigger_evals.json` is 6 (4+/2−). Grow to ≥10 with ≥4 near-miss negatives — sharpen
the boundary against `react-composition` (page/widget composition), `state-and-data`
(store files), and `project-defaults` (greenfield stack) — plus positive variation.

## Coverage

A→R9, B→R10. No orphan tasks.
