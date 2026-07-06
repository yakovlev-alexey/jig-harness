# Implementation status

Living meta for the jig-harness phased plan. Feature behavior lives in
[`docs/specs/`](specs/README.md); cross-cutting decisions in
[`docs/adr/`](adr/README.md).

## Completed

| Phase                                | Deliverable                                                                                                                                                                                                              | Status |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| **P0 — Scaffold**                    | pnpm+turbo monorepo, Changesets, package skeletons, `rules-catalogue.md`, CI (`verify` + coherence + validate-skills)                                                                                                    | ✅     |
| **P1 — `setup-project` spine**       | create-app scaffolder, `templates/fullstack`, config packages, lefthook, template dogfood, scaffold-then-verify, L1/L2 evals for setup                                                                                   | ✅     |
| **P2 — `implement-frontend` spine**  | component/widget generators, `no-reexport-only`, frontend convention skills, implement-frontend workflow, L-gen/L-enf                                                                                                    | ✅     |
| **P2b — `implement-backend` spine**  | Prisma template, backend generators, custom backend rules, backend/contracts/implement-backend skills, Postgres compose + `db:setup`, CI Postgres for dogfood                                                            | ✅     |
| **P2c — `testing` spine**            | `testing` skill, Testing Trophy stack in template (vitest units, backend inject integration, Playwright+MSW frontend integration, `apps/e2e`), contract tests, test-route security, parallel namespacing, PR-only E2E CI | ✅     |
| **P2c — Remaining conventions**      | `state-and-data` skill, `sd-*` catalogue rows, scoped `no-restricted-imports` enforcement, Nano Stores dogfood in users slice (container/presenter)                                                                      | ✅     |
| **P2d — Frontend generators**        | `page`, `slice` turbo gen + L-gen; pages moved to `src/routes/` with TanStack Router file-based routing; route-tree boundaries + routes-dir lint exemptions                                                              | ✅     |
| **P2e — Spec-driven workflow spine** | `specs` convention + `write-spec`/`write-plan`/`implement-feature`/`review-change` phases + `develop-feature` orchestrator; `spec-present` gate; `docs/specs` + `docs/adr` scaffold and a `users` dogfood spec           | ✅     |
| **P2f — Vite SSR spine**             | Classic Vite SSR; TanStack Router loaders + Query dehydrate/hydrate; backend `/api` prefix + prod SSR plugin; entry boundaries + backend frontend-src import guard; SSR integration + collapsed E2E server               | ✅     |

## Next

| Phase                     | Focus                                                                                                                       | Outcome                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **P3 — Publish & polish** | First npm publish (`@jig-harness/*`), sharpen all migrated skills, run recorded L2 RED/GREEN baselines in CI where feasible | Shippable product outside the monorepo |
| **P4 — Deferred**         | Machine `rules.json` registry, Sonar / dependency-cruiser, OpenAPI codegen, `refactor-to-conventions`                       | Breadth without blocking core rails    |

## Sequencing note

Vertical spines remain the contract: each spine ships guidance + capability +
enforcement + tests for one use case before parallel fan-out. After P2b, prefer
**convention skills that lack enforcement** or **generators still missing** as the
next parallel workstreams — not broad refactors. All P2 spines are now shipped;
focus shifts to P3 publish and polish.

## Risks & mitigations

- **Skill ↔ enforcement drift** → `rules-catalogue.md` + CI coherence check.
- **False positives frustrate the agent/you** → off-the-shelf-first; ship rules as
  `warn`, ratchet to `error`; the spine calibrates.
- **Custom-rule maintenance cost** → minimize count; always ship fixtures.
- **Template drift** → `workspace:*` dogfood + template CI + scaffold-then-verify.
- **Agents ignore generators** → hooks/CI catch the output regardless; skills only
  nudge.
- **Scaffold resolution bugs** (`workspace:`/`catalog:` rewrite) → covered by the
  scaffold-then-verify CI job.
- **Scope creep across eight skills** → spine-first; catalogue-as-contract
  subagent fan-out.

## Open questions

1. `@jig-harness` npm scope availability, and fallback if taken
   (`@usejig` / `@jigkit`) — confirm before P3 publish.
2. Final workflow use-case list — `refactor-to-conventions` remains P4; P2e ships the
   spec-driven spine (`write-spec`/`write-plan`/`implement-feature`/`review-change` +
   `develop-feature`), superseding the earlier `design-feature`/`implement-fullstack`.
3. Template routing/state defaults — TanStack Router file-based routing in `src/routes/` + TanStack Query + Nano Stores patterns shipped in `state-and-data` skill and template users slice dogfood.
4. Repository visibility — private until first npm publish (P3).
5. Local Postgres without Docker — document only (compose required for `db:setup`);
   no in-process SQLite fallback planned.

## Documentation migration

Harness feature specs under `docs/specs/` backfill DESIGN.md vertical spines. All
seven harness feature specs are present.
