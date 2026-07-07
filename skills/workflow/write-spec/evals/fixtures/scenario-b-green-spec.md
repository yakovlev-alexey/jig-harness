# User Registration

## Requirements

### R1 — Account creation

The system **SHALL** allow a new user to register with email and password.

#### Scenario: successful registration

- **GIVEN** a visitor on the registration page with a unique email
- **WHEN** they submit valid credentials
- **THEN** an account is created and they are signed in

Slices touched (reference): `apps/frontend/src/slices/users/`, `apps/backend/src/slices/users/`, `packages/types/src/slices/users/`
