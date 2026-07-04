# Agent guidance

Prefer jig generators over hand-written boilerplate when available.

- Bootstrap: `setup-project` skill → `pnpm create @jig-harness/app`
- Frontend UI: `implement-frontend` skill → `pnpm exec turbo gen component|widget` from `apps/frontend`
- Backend API: `implement-backend` skill → `pnpm exec turbo gen backend-slice|endpoint|usecase` from `apps/backend`

Before finishing any task, run `pnpm verify` and fix all failures.

Local Postgres (after scaffold): `pnpm db:setup` — Docker or Podman Compose + Prisma migrate.

Follow convention skills: `project-defaults`, `frontend-architecture`, `react-composition`, `backend-architecture`, `contracts`.
