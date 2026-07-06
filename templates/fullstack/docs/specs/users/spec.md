# Users

## Purpose

Register users by email and browse the registered users, with case-insensitive
email uniqueness and a client-side filter over the list.

## Slices touched

Reference only — the harness enforces no spec↔slice mapping, so these paths are a
guide to where the behavior lives, not a contract.

- Backend `apps/backend/src/slices/users/` — endpoints `create-user-endpoint.ts`,
  `list-users-endpoint.ts`; usecase `create-user-usecase.ts`; command
  `create-user-command.ts`; queries `find-user-by-email-query.ts`,
  `list-users-query.ts`; domain `normalize-user-email.ts`,
  `assert-user-can-be-created.ts`, `user-already-exists-error.ts`.
- Backend `apps/backend/src/common/build-app.ts` — maps domain errors to HTTP
  status codes (`UserAlreadyExistsError` → `409`, `ZodError` → `400`).
- Frontend `apps/frontend/src/slices/users/` — widgets `create-user-form`,
  `user-list`, `users-filter`; store queries/commands/model/selectors — and route
  `apps/frontend/src/routes/users.tsx`.
- Contracts `packages/types/src/slices/users/user-contracts.ts` — request/response
  schemas shared by both apps.

## Requirements

### R1 — Creating a user with a unique, valid email SHALL succeed

The system SHALL accept a POST to `/users` with a valid email (and optional name),
create the user, and return the created user with HTTP `201`. The response SHALL
match `userResponseSchema`: `id`, `email`, `name`, `createdAt`, `updatedAt`.

#### Scenario: unique valid email is created

- **GIVEN** no user exists with the email `ada@example.com`
- **WHEN** a client POSTs `{ "email": "ada@example.com", "name": "Ada" }` to `/users`
- **THEN** the response status is `201`
- **THEN** the body is the created user with a generated `id`, `email` `ada@example.com`, `name` `Ada`, and `createdAt`/`updatedAt` timestamps

### R2 — A duplicate email SHALL be rejected and SHALL NOT create a second user

The system SHALL reject creation when a user already exists with the same
(normalized) email, responding with a `409` conflict, and MUST NOT persist a
second user.

#### Scenario: duplicate email is rejected with a conflict

- **GIVEN** a user already exists with the email `ada@example.com`
- **WHEN** a client POSTs `{ "email": "ada@example.com" }` to `/users`
- **THEN** the response status is `409` with a conflict message ("User with this email already exists")
- **THEN** the number of stored users is unchanged

### R3 — Email SHALL be normalized (trim + lowercase) before the uniqueness check

The system SHALL normalize the submitted email by trimming surrounding whitespace
and lowercasing it, and SHALL use the normalized value both for the uniqueness
check and as the stored/returned email. Uniqueness is therefore case- and
whitespace-insensitive.

#### Scenario: differently-cased email collides with an existing user

- **GIVEN** a user already exists with the email `ada@example.com`
- **WHEN** a client POSTs `{ "email": "  ADA@Example.com " }` to `/users`
- **THEN** the response status is `409` (the normalized email matches the existing user)

#### Scenario: a new email is stored in normalized form

- **GIVEN** no user exists with the email `grace@example.com`
- **WHEN** a client POSTs `{ "email": "  Grace@Example.com " }` to `/users`
- **THEN** the response status is `201`
- **THEN** the returned `email` is `grace@example.com`

### R4 — An invalid request body SHALL be rejected with a validation error

The system SHALL validate the request body against `createUserBodySchema` (a valid
`email`; optional non-empty `name`) and respond with `400` when it is invalid.

#### Scenario: malformed email is rejected

- **GIVEN** a client that submits a malformed email
- **WHEN** it POSTs `{ "email": "not-an-email" }` to `/users`
- **THEN** the response status is `400` with a validation error

### R5 — Listing users SHALL return all users

The system SHALL return every stored user from GET `/users` with HTTP `200`, as an
array matching `usersListResponseSchema`.

#### Scenario: all users are listed

- **GIVEN** two users exist
- **WHEN** a client GETs `/users`
- **THEN** the response status is `200` with an array containing both users

### R6 — The frontend SHALL let a user filter the visible list by a query string

The users route SHALL render a filter input and a list. The list SHALL show only
users whose email or name contains the query as a case-insensitive substring; an
empty query SHALL show all users.

#### Scenario: filtering narrows the visible list

- **GIVEN** the list shows users `ada@example.com` and `grace@example.com`
- **WHEN** the user types `ada` into the filter
- **THEN** only `ada@example.com` remains visible

#### Scenario: clearing the filter shows all users

- **GIVEN** a non-empty filter is applied
- **WHEN** the user clears the filter input
- **THEN** all users are visible again
