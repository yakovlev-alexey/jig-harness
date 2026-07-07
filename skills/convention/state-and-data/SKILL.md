---
name: state-and-data
description: Use when deciding TanStack Query vs Nano Stores, wiring useQuery or useMutation, cache invalidation, UI filters, selected entities, drafts, wizard progress, or store/queries vs store/commands vs store/model layout in jig fullstack apps.
---

# State And Data

## Overview

Keep most business logic on the backend. Frontend orchestration submits intent, calls the backend, updates or invalidates server-state caches, and renders results. Server state lives in TanStack Query; frontend-only shared UI state lives in Nano Stores.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

- Adding or moving files under `src/slices/*/store/`
- Wiring `useQuery`, `useMutation`, Nano Store atoms, or cache invalidation
- Deciding where a UI filter, draft, or selected entity belongs
- User asks about TanStack Query, Nano Stores, query keys, or store file roles

## When NOT to Use

- Slice folder segments or import/export style (use `frontend-architecture`)
- Page/widget composition or colocated CSS (use `react-composition`)
- Shared Zod contracts (use `contracts`)
- Test layer choice (use `testing`)

## Preferred Shape

```text
src/
  routes/
    users.tsx              # route target (page) — composes widgets
    users.css
  slices/<product-area>/
    store/
      model/               # Nano Store atoms/maps
      selectors/           # pure derived helpers
      queries/             # TanStack Query options + keys
      commands/            # mutation functions (fetch + parse)
    widgets/
      <name>/
        <name>.widget.tsx  # container — owns store/data hooks
        <name>.tsx         # presenter — props only
    components/
      <name>/
        <name>.tsx         # presenter — props only
```

Route files under `src/routes/` and widget entry files (`*.widget.tsx`) are **containers**: they read store/data, run hooks, and pass plain props to presentational UI. Widget-ui files (`widgets/**/*.tsx` that are not `*.widget.tsx`) and components are **presenters**.

## Rules

| Rule ID                           | Convention                                                                                                                                                                          |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **sd-server-state-tanstack**      | Server state, async reads, caching, retries, and background refresh via TanStack Query.                                                                                             |
| **sd-mutations-usemutation**      | Writes via `useMutation({ mutationFn: <command> })`; invalidate affected query keys `onSuccess` (reuse exported keys, e.g. `usersQueryKey`).                                        |
| **sd-client-state-nanostores**    | Frontend-only shared UI state (filters, selected entities, drafts, wizard progress) via Nano Stores.                                                                                |
| **sd-no-server-data-in-stores**   | Never mirror server data into Nano Stores; keep it in TanStack Query. Stores may feed query keys or mutation inputs.                                                                |
| **sd-store-file-roles**           | `store/model/` atoms/maps; `store/selectors/` pure derived; `store/queries/` query options + keys; `store/commands/` mutation fns or state changes.                                 |
| **sd-small-named-store-files**    | Prefer small named files over repository/service/grouped store objects (see also **fe-one-entity-per-file**).                                                                       |
| **sd-no-store-in-presentational** | Presentational files (`components/**` and widget-ui `widgets/**/*.tsx` except `*.widget.tsx`) must not import store or data libraries. **ENFORCED** by lint.                        |
| **sd-ssr-loader-prefetch**        | Route loaders call `context.queryClient.ensureQueryData(...)` for SSR prefetch; widget entries keep `useQuery` (warm cache, no flash). Dehydrate/hydrate is handled by entry files. |

## SSR loader prefetch

For SSR, seed TanStack Query in the **route loader**, not in widgets:

```typescript
// src/routes/users.tsx — container page
export const Route = createFileRoute('/users')({
  loader: ({ context }) => context.queryClient.ensureQueryData(usersQuery()),
  component: UsersPage,
});

// widget entry — unchanged; reads warm cache via useQuery
export function UserListWidget() {
  const { data } = useQuery(usersQuery());
}
```

Root route uses `createRootRouteWithContext<{ queryClient: QueryClient }>()`. `entry-server.tsx` dehydrates; `entry-client.tsx` hydrates before `hydrateRoot`.

```typescript
// Good — container (*.widget.tsx) reads store and passes props
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@nanostores/react';
import { usersQuery } from '../../store/queries/users-query';
import { usersFilterAtom } from '../../store/model/users-filter-store';
import { filterUsers } from '../../store/selectors/filter-users';
import { UserListUi } from './user-list';

export function UserListWidget({ className }: { className?: string }) {
  const { data, isPending, isError } = useQuery(usersQuery());
  const filter = useStore(usersFilterAtom);
  const users = data ? filterUsers(data, filter) : [];
  return (
    <UserListUi className={className} isError={isError} isPending={isPending} users={users} />
  );
}

// Good — presenter (widget-ui) takes props only
type UserListUiProps = {
  users: UserResponse[];
  isPending: boolean;
  isError: boolean;
  className?: string;
};

export function UserListUi({ users, isPending, isError, className }: UserListUiProps) {
  // render from props — no useQuery, no store imports
}

// Bad — presenter imports store or data library
import { useQuery } from '@tanstack/react-query';
import { usersQuery } from '../../store/queries/users-query';
```

## Red Flags — STOP

- `useQuery` / `useMutation` / `useStore` inside a component or widget-ui file
- Importing `store/queries/*`, `store/commands/*`, or `store/model/*` from a presenter
- Copying server list data into a Nano Store atom
- A repository-style `store.ts` grouping queries, commands, and models

## Common Mistakes

| Mistake                                     | Correction                                                          |
| ------------------------------------------- | ------------------------------------------------------------------- |
| Server data copied into Nano Stores         | Keep it in TanStack Query; stores feed keys or mutation inputs only |
| Server writes bypass `useMutation`          | Use `useMutation({ mutationFn: command })` in the container         |
| Hooks in widget-ui instead of `.widget.tsx` | Move orchestration to the widget entry container                    |
| `store/` becomes a repository object        | Split into named query, command, selector, and model files          |
| Shared filter passed as page props          | Use a Nano Store atom; widgets read/write independently             |

See `references/query-nanostores-examples.md`. Full rule ↔ enforcement crosswalk: `rules-catalogue.md` in jig-harness.
