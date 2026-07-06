# Testing

## Purpose

Define the Testing Trophy stack for jig fullstack apps: static checks, dense unit
tests, real Postgres backend integration, Playwright+MSW frontend integration in
`pnpm verify`, PR-only E2E happy paths, parallel-safe data namespacing, and
build/runtime/token-gated test routes.

## Slices touched

- `skills/convention/testing/`
- `templates/fullstack/apps/backend/` — vitest unit/integration, `test-server.ts`,
  `test-support/`, inject tests
- `templates/fullstack/apps/frontend/` — vitest units, Playwright integration specs,
  MSW handlers
- `templates/fullstack/apps/e2e/` — happy-path Playwright specs, namespace helpers
- `templates/fullstack/packages/types/` — Zod contract unit tests
- `.github/workflows/` — verify dogfood vs PR-only E2E job

## Requirements

### R1 — Tests SHALL follow Testing Trophy layer order and tooling

The template MUST implement static → unit → integration → E2E layers with the
prescribed tools. Edge cases belong in unit/integration; E2E covers main happy paths
only.

#### Scenario: static layer runs first in verify

- **GIVEN** a fullstack template checkout
- **WHEN** `pnpm verify` runs
- **THEN** ESLint, Stylelint, Prettier checks, and `tsc --noEmit` execute before
  runtime test tasks

#### Scenario: unit tests use vitest node env without jsdom

- **GIVEN** a pure domain or Zod contract test under `apps/backend`, `apps/frontend/src`,
  or `packages/types`
- **WHEN** the test runs via `pnpm test`
- **THEN** vitest uses the node environment
- **THEN** React Testing Library and jsdom are not used for frontend unit tests

#### Scenario: backend integration uses inject against real DB

- **GIVEN** a backend slice integration test under `apps/backend/src/slices/*/tests/`
- **WHEN** the test exercises an HTTP flow
- **THEN** it uses Fastify `app.inject` against a running app instance
- **THEN** Prisma reads/writes hit real Postgres — no mocked database client

#### Scenario: frontend integration uses Playwright and MSW

- **GIVEN** a frontend integration spec under `apps/frontend/tests/*.spec.ts`
- **WHEN** the spec runs via `pnpm test:integration`
- **THEN** Playwright drives the browser and `@msw/playwright` stubs network via
  contract-shaped handlers — not RTL or jsdom

#### Scenario: E2E covers happy paths only

- **GIVEN** an E2E spec under `apps/e2e/tests/`
- **WHEN** the scenario is reviewed against the testing skill
- **THEN** it asserts a primary user journey (e.g. create user, list seeded users)
- **THEN** exhaustive edge-case matrices remain in unit or integration layers

### R2 — `pnpm verify` SHALL include integration tests but exclude E2E

Every commit and template dogfood CI MUST run `pnpm verify` (lint, typecheck, units,
frontend and backend integration, build, spec-present). Playwright E2E in `apps/e2e`
MUST run in a PR-only CI job — not inside `verify` or the default turbo `test` pipeline.

#### Scenario: verify includes backend and frontend integration

- **GIVEN** Postgres is available and Playwright chromium is installed
- **WHEN** a developer runs `pnpm verify`
- **THEN** `test:integration` for frontend and backend runs and must pass
- **THEN** the command exits `0` only when all included layers pass

#### Scenario: verify does not run apps/e2e specs

- **GIVEN** the turbo pipeline and root `package.json` scripts for verify
- **WHEN** `pnpm verify` completes successfully
- **THEN** no Playwright project under `apps/e2e/tests/` was executed as part of verify

#### Scenario: E2E runs in PR CI only

- **GIVEN** a pull request triggers CI
- **WHEN** the E2E workflow job runs
- **THEN** it executes `pnpm test:e2e` (or equivalent) against the template or dogfood app
- **THEN** pushes to branches without that job still pass verify without E2E

### R3 — Integration and E2E tests SHALL require real Postgres without skips

Backend integration and E2E tests MUST connect to a migrated Postgres database.
Missing or broken `DATABASE_URL` MUST fail tests — never `test.skip` or conditional
bypass.

#### Scenario: verify fails when database is down

