---
name: setup-project
description: Use when starting a new fullstack TypeScript web app, bootstrapping a greenfield monorepo, or scaffolding with jig.
---

# Setup Project

## Overview

Bootstrap a new fullstack app using the jig harness scaffolder. Do not hand-roll project structure.

## Procedure

1. Run `pnpm create @jig-harness/app <project-name>` in the target parent directory.
2. Read `project-defaults` for stack conventions and explain the resulting structure to the user:
   - `apps/web` — Vite + React + React Router + TanStack Query
   - `apps/api` — Fastify + Zod
   - `packages/types` — shared Zod contracts
3. `cd <project-name>` and run `pnpm verify`.
4. Fix any verify failures before finishing.

## Rules

- **sp-scaffolder** — Always use `pnpm create @jig-harness/app`; never hand-roll the monorepo layout.
- **sp-verify** — Always run `pnpm verify` before finishing setup.

## Common Mistakes

| Mistake                              | Correction                         |
| ------------------------------------ | ---------------------------------- |
| Creating apps/api, apps/web manually | Use the scaffolder                 |
| Skipping verify after scaffold       | Run `pnpm verify` and fix failures |
