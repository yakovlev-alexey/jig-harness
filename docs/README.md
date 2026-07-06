# jig-harness documentation

The public [skills](https://github.com/yakovlev-alexey/skills) repo holds eight
prescriptive but **guidance-only** web-app skills. Agents can ignore or reinterpret
those rules because nothing generates the boilerplate or machine-checks violations.
**jig-harness** closes both gaps: generators and scaffolding supply the capability
layer; ESLint, Stylelint, Prettier, TypeScript, and custom rules supply enforcement.

## Goals

1. **Guidance** — skills guide the agent unambiguously, with minimal room for interpretation.
2. **Capability** — agents are amplified by tools instead of manual labor (generators, scaffolder).
3. **Enforcement** — maximum of the skill rules become machine-checked gates (pre-commit + CI).
4. **Tested skills** — prove, repeatably, that skills change agent behavior and enforcement catches slips.
5. **Agent-agnostic** — no dependency on any single coding agent or vendor.

## Where to look

| Artifact       | Path                                          | Role                                                |
| -------------- | --------------------------------------------- | --------------------------------------------------- |
| Feature specs  | [`docs/specs/`](specs/README.md)              | Durable **what** — `SHALL`/`MUST` + GIVEN/WHEN/THEN |
| ADRs           | [`docs/adr/`](adr/README.md)                  | Cross-cutting **why** — append-only decisions       |
| Status         | [`docs/STATUS.md`](STATUS.md)                 | Phases, risks, open questions, roadmap              |
| Rule crosswalk | [`rules-catalogue.md`](../rules-catalogue.md) | Rule ↔ guidance ↔ capability ↔ enforcement          |

## Harness feature specs

Specs describe the **harness repo** (packages, skills, template wiring), not
template-app features like `users` (those live in `templates/fullstack/docs/specs/`).

| Feature              | Spec                                                         | Purpose                                                                   |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Setup project        | [`setup-project`](specs/setup-project/spec.md)               | Scaffold apps via `pnpm create @jig-harness/app` with green `pnpm verify` |
| Implement frontend   | [`implement-frontend`](specs/implement-frontend/spec.md)     | Frontend generators, slices, routes, boundaries, state-and-data           |
| Implement backend    | [`implement-backend`](specs/implement-backend/spec.md)       | Backend generators, layer flow, contracts, custom rules                   |
| Testing              | [`testing`](specs/testing/spec.md)                           | Testing Trophy stack, isolation, test routes, verify vs E2E               |
| Vite SSR             | [`vite-ssr`](specs/vite-ssr/spec.md)                         | Classic Vite SSR dev/prod topology and loader prefetch                    |
| Spec-driven workflow | [`spec-driven-workflow`](specs/spec-driven-workflow/spec.md) | Workflow spine, spec artifacts, `spec-present` gate                       |
| Skill testing        | [`skill-testing`](specs/skill-testing/spec.md)               | L0–L-gen methodology and template integration jobs                        |

## Repository topology

```
jig-harness/                      (pnpm + turborepo, Changesets fixed/linked)
├─ skills/
│   ├─ workflow/                  use-case entry points (installable)
│   └─ convention/                rulebooks (installable), references/ + evals/
├─ packages/                      published as @jig-harness/<dir>
│   ├─ eslint-plugin · eslint-config · prettier-config · stylelint-config · tsconfig
│   ├─ generators · spec-present · create-app
├─ templates/fullstack/           dogfood app (frontend + backend + e2e + types)
├─ docs/                          specs, ADRs, STATUS (this hub)
├─ rules-catalogue.md             rule ↔ layer crosswalk
└─ scripts/ · .github/workflows/  validation, coherence, CI
```

See [`docs/STATUS.md`](STATUS.md) for implementation progress and [`docs/adr/`](adr/README.md)
for locked architectural decisions.
