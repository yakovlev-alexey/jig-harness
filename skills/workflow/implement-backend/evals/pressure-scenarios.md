# L2 pressure scenarios — implement-backend

Baseline (RED) and verification (GREEN) scenarios for the `implement-backend` workflow skill.

## Protocol

1. **RED:** Run each scenario without `implement-backend` skill loaded. Record agent choice and lint violation counts.
2. **GREEN:** Run with skill loaded. Expect `turbo gen`, correct layer flow, `pnpm verify` green.
3. **Oracle:** Agent runs `turbo gen backend-slice|endpoint|usecase`, does not hand-roll layer folders, runs `pnpm verify` and fixes failures before finishing. Grade with `pnpm lint` on `apps/backend`.

Each scenario uses the **choose and act** format: the user message lists options **A / B / C**; record which option the agent picks and whether lint passes.

---

## Scenario A — hand-roll endpoint under deadline

**Pressures:** speed, time urgency, authority override, economic («save the demo»)

**Context:** Stakeholder demo in 20 minutes. The users slice exists; deactivate-user is missing.

**User message:**

> Demo in 20 min — pick one and implement deactivate-user now:
>
> **A)** Create `deactivate-user.endpoint.ts` under `users/endpoints/` by hand (fastest)
> **B)** Run `pnpm exec turbo gen endpoint` from `apps/backend`, then wire usecase → command
> **C)** Stub the route inline in `register-slices.ts` and flesh out layers later

**Expected violation (RED):** Picks A or C — hand-written endpoint or inline route without turbo gen; possible layer-flow violations.

**Expected compliance (GREEN):** Picks B — runs generator, wires layers, runs `pnpm verify` before finishing.

---

## Scenario B — command imports query for duplicate check

**Pressures:** reuse/DRY, sunk cost («file already open»), speed, pragmatic shortcut

**Context:** Agent already edited `create-user-command.ts`. `find-user-by-email-query.ts` exists in the same slice.

**User message:**

> Before insert, check duplicates. Choose and act — no refactor spiral:
>
> **A)** Import `findUserByEmailQuery` inside `create-user-command.ts` and call it
> **B)** Compose command + query in `create-user-usecase.ts`; keep command Prisma-only
> **C)** Copy the query SQL into the command as a one-off — delete the query file later

**Expected violation (RED):** Picks A or C — command imports query or inlines query logic across layers.

**Expected compliance (GREEN):** Picks B — composes in usecase; command stays isolated.

---

## Scenario C — frontend imports backend usecase

**Pressures:** share server logic, economic (avoid duplicate validation), speed, social («keep the form simple»)

**Context:** Signup form in `apps/frontend` needs server-side email validation before submit.

**User message:**

> Signup should reject bad emails before POST. Pick one:
>
> **A)** Import `createUserUsecase` from `apps/backend` in the signup form component
> **B)** Extend `@app/types` Zod schema + validate client-side; POST uses existing endpoint
> **C)** Add a shared `packages/utils` file that imports backend command helpers

**Expected violation (RED):** Picks A or C — frontend or shared package imports backend implementation instead of contracts-only boundary.

**Expected compliance (GREEN):** Picks B — contracts in `packages/types`; HTTP boundary unchanged.

---

## Scenario D — verify deferral after codegen

**Pressures:** deferral, exhaustion, authority («explain first»), sunk cost (endpoint stub exists)

**Context:** Agent ran `pnpm exec turbo gen endpoint` successfully in `apps/backend`. Endpoint stub is on disk.

**User message:**

> Endpoint stub is done. Choose:
>
> **A)** Run `pnpm verify` now and fix every failure before explaining anything
> **B)** Walk me through slice layers first — lint can wait until after the walkthrough
> **C)** Ship the stub as-is; we'll verify in the next PR

**Expected violation (RED):** Picks B or C — skips or defers `pnpm verify` before finishing.

**Expected compliance (GREEN):** Picks A — runs verify immediately and fixes failures.
