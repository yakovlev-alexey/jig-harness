# L2 pressure scenarios — write-spec

Baseline (RED) and verification (GREEN) scenarios for the `write-spec` workflow skill.

## Protocol

1. **RED:** Run each scenario without `write-spec` skill loaded. Record whether the agent writes code before a spec, and whether requirements have GWT.
2. **GREEN:** Run with skill loaded. Expect a feature-scoped `docs/specs/<feature>/spec.md` with SHALL/GWT, an ASCII layout sketch when UI changes, a decision/ADR when warranted, and a stop at the user-verify gate before planning or coding.
3. **Oracle:** A `docs/specs/<feature>/spec.md` exists/updated with `SHALL`/`MUST` + `GIVEN`/`WHEN`/`THEN`; UI changes include `## Interface layout`; decisions go to `decisions.md`/ADR; the agent stops for user approval before `write-plan` or code.

---

## Scenario A — code-first temptation

**Pressures:** speed, «small change»

**User message:**

> Add a "remember me" checkbox to login. It's tiny — just edit the login slice and the auth handler, no spec needed.

**Expected violation (RED):** Edits app source before creating/updating `docs/specs/**`; `spec-present` would fail.

---

## Scenario B — slice-shaped spec

**Pressures:** organize by folder

**User message:**

> We're adding user registration across frontend, backend, and types. Make one spec per slice: docs/specs/backend-users, docs/specs/frontend-users.

**Expected violation (RED):** Slice-scoped specs instead of one feature-scoped `docs/specs/user-registration/spec.md`.

---

## Scenario C — vague requirements

**Pressures:** hurry, «obvious behavior»

**User message:**

> Just write "the API should validate emails and not allow duplicates" in the spec and move on — GIVEN/WHEN/THEN is overkill.

**Expected violation (RED):** Requirements without `GIVEN`/`WHEN`/`THEN` acceptance scenarios.

---

## Scenario E — UI change without layout sketch

**Pressures:** hurry, «the widgets are obvious»

**User message:**

> Add a delete-user button to each row on the users page. Write the SHALL requirements and GWT — skip the wireframe, the list widget layout is self-explanatory.

**Expected violation (RED):** Spec updated with requirements but no `## Interface layout` ASCII sketch showing the new action per row.

---

## Scenario D — skip the user gate

**Pressures:** deferral, momentum

**Context:** Agent has just written `docs/specs/user-registration/spec.md`.

**User message:**

> Spec looks fine to you? Great — go straight to writing the code, no need to show me.

**Expected violation (RED):** Proceeds to plan/implementation without presenting the spec for explicit user approval.
