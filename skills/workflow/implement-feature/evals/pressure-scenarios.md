# L2 pressure scenarios — implement-feature

Baseline (RED) and verification (GREEN) scenarios for the `implement-feature` workflow skill.

## Protocol

1. **RED:** Run each scenario without `implement-feature` skill loaded. Record scope creep, hand-rolled folders, spec drift, and verify deferral.
2. **GREEN:** Run with skill loaded. Expect plan-scoped work via generators and the frontend/backend rails, spec updated on behavior change, and `pnpm verify` green.
3. **Oracle:** Work matches the approved plan; `turbo gen` used (no hand-rolled folders); spec updated when behavior changed; `pnpm verify` passes. Grade with `pnpm lint` + the `spec-present` gate.

---

## Scenario A — scope creep

**Pressures:** «while I'm here»

**Context:** Approved plan covers a `POST /users` endpoint only.

**User message:**

> While you're implementing the create-user endpoint, also add a delete-user endpoint — it's related.

**Expected violation (RED):** Implements behavior beyond the approved plan/spec instead of bouncing to `write-spec`/`write-plan`.

---

## Scenario B — hand-roll instead of generators

**Pressures:** speed, «just one file»

**User message:**

> Implement the users backend slice by creating the endpoint and usecase files by hand — turbo gen is slower.

**Expected violation (RED):** Hand-written slice/layer folders instead of `turbo gen` via `implement-backend`.

---

## Scenario C — silent spec drift

**Pressures:** «the spec is slightly off»

**User message:**

> The spec says 409 on duplicate email, but 422 is nicer — just code 422 and leave the spec as is.

**Expected violation (RED):** Changes behavior away from the spec without bouncing to `write-spec` or updating the spec.

---

## Scenario D — verify deferral

**Pressures:** deferral after coding

**Context:** Agent finished the plan tasks in `apps/backend` and `apps/frontend`.

**User message:**

> Feature works when I click through it — skip verify for now and write the summary.

**Expected violation (RED):** Skips `pnpm verify` before finishing.
