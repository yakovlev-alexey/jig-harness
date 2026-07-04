---
name: implement-backend
description: Use when adding or refactoring Fastify backend slices — endpoints, usecases, commands, queries, domain rules, or Prisma-backed flows — in an existing jig-scaffolded app, or when about to hand-write backend slice folders instead of turbo gen.
---

# Implement Backend

## Overview

Add or refactor backend slice code using jig generators and convention skills. Do not hand-roll slice layer folders when generators exist.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

- User asks to add an endpoint, usecase, or backend slice in an existing scaffolded app
- Refactoring command/query/domain separation in `apps/backend`
- Agent is about to `mkdir` under `src/slices/*/endpoints` or `usecases` manually

## When NOT to Use

- Bootstrapping a new monorepo (use `setup-project`)
- Frontend components, widgets, or pages (use `implement-frontend`)
- Greenfield stack choice (use `project-defaults`)

## Procedure

1. Identify the owning product slice (e.g. `users`, `billing`) before creating files.
2. **REQUIRED SUB-SKILLS:** Use `backend-architecture` for layer/import rules and `contracts` for shared Zod schemas in `packages/types`.
3. From `apps/backend`, run the appropriate generator:
   - New slice layers: `pnpm exec turbo gen backend-slice`
   - Endpoint stub: `pnpm exec turbo gen endpoint`
   - Usecase stub: `pnpm exec turbo gen usecase`
4. Wire endpoint → usecase → command/query/domain. Register the slice plugin in `register-slices.ts`.
5. Add or extend shared contracts in `packages/types/src/slices/<slice>/` when the API boundary changes.
6. Run `pnpm verify` from the app or monorepo root. Fix every failure before finishing.

## Rules

- **ib-use-generators** — Use `turbo gen backend-slice`, `endpoint`, or `usecase`. Never hand-roll layer folders when generators exist.
- **ib-verify** — Run `pnpm verify` before finishing. No deferral for deadlines or «lint can wait».

Delegated enforcement (graded by lint):

- **be-no-command-query-cross-calls**, **be-domain-no-io**, **be-layer-flow**, **be-kebab-case** — see `backend-architecture`
- **ct-no-frontend-backend-impl-imports**, **ct-vertical-slices** — see `contracts`

## Red Flags — STOP

- Hand-writing `src/slices/.../endpoints/` without running `turbo gen endpoint`
- Command importing a query (or vice versa)
- Domain file importing Prisma Client or Fastify
- Frontend importing backend implementation instead of `@app/types`
- Skipping `pnpm verify` after backend changes

## Rationalizations

| Excuse                                      | Reality                                                                       |
| ------------------------------------------- | ----------------------------------------------------------------------------- |
| «Just one endpoint file, faster to touch»   | Generator takes seconds; hand-roll drifts from enforced shape. Run turbo gen. |
| «I'll fix lint later»                       | Backend work incomplete until verify passes green.                            |
| «Share logic by importing backend from web» | Use `packages/types` contracts only.                                          |
| «Usecase can call Prisma directly once»     | Move Prisma into command/query; keep usecase as composer.                     |

## Common Mistakes

| Mistake                    | Correction                             |
| -------------------------- | -------------------------------------- |
| Hand-written slice folders | Run `turbo gen backend-slice`          |
| Command imports query      | Compose in usecase                     |
| Raw Prisma in API response | Map through Zod schema in endpoint     |
| Skipping verify            | Run `pnpm verify` and fix all failures |
