# Decisions — Testing

## 2026-07-06 — Real Postgres required for verify (no DB-less skips)

**Decision:** Backend integration tests and template `pnpm verify` require a real,
migrated Postgres database (`DATABASE_URL` via compose + `pnpm db:setup`). Tests MUST
fail hard when the database is missing or unreachable — no conditional `test.skip` or
in-memory SQLite fallback.

**Alternatives considered:**

- **SQLite or in-process DB for local verify** — rejected: Prisma schema and migrations
  target Postgres; a second dialect hides integration bugs.
- **Skip integration when `DATABASE_URL` unset** — rejected: silent skips let broken
  environments ship; CI and local verify must surface DB failures immediately.

**Rationale:** Backend spine dogfood and integration tests prove real HTTP + Prisma
behavior. Postgres via compose is the single supported path documented in
`setup-project`; verify stays an honest integration gate.

## 2026-07-06 — E2E PR-only (excluded from `pnpm verify`)

**Decision:** Playwright happy-path specs in `apps/e2e` run via `pnpm test:e2e` in a
PR-only CI job. They are NOT part of `pnpm verify` or the default turbo `test` pipeline.

**Alternatives considered:**

- **E2E in every verify run** — rejected: slower feedback loop, heavier local setup,
  and redundant coverage when integration layers already exercise HTTP and UI with MSW.
- **No E2E in CI** — rejected: a thin prod-like path (UI + API + DB) still needs
  periodic proof against the collapsed backend server topology.

**Rationale:** Testing Trophy keeps E2E thin for main happy paths. Verify stays fast
enough for every commit while PR CI catches full-stack regressions before merge.

## 2026-07-06 — Test-route gating (build exclude + runtime flag + token)

**Decision:** Test support routes (`POST /__test__/seed`, `POST /__test__/cleanup`)
live in `test-server.ts` / `test-support/`, are excluded from prod builds unless
`INCLUDE_TEST_ROUTES=true`, register at runtime only when `ENABLE_TEST_ROUTES` is set,
require header `x-test-token` == `TEST_ROUTES_TOKEN`, and refuse registration under
`NODE_ENV=production`. Cleanup is namespace-scoped only.

**Alternatives considered:**

- **Public seed routes in dev without token** — rejected: unsafe on shared networks
  and staging-like environments.
- **Global DB reset endpoint** — rejected: breaks parallel workers and shared staging
  databases; conflicts with namespaced isolation.
- **Ship test routes in production behind env only** — rejected: prod build exclusion
  prevents accidental deployment surface.

**Rationale:** Parallel E2E and backend integration need fast, scoped fixture setup
without polluting prod artifacts or wiping unrelated test data. Triple gating (build,
runtime env, token) keeps test hooks deliberate and auditable.
