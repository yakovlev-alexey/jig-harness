---
name: backend-architecture
description: Use when organizing or refactoring apps/backend slice layers; when endpoints, usecases, commands, queries, or domain placement is unclear; or when symptoms include command↔query imports, domain I/O, usecases calling Prisma directly, or non-kebab slice file names.
---

# Backend Architecture

## Overview

Structure backend code by vertical product slices and pragmatic clean architecture layers. Use screaming architecture names first, then layer names inside each slice.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

- Adding or moving files under `apps/backend/src/slices/` or `src/common/`
- Deciding layer placement for endpoints, usecases, commands, queries, or domain rules
- User asks about command/query separation, Prisma access, or slice plugins

## When NOT to Use

- Shared frontend/backend Zod contracts (use `contracts`)
- Greenfield stack defaults before scaffold (use `project-defaults`)
- Frontend slice layout (use `frontend-architecture`)

## Preferred Shape

```text
apps/backend/src/
  common/
    prisma.ts
    register-slices.ts
  slices/
    <product-area>/
      domain/
      usecases/
      commands/
      queries/
      endpoints/
      plugins/
      schemas/
```

## Flow

```text
endpoint -> usecase -> commands / queries -> Prisma
                  -> domain rules
```

## Rules

| Rule ID                             | Convention                                                                                                                                |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **be-slices-layout**                | Product slices live under `src/slices/<product-area>/`; shared infra under `src/common/`.                                                 |
| **be-layer-segments**               | Allowed layer segments: `domain`, `usecases`, `commands`, `queries`, `endpoints`, `plugins`, `schemas`.                                   |
| **be-kebab-case**                   | Name folders and files in lowercase kebab-case (`create-user-endpoint.ts`, `create-user-usecase.ts`).                                     |
| **be-no-command-query-cross-calls** | Commands and queries must not import each other. Compose them in usecases.                                                                |
| **be-domain-no-io**                 | Domain may use Prisma generated types (`import type`), but must not import Prisma Client, Fastify, HTTP, `process.env`, or external I/O.  |
| **be-layer-flow**                   | Endpoints call usecases; usecases compose domain + commands + queries; commands/queries hide Prisma mutations/reads.                      |
| **be-file-budget**                  | Keep slice layer files under ~200 lines (warn) / 300 lines (error). Split oversized usecases or endpoints into helpers.                   |
| **be-function-budget**              | Keep functions under ~50 lines (warn) / 80 lines (error). Extract validation, mapping, or branching into domain helpers or private funcs. |
| **be-complexity**                   | Cyclomatic complexity ≤ 12. Reduce branching in usecases by pushing rules into domain functions.                                          |

## Decomposition & size budgets

Backend slice layers share graduated line budgets and a complexity cap:

- **domain** — small pure functions; complexity stays low by design.
- **usecases / endpoints** — orchestrate; when a file grows, extract domain rules or private helpers in the same layer folder.
- **commands / queries** — one operation per file; split if a single read/write path accumulates too many branches.

Tests, generators, and config files are exempt from line budgets.

## Layer Responsibilities

- **domain** — reusable business rules, policies, assertions, normalizers
- **usecases** — one business operation per file; may open transaction boundaries
- **commands** — one write per file; optional transaction client parameter
- **queries** — one read per file; optional transaction client parameter
- **endpoints** — one Fastify route plugin per file; HTTP contract + status codes
- **plugins** — register slice endpoints on the Fastify app
- **schemas** — slice-local Zod schemas when not shared via `packages/types`

## Capability

Prefer `turbo gen backend-slice`, `turbo gen endpoint`, or `turbo gen usecase` from `@app/backend`. Generator output must pass `pnpm verify`.

## Red Flags — STOP

- Top-level `controllers/`, `services/`, or `repositories/` folders outside slices
- Usecase calling Prisma directly for normal reads/writes (move to command/query)
- Command importing a query or query importing a command
- Domain file with value imports from `@prisma/client`, Fastify, or env access
- Usecase or endpoint file exceeding file/function line budget without extraction
- High cyclomatic complexity in a single function — push branches into domain helpers

## Common Mistakes

| Mistake                          | Correction                                     |
| -------------------------------- | ---------------------------------------------- |
| Usecase calls Prisma for CRUD    | Move reads/writes into query/command files     |
| Command calls query              | Compose both in the usecase                    |
| Domain mirrors Prisma model      | Use generated types; put rules in domain funcs |
| Hand-written slice layer folders | Run `turbo gen backend-slice`                  |
| Monolithic usecase file          | Extract domain rules or private helpers        |
| Branch-heavy endpoint handler    | Move validation/mapping into domain or schemas |

See `references/backend-slice-examples.md`. Full rule ↔ enforcement crosswalk: `rules-catalogue.md` in jig-harness.
