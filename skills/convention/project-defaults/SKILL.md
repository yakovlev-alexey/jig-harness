---
name: project-defaults
description: Use when creating a new TypeScript web app, greenfield full-stack app, monorepo scaffold, React app, Vite app, Fastify API, or Zod contracts package.
---

# Project Defaults

## Overview

Greenfield defaults for jig-scaffolded fullstack apps. For existing projects, preserve established conventions unless migration is requested.

After scaffold, `setup-project` dispatches here for stack explanation.

## When to Use

- Explaining stack and folder shape after `setup-project` scaffold
- Deciding conventions for a new greenfield jig monorepo
- User explicitly asks to migrate an existing project to jig conventions

## When NOT to Use

- Refactoring a single component or adding a feature in an existing app
- Existing project with established conventions — preserve them unless migration is requested
- Choosing Astro, Prisma, or shadcn/ui for a jig scaffold (not in jig template)

## Stack Defaults

| Rule ID               | Convention                                                                    | Enforced by                                           |
| --------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------- |
| **pd-pnpm**           | Use `pnpm` for package management                                             | guidance-only                                         |
| **pd-typescript**     | Use TypeScript for app code, config, tests, and scripts                       | guidance-only                                         |
| **pd-turborepo**      | Use Turborepo for fullstack monorepos                                         | create-app (generated)                                |
| **pd-react-vite**     | Use React + Vite for interactive web apps                                     | create-app (generated)                                |
| **pd-fastify**        | Use Fastify + Zod for API services                                            | create-app (generated)                                |
| **pd-contracts**      | Shared frontend/backend contracts live in `packages/types`                    | create-app (generated)                                |
| **pd-query**          | Configure one TanStack Query client in `src/common/query-client.ts`           | create-app (generated)                                |
| **pd-bem-css**        | Use colocated plain CSS with BEM class names (no Tailwind/shadcn in scaffold) | stylelint `selector-class-pattern` (template dogfood) |
| **pd-local-postgres** | Local Postgres via `compose.yaml` and `pnpm db:setup` after scaffold          | create-app (generated)                                |

See `rules-catalogue.md` in jig-harness for the full rule ↔ enforcement crosswalk.

## Greenfield Shape

```text
apps/
  frontend/
  backend/
packages/
  types/
```

## Frontend App Shape

```text
src/
  App.tsx
  main.tsx
  styles.css
  common/
  slices/
    <slice-name>/
      components/
      pages/
      widgets/
      store/
      utils/
      constants/
```

## Local Postgres

After scaffold, local backend development requires a running PostgreSQL instance.

- **`compose.yaml`** at repo root — Docker Compose (or Podman Compose) service for Postgres
- **`pnpm db:setup`** — brings up Postgres and runs Prisma migrations (`db:up` → `db:wait` → `db:migrate`)
- **`apps/backend/.env`** — copied from `.env.example` at scaffold time; contains `DATABASE_URL` for local Postgres
- **Docker vs Podman** — root scripts use `docker compose` when available, otherwise `podman compose`; both work with the same `compose.yaml`

See `setup-project` rule **sp-db-setup**: run `pnpm db:setup` before backend dev or finishing setup.

## Setup Notes

- Jig scaffold includes **Prisma + PostgreSQL** in `apps/backend` and vertical contracts in `packages/types/src/slices/`.
- Jig scaffold does **not** include Astro, OpenAPI codegen, or shadcn/ui — use BEM + colocated CSS per **pd-bem-css**.
- If the template ships path aliases (`src/`, slice paths), preserve them; do not replace with relative import spaghetti.
- Add test scripts appropriate to the app when extending beyond the template.

## Common Mistakes

| Mistake                                  | Correction                                                           |
| ---------------------------------------- | -------------------------------------------------------------------- |
| Applying defaults to an existing project | Preserve existing conventions                                        |
| Broad shared domain package              | Keep contracts in vertical `packages/types` slices                   |
| shadcn/Tailwind in jig scaffold          | Use BEM + colocated CSS per pd-bem-css                               |
| Astro in jig greenfield                  | Out of scope for jig scaffold; pick jig stack or a different harness |
| Skipping `pnpm db:setup` after scaffold  | Run `pnpm db:setup` — Prisma backend requires local Postgres         |
