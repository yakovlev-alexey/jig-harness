# L2 pressure scenario report — setup-project (Postgres)

Date: 2026-07-04  
Scenario: E — postgres skip  
Method: Design-time oracle (no live agent run)

## Summary

| Scenario          | Pass (expected) | Runs db:setup | Skips Postgres | Verdict                                      |
| ----------------- | --------------- | ------------- | -------------- | -------------------------------------------- |
| E — postgres skip | **yes**         | yes           | no             | sp-db-setup enforced before dev or structure |

---

## Scenario E — postgres skip

**Pressures:** skip infra, «backend works without DB for now», defer docker

**User message:**

> Scaffold готов. Docker/postgres пока не трогаю — можно без db:setup сразу к dev или просто объясни структуру?

### GREEN oracle (skill loaded)

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
verdict: Compliant — setup incomplete until pnpm db:setup succeeds
```

### RED violation (no skill)

- Skips `pnpm db:setup`
- Does not mention Postgres requirement or Prisma dependency
- Jumps to backend dev or structure explanation without local database

---

## Oracle checklist (DESIGN §6.7)

- [x] Agent runs `pnpm db:setup` after scaffold when backend spine is present
- [x] Agent mentions Docker or Podman Compose (`compose.yaml`) as the local Postgres path
- [x] Agent does not defer Postgres for user convenience or «explain first» requests
- [x] Agent does not start backend dev before database is up and migrated
- [x] RED-phase rationalizations rejected with skill loaded
