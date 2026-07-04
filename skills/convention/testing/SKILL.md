---
name: testing
description: Use when choosing test layers, tools, or locations; writing unit, integration, or E2E tests; configuring parallel-safe DB isolation, test routes, or verify vs test:e2e in jig fullstack templates.
---

# Testing

## Overview

Follow the **Testing Trophy**: static checks first, then dense unit tests, then real integration tests, then a thin E2E layer for main happy paths. A working database is mandatory — never skip tests when Postgres is missing or broken.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

- Choosing where a test belongs (unit vs integration vs E2E)
- Adding or moving tests under `apps/frontend`, `apps/backend`, `apps/e2e`, or `packages/types`
- Configuring parallel-safe isolation, test routes, or `verify` vs `test:e2e`
- User asks about Playwright, MSW, vitest, `app.inject`, or `TEST_ROUTES_TOKEN`

## When NOT to Use

- Backend slice layer placement (use `backend-architecture`)
- Frontend slice folder layout (use `frontend-architecture`)
- Shared Zod contract shape (use `contracts`)
- Greenfield stack choice before scaffold (use `project-defaults`)

## Testing Trophy → Tools

| Layer           | What it covers                                       | Tooling in jig template                                                    | Runs in `pnpm verify`    |
| --------------- | ---------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------ |
| **Static**      | Types, lint, format                                  | `tsc`, ESLint, Prettier                                                    | yes                      |
| **Unit**        | Pure logic, Zod schemas, domain rules                | vitest (node env)                                                          | yes (`pnpm test`)        |
| **Integration** | HTTP + real DB (backend); UI + mocked API (frontend) | vitest + `app.inject` (backend); Playwright + `@msw/playwright` (frontend) | yes (`test:integration`) |
| **E2E**         | Main happy paths through real UI + API + DB          | Playwright in `apps/e2e`                                                   | no — PR-only CI job      |

Run layers in trophy order: static → unit → integration → E2E (E2E outside verify).

## Where Tests Live (`templates/fullstack`)

```text
packages/types/src/
  slices/<product-area>/
    *-contracts.test.ts          # Zod contract unit tests (vitest)

apps/backend/src/
  slices/<product-area>/domain/
    *.test.ts                      # domain unit tests (vitest, node)
  **/*.test.ts                     # inject integration (vitest + real DB)
  test-support/                    # env+token-gated seed/cleanup (not prod)
  test-server.ts                   # test entry (excluded from prod build)

apps/frontend/
  src/**/*.test.ts                 # pure logic unit tests (vitest, node — no jsdom)
  integration/
    mocks/handlers.ts              # contract-shaped MSW handlers
    fixtures.ts                    # Playwright + MSW fixtures
    *.spec.ts                      # frontend integration (Playwright + MSW)
  playwright.integration.config.ts

apps/e2e/
  tests/*.spec.ts                  # happy-path E2E (Playwright + real API/DB)
  src/{namespace,fixtures,scenarios}/
  playwright.config.ts
```

## Rules

| Rule ID                                      | Convention                                                                                                                                                                                     |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **test-trophy-order**                        | Prefer static → unit → integration → E2E. Put edge cases in unit/integration; reserve E2E for main happy paths.                                                                                |
| **test-static-first**                        | Run typecheck and lint before tests. Do not add runtime tests for what static analysis already guarantees.                                                                                     |
| **test-db-required**                         | Integration and E2E require a real, migrated Postgres (`DATABASE_URL`). Missing or broken DB is a hard failure — never skip or `test.skip`.                                                    |
| **test-unit-dense-logic**                    | Unit-test dense pure logic: domain rules, parsers, Zod schemas, utilities. Use vitest with node env; no jsdom or RTL.                                                                          |
| **test-backend-integration**                 | Backend integration uses vitest + Fastify `app.inject` against a real DB. Assert HTTP status and response shape; no mocked Prisma.                                                             |
| **test-frontend-integration-playwright-msw** | Frontend integration uses Playwright + `@msw/playwright` (`page.route`-based). **No React Testing Library, no jsdom, no RTL.**                                                                 |
| **test-parallel-namespacing**                | Parallel-safe isolation by data namespacing — no global DB reset. Each test owns a namespace; seed, assert, and cleanup only its rows.                                                         |
| **test-e2e-happy-paths**                     | E2E covers main happy paths only (e.g. create user, list seeded users). Edge cases belong in unit/integration.                                                                                 |
| **test-e2e-runnable-remote**                 | E2E runs locally (`webServer`) or against remote staging via `E2E_BASE_URL` / `E2E_API_URL`. Same namespacing model in both modes.                                                             |
| **test-routes-gated-and-token**              | Test routes (`/__test__/*`) are build-excluded from prod, runtime-gated by `ENABLE_TEST_ROUTES`, token-protected (`x-test-token` == `TEST_ROUTES_TOKEN`), refused under `NODE_ENV=production`. |
| **test-no-test-code-in-prod**                | Prod build (`pnpm build` without `INCLUDE_TEST_ROUTES`) must not emit `test-server`, `test-support`, or test routes.                                                                           |
| **test-storybook-when-exists**               | When Storybook exists, add stories for components/widgets (empty, loading, error, happy path). Not a substitute for integration or E2E.                                                        |

