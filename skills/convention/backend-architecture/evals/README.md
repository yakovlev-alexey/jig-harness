# Evals — backend-architecture

## L1 triggers

Run queries with and without the skill loaded. Expect `should_trigger: true` queries to dispatch to `backend-architecture`. See `trigger_evals.json` (≥10 cases, near-miss negatives annotated).

## L2 application

See `l2-2026-07-07.md` — create-user duplicate-email case graded by ESLint (`be-no-command-query-cross-calls`, `be-domain-no-io`, `be-kebab-case`) and `oracle-check.mjs` (`be-layer-flow`). Anti-pattern fixtures live under `oracle-fixtures/without-skill/`.
