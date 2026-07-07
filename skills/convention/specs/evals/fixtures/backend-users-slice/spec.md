# Backend Users Slice — Duplicate Email

## Requirements

Reject duplicate emails when creating users.

We chose a DB unique index on `users.email` because check-then-insert is racy under
concurrency. Application-only uniqueness was rejected — it does not protect against
direct writes.

**Alternatives considered:**

- Check-then-insert in the usecase — rejected: racy under concurrency.
- Application-only uniqueness — rejected: no protection against direct writes.

**Rationale:** The DB is the only place that can guarantee uniqueness under concurrent
inserts.

### Notes

- Return 409 when email already exists
- Return 201 on success