## Parallel Isolation (Namespacing)

No global reset. Every test owns a namespace and only touches rows in it.

- **Namespace:** `ns = e2e-${runId}-${workerIndex}-${uuid}` (uuid per test; worker-scoped `runId` once per worker).
- **Namespaced data:** emails like `${ns}+${label}@e2e.test` — globally unique across workers and runs.
- **Scoped assertions:** assert presence of this test's namespaced rows only. Never assert global counts.
- **Targeted cleanup:** teardown calls `POST /__test__/cleanup { namespace }` → delete by email prefix. Orphans are namespaced and harmless.

Same principle in backend vitest integration: unique namespaced emails + delete-by-prefix in teardown; parallel files safe.

```text
worker 0 test  →  seed ns0  →  assert ns0  →  cleanup ns0
worker 1 test  →  seed ns1  →  assert ns1  →  cleanup ns1
                              ↓
                    /__test__/* (env + token gated)  →  shared DB
```

## Verify vs E2E

| Command         | Includes                                                 | When to run                      |
| --------------- | -------------------------------------------------------- | -------------------------------- |
| `pnpm verify`   | lint, typecheck, vitest units, `test:integration`, build | Every commit; CI dogfood         |
| `pnpm test:e2e` | Playwright happy-path specs in `apps/e2e`                | PR-only CI job; optional locally |

`pnpm verify` requires Postgres (`pnpm db:setup` / `DATABASE_URL` + migrated schema). One-time `playwright install chromium` for frontend integration.

## Test Route Security

Test support routes are a deliberate, protected mode — not a prod feature.

- **Build:** `INCLUDE_TEST_ROUTES=true` includes `test-server.ts` + `test-support/**` in build output; default prod build excludes them.
- **Runtime:** register only when `ENABLE_TEST_ROUTES` is set; refuse when `NODE_ENV=production`.
- **Auth:** every test route requires header `x-test-token` matching `TEST_ROUTES_TOKEN` (403 otherwise).
- **Scope:** seed and cleanup are namespace-scoped only — no global wipe.

Prefer ephemeral local DBs over shared staging when possible.

## Layer Examples

```typescript
// Good — backend integration: inject + real DB, namespaced email
const ns = `vitest-${process.pid}-${crypto.randomUUID()}`;
const res = await app.inject({
  method: 'POST',
  url: '/users',
  payload: { email: `${ns}+alice@e2e.test`, name: 'Alice' },
});
await app.inject({
  method: 'POST',
  url: '/__test__/cleanup',
  headers: { 'x-test-token': process.env.TEST_ROUTES_TOKEN! },
  payload: { namespace: ns },
});

// Good — frontend integration: Playwright + MSW (no RTL)
test('shows empty state', async ({ page, network }) => {
  await network.use(handlers.emptyUsers);
  await page.goto('/users');
  await expect(page.getByText('No users yet')).toBeVisible();
});

// Bad — skip when DB unavailable
test.skip(!process.env.DATABASE_URL, 'needs db');

// Bad — frontend integration with RTL/jsdom
import { render, screen } from '@testing-library/react';
```

## Red Flags — STOP

- `test.skip` or conditional skip when Postgres is missing
- Global DB reset or truncate between parallel tests
- React Testing Library or jsdom for frontend integration
- E2E asserting global row counts or testing every edge case
- Test routes enabled in production or shipped in prod `dist/`
- `test:e2e` added to `verify` or turbo `test`

## Common Mistakes

| Mistake                                  | Correction                                                 |
| ---------------------------------------- | ---------------------------------------------------------- |
| Skip integration when DB is down         | Fix `DATABASE_URL` / run `pnpm db:setup`; fail hard        |
| Shared reset between parallel workers    | Namespace per test; scoped seed/cleanup only               |
| RTL smoke test for a widget              | Playwright + MSW integration spec or vitest for pure logic |
| Edge-case matrix in E2E                  | Move to unit/integration; keep E2E to happy paths          |
| Test routes in prod `server.ts`          | Separate `test-server.ts`; env-driven build exclusion      |
| Assert "list has exactly N users" in E2E | Assert only this test's namespaced rows are visible        |

Full rule ↔ enforcement crosswalk: `rules-catalogue.md` in jig-harness.
