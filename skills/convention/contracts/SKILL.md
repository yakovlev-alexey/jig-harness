---
name: contracts
description: Use when sharing frontend and backend TypeScript types, Zod schemas, API contracts, request or response models, or packages/types slice layout.
---

# Contracts

## Overview

Keep shared frontend/backend code minimal. Share API contracts and types deliberately, vertically, and only at the boundary.

## When to Use

- Adding or moving Zod schemas in `packages/types`
- Deciding what belongs in shared contracts vs backend/frontend slice code
- User asks about frontend importing backend code or API response shapes

## When NOT to Use

- Backend layer flow (use `backend-architecture`)
- Frontend slice folders (use `frontend-architecture`)
- Greenfield stack choice (use `project-defaults`)

## Preferred Shape

```text
packages/types/src/
  slices/
    <product-area>/
      <slice>-contracts.ts
```

## Rules

| Rule ID                                 | Convention                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------ |
| **ct-vertical-slices**                  | Shared contracts live under `packages/types/src/slices/<product-area>/`.                   |
| **ct-no-frontend-backend-impl-imports** | Frontend must not import `apps/backend/src/**`. Import from `@app/types` only.             |
| **ct-zod-boundaries**                   | Use Zod at API request/response boundaries and for env parsing.                            |
| **ct-no-prisma-leak**                   | Map API responses through explicit Zod schemas; do not leak full Prisma models to clients. |

## Import Examples

```typescript
// Good — shared contract from packages/types
import { createUserBodySchema } from '@app/types/slices/users/user-contracts';

// Bad — frontend importing backend implementation
import { createUserUsecase } from '../../../backend/src/slices/users/usecases/create-user-usecase.js';
```

## Common Mistakes

| Mistake                          | Correction                                          |
| -------------------------------- | --------------------------------------------------- |
| Frontend imports backend src     | Share only vertical contracts from `packages/types` |
| Broad shared domain package      | Keep contracts slice-local and minimal              |
| API returns raw Prisma model     | Parse/map through Zod response schema in endpoint   |
| Contracts organized by tech type | Organize by product slice under `slices/<name>/`    |

Full rule ↔ enforcement crosswalk: `rules-catalogue.md` in jig-harness.
