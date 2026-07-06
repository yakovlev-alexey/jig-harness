# 0002. Three-layer rule model

- Status: Accepted
- Date: 2026-07-06

## Context

The existing public skills repo holds prescriptive web-app guidance, but it is
**guidance-only**: agents hand-write boilerplate instead of generating it, and
nothing in prettier/eslint/stylelint/tsc/CI turns skill rules into machine-checked
gates. A markdown-only skills repo cannot host capability or enforcement layers
because those must run inside real project repos.

Two gaps make guidance unenforceable and easy for an agent to ignore or
reinterpret: no capability layer (generators, templates) and no enforcement layer
(lint, hooks, CI). Success requires that a violated rule is caught automatically,
common boilerplate is generated with lint-clean output, and a scaffolded project
starts green under the full `verify` suite.

## Decision

We treat **the rule as the atomic unit** of the harness. Every rule can appear in
up to three layers and is checked at up to three test levels:

1. **Guidance** — convention skills state the rule with a stable rule id.
2. **Capability** — generators never emit violating patterns; output passes lint.
3. **Enforcement** — eslint/stylelint/tsc and custom rules flag violations in
   pre-commit hooks and CI.

`rules-catalogue.md` is the connective tissue: one row per rule with columns for
guidance anchor, capability generator, enforcement rule id, tests, and status
(`guidance-only` → `generated` → `enforced` → `full`). The whole harness goal is
to make each rule real in as many layers as possible and test each layer (L1/L2
skill evals, L-gen generator snapshots, L-enf fixture RED/GREEN).

## Consequences

- Rules stay coherent across skills, generators, and lint instead of drifting
  as disconnected prose.
- CI coherence checks can require every custom eslint rule to have a catalogue
  row and every row citing enforcement to reference a real rule.
- Adding a new convention requires planning its layer coverage and test levels,
  not just editing a skill paragraph.
- The catalogue is deliberately structured toward a future machine registry
  (`rules.json`) without blocking v1 on that migration.

## Alternatives considered

- **Guidance-only skills repo.** Rejected: guidance alone is skippable; without
  capability and enforcement layers, agents reinterpret rules and violations are
  only "mentioned", not caught.
- **Enforcement without generators.** Rejected: agents still hand-write
  boilerplate; capability amplifies agents with tools and ensures generator output
  is always lint-clean, which is part of proving the rule loop end-to-end.
