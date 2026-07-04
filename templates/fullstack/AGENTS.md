# Agent guidance

Prefer jig generators over hand-written boilerplate when available.

- Bootstrap: `setup-project` skill → `pnpm create @jig-harness/app`
- Frontend UI: `implement-frontend` skill → `pnpm exec turbo gen component|widget` from `apps/web`

Before finishing any task, run `pnpm verify` and fix all failures.

Follow convention skills: `project-defaults`, `frontend-architecture`, `react-composition`.
