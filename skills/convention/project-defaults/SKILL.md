---
name: project-defaults
description: Use when creating a new TypeScript web app, greenfield full-stack app, monorepo scaffold, React app, Vite app, Fastify API, or Zod contracts package.
---

# Project Defaults

## Overview

Greenfield defaults for jig-scaffolded fullstack apps. For existing projects, preserve established conventions unless migration is requested.

## Stack Defaults

| Rule ID           | Convention                                                                    |
| ----------------- | ----------------------------------------------------------------------------- |
| **pd-pnpm**       | Use `pnpm` for package management                                             |
| **pd-typescript** | Use TypeScript for app code, config, tests, and scripts                       |
| **pd-turborepo**  | Use Turborepo for fullstack monorepos                                         |
| **pd-react-vite** | Use React + Vite for interactive web apps                                     |
| **pd-fastify**    | Use Fastify + Zod for API services                                            |
| **pd-contracts**  | Shared frontend/backend contracts live in `packages/types`                    |
| **pd-query**      | Configure one TanStack Query client in `src/common/query-client.ts`           |
| **pd-bem-css**    | Use colocated plain CSS with BEM class names (no Tailwind/shadcn in scaffold) |

## Greenfield Shape

```text
apps/
  web/
  api/
packages/
  types/
```

## Web App Shape

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

## Common Mistakes

| Mistake                                  | Correction                                         |
| ---------------------------------------- | -------------------------------------------------- |
| Applying defaults to an existing project | Preserve existing conventions                      |
| Broad shared domain package              | Keep contracts in vertical `packages/types` slices |
| shadcn/Tailwind in jig scaffold          | Use BEM + colocated CSS per pd-bem-css             |
