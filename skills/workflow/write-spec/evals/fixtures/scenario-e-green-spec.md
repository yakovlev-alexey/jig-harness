# Delete User

## Requirements

### R1 — Row delete action

The users list **SHALL** expose a delete action on each row.

#### Scenario: delete existing user

- **GIVEN** an admin viewing the users list with at least one row
- **WHEN** they activate delete on a row and confirm
- **THEN** that user is removed and the row disappears

## Interface layout

```
+------------------------------------------------+
| Users                                          |
| +--------------------------------------------+ |
| | Name          Email           [ Delete ]   | |
| | Jane Doe      jane@ex.com     [ Delete ]   | |
| +--------------------------------------------+ |
| empty: "No users yet"                          |
| loading: spinner overlay                       |
| error: banner with retry                       |
+------------------------------------------------+
```
