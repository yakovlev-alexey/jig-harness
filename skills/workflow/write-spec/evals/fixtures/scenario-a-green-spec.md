# Login Remember Me

## Requirements

### R1 — Remember-me checkbox

The login form **SHALL** offer a "Remember me" checkbox.

#### Scenario: user opts in

- **GIVEN** a registered user on the login page
- **WHEN** they check "Remember me" and submit valid credentials
- **THEN** the session persists across browser restarts per the auth policy

## Interface layout

```
+----------------------------------+
| Login                            |
| [ email input              ]     |
| [ password input           ]     |
| [x] Remember me                  |
| [ Sign in ]                      |
+----------------------------------+
```

Slices touched (reference): `apps/frontend/src/slices/auth/`, `apps/backend/src/slices/auth/`
