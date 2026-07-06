# jig-harness

Agent-agnostic harness for building TypeScript fullstack web apps on narrow, tested rails.

**jig** closes the gap between convention skills and real projects by pairing three layers for every rule:

| Layer           | What it does                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------------- |
| **Guidance**    | Installable agent skills with sharp, rule-ID'd conventions                                     |
| **Capability**  | Scaffolding and `turbo gen` generators that emit correct boilerplate                           |
| **Enforcement** | ESLint, Stylelint, Prettier, and TypeScript configs that turn rules into machine-checked gates |

A rule the agent violates is caught automatically. Generator output is lint-clean. A scaffolded project starts green under `pnpm verify`.

See [docs/README.md](docs/README.md) for architecture and [rules-catalogue.md](rules-catalogue.md) for the rule crosswalk across all three layers.

## Stack

Opinionated and fixed for v1:

- **Monorepo** — pnpm, Turborepo
- **Frontend** — React, Vite, TanStack Router, TanStack Query, BEM CSS
- **Backend** — Fastify, Zod, Prisma, PostgreSQL
- **Contracts** — shared Zod schemas in `packages/types`

## Quick start — scaffold a new app

```bash
pnpm create @jig-harness/app my-app
cd my-app
pnpm db:setup    # starts Postgres (Docker/Podman) and runs Prisma migrations
pnpm verify      # lint + typecheck + test + integration + build
pnpm dev
```

`pnpm verify` requires a running Postgres (`DATABASE_URL` + migrated schema). Use `compose.yaml` via `pnpm db:setup` — the harness is not designed to run DB-less. E2E (`pnpm test:e2e`) is separate from verify and runs in PR CI only.

The scaffolder copies the [fullstack template](templates/fullstack) and pins published `@jig-harness/*` packages. For local development of the harness itself, use the offline path (same flow as `pnpm scaffold:verify`):

```bash
# from jig-harness repo root, after pnpm install
mkdir -p /tmp/jig-tarballs
for pkg in @jig-harness/tsconfig @jig-harness/prettier-config @jig-harness/eslint-plugin \
  @jig-harness/eslint-config @jig-harness/stylelint-config @jig-harness/generators; do
  pnpm --filter "$pkg" pack --pack-destination /tmp/jig-tarballs
done
node packages/create-app/bin/create-app.js my-app --tarballs-dir /tmp/jig-tarballs
```

## Agent skills

