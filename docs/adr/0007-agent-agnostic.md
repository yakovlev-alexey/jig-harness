# 0007. Agent-agnostic enforcement

- Status: Accepted
- Date: 2026-07-06

## Context

Coding agents differ by vendor (Claude, Codex, Cursor, others). The harness goal
includes tested skills and machine-checked rules, but tying enforcement to one
agent's hooks, rules format, or CLI would shrink the audience and duplicate
maintenance. Violations must be caught regardless of which agent wrote the code.

## Decision

We keep the harness **agent-agnostic**:

- **Skills** — plain `SKILL.md`, installable across agents via skills.sh.
- **Enforcement** — eslint, stylelint, tsc, lefthook pre-commit, and CI grade
  the _code_, not the agent. These run the same for human and agent commits.
- **Agent-facing glue** — a vendor-neutral `AGENTS.md` fragment in the template
  ("prefer the generators; run `pnpm verify` before finishing"). Optional thin
  adapters (a Cursor rule, a Claude hook) may wrap this later; the core does not
  depend on them.

No single coding agent or vendor is a required dependency.

## Consequences

- Any agent that edits the repo hits the same lint, hooks, and CI gates.
- Skill evals (L1/L2) can run across environments that support skills.sh without
  vendor-specific harness code in the critical path.
- Best-in-class IDE integrations are additive, not blockers for shipping packages,
  template, and enforcement.
- Agents that ignore skills still produce code that passes or fails objective checks;
  skills nudge, hooks and CI enforce.

## Alternatives considered

- **Vendor-specific rules/hooks as the core.** Rejected: ties the product to one
  editor or agent runtime, duplicates enforcement logic per vendor, and weakens
  the claim that rules are real for all users; vendor adapters belong in an
  optional layer on top of shared lint and `AGENTS.md`.
