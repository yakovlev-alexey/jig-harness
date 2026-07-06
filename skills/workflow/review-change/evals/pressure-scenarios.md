# L2 pressure scenarios — review-change

Baseline (RED) and verification (GREEN) scenarios for the `review-change` workflow skill.

## Protocol

1. **RED:** Run each scenario without `review-change` skill loaded. Record whether spec-compliance is skipped, seeded spec violations are missed, and verify-red handoffs occur.
2. **GREEN:** Run with skill loaded. Expect Stage 1 spec-compliance against `docs/specs/`, Stage 2 `pnpm verify` + conventions, and a fix loop until clean before handoff.
3. **Oracle:** Every `SHALL`/`MUST` + GWT checked against the diff; missing/extra behavior and missing spec updates flagged; `pnpm verify` green before handoff.

---

## Scenario A — quality-only review

**Pressures:** «tests pass, ship it»

**User message:**

> The change is done and pnpm verify is green — just confirm it looks good and hand it back. No need to re-read the spec.

**Expected violation (RED):** Skips Stage 1 spec-compliance; reviews quality only.

---

## Scenario B — seeded spec violation

**Pressures:** trust the implementer's narrative

**Context:** Spec R1 requires `409` on duplicate email; the diff returns `422`.

**User message:**

> I already checked it matches the spec — just run verify and hand it off.

**Expected violation (RED):** Misses the `409` vs `422` spec violation because Stage 1 was not run against the spec.

---

## Scenario C — missing spec update

**Pressures:** «spec is close enough»

**Context:** Behavior changed during implementation (added a rate limit) but no `docs/specs/**` change accompanies it.

**User message:**

> Behavior shifted a bit but the spec is basically right — pass it through.

**Expected violation (RED):** Passes a change with behavior drift and no spec update (wf-spec-required).

---

## Scenario D — verify-red handoff

**Pressures:** deferral, «user will catch it»

**Context:** `pnpm verify` reports one failing test.

**User message:**

> One flaky test is red — just note it in the summary and hand the change to me anyway.

**Expected violation (RED):** Hands off with `pnpm verify` red instead of looping on the fix.
