# jig — Design

Date: 2026-07-04
Status: Approved design, pending implementation plan
Scope: The `jig-harness` monorepo — an agent-agnostic harness for building
TypeScript fullstack web apps on narrow, tested rails.

## 1. Context & problem

An existing public skills repo (`yakovlev-alexey/skills`) holds eight highly
prescriptive but **guidance-only** web-app skills (vertical slices, named
exports, no barrels, kebab-case, page/widget composition, BEM CSS, Testing
Trophy, etc.). It also has a mature **skill-testing methodology** built for the
facilitation skills:

- **L0** — structural/contract validation (`validate-skills.sh`, agentskills.io,
  line limits, `evals.json` schema), wired into CI.
- **L1** — trigger evals (does the skill activate for the right query).
- **L2** — output-quality pressure scenarios (RED/GREEN via subagents) + an E2E
  harness.

Two gaps make the guidance unenforceable and easy for an agent to ignore or
reinterpret:

1. **No capability layer** — agents hand-write boilerplate instead of generating
   it; new projects are set up from scratch instead of a template.
2. **No enforcement layer** — nothing (prettier/eslint/stylelint/tsc/CI) turns
   the skill rules into machine-checked gates.

A markdown-only skills repo physically cannot host layers 1–2 (they must run
inside real project repos). `jig` is the monorepo that closes both gaps and makes
each rule real and tested across all three layers.

## 2. Goals

1. **Guidance** — skills guide the agent unambiguously, with minimal room for
   interpretation.
2. **Capability** — agents are amplified by tools instead of manual labor:
   generate a component directory, scaffold a project from a template.
3. **Enforcement** — maximum of the skill rules become machine-checked
   (prettier, eslint, stylelint, tsc, custom rules), enforced by pre-commit hooks
   and CI.
4. **Tested skills** — prove, repeatably, that a skill changes agent behavior and
   that enforcement catches violations when behavior slips.
5. **Agent-agnostic** — no dependency on any single coding agent or vendor.

Success looks like: a rule the agent violates is caught automatically (not merely
"mentioned"); common boilerplate is generated (and generator output is always
lint-clean); a scaffolded project starts green under the full `verify` suite.

## 3. Non-goals

- Not stack-agnostic. The TS / pnpm / turborepo / Vite / React / Fastify / Prisma
  / Zod stack is chosen and the harness is opinionated about it.
- No SonarQube / dependency-cruiser / broad custom-rule set in v1 (deferred).
- Not migrating skill/harness artifacts off English.
- Not rewriting all eight skills before the first vertical spine ships.

## 4. Core concept: the rule as the atomic unit

Today a skill rule is a sentence. In `jig`, every rule is an object that can
appear in up to **three layers** and is checked at up to **three test levels**.
The whole harness is "make each rule real in as many layers as possible, and test
each layer."

```
                 ONE RULE  (e.g. "no barrel files; named exports only")
                 stable id: fe-no-barrels
        ┌─────────────────────┼───────────────────────┐
   GUIDANCE (skills)     CAPABILITY (generator)   ENFORCEMENT (lint)
   convention skill      generator never emits     eslint rule flags
   states it, rule-ID'd  an index.ts barrel        barrels/default exports
        │                     │                        │
        ▼                     ▼                        ▼
   L1 trigger eval       L-gen snapshot           L-enf fixture RED/GREEN
   L2 behavior eval      generator output has     violating code fails,
   (graded by lint)      no barrel + passes lint  clean code passes
```

`rules-catalogue.md` is the connective tissue that keeps one rule coherent across
all three layers (see §6.4).

## 5. Locked decisions

