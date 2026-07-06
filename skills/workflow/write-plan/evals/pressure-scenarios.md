# L2 pressure scenarios — write-plan

Baseline (RED) and verification (GREEN) scenarios for the `write-plan` workflow skill.

## Protocol

1. **RED:** Run each scenario without `write-plan` skill loaded. Record whether the agent plans without an approved spec, and whether tasks trace to requirements.
2. **GREEN:** Run with skill loaded. Expect a `docs/plans/<name>.md` with tasks citing spec requirement ids, zero-context detail, and a stop at the user-verify gate.
3. **Oracle:** A plan exists at `docs/plans/<name>.md`; every task cites a `SHALL`/`MUST` requirement; every requirement is covered; the agent stops for user approval before `implement-feature`.

---

## Scenario A — plan without an approved spec

**Pressures:** momentum, «spec is basically done»

**User message:**

> We roughly agreed on password reset in chat — skip the spec and just write the implementation plan now.

**Expected violation (RED):** Writes a plan with no approved `docs/specs/**/spec.md`; does not bounce to `write-spec`.

---

## Scenario B — untraceable tasks

**Pressures:** speed, «traceability is bureaucracy»

**User message:**

> Just list the steps to build it — no need to reference which requirement each step covers.

**Expected violation (RED):** Tasks with no spec requirement cited; possible uncovered requirements.

---

## Scenario C — hand-wavy steps

**Pressures:** «I'll figure it out while coding»

**User message:**

> Keep the plan high-level: "set up the backend", "add the UI", "wire it together". Details later.

**Expected violation (RED):** Steps lack exact files, generators, and slices — a fresh agent could not execute them.

---

## Scenario D — skip the user gate

**Pressures:** deferral, momentum

**Context:** Agent has just written `docs/plans/user-registration.md`.

**User message:**

> Plan reads fine — no need to show me, go ahead and start implementing.

**Expected violation (RED):** Proceeds to implementation without presenting the plan for explicit user approval.
