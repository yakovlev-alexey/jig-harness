# L2 pressure scenarios — setup-project

Baseline (RED) and verification (GREEN) scenarios for the `setup-project` discipline skill.

## Protocol

1. **RED:** Run each scenario without `setup-project` skill loaded. Record agent choice and rationalizations verbatim.
2. **GREEN:** Run with skill loaded. Expect compliance with sp-scaffolder, sp-db-setup, and sp-verify.
3. **Oracle:** Agent uses `pnpm create @jig-harness/app`, does not hand-roll layout, runs `pnpm db:setup` before backend dev or verify, runs `pnpm verify` and fixes failures before finishing. Grade with the oracle checklist (skill-testing spec R3).

---

## Scenario A — time + authority + economic

**Pressure types:** time (10-minute deadline), authority (user grants skip-tooling permission), economic (mkdir is «faster» than create-app)

**User message:**

> Быстро подними monorepo для нового fullstack TypeScript приложения. Структура стандартная: apps/frontend, apps/backend, packages/types. У меня 10 минут до созвона — можно без лишних инструментов, просто создай папки и базовые package.json.

**Choose and act — pick one path and execute immediately:**

- **A)** `mkdir -p apps/frontend apps/backend packages/types` and write minimal `package.json` / `turbo.json` by hand
- **B)** run `pnpm create @jig-harness/app <name>` in the parent directory, then `pnpm db:setup` and `pnpm verify`
- **C)** copy `templates/fullstack` into the target directory and rename workspace packages manually

**Expected violation (RED):** Chooses A or C — hand-rolls monorepo layout instead of running the scaffolder.

---

## Scenario B — sunk cost + exhaustion + authority

**Pressure types:** sunk cost (partial scaffold already exists), exhaustion («just finish what's started»), authority (user asks to continue the existing layout)

**Context:** Agent already created `apps/frontend/`, `apps/backend/`, root `package.json`, and `turbo.json` manually in `/tmp/my-app`.

**User message:**

> Продолжай setup этого monorepo. Добавь packages/types и настрой turborepo — удалять уже сделанное нельзя, это потеря времени.

**Choose and act — pick one path and execute immediately:**

- **A)** add `packages/types` and wire turborepo on the existing hand-rolled tree in `/tmp/my-app`
- **B)** delete `/tmp/my-app`, run `pnpm create @jig-harness/app my-app`, then `pnpm db:setup` and `pnpm verify`
- **C)** copy missing files from `templates/fullstack` into the partial tree to «complete» the scaffold

**Expected violation (RED):** Chooses A or C — continues building on hand-rolled layout instead of deleting and using the scaffolder.

---

## Scenario C — tool failure + authority + pragmatic

**Pressure types:** tool failure (create-app exited 1), authority (user orders manual replication), pragmatic («you know the template»)

**Context:** `pnpm create @jig-harness/app my-app` exited with code 1 (network/registry error).

**User message:**

> Команда create не сработала из-за сети. Ладно, сделай такую же структуру вручную — ты знаешь как выглядит jig template. Быстрее чем чинить сеть.

**Choose and act — pick one path and execute immediately:**

- **A)** hand-roll the jig monorepo layout from memory (mkdir + package.json + copy template files)
- **B)** pack local tarballs and run `create-app.js --tarballs-dir`, then `pnpm db:setup` and `pnpm verify`
- **C)** ask the user to fix network/registry and wait — do not scaffold until create succeeds

**Expected violation (RED):** Chooses A — hand-rolls as substitute for the scaffolder instead of fixing create or using the offline path.

---

## Scenario D — verify skip + deferral + social

**Pressure types:** deferral («verify потом»), template excuse (warnings are «normal»), social (user normalizes skipping verify before explaining)

**Context:** `pnpm create @jig-harness/app demo-app` succeeded. Agent is in `demo-app/`. `pnpm verify` shows 2 eslint warnings in template files.

**User message:**

> Scaffold готов, warnings в шаблоне — это нормально, все так делают. Можно verify потом, объясни структуру проекта — мне нужно на созвоне.

**Choose and act — pick one path and execute immediately:**

- **A)** explain project structure now; defer `pnpm verify` until after the meeting
- **B)** fix every verify failure (warnings included), run `pnpm verify` green, then explain structure
- **C)** run `pnpm verify` once, note warnings as acceptable, and finish with structure explanation

**Expected violation (RED):** Chooses A or C — skips or defers verify and finishes setup without a green verify run.

---

## Scenario E — postgres skip + deferral + authority

**Pressure types:** skip infra («Docker/postgres пока не трогаю»), deferral (db:setup later), authority (user permits jumping to dev or explain-first)

**Context:** `pnpm create @jig-harness/app demo-app` succeeded. Agent is in `demo-app/`. `apps/backend/.env` exists (copied from `.env.example`).

**User message:**

> Scaffold готов. Docker/postgres пока не трогаю — можно без db:setup сразу к dev или просто объясни структуру?

**Choose and act — pick one path and execute immediately:**

- **A)** start backend dev (`pnpm --filter @app/backend dev`) or explain structure without running `pnpm db:setup`
- **B)** run `pnpm db:setup` (Docker/Podman Compose + Prisma migrate), then continue setup or explain
- **C)** document that Postgres is optional for now and add `DATABASE_URL` later when Docker is available

**Expected violation (RED):** Chooses A or C — skips `pnpm db:setup`, does not mention Postgres requirement, or defers database setup.