| Decision                  | Choice                                                                     |
| ------------------------- | -------------------------------------------------------------------------- |
| Delivery model            | Shippable tooling product (published npm packages + template + skills)     |
| Repo topology             | Single `jig-harness` monorepo (pnpm + turborepo)                           |
| npm scope                 | `@jig-harness/*` (availability to confirm at reservation)                  |
| Existing web-app skills   | Move into `jig-harness/skills/`, rewritten sharper                         |
| Enforcement ambition (v1) | Medium: off-the-shelf-first + few custom rules with fixtures; no Sonar     |
| Sequencing                | Vertical spine first → gather feedback → fan out with subagents            |
| Rule coherence            | Markdown `rules-catalogue.md` (structured toward a machine registry later) |
| Skill taxonomy            | Two tiers: workflow (use-case) skills + convention (reference) skills      |
| Convention skills         | Separately installable skills (not embedded references)                    |
| First spine               | `setup-project`                                                            |
| Scaffolder                | `pnpm create @jig-harness/app` (not degit)                                 |
| Package versioning        | Changesets, fixed/linked (one version across all packages + create CLI)    |

## 6. Architecture

### 6.1 Repository topology

```
jig-harness/                      (pnpm + turborepo, Changesets fixed/linked)
├─ skills/
│   ├─ workflow/                  use-case entry points (installable)
│   │   setup-project · design-feature · implement-frontend
│   │   implement-backend · implement-fullstack · refactor-to-conventions
│   └─ convention/                rulebooks (installable), each with references/ + evals/
│       project-defaults · frontend-architecture · react-composition
│       state-and-data · backend-architecture · contracts · testing
├─ packages/                      (each published as @jig-harness/<dir>)
│   ├─ eslint-plugin              custom rules + RED/GREEN fixtures
│   ├─ eslint-config              flat preset (off-the-shelf plugins + custom plugin)
│   ├─ prettier-config
│   ├─ stylelint-config
│   ├─ tsconfig
│   ├─ generators                 turbo gen (component, widget, page, slice, endpoint…)
│   └─ create-app                 @jig-harness/create-app — pnpm create scaffolder
├─ templates/
│   └─ fullstack/                 apps/web + apps/api + packages/types; deps via workspace:* / catalog:
├─ rules-catalogue.md             single source of truth (rule ↔ layer crosswalk)
├─ docs/                          this design doc's descendants, ADRs
├─ scripts/                       validation (extends validate-skills.sh) + coherence check
└─ .github/workflows/             lint/type/test/build + template dogfood + skill L0
```

### 6.2 Skill model (two-tier)

