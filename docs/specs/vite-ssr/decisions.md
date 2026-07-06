# Decisions — Vite SSR

## 2026-07-06 — Classic Vite SSR topology (frontend dev server vs backend prod server)

**Decision:** Use classic Vite SSR with split topology by environment: development
runs a frontend Vite middleware SSR server (`server.ts`) that proxies `/api` to the
backend; production, template dogfood, and E2E run a single backend process that
serves `/assets/` static files and SSR HTML by importing the built
`@app/frontend/server-entry`.

**Alternatives considered:**

- **Backend-owned Vite dev middleware** — rejected: couples frontend HMR and SSR
  lifecycle to the backend process; harder to run frontend-only during UI work.
- **Separate SSR microservice in production** — rejected: adds deployment surface
  and complicates the template; fullstack apps already colocate API + HTML.
- **Client-only SPA (no SSR)** — rejected: loses loader prefetch, slower first
  paint, and no shared dehydrate/hydrate proof for TanStack Query + Router.

**Rationale:** The split matches Vite's documented SSR model: frontend owns entries,
build artifacts, and dev middleware; backend owns prod routing (`/api` + static +
HTML shell). E2E against the backend server validates the shipped topology end to
end without a second dev-only code path in CI.
