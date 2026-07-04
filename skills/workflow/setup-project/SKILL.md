---
name: setup-project
description: Use when starting a new fullstack TypeScript web app, bootstrapping a greenfield monorepo, or scaffolding with jig — or when about to manually create apps/web, apps/api, or packages/types.
---

# Setup Project

## Overview

Bootstrap a new fullstack app using the jig harness scaffolder. Do not hand-roll project structure.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

- User asks to start, bootstrap, or scaffold a new fullstack TypeScript monorepo
- User is about to `mkdir apps/web`, `apps/api`, or `packages/types` manually
- Greenfield project with no existing jig scaffold

## When NOT to Use

- Fixing lint, tests, or features in an existing project
- Adding a slice, component, or endpoint to an already scaffolded app
- User explicitly requests migration of an existing codebase (use `refactor-to-conventions` when available)

## Procedure

1. Run `pnpm create @jig-harness/app <project-name>` in the target parent directory.
2. If create fails (network, registry): fix the error and retry, or use the offline path documented in `packages/create-app` (local tarballs via `--tarballs-dir`). Do not substitute hand-rolled layout.
3. **REQUIRED SUB-SKILL:** Use `project-defaults` for stack conventions and explain the resulting structure to the user:
   - `apps/web` — Vite + React + React Router + TanStack Query
   - `apps/api` — Fastify + Zod
   - `packages/types` — shared Zod contracts
4. `cd <project-name>` and run `pnpm verify`.
5. Fix every verify failure before finishing. Setup is incomplete until verify passes green.

## Rules

- **sp-scaffolder** — Always use `pnpm create @jig-harness/app` (or its offline equivalent). Never hand-roll the monorepo layout. Never copy `templates/fullstack` manually as a substitute.
- **sp-verify** — Always run `pnpm verify` before finishing setup. No deferral for deadlines, user requests, or «template warnings are normal».

## Red Flags — STOP and Start Over

- Creating `apps/web`, `apps/api`, or `packages/types` before running the scaffolder
- Continuing a partially hand-rolled layout instead of deleting and re-scaffolding
- Copying files from `templates/fullstack` manually «to save time»
- Skipping or deferring `pnpm verify` («after the meeting», «before first commit», «warnings are expected»)
- Using `--skip-install` to avoid verify without a plan to run verify before finishing
- «I'll adapt the hand-rolled structure while fixing»

**All of these mean: delete hand-rolled work, run the scaffolder, run verify green.**

## Rationalizations

| Excuse | Reality |
| --- | --- |
| «Structure is simple, faster to mkdir manually» | Scaffolder takes seconds; hand-roll drifts from enforced template. Delete and re-scaffold. |
| «Create failed / offline — I'll replicate the template by hand» | Fix create or use offline scaffolder path. Hand-roll is not an equivalent. |
| «Already half-built manually — deleting is wasteful» | Partial scaffold is invalid. Delete it. Sunk cost is smaller than verify/debug drift. |
| «User is in a hurry / said skip tooling» | Speed ≠ skip scaffolder or verify. Urgency makes verify more important, not less. |
| «Verify later — template warnings are normal» | Setup incomplete until verify passes green. Fix failures now. |
| «Copying from templates/fullstack is the same as scaffolder» | Manual copy skips dep rewrite, tarball resolution, and git init. Use create-app. |

## Common Mistakes

| Mistake | Correction |
| --- | --- |
| Creating apps/api, apps/web manually | Delete hand-rolled layout; use the scaffolder |
| Skipping verify after scaffold | Run `pnpm verify` and fix all failures before finishing |
| Continuing partial hand-roll | Delete partial work; start over with scaffolder |