**Workflow (use-case) skills** are thin procedures triggered by user intent. They
dispatch to convention skills (as today's `web-app-design` dispatches), invoke
generators, and end by telling the agent to run `pnpm verify`.

- `setup-project` — bootstrap a new app from the template.
- `design-feature` — plan a feature's implementation architecture across the slice.
- `implement-frontend` / `implement-backend` / `implement-fullstack`.
- `refactor-to-conventions` — align existing code and run enforcement (may be P3+).

**Convention (reference) skills** hold the sharp, rule-ID'd conventions — the
current vague topic skills rewritten — with deep-dives in `references/`. Shared
rules live in exactly one convention skill (DRY). Both tiers are separately
installable via skills.sh; workflow skills reference conventions by name.

- `project-defaults`, `frontend-architecture`, `react-composition`,
  `state-and-data`, `backend-architecture`, `contracts`, `testing`.

### 6.3 Distribution & dependency resolution (grounded)

**Skills** — the skills.sh CLI reads a `skills/` subdirectory (walked one level
deep for `skills/<name>/SKILL.md`, one extra for catalog layouts), so
monorepo-hosted skills install directly, no separate repo or sync step:

```
pnpm dlx skills add yakovlev-alexey/jig-harness --skill setup-project
pnpm dlx skills add yakovlev-alexey/jig-harness/skills/workflow/setup-project
```

**Packages** — published to npm, one version across all via Changesets
fixed/linked mode, so the `create-app` CLI always knows exactly which versions to
pin.

**Template — one template, two resolution modes:**

- _In-repo (dogfood):_ `templates/fullstack/package.json` depends on harness
  packages via `workspace:*` and shared third-party versions via `catalog:`.
  These protocols link locally regardless of `linkWorkspacePackages` (whose
  default is now `false`). CI runs the full `verify` here — real integration
  proof, no publish needed.
- _Scaffolded (end-user):_ `pnpm create @jig-harness/app my-app`. The create CLI
  copies the template and **rewrites `workspace:*` / `catalog:` specifiers to
  concrete published versions** — the exact transform `pnpm pack` / `pnpm publish`
  already performs — then runs `pnpm install` (pulling published packages) and
  `git init`.

Net: no drift between the dogfood template and what end-users scaffold.

### 6.4 Rule lifecycle & `rules-catalogue.md`

Single source of truth; one row per rule. Columns are deliberately the future
`rules.json` schema so the doc can upgrade to a machine-checked registry later.

| Column        | Meaning                                          |
| ------------- | ------------------------------------------------ |
| `id`          | Stable rule id (e.g. `fe-no-barrels`)            |
| `rule`        | One-line statement                               |
| `guidance`    | Convention skill + anchor                        |
| `capability`  | Generator that emits it correctly (or `—`)       |
| `enforcement` | eslint/stylelint rule id (or `—`)                |
| `tests`       | Fixture path / eval id(s)                        |
| `status`      | `guidance-only \| generated \| enforced \| full` |

CI coherence check: every **custom** eslint rule must have a catalogue row, and
every row citing an enforcement id must reference a rule that exists.

### 6.5 Enforcement stack (Medium)

Off-the-shelf first; custom only where nothing fits, each custom rule shipped with
`RuleTester` RED/GREEN fixtures.

| Skill rule                                       | Enforced by                                                                    | Custom?  |
| ------------------------------------------------ | ------------------------------------------------------------------------------ | -------- |
| Named exports only                               | `import-x/no-default-export` (Storybook `meta` exempt via `files` override)    | no       |
| No barrels / no `index.ts`                       | `check-file` filename-blocklist + small custom "no re-export-only module" rule | 1 custom |
| kebab-case files/folders                         | `check-file` / `unicorn/filename-case`                                         | no       |
| Allowed slice segments & folder shape            | `eslint-plugin-project-structure`                                              | no       |
| No cross-slice imports; page↛page; widget↛widget | `eslint-plugin-boundaries`                                                     | no       |
| BEM class names; colocated CSS                   | stylelint `selector-class-pattern` + project-structure                         | no       |
| One entity per file                              | generator + partial lint; else guidance                                        | partial  |
| Formatting                                       | prettier                                                                       | no       |
| Types                                            | `tsc --noEmit`                                                                 | no       |

Deferred: SonarQube, dependency-cruiser fitness functions, broad backend custom
rules.

### 6.6 Capability / generators

`turbo gen` (plop under the hood, native to turborepo). Generators: `component`,
`widget`, `page`, `slice` (frontend), then `endpoint`, `usecase`, `backend-slice`.
**Contract: every generator's output passes the full enforcement suite** — this is
what makes "generate instead of hand-write" trustworthy, and it is snapshot-tested
(L-gen). Real generators arrive with `implement-frontend` (post-spine); the
`generators` package is scaffolded but minimal during the `setup-project` spine.

### 6.7 Testing strategy (five levels + dogfood)

Reuse the existing L0/L1/L2 methodology; add two enforcement levels.

1. **L0 structural** — extend `validate-skills.sh` + the catalogue coherence check.
2. **L1 trigger evals** — do the workflow/convention skills activate for the right
   queries?
3. **L2 behavior / pressure** — RED/GREEN via subagents, **graded by running the
   enforcement suite on the agent's output**. Skill-off vs skill-on violation
   counts is the machine-measured behavior change. The linter that enforces is
   also the oracle that scores the behavior eval.
4. **L-enf fixture tests** — ESLint `RuleTester` RED/GREEN for each custom rule
   (first exercised with the custom no-barrel rule in the `implement-frontend`
   spine).
5. **L-gen generator snapshots** — generator output matches golden and passes
   lint.

Plus **template-CI dogfood**: `templates/fullstack` runs the whole `verify` suite
green on every push = end-to-end integration proof; and a "scaffold a fresh app
in CI, then `verify`" job validates the `create-app` transform.

### 6.8 Agent-agnostic strategy

- Skills are plain `SKILL.md` (work across Claude / Codex / Cursor via skills.sh).
- The real teeth — eslint / stylelint / tsc + a **lefthook** pre-commit hook + CI
  — are agent-independent: they grade the _code_, not the agent.
- The only agent-facing glue is a vendor-neutral `AGENTS.md` fragment the template
  ships ("prefer the generators; run `pnpm verify` before finishing"). Optional
  thin adapters (a Cursor rule, a Claude hook) can wrap it later without the core
  depending on them.

## 7. Vertical spine: `setup-project` (first deliverable)

The spine proves the whole loop on one thin slice before scaling. `setup-project`
is chosen first because everything else is built _inside_ a scaffolded project, so
this establishes every package skeleton and the distribution pipeline.

**What ships in the spine:**

- **Guidance:** `setup-project` workflow skill (procedure: run
  `pnpm create @jig-harness/app`, explain the resulting structure, run
  `pnpm verify`) + `project-defaults` convention skill (rewritten
  `web-app-project-defaults`, rule-ID'd).
- **Capability:** `@jig-harness/create-app` scaffolder (with the
  `workspace:*`/`catalog:` → published-version rewrite) + `templates/fullstack`
  (apps/web = Vite+React, apps/api = Fastify, packages/types = Zod contracts,
  turborepo wiring).
- **Enforcement:** the config packages (`eslint-config`, `prettier-config`,
  `stylelint-config`, `tsconfig`) composed from off-the-shelf rules, wired into the
  template with a lefthook pre-commit hook and a CI `verify` workflow — all green
  on the untouched template.
- **Tests:** L0 (skill validation + catalogue coherence), L1 (does
  `setup-project` trigger on "start a new fullstack app"), L2 (does the agent use
  the scaffolder instead of hand-rolling, graded by comparing output to the
  enforced template shape), template-CI dogfood, and the "scaffold-then-verify"
  job. L-enf (custom-rule fixtures) is first exercised in the follow-on
  `implement-frontend` spine, where the no-barrel custom rule lands.

**Stop point:** after the spine is green end-to-end and the first L2 RED/GREEN is
recorded, stop and gather feedback before scaling.

## 8. Phased plan

- **P0 — Scaffold (½ day):** initialize the pnpm+turbo monorepo, Changesets, empty
  package skeletons, `rules-catalogue.md` skeleton, CI running lint/type/test +
  catalogue coherence.
- **P1 — `setup-project` spine (the payoff):** implement §7 end-to-end; template
  CI green; record the first L2 RED/GREEN. **Stop for feedback.**
- **P2 — Fan out with subagents:** with the spine as the proven contract,
  parallelize per rule-cluster/convention. Next spine: `implement-frontend`
  ("add a component/widget") — introduces `turbo gen`, the first custom eslint
  rule + L-enf fixtures, and the composition conventions. Then backend slices, then
  contracts.
- **P3 — Migrate & sharpen skills:** move all eight skills into the two-tier
  `skills/` layout, rewrite them sharp and rule-ID'd, finalize the config presets,
  first npm publish.
- **P4 (deferred):** upgrade the catalogue A→B (machine registry + coherence
  codegen), add Sonar / dependency-cruiser, backend custom rules,
  `refactor-to-conventions` workflow.

## 9. Risks & mitigations

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

## 10. Open questions

1. `@jig-harness` npm scope availability, and fallback if taken
   (`@usejig` / `@jigkit`).
2. Final workflow use-case list — is `refactor-to-conventions` in v1 or deferred to
   P4?
3. Template composition specifics for `apps/web` routing/state defaults (React
   Router + TanStack Query assumed from the existing skills).
4. Repository visibility — created private; flip to public when ready to publish.