- **GIVEN** Postgres is not running and `DATABASE_URL` is invalid
- **WHEN** `pnpm verify` reaches backend integration tests
- **THEN** tests fail with a connection or migration error
- **THEN** no test is silently skipped due to missing database

#### Scenario: dogfood CI provisions Postgres before verify

- **GIVEN** the template dogfood workflow on push
- **WHEN** integration tests run in CI
- **THEN** a Postgres service or compose step provides `DATABASE_URL`
- **THEN** migrations are applied before inject or E2E tests execute

### R4 — Parallel tests SHALL isolate data by namespace without global reset

Every integration and E2E test MUST own a unique namespace, seed and assert only
namespaced rows, and tear down with scoped cleanup. Global truncate or full-database
reset between parallel workers is forbidden.

#### Scenario: namespace format is unique per test

- **GIVEN** parallel Playwright workers or vitest files
- **WHEN** a test seeds data
- **THEN** it uses a namespace of the form `e2e-${runId}-${workerIndex}-${uuid}`
  (or equivalent vitest prefix with pid/uuid)
- **THEN** seeded emails follow `${ns}+${label}@e2e.test`

#### Scenario: assertions are scoped to namespaced rows

- **GIVEN** a test seeded users for namespace `ns-a`
- **WHEN** the test asserts list contents or counts
- **THEN** assertions reference only rows created with `ns-a` prefixes
- **THEN** the test does not assert global table counts across all namespaces

#### Scenario: teardown deletes by namespace prefix only

- **GIVEN** a test completed seeding namespaced rows
- **WHEN** teardown runs
- **THEN** it calls scoped cleanup (e.g. `POST /__test__/cleanup { namespace }` or
  delete-by-email-prefix in vitest)
- **THEN** rows from other parallel tests remain untouched

### R5 — Test routes SHALL be build-excluded, runtime-gated, and token-protected

`POST /__test__/seed` and `POST /__test__/cleanup` MUST be excluded from production
builds, registered only when explicitly enabled, require `x-test-token` matching
`TEST_ROUTES_TOKEN`, and MUST refuse registration when `NODE_ENV=production`.

#### Scenario: prod build excludes test server artifacts

- **GIVEN** `pnpm build` runs without `INCLUDE_TEST_ROUTES=true`
- **WHEN** the backend production bundle is inspected
- **THEN** `test-server.ts`, `test-support/**`, and test route handlers are not emitted
  to prod output

#### Scenario: test routes require enable flag and token

- **GIVEN** the backend runs with `ENABLE_TEST_ROUTES` set and `TEST_ROUTES_TOKEN` configured
- **WHEN** a client POSTs `/__test__/seed` without `x-test-token`
- **THEN** the server responds `403 Forbidden`
- **WHEN** the client sends `x-test-token` matching `TEST_ROUTES_TOKEN`
- **THEN** the seed request succeeds for the supplied namespace scope

#### Scenario: production runtime refuses test routes

- **GIVEN** `NODE_ENV=production`
- **WHEN** the server starts even if `ENABLE_TEST_ROUTES` is set
- **THEN** `/__test__/*` routes are not registered
- **THEN** requests to those paths receive `404 Not Found` or equivalent refusal

#### Scenario: seed and cleanup are namespace-scoped

- **GIVEN** a valid token and enable flags
- **WHEN** `POST /__test__/cleanup` is called with `{ namespace: "ns-a" }`
- **THEN** only rows belonging to `ns-a` are removed
- **THEN** no global wipe of unrelated namespaces occurs

### R6 — ESLint SHALL relax boundary rules in test files while keeping export rules

Test files (`*.test.*`, `*.spec.*`, `tests/`, `e2e/`, fixtures) MUST relax
`boundaries/element-types` and custom backend layer rules. Filename-case and
named-export rules MUST remain enforced.

#### Scenario: test file may import across layers for setup

- **GIVEN** a vitest file under `apps/backend/src/slices/users/tests/`
- **WHEN** ESLint runs on that file
- **THEN** backend boundary element-type rules are not applied at error severity

#### Scenario: test file still enforces kebab-case and exports

- **GIVEN** a test file uses a default export or a non-kebab-case filename outside
  exempt patterns
- **WHEN** ESLint runs
- **THEN** filename-case or `import-x/no-default-export` violations are still reported
