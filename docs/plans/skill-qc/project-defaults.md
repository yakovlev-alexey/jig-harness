# Plan — project-defaults (skill QC)

Skill: [skills/convention/project-defaults](../../../skills/convention/project-defaults/SKILL.md).
Type: reference · encoded-preference · model-invoked. Shared gate & verification:
[README](./README.md). Traces to skill-testing R9, R10, R11.

## Task A — Add an L2 retrieval eval

**Satisfies:** skill-testing R9 · **Effort:** S

Add `evals/l2-<date>.md` (or `evals/evals.json`) with 2 retrieval cases and an
objective oracle:

- "What stack should I use for a new fullstack app?" → oracle checklist: names pnpm,
  TypeScript, React+Vite, TanStack Router (file-based, `src/routes/`), Fastify+Zod,
  `packages/types` contracts, BEM + colocated CSS; and rejects shadcn/Tailwind/Astro.
- "Where do shared Zod schemas go?" → oracle: names `packages/types/src/slices/<area>/`.

Grade `with_skill` vs `without_skill`; record the delta. Retrieval checklist is the
oracle — not "looks good".

## Task B — Catalogue anchor for `ss-backend-frontend-entry-only`

**Satisfies:** skill-testing R11 · **Effort:** XS

`rules-catalogue.md:64` names `project-defaults` as guidance for
`ss-backend-frontend-entry-only`, but the skill's rule tables never state it. Either
state it in the SSR/stack area of [SKILL.md](../../../skills/convention/project-defaults/SKILL.md)
(preferred: one row near `pd-ssr`) or reassign the catalogue guidance owner to
`contracts` (sibling of `ct-no-frontend-backend-impl-imports`). Verified by
`pnpm run coherence` once [harness-coherence-check](./harness-coherence-check.md) lands.

## Task C — Grow trigger set to the near-miss floor

**Satisfies:** skill-testing R10 · **Effort:** S

`evals/trigger_evals.json` is 6 (4+/2−). Grow to ≥10 with ≥4 near-miss negatives from
siblings — e.g. "add a component to this existing app" (→ `frontend-architecture`),
"where does a Fastify command file go?" (→ `backend-architecture`), "review this diff"
(→ `review-change`) — plus positive variation (casual/terse, migration phrasing).

## Task D — Fix the trigger-eval report label

**Satisfies:** doc hygiene (supports R10) · **Effort:** XS

[evals/trigger-eval-report-2026-07-04.md](../../../skills/convention/project-defaults/evals/trigger-eval-report-2026-07-04.md)
calls the shadcn query a "negative"; it is `should_trigger: true`. Correct the prose.

## Coverage

A→R9, B→R11, C→R10, D→R10 (hygiene). No orphan tasks.
