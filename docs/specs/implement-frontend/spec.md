# Implement Frontend

## Purpose

Add or refactor React frontend UI in a jig-scaffolded app using turbo generators,
vertical product slices, TanStack Router file-based route targets under `src/routes/`,
enforced import boundaries, and state-and-data container/presenter rules — with
generator output and hand-wired UI passing `pnpm verify`.

## Slices touched

- `packages/generators/` — `component`, `widget`, `page`, `slice` turbo gen
- `skills/workflow/implement-frontend/`
- `skills/convention/frontend-architecture/`, `skills/convention/react-composition/`,
  `skills/convention/state-and-data/`
- `packages/eslint-config/` — frontend boundaries, composition, presentational import
  restrictions
- `templates/fullstack/apps/frontend/` — reference slices, `src/routes/`, route tree

## Requirements

### R1 — Frontend UI folders SHALL be created via turbo generators

Agents MUST use `pnpm exec turbo gen component`, `widget`, `page`, or `slice` from
`apps/frontend` instead of hand-writing slice folders. Generator output MUST pass
the full enforcement suite (lint, typecheck, format).

#### Scenario: component generator produces lint-clean output

- **GIVEN** a scaffolded fullstack app with generators wired via `turbo/generators/config.ts`
- **WHEN** a developer runs `pnpm exec turbo gen component` and completes the prompts
- **THEN** a new folder appears under `src/slices/<product-area>/components/<name>/`
  with named-export TSX and colocated CSS
- **THEN** `pnpm verify` passes without manual fixes to the generated files

#### Scenario: widget generator produces container and presenter files

- **GIVEN** a scaffolded fullstack app
- **WHEN** a developer runs `pnpm exec turbo gen widget`
- **THEN** the slice receives `<name>.widget.tsx` (container) and `<name>.tsx`
  (presenter) under `src/slices/<product-area>/widgets/<name>/`
- **THEN** generated files use named exports only and have no `index.ts` barrel

#### Scenario: page generator emits a TanStack route file

- **GIVEN** a scaffolded fullstack app with TanStack Router configured
- **WHEN** a developer runs `pnpm exec turbo gen page`
- **THEN** a route target file and colocated CSS are created under `src/routes/`
- **THEN** `pnpm generate` (or equivalent) updates `routeTree.gen.ts` and verify passes

#### Scenario: slice generator scaffolds product slice segments without pages

- **GIVEN** a scaffolded fullstack app
- **WHEN** a developer runs `pnpm exec turbo gen slice`
- **THEN** allowed segment folders (`components/`, `widgets/`, `store/`, `utils/`,
  `constants/`) are created under `src/slices/<product-area>/`
- **THEN** no `pages/` segment or route target is created inside the slice

### R2 — Route targets SHALL live in `src/routes/` as TanStack file-based routes

Pages MUST NOT live inside product slices. Route files under `src/routes/` compose
widgets and components from slices and `src/common/`; they MUST NOT import other
route targets.

#### Scenario: route file composes slice widgets

- **GIVEN** a product slice with a widget entry at
  `src/slices/users/widgets/user-list/user-list.widget.tsx`
- **WHEN** the `/users` route is implemented in `src/routes/users.tsx`
- **THEN** the route component imports and renders the widget entry from the slice
- **THEN** no page file exists under `src/slices/users/pages/` or similar

#### Scenario: page-to-page import is rejected

- **GIVEN** `src/routes/users.tsx` contains an import from `./settings.tsx` or another
  route target
- **WHEN** ESLint runs with the template frontend config
- **THEN** `eslint-plugin-boundaries` reports a violation for the page element type

#### Scenario: generated route tree is excluded from manual lint rules

- **GIVEN** `routeTree.gen.ts` is produced by `@tanstack/router-plugin`
- **WHEN** ESLint and Prettier run
- **THEN** the generated route tree file is ignored by filename-case and export rules
  configured for generated output

### R3 — Frontend import boundaries SHALL enforce slice and composition rules

Cross-slice imports, page↛page, widget↛widget, and frontend↛backend implementation
imports MUST be blocked or warned per harness configuration. Named exports, no
barrels, and kebab-case filenames MUST hold for hand-written and generated code.

#### Scenario: widget entry must not import sibling widget entry

- **GIVEN** `user-list.widget.tsx` imports another widget entry file under
  `src/slices/users/widgets/`
- **WHEN** ESLint runs
- **THEN** boundaries or composition rules report a violation

#### Scenario: barrel file is rejected

- **GIVEN** a new `index.ts` re-exporting slice symbols
- **WHEN** ESLint runs
- **THEN** filename blocklist and/or `@jig-harness/no-reexport-only` report a violation

#### Scenario: frontend must not import backend implementation

- **GIVEN** a frontend file imports from `apps/backend/src/` or a relative path into
  backend slice layers
- **WHEN** ESLint runs
- **THEN** `import-x/no-restricted-paths` reports a violation (`ct-no-frontend-backend-impl-imports`)

### R4 — State and data hooks SHALL live in containers only

Presentational components and widget-ui files MUST NOT import TanStack Query,
Nano Stores, or slice store modules. Store and data wiring MUST stay in route
targets, `*.widget.tsx` container entries, or colocated `use-*.ts` hooks consumed
by containers.

#### Scenario: presenter component rejects store imports

- **GIVEN** `src/slices/users/components/user-card/user-card.tsx` imports
  `useQuery` or a file under `store/queries/`
- **WHEN** ESLint runs with presentational scoping
- **THEN** `no-restricted-imports` reports a violation (`sd-no-store-in-presentational`)

#### Scenario: widget container owns data hooks

- **GIVEN** a users list feature needs server state
- **WHEN** the feature is wired correctly
- **THEN** `user-list.widget.tsx` calls `useQuery(usersQuery())` and passes plain props
  to `user-list.tsx`
- **THEN** `user-list.tsx` has no imports from `@tanstack/react-query`, `@nanostores/react`,
  or `store/`

#### Scenario: route loader prefetches SSR data

- **GIVEN** a route needs server data for SSR
- **WHEN** `src/routes/users.tsx` defines a TanStack Router `loader`
- **THEN** the loader calls `context.queryClient.ensureQueryData(...)` using query
  options exported from the slice `store/queries/` folder
- **THEN** the widget entry still uses `useQuery` to read the warmed cache without a
  loading flash

### R5 — Frontend work SHALL finish with a green `pnpm verify`

Any change that adds or refactors frontend UI MUST pass `pnpm verify` from the
monorepo or app root before the task is complete.

#### Scenario: verify runs after generator and wiring

- **GIVEN** a developer added a page via `turbo gen page` and wired it into navigation
- **WHEN** they run `pnpm verify` with Postgres available and Playwright browsers installed
- **THEN** lint, typecheck, unit tests, frontend integration tests, backend integration
  tests, build, and the spec-present gate all pass
