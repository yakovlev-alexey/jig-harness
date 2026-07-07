# Plan — react-composition (skill QC)

Skill: [skills/convention/react-composition](../../../skills/convention/react-composition/SKILL.md).
Type: pattern · encoded-preference · model-invoked. Shared gate & verification:
[README](./README.md). Traces to skill-testing R9, R10, R11.

## Task A — Resolve the uncatalogued `rc-components-are-presentational` ID

**Satisfies:** skill-testing R11 · **Effort:** XS

[SKILL.md:32](../../../skills/convention/react-composition/SKILL.md) declares
`rc-components-are-presentational`, which has no catalogue row and duplicates the
catalogued, enforced `sd-no-store-in-presentational` (`rules-catalogue.md:45`).
Preferred: drop the local ID and keep the existing cross-reference to `state-and-data`
/ **sd-no-store-in-presentational** (then it is an exempt cross-reference under R11 —
no new row). Alternative: add a catalogue row owned by `react-composition`. Verified by
`pnpm run coherence` once [harness-coherence-check](./harness-coherence-check.md) lands.

## Task B — Add an L2 application eval

**Satisfies:** skill-testing R9 · **Effort:** M

Add `evals/l2-<date>.md` with an application case + lint oracle:

- "Add a widget that reuses a presentational block owned by another widget." → oracle:
  no widget-imports-widget (`rc-no-widget-imports-widget`), block composed on the page
  or kept in the widget folder, `.widget.tsx` suffix, colocated CSS present.

Grade `with_skill` vs `without_skill`.

## Task C — Grow trigger set to the near-miss floor

**Satisfies:** skill-testing R10 · **Effort:** S

`trigger_evals.json` is 6 (4+/2−). Grow to ≥10 with ≥4 near-miss negatives — boundary
against `frontend-architecture` (folder/import rules) and `state-and-data` (hooks/store)
— plus positive variation.

## Coverage

A→R11, B→R9, C→R10. No orphan tasks.
