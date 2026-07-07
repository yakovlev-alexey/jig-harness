# Setup Project

## Purpose

Bootstrap a new fullstack TypeScript monorepo from the jig harness template with
published dependency resolution, local Postgres, and a green `pnpm verify` suite.

## Slices touched

- `packages/create-app`
- `templates/fullstack`
- `skills/workflow/setup-project`
- `skills/convention/project-defaults`
- `packages/eslint-config`, `packages/prettier-config`, `packages/stylelint-config`, `packages/tsconfig`

## Requirements

### R1 — The scaffolder SHALL copy the fullstack template

`pnpm create @jig-harness/app` MUST copy `templates/fullstack` into the target
project directory, including apps, packages, config, and harness wiring.

#### Scenario: scaffold produces the expected monorepo layout

- **GIVEN** an empty parent directory and a valid project name
- **WHEN** a user runs `pnpm create @jig-harness/app my-app`
- **THEN** `my-app/` contains `apps/frontend`, `apps/backend`, `packages/types`, turborepo config, and lefthook wiring copied from the template

### R2 — The scaffolder SHALL rewrite workspace and catalog specifiers to published versions

The create-app CLI MUST replace `workspace:*` and `catalog:` dependency specifiers
with concrete published versions (or local tarballs when `--tarballs-dir` is used)
before the scaffolded project is installed.

#### Scenario: harness packages resolve to published versions

- **GIVEN** the template depends on `@jig-harness/eslint-config` via `workspace:*`
- **WHEN** create-app scaffolds a project without `--tarballs-dir`
- **THEN** the scaffolded `package.json` files contain semver pins for `@jig-harness/*` packages, not `workspace:*`

#### Scenario: catalog entries resolve to concrete versions

- **GIVEN** the template references a third-party package via `catalog:`
- **WHEN** create-app scaffolds a project
- **THEN** the scaffolded manifest contains a concrete semver for that package, not `catalog:`

### R3 — The scaffolder SHALL install dependencies and initialize git

After copying and rewriting manifests, create-app MUST run `pnpm install` and
`git init` in the scaffolded project unless explicitly skipped via flags.

#### Scenario: default scaffold installs and initializes git

- **GIVEN** a successful create-app run with default flags
- **WHEN** scaffolding completes
- **THEN** `node_modules` is populated via `pnpm install` and a `.git` directory exists

#### Scenario: skip flags bypass install or git init

- **GIVEN** create-app is invoked with `--skip-install` or `--skip-git`
- **WHEN** scaffolding completes
- **THEN** the corresponding step is omitted while the template copy and rewrite still occur

### R4 — A freshly scaffolded app SHALL pass `pnpm verify`

A project produced by create-app MUST pass the full `pnpm verify` suite (lint,
typecheck, unit/integration tests, and the spec-present gate) once Postgres is
available and Playwright browsers are installed.

#### Scenario: scaffold-then-verify in CI

- **GIVEN** a project freshly scaffolded by create-app with dependencies installed
- **WHEN** `pnpm db:setup` has been run and Playwright chromium is installed
- **THEN** `pnpm verify` exits `0`

### R5 — `pnpm db:setup` SHALL start Postgres and apply migrations

The scaffolded template MUST provide `compose.yaml` and a `pnpm db:setup` script
that starts local Postgres (Docker or Podman) and applies Prisma migrations.

#### Scenario: database setup succeeds on a fresh scaffold

- **GIVEN** a scaffolded project with Docker or Podman available and `.env` copied from `.env.example`
- **WHEN** the user runs `pnpm db:setup`
- **THEN** Postgres is running via compose and Prisma migrations are applied without error

#### Scenario: verify requires a working database

- **GIVEN** a scaffolded project where `pnpm db:setup` has not been run
- **WHEN** the user runs `pnpm verify`
- **THEN** backend integration tests fail due to missing database connectivity (no silent skip)
