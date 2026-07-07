# Agent guidance

This is the `jig-harness` monorepo (pnpm + Turborepo). See `README.md` for the full
overview and script reference, and `templates/fullstack/AGENTS.md` for template-specific
(app) guidance. Standard commands live in the root `package.json` and `README.md`.

## Cursor Cloud specific instructions

Environment notes for cloud agents. Dependencies are refreshed automatically on
startup via the update script (`pnpm install` from the repo root); the items below are
non-obvious caveats, not install steps.

### Node version (critical for tests)

`pnpm run test` / `pnpm run verify` require Node ≥ 22.18, because
`@jig-harness/generators` tests `require()` a TypeScript `turbo/generators/config.ts`
and rely on Node's default TypeScript type-stripping. The VM's baseline
`/exec-daemon/node` is v22.14.0 (too old — the generator tests fail with
`SyntaxError: Unexpected token '{'`).

This is handled by a `node` symlink at `/usr/local/cargo/bin/node` (first entry on
`PATH`) pointing at nvm's `v22.22.2`, so `node --version` resolves to `v22.22.2`. If
`node` ever reverts to `v22.14.x` (e.g. the symlink is missing), recreate it:

```bash
ln -sf "$(nvm which 22 2>/dev/null || echo /home/ubuntu/.nvm/versions/node/v22.22.2/bin/node)" /usr/local/cargo/bin/node
```

(`nvm use 22` or a login shell also selects the right version, but the symlink fixes
the default non-login shell that runs commands.)

### PostgreSQL (no Docker in this VM)

`pnpm verify` and backend dev require Postgres and are **not** designed to run DB-less.
The repo's `db:up` / `db:setup` scripts use Docker/Podman Compose, which are **not
available** here. Instead, Postgres 16 is installed natively. Start it (it is not
running on a fresh boot):

```bash
sudo pg_ctlcluster 16 main start
```

Connection (matches `apps/backend/.env.example`): database `jig_dev`, user/password
`postgres`/`postgres` on `localhost:5432`. Export the URL for verify/test/migrate:

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jig_dev?schema=public"
```

The backend also reads `templates/fullstack/apps/backend/.env` (already created from
`.env.example`, gitignored). Apply migrations after starting Postgres if needed:
`pnpm --filter @app/backend db:migrate`.

### Running / verifying

- Full tooling + package checks (from repo root): `pnpm run verify`.
- Fullstack template checks incl. frontend Playwright+MSW integration:
  `pnpm run template:dogfood` (needs Postgres running + `DATABASE_URL`).
- Run the app in dev mode:
  `pnpm exec turbo run dev --filter=@app/backend --filter=@app/frontend`
  → backend API on `http://localhost:3001`, frontend SSR on `http://localhost:5174`.
  The `/users` page (`http://localhost:5174/users`) exercises the full stack
  (create-user form → `POST /api/users` → Prisma → Postgres → list).
- Playwright browsers (chromium) are installed for integration/E2E tests.
