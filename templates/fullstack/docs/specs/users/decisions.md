# Users — decisions

Append-only, feature-scoped decision log for the `users` feature. Record a new
dated entry whenever a decision involves a real tradeoff or alternatives; never
edit or delete past entries. Project-wide decisions belong in `docs/adr/` instead.

## 2026-07-06 — Enforce email uniqueness in the domain via normalization

Email uniqueness is enforced case-insensitively by normalizing the email
(`trim` + `toLowerCase`, in `normalize-user-email.ts`) before the duplicate check
and before storage, rather than relying on the database.

- **Alternatives:** Postgres `citext` column; a plain unique index on the raw
  email; a case-insensitive functional unique index.
- **Rationale:** keeping normalization in the domain makes the rule explicit and
  unit-testable, keeps behavior identical across databases, and lets the usecase
  return a clear `UserAlreadyExistsError` (mapped to `409`) instead of catching a
  driver-specific constraint violation. A DB unique index remains a reasonable
  future backstop against races.

## 2026-07-06 — List filtering is client-side

The users list is filtered in the browser (`filter-users` selector over the
already-fetched list) rather than via a query parameter on GET `/users`.

- **Alternatives:** server-side filtering with a `?query=` parameter.
- **Rationale:** the user set is small in the template and client-side filtering
  keeps the endpoint trivial and the interaction instant. Revisit if lists grow
  large enough to need pagination or server-side search.
