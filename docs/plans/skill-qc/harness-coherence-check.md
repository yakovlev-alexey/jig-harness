# Plan — harness coherence-check (skill QC, cross-cutting)

The one **non-skill** unit in this decomposition: the shared verifier for rule-ID
coherence. It is the prerequisite that makes the per-skill catalogue tasks
(`project-defaults`, `react-composition`, and the 5 spine plans) machine-checked rather
than manual. Shared gate & verification: [README](./README.md). Traces to skill-testing
R11 and spec-driven R6.

## Task A — Extend coherence-check.mjs to enforce skill-rule-ID coherence

**Satisfies:** skill-testing R11 · **Effort:** M

Extend [scripts/coherence-check.mjs](../../../scripts/coherence-check.mjs). Today it only
checks custom-ESLint-rule ↔ catalogue. Add a pass that, for each
`skills/**/SKILL.md` Rules section, collects the rule IDs the skill declares as its
**own**, and asserts each has a `rules-catalogue.md` row whose guidance column names
that skill. Support both rule tables and bullet-list declarations. Exempt IDs
mentioned only as cross-references to another skill's rule (e.g. "see
`state-and-data` / **sd-...**").

Implementation notes:

- Reuse the existing `parseCatalogue()` (id + guidance columns).
- Parse only the `## Rules` section, stopping at the next `##` heading. This avoids
  false positives from examples, references, and file names.
- Detect own-rule IDs from either bolded `**xx-foo**` cells in a table or bullet
  declarations like `- **xx-foo** — ...`; treat rows/bullets that contain
  "see `<skill>`", "Reference **wf-...**", or "Delegated enforcement" as
  cross-references, not ownership.
- Ignore rule-like tokens outside owned Rules declarations, such as
  `assert-user-can-be-created.ts` in reference examples.
- Fail listing each uncatalogued own-rule ID and its skill; keep the existing checks.

## Task B — Add a fixture test for the new check

**Satisfies:** skill-testing R11 · **Effort:** S

Add a small RED/GREEN fixture (temp SKILL.md + catalogue snippet) proving the check:

- fails on an uncatalogued own-rule ID in a bullet-list Rules section;
- fails on an uncatalogued own-rule ID in a table Rules section;
- passes on a catalogued one;
- passes on a pure cross-reference / delegated-enforcement row;
- ignores rule-like filenames and examples outside `## Rules`.

Wire into `pnpm run test` / the coherence step so CI enforces it.

## Sequencing

Land this **before** (or with) the catalogue-row tasks in the per-skill plans so those
rows are verified on commit. After it lands, `pnpm run coherence` is the oracle for
every R11 task in this folder.

## Coverage

A→R11, B→R11. No orphan tasks.