Skills live under `[skills/](skills/)` and install via [skills.sh](https://skills.sh):

```bash
pnpm dlx skills add yakovlev-alexey/jig-harness --skill setup-project
pnpm dlx skills add yakovlev-alexey/jig-harness --skill implement-frontend
pnpm dlx skills add yakovlev-alexey/jig-harness --skill implement-backend
```

**Workflow skills** (use-case entry points):

| Skill                | Purpose                                                 |
| -------------------- | ------------------------------------------------------- |
| `setup-project`      | Bootstrap a new app from the template                   |
| `implement-frontend` | Add frontend slices, components, widgets via generators |
| `implement-backend`  | Add backend slices, endpoints, usecases via generators  |

**Convention skills** (rulebooks referenced by workflow skills):

`project-defaults`, `frontend-architecture`, `react-composition`, `state-and-data`, `backend-architecture`, `contracts`, `testing`

## Testing

The template ships a **Testing Trophy** stack documented in the `testing` convention skill:

| Layer                | Tooling                                                              |
| -------------------- | -------------------------------------------------------------------- |
| Static               | ESLint, Stylelint, TypeScript, Zod contract tests (`packages/types`) |
| Unit                 | Vitest (pure logic; no jsdom/RTL)                                    |
| Backend integration  | Vitest + `app.inject` against real Postgres                          |
| Frontend integration | Playwright + `@msw/playwright` (in `verify`)                         |
| E2E                  | Playwright in `apps/e2e` (PR CI only; not in `verify`)               |

Parallel workers isolate data by **namespace** (namespaced emails, scoped cleanup) — no global DB reset. Test routes (`/__test__/*`) are build- and runtime-gated plus token-protected; never enable in production.

One-time setup after scaffold: `pnpm exec playwright install chromium`.

In a scaffolded app, run from the frontend or backend package:

```bash
turbo gen component   # presentational component in a product slice
turbo gen widget      # widget with colocated UI
turbo gen page        # TanStack route file in src/routes/
turbo gen slice       # frontend slice segment folders
turbo gen backend-slice
turbo gen endpoint
turbo gen usecase
```

Generator output is snapshot-tested and must pass the full lint suite (L-gen).

## Published packages

The harness publishes tooling packages to npm. All `@jig-harness/*` packages share one version via Changesets fixed/linked mode in this repo (not in scaffolded apps):

| Package                         | Purpose                                            |
| ------------------------------- | -------------------------------------------------- |
| `@jig-harness/create-app`       | `pnpm create @jig-harness/app` scaffolder          |
| `@jig-harness/generators`       | Plop generators registered for `turbo gen`         |
| `@jig-harness/eslint-plugin`    | Custom ESLint rules with RED/GREEN fixtures        |
| `@jig-harness/eslint-config`    | Flat ESLint preset (off-the-shelf + custom plugin) |
| `@jig-harness/stylelint-config` | BEM and CSS conventions                            |
| `@jig-harness/prettier-config`  | Shared formatting                                  |
| `@jig-harness/tsconfig`         | Base, React, and Node TS configs                   |

## Development

Requires Node ≥ 20 and pnpm 10.

```bash
git clone https://github.com/yakovlev-alexey/jig-harness.git
cd jig-harness
pnpm install
pnpm verify
```

Git hooks (via [lefthook](https://github.com/evilmartians/lefthook)) install on `pnpm install`. **pre-push** runs `pnpm verify` so broken commits cannot be pushed; **pre-commit** auto-formats staged files with Prettier.

### Running the fullstack template

The template under `templates/fullstack/` is wired into this monorepo. Install from the **repo root** — `pnpm install` inside `templates/fullstack/` fails because that folder's workspace does not include `@jig-harness/*` packages.

```bash
pnpm --dir templates/fullstack db:setup   # Postgres (Docker/Podman) + Prisma migrate
pnpm --filter @app/frontend exec playwright install chromium   # once, for integration tests
pnpm template:dogfood                     # lint + typecheck + test + integration + build

# Interactive dev — backend :3001, frontend SSR :5174
pnpm exec turbo run dev --filter=@app/backend --filter=@app/frontend
```

Postgres is required for backend dev and for `template:dogfood`. E2E (`pnpm --dir templates/fullstack test:e2e`) is separate from verify; see `templates/fullstack/AGENTS.md` for test-route env vars.

### Scripts

| Script                  | Description                                                                  |
| ----------------------- | ---------------------------------------------------------------------------- |
| `pnpm verify`           | format:check → coherence → validate-skills → lint → typecheck → test → build |
| `pnpm coherence`        | Rule catalogue ↔ custom ESLint rule consistency                              |
| `pnpm validate-skills`  | L0 structural validation of skill files                                      |
| `pnpm template:dogfood` | Run full verify on `templates/fullstack`                                     |
| `pnpm scaffold:verify`  | Scaffold a fresh app in CI and verify it                                     |
| `pnpm release`          | Build and publish `@jig-harness/*` via Changesets                            |

### Repository layout

```
jig-harness/
├── skills/
│   ├── workflow/          # setup-project, implement-frontend, implement-backend, …
│   └── convention/        # project-defaults, frontend-architecture, …
├── packages/              # published @jig-harness/* tooling
├── templates/fullstack/   # dogfood template (apps/frontend, apps/backend, apps/e2e, packages/types)
├── docs/                  # specs, ADRs, STATUS hub
├── rules-catalogue.md     # rule ↔ layer crosswalk
└── scripts/               # validation, coherence, dogfood
```

## License

MIT
