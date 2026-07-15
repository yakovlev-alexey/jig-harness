# Plan — state-and-data skill QC

Skill: `skills/convention/state-and-data`. Execute after the foundation PR using the
[shared protocol](./README.md). No generator applies to eval assets.

## Task A — Normalize trigger definitions and documentation

**Satisfies:** skill-testing R2, R10, R13 · **Effort:** S

Convert `evals/trigger_evals.json` to this exact v1 matrix. Preserve the first six
queries byte-for-byte and add the final four:

```json
{
  "schema_version": 1,
  "cases": [
    {
      "id": "server-state-query-or-store",
      "query": "Should the users list from the API live in TanStack Query or a Nano Store?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "invalidate-users-after-create",
      "query": "How do I invalidate the users cache after creating a user?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "shared-ui-filter-ownership",
      "query": "Where should a shared UI filter value live when two widgets on the same page need it?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "store-segment-roles",
      "query": "What goes in store/queries vs store/commands vs store/model?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "near-miss-fastify-command-placement",
      "query": "Where should I put a new Fastify command file?",
      "should_trigger": false,
      "near_miss_of": "backend-architecture"
    },
    {
      "id": "near-miss-database-test-skip",
      "query": "Can I skip backend integration tests when DATABASE_URL is unset?",
      "should_trigger": false,
      "near_miss_of": "testing"
    },
    {
      "id": "state-library-terse",
      "query": "Query or Nano Store?",
      "should_trigger": true,
      "positive_form": "terse"
    },
    {
      "id": "buried-checkout-state-design",
      "query": "While adding checkout, decide where its server cart, shared coupon draft, mutation, and cache invalidation should live.",
      "should_trigger": true,
      "positive_form": "task_buried"
    },
    {
      "id": "near-miss-page-widget-layout",
      "query": "Should the users page or UserListWidget own the layout between two widgets?",
      "should_trigger": false,
      "near_miss_of": "react-composition"
    },
    {
      "id": "near-miss-shared-zod-response",
      "query": "Where should the shared Zod response schema for users live?",
      "should_trigger": false,
      "near_miss_of": "contracts"
    }
  ]
}
```

Keep the current trigger-only `SKILL.md` description unchanged. Rewrite
`evals/README.md` to the shared template and state ten trigger cases.

## Task B — Add two isolated state application cases

**Satisfies:** skill-testing R9, R13 · **Effort:** M

Create `evals/evals.json` with exactly these definitions:

```json
{
  "schema_version": 1,
  "cases": [
    {
      "id": "shared-ui-filter-state",
      "kind": "application",
      "prompt": "The seeded users page passes one filter value through props to UserFilterWidget and UserListWidget while the server-backed users list is already a TanStack Query. Refactor the shared UI filter to the correct state owner, keep server data out of client stores, and keep presenters props-only. Make the changes in the workspace.",
      "variants": ["without_skill", "with_skill"],
      "workspace": {
        "kind": "fixture_copy",
        "source": "fixtures/shared-ui-filter-state/"
      },
      "oracle": {
        "type": "command",
        "ref": "oracles/shared-ui-filter-state.mjs"
      }
    },
    {
      "id": "create-user-cache-invalidation",
      "kind": "application",
      "prompt": "Complete the seeded CreateUserWidget so it submits with TanStack Query and refreshes the users query after a successful create. Reuse the exported query key and existing createUser command; keep data hooks out of the presenter. Make the changes in the workspace.",
      "variants": ["without_skill", "with_skill"],
      "workspace": {
        "kind": "fixture_copy",
        "source": "fixtures/create-user-cache-invalidation/"
      },
      "oracle": {
        "type": "command",
        "ref": "oracles/create-user-cache-invalidation.mjs"
      }
    }
  ]
}
```

Create this exact support tree:

```text
evals/
├── fixtures/
│   ├── shared-ui-filter-state/
│   │   └── apps/frontend/src/
│   │       ├── routes/users.tsx
│   │       └── slices/users/
│   │           ├── store/queries/users-query.ts
│   │           └── widgets/
│   │               ├── user-filter/
│   │               │   ├── user-filter.widget.tsx
│   │               │   └── user-filter.tsx
│   │               └── user-list/
│   │                   ├── user-list.widget.tsx
│   │                   └── user-list.tsx
│   └── create-user-cache-invalidation/
│       └── apps/frontend/src/slices/users/
│           ├── store/
│           │   ├── commands/create-user-command.ts
│           │   └── queries/users-query.ts
│           └── widgets/create-user/
│               ├── create-user.widget.tsx
│               └── create-user.tsx
└── oracles/
    ├── shared-ui-filter-state.mjs
    └── create-user-cache-invalidation.mjs
```

For `shared-ui-filter-state`, seed `users.tsx` with page-local `useState` and prop
drilling; seed `users-query.ts` with exported `usersQueryKey` and `usersQuery`; seed
widget entry files as containers and the unsuffixed files as typed presenters. The
oracle must require exactly one Nano Store at
`store/model/users-filter-store.ts`, require both `.widget.tsx` containers to read or
write that store, keep `useQuery(usersQuery())` in `user-list.widget.tsx`, and reject
Nano Store copies of the users array. It must reject `useQuery`, `useMutation`,
`useStore`, `@tanstack/react-query`, `@nanostores/react`, and `store/**` imports in both
presenters, and run the `sd-no-store-in-presentational` rule against those presenter
paths.

For `create-user-cache-invalidation`, seed `users-query.ts` with named exports
`usersQueryKey` and `usersQuery`, seed `create-user-command.ts` with named
`createUser`, seed `create-user.tsx` as a props-only form, and leave a TODO submit path
in `create-user.widget.tsx`. The oracle must require that widget to call
`useMutation({ mutationFn: createUser })`, obtain a query client, and call
`invalidateQueries({ queryKey: usersQueryKey })` from `onSuccess`; reject a duplicated
inline key, direct `fetch` in the widget, server-user data in Nano Stores, and any data
or store import in `create-user.tsx`. Both oracles return stable runner-side evidence
and the exact workspace input hash; the scenario child supplies no grade.

## Task C — Run and audit the current campaign

**Satisfies:** skill-testing R9, R13, R14 · **Effort:** M

Run every trigger and every application `case × variant` separately under
`skill-qc-state-and-data-v1`. Generate runner-owned evidence, pass the audit, and commit
it only through shared Step 4 after all checks pass.

## Task D — Remove exact debt and verify

**Satisfies:** skill-testing R1, R15 · **Effort:** S

Delete only resolved `convention/state-and-data` tuples and run all shared checks plus
`pnpm verify`.

## Coverage

A→R2/R10/R13, B→R9/R13, C→R9/R13/R14, D→R1/R15.
