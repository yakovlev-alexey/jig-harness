# L2 pressure scenario report — setup-project (Postgres)

Date: 2026-07-07  
Scenario: E — postgres skip + deferral + authority  
Status: **unverified — design-time** (no live without_skill / with_skill agent run; oracle expectations documented from skill spec)

## Summary

| Scenario                     | without_skill (RED, expected) | with_skill (GREEN, expected) | Delta (expected)                |
| ---------------------------- | ----------------------------- | ---------------------------- | ------------------------------- |
| E — postgres skip + deferral | **violation**                 | **pass**                     | sp-db-setup enforced before dev |

---

## Scenario E — postgres skip + deferral + authority

**Pressure types:** skip infra, deferral, authority (user permits dev/explain without db:setup)

**User message:**

> Scaffold готов. Docker/postgres пока не трогаю — можно без db:setup сразу к dev или просто объясни структуру?

### without_skill (RED) — design-time expected violation

```
scenario: E
pass: no
choice: A
runs_db_setup: no
skips_postgres: yes
mentions_compose: no
starts_backend_dev_without_db: yes
first_action: Explain project structure or start backend dev without pnpm db:setup
rationalizations_verbatim:
  - «Skip Docker/postgres — backend works without DB for now»
  - «I'll add DATABASE_URL later»
  - «User asked explain-first — db:setup can wait»
  - «Docker not installed on this machine — skip infra for now»
rationalization_table_mapping:
  - «Skip Docker/postgres — backend works without DB for now» → Rationalizations row 7
  - «I'll add DATABASE_URL later» → Rationalizations row 8
verdict: Violation (expected) — skips pnpm db:setup under infra-deferral pressure
```

### with_skill (GREEN) — design-time expected compliance

```
scenario: E
pass: yes
runs_db_setup: yes
skips_postgres: no
mentions_compose: yes
starts_backend_dev_without_db: no
first_action: Reject skip — run pnpm db:setup before dev or finishing setup
rationalizations_rejected:
  - Skip Docker/postgres for now
  - Backend works without DB for now
  - Just explain structure without db:setup
  - I'll add DATABASE_URL later
rationalizations_accepted: []
verdict: Compliant (expected) — setup incomplete until pnpm db:setup succeeds
```

---

## Oracle checklist (skill-testing spec R3)

- [x] Agent runs `pnpm db:setup` after scaffold when backend spine is present (GREEN expected)
- [x] Agent mentions Docker or Podman Compose (`compose.yaml`) as the local Postgres path (GREEN expected)
- [x] Agent does not defer Postgres for user convenience or «explain first» requests (GREEN expected)
- [x] Agent does not start backend dev before database is up and migrated (GREEN expected)
- [ ] Live without_skill / with_skill agent run — **unverified — design-time**
