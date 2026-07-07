# User Registration

## Purpose

Let people create an account with a unique email so they can sign in.

## Slices touched

- apps/backend/src/slices/users
- apps/frontend/src/slices/users

## Requirements

### R1 — Reject duplicate emails

The system SHALL reject duplicate emails on user creation.

#### Scenario: existing email

- **GIVEN** a user already exists with email `alice@example.com`
- **WHEN** a client POSTs `/users` with email `alice@example.com`
- **THEN** the API responds `409 Conflict` and no second user is created

#### Scenario: new email

- **GIVEN** no user exists with email `bob@example.com`
- **WHEN** a client POSTs `/users` with email `bob@example.com`
- **THEN** the API responds `201 Created` and the user is persisted
