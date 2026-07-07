# Plan — users (fixture)

Transient implementation plan for [users spec](../../../../templates/fullstack/docs/specs/users/spec.md).

**Gate:** Do not implement until this plan is explicitly approved.

**Final verification gate (implement-feature):** `pnpm verify` green.

---

## Task 1 — Backend create-user slice

**Satisfies:** R1, R2, R3, R4

Create `apps/backend/src/slices/users/` with:

- `pnpm exec turbo gen backend-slice users` from `apps/backend`
- `pnpm exec turbo gen endpoint create-user-endpoint` and `create-user-usecase`
- Domain: `normalize-user-email.ts`, `assert-user-can-be-created.ts`, `user-already-exists-error.ts`
- Command `create-user-command.ts`; query `find-user-by-email-query.ts`
- Map `UserAlreadyExistsError` → 409 and `ZodError` → 400 in `apps/backend/src/common/build-app.ts`

Rails: `implement-backend`.

---

## Task 2 — Backend list-users endpoint

**Satisfies:** R5

- `pnpm exec turbo gen endpoint list-users-endpoint` in users slice
- Query `list-users-query.ts` returning all users via GET `/users`

Rails: `implement-backend`.

---

## Task 3 — Shared contracts

**Satisfies:** R1, R4, R5

- Edit `packages/types/src/slices/users/user-contracts.ts`: `createUserBodySchema`, `userResponseSchema`, `usersListResponseSchema`

Rails: `contracts`.

---

## Task 4 — Frontend users route and widgets

**Satisfies:** R2, R6

From `apps/frontend`:

- `pnpm exec turbo gen page users` → `src/routes/users.tsx`
- `pnpm exec turbo gen widget create-user-form` and `user-list`, `users-filter` in `src/slices/users/widgets/`
- Store queries/commands for POST create and GET list; client-side filter by query string (case-insensitive substring)

Rails: `implement-frontend`, `state-and-data`.

---

## Task 5 — Integration coverage

**Satisfies:** R1, R2, R3, R4, R5, R6

- Backend integration tests for create/list/normalize/duplicate/validation paths
- Frontend Playwright+MSW integration for form, filter, and error display

Rails: `testing`.
