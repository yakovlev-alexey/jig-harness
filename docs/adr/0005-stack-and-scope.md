# 0005. Stack choice and scope boundaries

- Status: Accepted
- Date: 2026-07-06

## Context

The harness targets TypeScript fullstack web apps. Breadth across every stack and
every advanced static-analysis tool would delay shipping enforceable rails. v1 must
deliver medium enforcement ambition — off-the-shelf-first plus a small set of
custom rules with fixtures — while staying opinionated enough that generators,
skills, and lint presets compose without abstraction tax.

## Decision

We **commit to a single stack** and **defer broad tooling** in v1:

- **Stack (locked):** TypeScript, pnpm, turborepo, Vite, React, Fastify, Prisma,
  Zod. The harness is not stack-agnostic.
- **Enforcement ambition (v1):** Medium — off-the-shelf eslint/stylelint/tsc/prettier
  first; custom rules only where nothing fits, each shipped with RuleTester
  RED/GREEN fixtures. No SonarQube, dependency-cruiser fitness functions, or
  broad custom-rule set in v1.
- **Explicit non-goals:** not migrating skill/harness artifacts off English; not
  rewriting all eight skills before the first vertical spine ships.
- **Rule coherence:** markdown `rules-catalogue.md` as source of truth, structured
  toward a machine registry later.

## Consequences

- Skills, generators, template, and eslint presets can assume one toolchain;
  agents get sharper, testable conventions instead of generic placeholders.
- Deferred tools (Sonar, dependency-cruiser, broad OpenAPI/codegen) stay on the
  roadmap without blocking the core spine.
- Projects outside the chosen stack cannot adopt jig without forking; that tradeoff
  is intentional.
- Custom-rule maintenance stays bounded by the "few custom rules + fixtures"
  policy.

## Alternatives considered

- **Stack-agnostic harness.** Rejected: generators, boundaries rules, and template
  dogfood require concrete framework choices; agnosticism would weaken enforcement
  and duplicate every layer behind adapters.
- **Sonar / dependency-cruiser in v1.** Rejected: high setup and false-positive
  cost; off-the-shelf eslint boundaries and a minimal custom set prove the
  three-layer loop first; Sonar and fitness functions are deferred to P4.
