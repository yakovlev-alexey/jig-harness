# Backend slice layout examples

## Layer folders

```text
src/slices/users/
  domain/
    assert-user-can-be-created.ts
    normalize-user-email.ts
  usecases/
    create-user-usecase.ts
  commands/
    create-user-command.ts
  queries/
    find-user-by-email-query.ts
  endpoints/
    create-user-endpoint.ts
  plugins/
    users-plugin.ts
  schemas/
```

## Flow example

```typescript
// create-user-endpoint.ts — HTTP boundary
import { createUserUsecase } from '../usecases/create-user-usecase.js';

// create-user-usecase.ts — composes domain + query + command
import { findUserByEmailQuery } from '../queries/find-user-by-email-query.js';
import { createUserCommand } from '../commands/create-user-command.js';
import { assertUserCanBeCreated } from '../domain/assert-user-can-be-created.js';
```

## Domain type import (be-domain-no-io)

```typescript
// Good — type-only import from Prisma
import type { User } from '@prisma/client';

// Bad — value import or Prisma client in domain/
import { prisma } from '../../../common/prisma.js';
```
