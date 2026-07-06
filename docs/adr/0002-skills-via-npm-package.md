# 0002. Skills via npm package

- Status: Accepted
- Date: 2026-07-06

## Context

The harness ships agent skills under repo-root `skills/` and distributes them
today only through skills.sh (`pnpm dlx skills add yakovlev-alexey/jig-harness`).
The scaffolder (`pnpm create @jig-harness/app`) copies the fullstack template and
pins `@jig-harness/*` npm packages but does not deliver skills. Template
`AGENTS.md` references skill names agents may not have installed, so scaffolded
projects are not agent-ready out of the box.

DESIGN.md §5 locked "Convention skills — Separately installable skills (not embedded
references)" when the only install path was skills.sh. That decision prevented
copying skill markdown into the template git tree but did not address
version-pinned, project-scoped delivery.

## Decision

Introduce `@jig-harness/skills`, a published npm package in the Changesets fixed
`@jig-harness/*` group that:

1. Bundles all harness workflow and convention skills (`SKILL.md` + `references/`,
   excluding harness-only `evals/`) synced from repo-root `skills/` at `prepack`.
2. Runs a `postinstall` linker that creates gitignored symlinks from project-local
   agent directories (`.cursor/skills`, `.codex/skills`, `.claude/skills`,
   `.agents/skills`) into `node_modules/@jig-harness/skills/bundled/`.
3. Ships as a devDependency of the fullstack template so `pnpm create` + default
   `pnpm install` links skills automatically.

Keep skills.sh as a secondary channel for global install and harness contributors.
Repo-root `skills/` remains the single source of truth; the npm package is a
published projection, not a second authoring location.

## Consequences

- Scaffolded apps become agent-ready without a separate skills install step.
- Skill versions align with other harness packages on every scaffold and upgrade.
- Linked skill directories are gitignored; fresh clones restore links on
  `pnpm install`.
- Windows and symlink-permission edge cases need junction fallback and clear docs.
- DESIGN.md §5 and §6.3 must describe dual-channel distribution (npm + skills.sh).
- Harness CI gains sync/linker unit tests and scaffold integration assertions.
- The locked "separately installable" wording is refined: skills remain installable
  via skills.sh globally, and via npm locally per project — they are not embedded
  as committed files in the scaffold git tree.

## Alternatives considered

- **Copy `skills/` into the scaffolded repo (committed).** Rejected: drifts from
  harness version, duplicates the npm channel, and violates the spirit of keeping
  agent glue out of git.
- **Run skills.sh during `pnpm create`.** Rejected: network-dependent, installs
  globally not per-project, and cannot pin versions with other `@jig-harness/*`
  packages.
- **Status quo + documentation only.** Rejected: agents still miss skills unless
  the user manually runs skills.sh; does not meet the agent-ready scaffold goal.
- **Global-only symlink into `~/.cursor/skills`.** Rejected: not project-scoped,
  not version-locked per app, and conflicts with multi-project workflows.

Feature requirements and acceptance scenarios: [spec](../specs/skills-via-npm/spec.md).

## Documentation note (2026-07-06)

This ADR predates the decomposition of `DESIGN.md` into `docs/README.md`, feature
specs, and numbered ADRs. Context and Consequences that mention `DESIGN.md` §5 or
§6.3 describe the pre-decomposition source of truth. Dual-channel distribution
and repository topology are now documented in:

- [ADR 0007 — Distribution and template resolution](0007-distribution.md)
- [ADR 0004 — Monorepo delivery and versioning](0004-monorepo-delivery.md)
- [docs/README.md — Repository topology](../README.md#repository-topology)
- [skills-via-npm spec](../specs/skills-via-npm/spec.md)
