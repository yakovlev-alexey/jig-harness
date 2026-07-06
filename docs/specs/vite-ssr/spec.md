# Vite SSR

## Purpose

Deliver server-rendered HTML for the fullstack template using classic Vite SSR: the
frontend owns SSR entries and route-loader prefetch; development runs a frontend
SSR dev server with an `/api` proxy; production and E2E serve static assets and
SSR HTML from a single backend process.

## Slices touched

Reference only — the harness enforces no spec↔slice mapping.

- `templates/fullstack/apps/frontend/` — `server.ts` (dev SSR server), `index.html`
  placeholders, `src/entry-client.tsx`, `src/entry-server.tsx`, `src/router.tsx`,
  `src/common/query-client.ts`, route loaders (e.g. `src/routes/users.tsx`).
- `templates/fullstack/apps/backend/src/common/ssr-plugin.ts` — prod static assets +
  SSR HTML via `@app/frontend/server-entry`.
- `templates/fullstack/apps/backend/src/common/tests/ssr.test.ts` — backend SSR
  integration.
- `templates/fullstack/apps/e2e/` — E2E against prod-like backend server.
- `packages/eslint-config/` — entry-file filename exemptions; backend
  `import-x/no-restricted-paths` guard (`ss-backend-frontend-entry-only`).
- `skills/convention/project-defaults/`, `skills/convention/state-and-data/`,
  `skills/convention/frontend-architecture/` — `pd-ssr`, `sd-ssr-loader-prefetch`
  guidance.

## Requirements

### R1 — Development SHALL run a frontend SSR server that proxies `/api` to the backend

In development, the frontend app MUST expose an SSR-capable HTTP server (Vite
middleware mode) that renders HTML for non-API GET requests and proxies `/api/*` to
the backend origin configured by `VITE_BACKEND_URL` (default `http://localhost:3001`).

#### Scenario: dev server renders a page

- **GIVEN** the backend is listening on port `3001` and the frontend dev server is
  started via `pnpm --filter @app/frontend dev`
- **WHEN** a client GETs `/` on the frontend dev port (default `5174`)
- **THEN** the response status is `200` with `text/html`
- **THEN** the body contains rendered page markup in place of `<!--ssr-outlet-->`

#### Scenario: dev server proxies API calls

- **GIVEN** the frontend dev server is running with `VITE_BACKEND_URL` pointing at
  the backend
- **WHEN** a client GETs `/api/health` through the frontend dev origin
- **THEN** the request is forwarded to the backend and the backend response is
  returned

#### Scenario: dev server does not SSR API paths

- **GIVEN** the frontend dev server is running
- **WHEN** a client GETs `/api/users` on the frontend dev origin
- **THEN** the response status is `404` (API is proxied on matching requests, not
  rendered as HTML)

### R2 — Production and E2E SHALL serve static assets and SSR HTML from the backend

In production-like mode, a single backend process MUST serve built client assets
under `/assets/`, expose `/api/*` as today, and render SSR HTML for other GET
requests by importing the built `@app/frontend/server-entry` export.

#### Scenario: prod backend serves static assets

- **GIVEN** the frontend has been built (`dist/client/assets/`) and the backend is
  running with `ssr-plugin` registered
- **WHEN** a client GETs a built asset path under `/assets/`
- **THEN** the response status is `200` with the asset bytes

#### Scenario: prod backend renders SSR HTML for app routes

- **GIVEN** the frontend client and server bundles are built and the backend is
  running with `ssr-plugin` registered
- **WHEN** a client GETs `/` or `/users`
- **THEN** the response status is `200` with `text/html`
- **THEN** the body contains rendered route markup and a `window.__APP_STATE__=`
  script in place of `<!--ssr-state-->`

#### Scenario: prod backend does not SSR API or test routes

- **GIVEN** the backend is running with `ssr-plugin` registered
- **WHEN** a client GETs `/api/health` or `/__test__/seed`
- **THEN** the response is handled by the API/test-route handlers, not the SSR
  not-found handler

#### Scenario: SSR render failure returns a safe HTML error page

- **GIVEN** the backend is running with `ssr-plugin` registered and server-side
  rendering throws
- **WHEN** a client GETs a non-API app route
- **THEN** the response status is `500` with `text/html` containing a fallback
  message and no dehydrated state script

### R3 — Route loaders SHALL prefetch data for SSR via TanStack Query

Route targets that need server data MUST prefetch in their TanStack Router
`loader` using `context.queryClient.ensureQueryData(...)`. Widget entries keep
`useQuery` to read the warmed cache without a loading flash.

#### Scenario: users route prefetches list data into SSR HTML

