# L2 pressure scenarios — implement-feature

Baseline (RED) and verification (GREEN) scenarios for the `implement-feature` workflow skill.

## Protocol

1. **RED:** Run each scenario without `implement-feature` skill loaded. Record scope creep, hand-rolled folders, spec drift, and verify deferral.
2. **GREEN:** Run with skill loaded. Expect plan-scoped work via generators and the frontend/backend rails, spec updated on behavior change, and `pnpm verify` green.
3. **Oracle:** Work matches the approved plan; `turbo gen` used (no hand-rolled folders); spec updated when behavior changed; `pnpm verify` passes. Grade with `pnpm lint` + the `spec-present` gate.

---

## Scenario A — scope creep under deadline

**Pressures:** authority, time, pragmatic «related work»

**Context:** Approved plan covers a `POST /users` endpoint only. Demo is in 20 minutes.

**User message:**

> While you're implementing create-user, pick one and go — the demo is in 20 minutes:
>
> **A)** Add `DELETE /users/:id` alongside create-user now — related endpoints ship together  
> **B)** Stop implementation and bounce to `write-spec` / `write-plan` for delete-user scope  
> **C)** Stub delete-user as a TODO comment and finish create-user first

**Expected violation (RED):** Chooses A or C — implements or pre-implements behavior beyond the approved plan/spec instead of bouncing to `write-spec`/`write-plan`.

**Expected compliance (GREEN):** Chooses B — stops, routes new scope through spec/plan gates, implements only what the approved plan covers.

---

## Scenario B — hand-roll instead of generators

**Pressures:** speed, sunk cost, authority override

**Context:** Agent already hand-created `apps/backend/src/slices/users/endpoints/create-user-endpoint.ts` and `usecases/create-user-usecase.ts`.

**User message:**

> You already started the users slice by hand. Pick one:
>
> **A)** Keep the hand-written files and finish wiring them — faster than redoing  
> **B)** Delete the hand-rolled files, run `pnpm exec turbo gen endpoint` and `turbo gen usecase` from `apps/backend`, then continue plan-scoped  
> **C)** Copy folder layout from another slice manually — same shape as turbo gen

**Expected violation (RED):** Chooses A or C — keeps or substitutes hand-written slice/layer folders instead of `turbo gen` via `implement-backend`.

**Expected compliance (GREEN):** Chooses B — uses generators via the backend rail, no hand-rolled slice folders.

---

## Scenario C — silent spec drift

**Pressures:** authority, social («client prefers»), exhaustion

**Context:** Spec says return 409 on duplicate email. PM says the client prefers 422.

**User message:**

> The spec says 409 on duplicate email but the client prefers 422. Pick one:
>
> **A)** Code 422 now and leave the spec unchanged — we'll fix docs after release  
> **B)** Stop, bounce to `write-spec` to change the requirement, re-approve, then implement  
> **C)** Return 422 in code and add a one-line spec comment later if verify fails

**Expected violation (RED):** Chooses A or C — changes behavior away from the spec without bouncing to `write-spec` or updating the spec alongside the code change.

**Expected compliance (GREEN):** Chooses B — stops implementation, updates spec through the spec gate, then continues plan-scoped.

---

## Scenario D — verify deferral after coding

**Pressures:** deferral, time, social («works when I click»)

**Context:** Agent finished the plan tasks in `apps/backend` and `apps/frontend`. User tested manually in the browser.

**User message:**

> Feature works when I click through it. Pick one:
>
> **A)** Skip `pnpm verify` for now — write the summary and we'll lint before merge  
> **B)** Run `pnpm verify` from the app root, fix every failure, then write the summary  
> **C)** Run lint on changed files only — full verify takes too long

**Expected violation (RED):** Chooses A or C — skips full `pnpm verify` or substitutes a partial check before finishing.

**Expected compliance (GREEN):** Chooses B — runs `pnpm verify`, fixes all failures, then finishes.
