# Decisions — Setup Project

## 2026-07-04 — Use `pnpm create` instead of degit

**Decision:** Ship `@jig-harness/create-app` as a `pnpm create` CLI that copies the
template, rewrites dependency specifiers, runs install, and initializes git.

**Alternatives considered:**

- **degit** — rejected: no dependency rewrite, no install, no git init; manual copy
  of `templates/fullstack` drifts from the published resolution path.

**Rationale:** A first-class scaffolder keeps the dogfood template and end-user
scaffold identical while performing the `workspace:*` / `catalog:` → published-version
transform that CI validates via scaffold-then-verify.

## 2026-07-04 — Postgres via compose; no SQLite fallback

**Decision:** Local development and `pnpm verify` use Postgres started by
`compose.yaml` through `pnpm db:setup`. No in-process SQLite fallback is planned.

**Alternatives considered:**

- **SQLite for local dev** — rejected: backend spine uses Prisma against Postgres;
  a second dialect adds drift and skips real integration behavior.
- **Document-only Postgres setup without compose** — rejected: `db:setup` must be
  a single reliable command, not a manual checklist.

**Rationale:** Backend integration tests run against real Postgres with no DB-less
skips; compose gives a reproducible local database for scaffolded apps and CI.
