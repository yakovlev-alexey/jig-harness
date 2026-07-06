# 0005. Two-tier skill taxonomy

- Status: Accepted
- Date: 2026-07-06

## Context

The harness ships many conventions (frontend architecture, backend slices,
contracts, testing, specs) and several user-intent workflows (bootstrap a project,
implement a slice, run the spec-driven build loop). A flat pile of topic skills
forces agents to guess which skill applies, duplicates shared rules across files,
and mixes procedural "do X then verify" guidance with reference rulebooks.

## Decision

We organize skills into **two separately installable tiers**:

**Workflow (use-case) skills** — thin procedures triggered by user intent. They
dispatch to convention skills (as today's `web-app-design` dispatches), invoke
generators, and end by telling the agent to run `pnpm verify`. Examples:
`setup-project`, `implement-frontend`, `implement-backend`, the spec-driven spine
(`write-spec`, `write-plan`, `implement-feature`, `review-change`,
`develop-feature`), and planned `refactor-to-conventions`.

**Convention (reference) skills** — sharp, rule-ID'd rulebooks with deep-dives in
`references/`. Shared rules live in exactly one convention skill (DRY). Examples:
`project-defaults`, `frontend-architecture`, `react-composition`,
`state-and-data`, `backend-architecture`, `contracts`, `testing`, `specs`.
Workflow skills reference conventions by name; conventions are **not** embedded
inline in workflow skills.

Both tiers install via skills.sh from the monorepo `skills/` tree.

## Consequences

- Agents get a clear entry point (workflow) and a stable reference (convention)
  without copying rule prose into every procedure.
- Rule ids in convention skills align with `rules-catalogue.md` rows for guidance
  column tracking.
- Authors must decide tier placement when adding skills and avoid duplicating
  shared rules across convention skills.
- Install surface grows (many skills) but each install remains focused; users can
  add convention skills independently of workflows.

## Alternatives considered

- **Single-tier skills.** Rejected: mixes procedures and encyclopedic conventions;
  harder to trigger the right skill and to keep rule ids DRY across topics.
- **Embedded convention references** (workflow skills inlining convention text).
  Rejected: duplicates rules, increases drift versus catalogue and enforcement;
  separately installable convention skills stay the single guidance source per rule.
