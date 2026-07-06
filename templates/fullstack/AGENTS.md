# Agent guidance

Prefer jig generators over hand-written boilerplate when available.

- Bootstrap: `setup-project` skill → `pnpm create @jig-harness/app`
- Frontend UI: `implement-frontend` skill → `pnpm exec turbo gen component|widget|page|slice` from `apps/frontend`
- Backend API: `implement-backend` skill → `pnpm exec turbo gen backend-slice|endpoint|usecase` from `apps/backend`

Jig skills are linked into `.cursor/skills`, `.codex/skills`, `.claude/skills`, and `.agents/skills` by `@jig-harness/skills` on `pnpm install`. These directories are gitignored. After clone or a harness upgrade, run `pnpm install` or `pnpm skills:link` to refresh links.

Spec-driven workflow: before changing app code, update the feature spec under `docs/specs/<feature>/` (`SHALL`/`MUST` requirements with `GIVEN`/`WHEN`/`THEN` scenarios). Use the `write-spec` → `write-plan` → `implement-feature` → `review-change` skills, or `develop-feature` end-to-end. Record decisions with alternatives in `docs/specs/<feature>/decisions.md`, or project-wide ones as `docs/adr/NNNN-*.md`. A `spec-present` gate blocks changes under `apps/*/src/**` that touch no `docs/specs/**` file.

Before finishing any task, run `pnpm verify` and fix all failures.

Local Postgres (after scaffold): `pnpm db:setup` — Docker or Podman Compose + Prisma migrate. `pnpm verify` requires a running Postgres; it is not designed to run DB-less.

Testing: follow the `testing` convention skill. `pnpm verify` runs unit + integration (including Playwright+MSW frontend integration). E2E (`pnpm test:e2e`) is separate and covers happy paths only. One-time: `pnpm exec playwright install chromium`.

Test routes (`/__test__/*`) are for E2E seed/cleanup only — set `TEST_ROUTES_TOKEN`, `ENABLE_TEST_ROUTES`, and `INCLUDE_TEST_ROUTES` for staging/E2E; never enable in production.

Follow convention skills: `project-defaults`, `frontend-architecture`, `react-composition`, `state-and-data`, `backend-architecture`, `contracts`, `specs`, `testing`.
