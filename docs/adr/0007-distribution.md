# 0007. Distribution and template resolution

- Status: Accepted
- Date: 2026-07-06

## Context

Skills, npm packages, and the fullstack template must reach end users without a
separate sync pipeline, and the template CI must prove the same artifact users
scaffold — not a fork that only works inside the monorepo. skills.sh expects a
walkable `skills/` layout; create-app must pin published package versions while
developers dogfood with workspace links.

## Decision

**Skills — dual channel:**

- _Project-local (primary for scaffolded apps):_ `@jig-harness/skills` bundles
  repo-root skills and links them into agent directories on `pnpm install`. See
  [ADR 0002](0002-skills-via-npm-package.md).
- _Global (contributors / manual install):_ skills.sh reads monorepo-hosted
  `skills/<name>/SKILL.md` with no separate sync repo:

```
pnpm dlx skills add yakovlev-alexey/jig-harness --skill setup-project
pnpm dlx skills add yakovlev-alexey/jig-harness/skills/workflow/setup-project
```

**Packages** — published to npm under `@jig-harness/*` with Changesets
fixed/linked versioning so create-app always pins one coherent release.

**Template — one template, two resolution modes:**

- _In-repo (dogfood):_ `templates/fullstack/package.json` depends on harness
  packages via `workspace:*` and shared third-party versions via `catalog:`.
  CI runs full `verify` here as integration proof without publishing.
- _Scaffolded (end-user):_ `pnpm create @jig-harness/app` copies the template,
  rewrites `workspace:*` / `catalog:` to concrete published versions (same
  transform as `pnpm pack` / `pnpm publish`), then runs `pnpm install` and
  `git init`.

Net: no drift between dogfood template and what end-users scaffold; scaffold
transform is validated by a scaffold-then-verify CI job.

## Consequences

- No skills mirror repo or release-time sync script to maintain.
- Template CI and create-app share one source tree; resolution bugs surface in
  dogfood or scaffold CI, not only in the field.
- End users need npm access to `@jig-harness/*`; monorepo contributors use
  workspace protocols locally regardless of `linkWorkspacePackages` default.
- create-app owns the rewrite logic; changes to workspace/catalog usage must keep
  both modes working.

## Alternatives considered

- **Separate skills sync repo.** Rejected: duplicates the monorepo skills tree
  and reintroduces drift between guidance, catalogue, and enforcement shipped
  in the same repo.
- **Dogfood-only template** (no published rewrite path). Rejected: end users
  could not scaffold standalone apps with pinned packages; the product requires
  `pnpm create @jig-harness/app` with published-version resolution.
