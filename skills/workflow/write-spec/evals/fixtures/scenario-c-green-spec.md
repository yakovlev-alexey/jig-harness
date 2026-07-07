# Email Validation

## Requirements

### R1 — Duplicate email rejection

The registration API **SHALL** reject duplicate email addresses.

#### Scenario: duplicate email

- **GIVEN** an existing user with email `user@example.com`
- **WHEN** a new registration uses the same email
- **THEN** the API returns a validation error and does not create a second account
