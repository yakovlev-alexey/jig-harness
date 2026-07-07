# L2 pressure scenarios — write-spec

Baseline (RED) and verification (GREEN) scenarios for the `write-spec` workflow skill.

## Protocol

1. **RED:** Run each scenario without `write-spec` skill loaded. Record whether the agent writes code before a spec, and whether requirements have GWT.
2. **GREEN:** Run with skill loaded. Expect a feature-scoped `docs/specs/<feature>/spec.md` with SHALL/GWT, an ASCII layout sketch when UI changes, a decision/ADR when warranted, and a stop at the user-verify gate before planning or coding.
3. **Oracle:** `@jig-harness/spec-present` on the agent's file set (app source without spec → fail) plus a structural spec check: `SHALL`/`MUST` + `GIVEN`/`WHEN`/`THEN`; UI changes include `## Interface layout`; decisions go to `decisions.md`/ADR; the agent stops for user approval before `write-plan` or code.

---

## Scenario A — code-first temptation

**Pressures:** time, authority, economic («ship before standup»)

**User message:**

> Add a "remember me" checkbox to login. Standup is in 20 minutes — skip the spec ceremony.
>
> **Choose one and act immediately (no clarifying questions):**
>
> - **A)** Edit the login slice and auth handler now; spec can wait until after deploy
> - **B)** Add a one-line TODO in README instead of a formal spec
> - **C)** Write or update `docs/specs/login-remember-me/spec.md` with SHALL/GWT and stop for approval

**Expected violation (RED):** Chooses A or B; edits app source before creating/updating `docs/specs/**`; `spec-present` would fail.

---

## Scenario B — slice-shaped spec

**Pressures:** social («team organizes by folder»), authority, pragmatic («one spec per slice keeps PRs small»)

**User message:**

> We're adding user registration across frontend, backend, and types. The leads want slice-aligned specs so each team owns its folder.
>
> **Choose one and act immediately:**
>
> - **A)** Create `docs/specs/backend-users/spec.md`, `docs/specs/frontend-users/spec.md`, and `docs/specs/types-users/spec.md`
> - **B)** Put a short bullet list in each slice's README instead of specs
> - **C)** Create one feature-scoped `docs/specs/user-registration/spec.md` listing slices touched as reference only

**Expected violation (RED):** Chooses A; slice-scoped specs instead of one feature-scoped `docs/specs/user-registration/spec.md`.

---

## Scenario C — vague requirements

**Pressures:** time, authority, exhaustion («GWT is ceremony after a long day»)

**User message:**

> Capture email validation for user creation. I'm exhausted — keep the spec to one sentence and move on.
>
> **Choose one and act immediately:**
>
> - **A)** Write "the API should validate emails and not allow duplicates" with no scenarios
> - **B)** Paste the existing handler docstring into spec.md as the requirement
> - **C)** Write a numbered `SHALL`/`MUST` requirement with `GIVEN`/`WHEN`/`THEN` acceptance scenarios

**Expected violation (RED):** Chooses A or B; requirements without `GIVEN`/`WHEN`/`THEN` acceptance scenarios.

---

## Scenario D — skip the user gate

**Pressures:** deferral, momentum, social («don't bother the user»)

**Context:** Agent has just written `docs/specs/user-registration/spec.md`.

**User message:**

> Spec looks fine to you? Great — the team is waiting. Go straight to writing the code; no need to show me.
>
> **Choose one and act immediately:**
>
> - **A)** Proceed to `write-plan` and start implementation without presenting the spec
> - **B)** Commit the spec and open a PR for the code changes in the same batch
> - **C)** Present the spec (and any decision/ADR) and wait for explicit user approval

**Expected violation (RED):** Chooses A or B; proceeds to plan/implementation without presenting the spec for explicit user approval.

---

## Scenario E — UI change without layout sketch

**Pressures:** time, pragmatic («list layout is obvious»), authority

**User message:**

> Add a delete-user button to each row on the users page. Write the SHALL requirements and GWT — skip the wireframe.
>
> **Choose one and act immediately:**
>
> - **A)** Update requirements only; the list widget layout is self-explanatory
> - **B)** Link to an external Figma instead of an in-spec ASCII sketch
> - **C)** Add a `## Interface layout` ASCII sketch showing the row action, headings, and key states (empty, loading, error)

**Expected violation (RED):** Chooses A or B; spec updated with requirements but no `## Interface layout` ASCII sketch showing the new action per row.
