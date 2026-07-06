# 0003. Monorepo delivery and versioning

- Status: Accepted
- Date: 2026-07-06

## Context

The harness must ship as a **shippable tooling product**: published npm packages,
a scaffolder template, and installable skills — not a loose collection of docs.
Existing web-app skills live in a separate repo; rule coherence, generators,
enforcement configs, and the fullstack template must evolve together. End users
need a single, predictable way to bootstrap projects and pin compatible package
versions.

## Decision

We deliver from a **single `jig-harness` monorepo** (pnpm + turborepo):

- **Repo topology** — one monorepo hosts `skills/`, `packages/`, `templates/`,
  `rules-catalogue.md`, scripts, and CI.
- **npm scope** — `@jig-harness/*` for all published packages (availability to
  confirm at reservation).
- **Skills** — existing web-app skills move into `jig-harness/skills/`, rewritten
  sharper with rule ids.
- **Scaffolder** — `pnpm create @jig-harness/app` (not degit).
- **Versioning** — Changesets in fixed/linked mode: one version across all
  packages and the create CLI so the scaffolder always pins a known-compatible
  set.
- **Sequencing** — vertical spine first, gather feedback, then fan out with
  subagents.

## Consequences

- Skills, packages, template, and catalogue change in one place; coherence checks
  and template dogfood CI prove integration without cross-repo sync.
- Fixed/linked versioning simplifies support: every `@jig-harness/*` release is
  one coherent snapshot.
- The monorepo is larger and all consumers wait on a unified release cadence
  rather than independent package semver.
- First spine is `setup-project`, establishing the distribution pipeline before
  scaling convention coverage.

## Alternatives considered

- **Multi-repo** (separate skills repo, packages repo, template repo). Rejected:
  rule coherence, generator output, and enforcement configs would drift; the
  three-layer model needs one connective catalogue and shared CI.
- **degit template.** Rejected: no version rewrite of harness dependencies;
  `pnpm create @jig-harness/app` copies the template and rewrites `workspace:*` /
  `catalog:` to published versions, then runs install and `git init`.
- **Independent package versions.** Rejected: create-app must know exactly which
  eslint-config, generators, and configs belong together; linked Changesets avoid
  combinatorial mismatch for end users.
