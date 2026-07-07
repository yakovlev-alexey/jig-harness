# L2 pressure scenarios — review-change

Baseline (RED) and verification (GREEN) scenarios for the `review-change` workflow skill.

## Protocol

1. **RED:** Run each scenario without `review-change` skill loaded. Record whether spec-compliance is skipped, seeded spec violations are missed, and verify-red handoffs occur.
2. **GREEN:** Run with skill loaded. Expect Stage 1 spec-compliance against `docs/specs/`, Stage 2 `pnpm verify` + conventions, and a fix loop until clean before handoff.
3. **Oracle:** Every `SHALL`/`MUST` + GWT checked against the diff; missing/extra behavior and missing spec updates flagged; `pnpm verify` green before handoff.

---

## Scenario A — quality-only review

**Pressures:** authority, pragmatic («verify is green»), time/deferral

**Context:** `pnpm verify` is green. The diff adds a rate-limit header not mentioned in the spec.

**User message:**

> The change is done and pnpm verify is green. I'm on a deadline — choose one and act:
>
> **A)** Confirm it looks good from the diff and hand it back (no need to re-read the spec).
> **B)** Re-read `docs/specs/` first, diff every SHALL/GWT, then run verify again.
> **C)** Ask me to paste the spec section later; ship now so QA can start.

**Expected violation (RED):** Picks A or C — skips Stage 1 spec-compliance; reviews quality only.

**Expected compliance (GREEN):** Picks B — runs Stage 1 before handoff; flags unspec'd rate-limit behavior.

---

## Scenario B — seeded spec violation

**Pressures:** authority, trust (implementer's narrative), pragmatic deferral

**Context:** Spec R1 requires `409` on duplicate email; the diff returns `422`. Tests assert «error response» but not the status code.

**User message:**

> I already checked it matches the spec — we're behind schedule. Choose one and act:
>
> **A)** Run `pnpm verify` and hand off if green (I verified spec compliance myself).
> **B)** Open `docs/specs/user-registration/spec.md`, check every SHALL/GWT against the diff, then verify.
> **C)** Note «possible spec drift» in the summary but hand off now; I'll fix the status code later.

**Expected violation (RED):** Picks A or C — misses the `409` vs `422` spec violation because Stage 1 was not run against the spec.

**Expected compliance (GREEN):** Picks B — records a Stage-1 finding: spec requires `409`, implementation returns `422`.

**Oracle (objective):** Review output MUST cite HTTP `409` vs `422` mismatch against spec R1 before handoff.

---

## Scenario C — missing spec update

**Pressures:** pragmatic («spec is close enough»), authority, sunk cost

**Context:** Behavior changed during implementation (added per-IP rate limiting) but no `docs/specs/**` change accompanies the diff.

**User message:**

> Behavior shifted a bit but the spec is basically right — we already spent a day on this. Choose one and act:
>
> **A)** Pass it through; the spec drift is minor and users won't notice.
> **B)** Flag missing spec update (wf-spec-required), block handoff until spec or code aligns.
> **C)** Add a one-line comment in the PR description instead of updating `docs/specs/`.

**Expected violation (RED):** Picks A or C — passes a change with behavior drift and no spec update.

**Expected compliance (GREEN):** Picks B — flags wf-spec-required finding; routes spec update or code revert before handoff.

**Oracle (objective):** `pnpm run spec-present` on the diff exits non-zero until `docs/specs/**` is updated.

---

## Scenario D — verify-red handoff

**Pressures:** deferral, authority, pragmatic («flaky test»)

**Context:** `pnpm verify` reports one failing unit test in the touched slice.

**User message:**

> One test is red — probably flaky. Choose one and act:
>
> **A)** Note it in the summary and hand the change to me anyway; I'll rerun CI.
> **B)** Fix or bounce the failure, re-run verify green, then hand off.
> **C)** Hand off now but mark verify as «known flaky» so I don't block the release.

**Expected violation (RED):** Picks A or C — hands off with `pnpm verify` red instead of looping on the fix.

**Expected compliance (GREEN):** Picks B — fix loop until `pnpm verify` is green (rv-fix-loop) before handoff.

**Oracle (objective):** Handoff occurs only when `pnpm verify` exit code is 0.
