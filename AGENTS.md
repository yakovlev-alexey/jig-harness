# Agent guidance

This is the `jig-harness` monorepo (pnpm + Turborepo). See `README.md` for the full
overview and script reference, and `templates/fullstack/AGENTS.md` for template-specific
(app) guidance. Standard commands live in the root `package.json` and `README.md`.

## Cursor Cloud specific instructions

Running in a Cursor Cloud VM has non-obvious, environment-specific caveats (Node version
gotcha for tests, and native PostgreSQL because Docker/Podman is unavailable). These are
documented in [`docs/cursor-cloud-setup.md`](docs/cursor-cloud-setup.md) — read it before
running tests or starting services.