- **GIVEN** at least one user exists in the database
- **WHEN** a client GETs `/users` through the prod-like backend SSR path
- **THEN** the HTML body contains the user's visible name or email
- **THEN** the dehydrated `window.__APP_STATE__` includes the prefetched users
  query data

#### Scenario: loader prefetch runs before renderToString

- **GIVEN** a route defines `loader: ({ context }) => context.queryClient.ensureQueryData(...)`
- **WHEN** `entry-server.tsx` `render(url)` runs for that route
- **THEN** `router.load()` completes before `renderToString`
- **THEN** the returned `dehydratedState` includes queries populated by the loader

### R4 — Entry files SHALL dehydrate on the server and hydrate on the client

`entry-server.tsx` MUST dehydrate the per-request `QueryClient` into
`dehydratedState`. `entry-client.tsx` MUST hydrate `window.__APP_STATE__` into a
fresh `QueryClient` before `hydrateRoot` when SSR state is present; otherwise it
MUST fall back to `createRoot` client-only rendering.

#### Scenario: server embeds escaped dehydrated state

- **GIVEN** a route render produced non-empty query cache data
- **WHEN** the SSR HTML is assembled
- **THEN** `<!--ssr-state-->` is replaced with
  `<script>window.__APP_STATE__=…</script>` where JSON is escaped for `<` and `/`

#### Scenario: client hydrates when SSR state is present

- **GIVEN** the browser loads HTML with `window.__APP_STATE__` set
- **WHEN** `entry-client.tsx` boots
- **THEN** it calls `hydrate(queryClient, window.__APP_STATE__)` before
  `hydrateRoot`
- **THEN** the page is interactive without refetching data already in the cache

#### Scenario: client renders without hydration when no SSR state

- **GIVEN** the browser loads HTML without `window.__APP_STATE__`
- **WHEN** `entry-client.tsx` boots
- **THEN** it uses `createRoot(...).render(...)` (client-only path)

### R5 — SSR wiring SHALL use shared router and query-client factories

The template MUST expose `createRouter(queryClient)` in `src/router.tsx` and
`createQueryClient()` in `src/common/query-client.ts`. Both `entry-server.tsx`
and `entry-client.tsx` MUST use these factories — not duplicate router or client
construction.

#### Scenario: server and client share router factory

- **GIVEN** `src/router.tsx` exports `createRouter`
- **WHEN** `entry-server.tsx` and `entry-client.tsx` are inspected
- **THEN** both import and call `createRouter` from `./router`

#### Scenario: server entry is published for backend import

- **GIVEN** the frontend package is built
- **WHEN** the backend resolves `@app/frontend/server-entry`
- **THEN** it loads `./dist/server/entry-server.js` exporting `render(url)`

### R6 — Import boundaries SHALL restrict backend access to the built server entry

The backend MUST NOT import `apps/frontend/src/**`. It MAY import only the
published `@app/frontend/server-entry` export. Frontend entry files
(`entry-client.tsx`, `entry-server.tsx`, `router.tsx`, `App.tsx`) are exempt from
kebab-case filename enforcement.

#### Scenario: backend source import is rejected by lint

- **GIVEN** a backend file contains `import … from '../../frontend/src/entry-server.tsx'`
- **WHEN** ESLint runs with the template backend config
- **THEN** `import-x/no-restricted-paths` reports an error citing
  `ss-backend-frontend-entry-only`

#### Scenario: backend server-entry import is allowed

- **GIVEN** `ssr-plugin.ts` contains `import('@app/frontend/server-entry')`
- **WHEN** ESLint runs with the template backend config
- **THEN** no `ss-backend-frontend-entry-only` violation is reported

### R7 — SSR behavior SHALL be covered by backend integration and collapsed E2E

Backend integration tests MUST assert SSR HTML for `/` and loader-prefetched `/users`.
E2E MUST run against the prod-like backend server (not the frontend dev server).

#### Scenario: backend SSR integration covers home and users

- **GIVEN** backend integration tests run with `DATABASE_URL` set and `ssr-plugin`
  registered
- **WHEN** the SSR test suite runs
- **THEN** `GET /` returns HTML with page markup and `window.__APP_STATE__=`
- **THEN** `GET /users` after seeding a user returns HTML containing that user's
  visible data and dehydrated state

#### Scenario: E2E uses backend webServer

- **GIVEN** E2E runs locally without `E2E_BASE_URL`
- **WHEN** Playwright starts `webServer`
- **THEN** it launches the backend test server (`@app/backend start:test`) on port
  `3001` with `SSR_API_ORIGIN` set to that origin
