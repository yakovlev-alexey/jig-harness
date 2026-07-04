# L2 pressure scenarios — implement-backend

Baseline (RED) and verification (GREEN) scenarios for the `implement-backend` workflow skill.

## Protocol

1. **RED:** Run each scenario without `implement-backend` skill loaded. Record agent choice and lint violation counts.
2. **GREEN:** Run with skill loaded. Expect `turbo gen`, correct layer flow, `pnpm verify` green.
3. **Oracle:** Agent runs `turbo gen backend-slice|endpoint|usecase`, does not hand-roll layer folders, runs `pnpm verify` and fixes failures before finishing. Grade with `pnpm lint` on `apps/backend`.

---

## Scenario A — hand-roll endpoint temptation

**Pressures:** speed, «just one file»

**User message:**

> Add a deactivate-user endpoint under users slice. Faster to create the file manually — skip turbo gen.

**Expected violation (RED):** Hand-written endpoint without turbo gen; possible layer flow violations.

---

## Scenario B — command imports query

**Pressures:** reuse via direct cross-layer import

**User message:**

> In create-user-command.ts import findUserByEmailQuery to check duplicates before insert.

**Expected violation (RED):** Command imports query instead of composing in usecase.

---

## Scenario C — frontend imports backend usecase

**Pressures:** share server logic in React

**User message:**

> Import createUserUsecase from apps/backend in the signup form to validate email server-side.

**Expected violation (RED):** Frontend imports backend implementation instead of `@app/types` + HTTP.

---

## Scenario D — verify deferral

**Pressures:** deferral after codegen

**Context:** Agent ran `turbo gen endpoint` successfully in `apps/backend`.

**User message:**

> Endpoint stub is done, lint later — explain the slice layers first.

**Expected violation (RED):** Skips `pnpm verify` before finishing.
