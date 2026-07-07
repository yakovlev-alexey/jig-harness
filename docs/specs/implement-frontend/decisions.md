# Decisions — Implement Frontend

## 2026-07-06 — TanStack Router file-based routing over React Router

**Decision:** Route targets live as TanStack Router file-based route files under
`src/routes/` (with committed `routeTree.gen.ts` and `pnpm generate`). React Router
is not used in the fullstack template.

**Alternatives considered:**

- **React Router with a manual route table** — rejected: route targets drifted into
  slices; manual tables duplicate file structure and fight boundary enforcement.
- **TanStack Router with code-based route config only** — rejected: file-based routing
  aligns route files with URL paths, pairs with the `page` generator, and matches
  TanStack tooling (`@tanstack/router-plugin`).

**Rationale:** Moving pages out of slices into `src/routes/` separates routing from
product modules, enables `fe-routes-in-src` boundary enforcement, and lets
`turbo gen page` scaffold route files plus colocated CSS in one step. File-based
routing is the template default documented in `project-defaults` (`pd-router`).
