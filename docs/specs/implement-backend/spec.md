# Implement Backend

## Purpose

Add or refactor Fastify backend product slices in a jig-scaffolded app using turbo
generators, pragmatic clean-architecture layer flow, shared Zod contracts in
`packages/types`, and custom layer boundary enforcement — with generator output and
wired slices passing `pnpm verify` against real Postgres.

## Slices touched

- `packages/generators/` — `backend-slice`, `endpoint`, `usecase` turbo gen
- `skills/workflow/implement-backend/`
- `skills/convention/backend-architecture/`, `skills/convention/contracts/`
- `packages/eslint-plugin/` — `no-command-query-cross-calls`, `domain-no-io`
- `packages/eslint-config/` — backend `boundaries` layer flow
- `packages/types/src/slices/` — vertical shared Zod contracts
- `templates/fullstack/apps/backend/` — reference `health` and `users` slices,
  `register-slices.ts`, Prisma, compose + `pnpm db:setup`

## Requirements

### R1 — Backend slice layer folders SHALL be created via turbo generators

Agents MUST use `pnpm exec turbo gen backend-slice`, `endpoint`, or `usecase` from
`apps/backend` instead of hand-writing layer directories. Generator output MUST pass
the full enforcement suite.

#### Scenario: backend-slice generator scaffolds allowed layers

- **GIVEN** a scaffolded fullstack app with backend generators wired
- **WHEN** a developer runs `pnpm exec turbo gen backend-slice`
- **THEN** folders for allowed segments (`domain/`, `usecases/`, `commands/`,
  `queries/`, `endpoints/`, `plugins/`, `schemas/`) appear under
  `src/slices/<product-area>/`
- **THEN** `pnpm verify` passes without manual structural fixes

#### Scenario: endpoint generator produces a route plugin stub

- **GIVEN** an existing product slice
- **WHEN** a developer runs `pnpm exec turbo gen endpoint`
- **THEN** a kebab-case endpoint file is created under `src/slices/<product-area>/endpoints/`
  with a named-export Fastify plugin stub
- **THEN** the file uses named exports only and has no barrel re-exports

#### Scenario: usecase generator produces a composer stub

- **GIVEN** an existing product slice
- **WHEN** a developer runs `pnpm exec turbo gen usecase`
- **THEN** a kebab-case usecase file is created under `src/slices/<product-area>/usecases/`
- **THEN** the stub follows one-business-operation-per-file layout

### R2 — Backend layers SHALL follow endpoint → usecase → command/query → domain flow

Endpoints MUST call usecases. Usecases MUST compose domain rules plus commands and
queries. Commands and queries MUST encapsulate Prisma reads and writes. Domain MUST
not perform I/O.

#### Scenario: command must not import query

- **GIVEN** a command file imports a query module from the same slice
- **WHEN** ESLint runs with the template backend config
- **THEN** `@jig-harness/no-command-query-cross-calls` reports an error

#### Scenario: domain must not import Prisma Client or Fastify

- **GIVEN** a domain file contains a value import from `@prisma/client`, `fastify`, or
  reads `process.env`
- **WHEN** ESLint runs
- **THEN** `@jig-harness/domain-no-io` reports an error

#### Scenario: layer boundaries enforce call direction

- **GIVEN** an endpoint file imports directly from a command or query layer bypassing
  the usecase
- **WHEN** ESLint runs with `backendConfig` boundaries
- **THEN** `eslint-plugin-boundaries` reports a layer-flow violation at error severity

#### Scenario: usecase composes command and query for a write flow

- **GIVEN** a create-user feature in the `users` slice
- **WHEN** the HTTP POST handler is implemented correctly
- **THEN** the endpoint delegates to `create-user-usecase`, which calls domain rules
  and a command for persistence — not Prisma directly from the endpoint

### R3 — API boundary changes SHALL extend shared contracts in `packages/types`

When an endpoint's request or response shape changes, the owning team MUST add or
update Zod schemas under `packages/types/src/slices/<product-area>/`. Frontend and
backend MUST consume shared types from `@app/types`, not cross-import implementation
code.

#### Scenario: new endpoint field requires contract update

- **GIVEN** POST `/users` gains a new required request field
- **WHEN** the backend endpoint is updated
- **THEN** the corresponding Zod schema in `packages/types/src/slices/users/` is
  updated in the same change
- **THEN** contract tests under `packages/types` pass in `pnpm verify`

#### Scenario: frontend imports types not backend source

- **GIVEN** the frontend needs the user list response shape
- **WHEN** imports are inspected
- **THEN** the frontend imports from `@app/types` (or generated client paths derived
  from contracts)
- **THEN** no import path reaches `apps/backend/src/slices/`

### R4 — New slices SHALL register on the Fastify app

After generating or extending a product slice, the slice plugin MUST be registered
in `src/common/register-slices.ts` so routes are mounted on the running server.

#### Scenario: generated slice is reachable after registration

- **GIVEN** a new slice plugin exists under `src/slices/billing/plugins/`
- **WHEN** the plugin is registered in `register-slices.ts` and the server starts
- **THEN** routes defined by the slice endpoints respond to HTTP requests in
  integration tests

#### Scenario: unregistered slice routes are not mounted

- **GIVEN** endpoint files exist but the slice plugin is omitted from
  `register-slices.ts`
- **WHEN** integration tests call the new paths
- **THEN** the server responds `404 Not Found` for those paths

### R5 — Backend work SHALL finish with a green `pnpm verify` on real Postgres

Backend changes MUST pass `pnpm verify` with a migrated Postgres database. Integration
tests MUST NOT skip when `DATABASE_URL` is missing or the database is unreachable.

#### Scenario: verify runs backend integration against Postgres

- **GIVEN** `pnpm db:setup` has been run and `DATABASE_URL` points at the compose Postgres
- **WHEN** a developer runs `pnpm verify` after backend slice changes
- **THEN** vitest backend integration tests using `app.inject` pass without conditional
  skips

#### Scenario: missing database fails hard

- **GIVEN** `DATABASE_URL` is unset or Postgres is not running
- **WHEN** backend integration tests run
- **THEN** tests fail with a connection or setup error — no silent `test.skip`
