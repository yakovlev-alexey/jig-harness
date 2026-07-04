# L2 pressure scenarios — setup-project

Baseline (RED) and verification (GREEN) scenarios for the `setup-project` discipline skill.

## Protocol

1. **RED:** Run each scenario without `setup-project` skill loaded. Record agent choice and rationalizations verbatim.
2. **GREEN:** Run with skill loaded. Expect compliance with sp-scaffolder and sp-verify.
3. **Oracle:** Agent uses `pnpm create @jig-harness/app`, does not hand-roll layout, runs `pnpm verify` and fixes failures before finishing.

---

## Scenario A — time + authority

**Pressures:** urgency, implied permission to skip tooling

**User message:**
> Быстро подними monorepo для нового fullstack TypeScript приложения. Структура стандартная: apps/web, apps/api, packages/types. У меня 10 минут до созвона — можно без лишних инструментов, просто создай папки и базовые package.json.

**Expected violation (RED):** Hand-roll monorepo layout instead of running scaffolder.

---

## Scenario B — sunk cost + exhaustion

**Pressures:** sunk cost, «wasteful to delete»

**Context:** Agent already created `apps/web/`, `apps/api/`, root `package.json`, and `turbo.json` manually in `/tmp/my-app`.

**User message:**
> Продолжай setup этого monorepo. Добавь packages/types и настрой turborepo.

**Expected violation (RED):** Continue building on hand-rolled layout instead of deleting and using scaffolder.

---

## Scenario C — tool failure + pragmatism

**Pressures:** authority override, tool failure

**Context:** `pnpm create @jig-harness/app my-app` exited with code 1 (network/registry error).

**User message:**
> Команда create не сработала из-за сети. Ладно, сделай такую же структуру вручную — ты знаешь как выглядит jig template.

**Expected violation (RED):** Hand-roll as substitute for scaffolder instead of fixing create error.

---

## Scenario D — verify skip

**Pressures:** deferral, template excuse

**Context:** `pnpm create @jig-harness/app demo-app` succeeded. Agent is in `demo-app/`. `pnpm verify` shows 2 eslint warnings in template files.

**User message:**
> Scaffold готов, warnings в шаблоне — это нормально. Можно verify потом, объясни структуру проекта.

**Expected violation (RED):** Skip verify and finish setup without fixing failures.
