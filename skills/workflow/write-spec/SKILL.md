---
name: write-spec
description: Use when adding a feature, changing behavior, fixing a bug, or starting any change to app source in an existing jig app, and no current spec covers it.
---

# Write Spec

## Overview

Capture the durable **what** of a change in a feature-scoped spec before any code is written. Specs live at `docs/specs/<feature>/spec.md`, are named by intent (not by slice), and hold `SHALL`/`MUST` requirements with `GIVEN`/`WHEN`/`THEN` scenarios. This is the first phase of the spec-driven spine: no plan, no code, until the spec exists and the user approves it.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

- User asks to add a feature, change behavior, fix a bug, or "start" any change to app source
- A change will touch `apps/*/src/**` and no matching `docs/specs/<feature>/spec.md` covers it yet
- An existing feature spec needs updating because its behavior is changing
- A real decision with alternatives comes up while shaping the change

## When NOT to Use

- Turning an approved spec into implementation steps (use `write-plan`)
- Executing an approved plan (use `implement-feature`)
- Reviewing an implemented change (use `review-change`)
- Pure format questions about spec.md / decisions.md / ADR shape (use `specs`)
- Bootstrapping a new monorepo (use `setup-project`)

## Procedure

1. Identify the feature by **intent**, not by slice or folder (e.g. `user-registration`, not `backend-users-slice`). One feature may span many slices.
2. **REQUIRED SUB-SKILL:** Use `specs` for spec.md / decisions.md / ADR format, naming, and the SHALL/GWT rules.
3. Locate the feature spec: read the existing `docs/specs/<feature>/spec.md`, or create the feature folder if the feature is new.
4. Write or update requirements as numbered `SHALL`/`MUST` statements, each with one or more `GIVEN`/`WHEN`/`THEN` acceptance scenarios. List the slices/paths touched as a reader reference (no mapping is enforced).
5. When the change adds or changes UI (pages, widgets, forms, layouts): add a compact **ASCII layout sketch** to the spec showing the intended interface structure — regions, headings, inputs, actions, and key states (empty, loading, error). Place it in a `## Interface layout` section before or alongside the requirements it supports.
6. If a real decision with alternatives/tradeoffs was made: append it to `docs/specs/<feature>/decisions.md` when it only affects this feature, or add a `docs/adr/NNNN-*.md` when it is cross-cutting. Use the content trigger, not a size threshold. Never edit an accepted decision/ADR — supersede it.
7. **STOP at the user-verify gate.** Present the spec (and any decision/ADR) to the user for explicit approval. Do not proceed to `write-plan` or any code until the user approves.

## Rules

- **ws-spec-before-code** — Write or update the feature spec before planning or writing code. Reference **wf-spec-required**: every app-source change must add or update a spec under `docs/specs/**`.
- **ws-feature-scoped** — Name and scope the spec by feature intent, not 1:1 to a slice. Reference **wf-spec-feature-scoped**: a feature may span slices; a slice may host many features.
- **ws-gwt** — Every requirement is a `SHALL`/`MUST` statement with `GIVEN`/`WHEN`/`THEN` scenarios. Reference **wf-spec-gwt**. No vague requirements.
- **ws-ui-layout** — When UI is added or changed, include a compact ASCII layout sketch in the spec (`## Interface layout`). Show structure and key states; the sketch is part of the user-verify gate.
- **ws-decisions-colocated** — Record the **why** in `docs/specs/<feature>/decisions.md` (feature-scoped) or `docs/adr/` (cross-cutting), never duplicated inside spec.md. Reference **wf-decisions-colocated** and **wf-adr-append-only** (supersede, never edit accepted entries).
- **ws-user-gate** — Stop after writing the spec and get explicit user approval before proceeding to `write-plan`. The spec is a shared contract, not a private draft.

## Red Flags — STOP

- Writing code or scaffolding files before the spec exists
- Requirements with no `GIVEN`/`WHEN`/`THEN` — vague "it should work" prose
- UI change with no ASCII layout sketch in the spec
- Editing an already-accepted ADR or decision entry instead of superseding it
- Skipping the user-verify gate and jumping straight to planning or coding
- Duplicating rationale inside spec.md instead of recording it in decisions.md / ADR

## Rationalizations

| Excuse                               | Reality                                                                                  |
| ------------------------------------ | ---------------------------------------------------------------------------------------- |
| «Small change, spec is overkill»     | `spec-present` fails app-source changes with no spec. Update the spec first.             |
| «I'll write the spec after the code» | Spec-after is not spec-driven. The spec is the input to plan and review.                 |
| «One spec per slice keeps it tidy»   | Specs are feature-scoped; features span slices. Name by intent (wf-spec-feature-scoped). |
| «GIVEN/WHEN/THEN is ceremony»        | GWT is the acceptance oracle for `review-change`. No GWT = untestable requirement.       |
| «Just tweak the accepted ADR»        | ADRs are append-only. Supersede with a new entry (wf-adr-append-only).                   |
| «User is in a hurry — skip approval» | The user-verify gate is the point of write-spec. Present and wait.                       |

## Common Mistakes

| Mistake                             | Correction                                                     |
| ----------------------------------- | -------------------------------------------------------------- |
| Coding before any spec exists       | Write/update `docs/specs/<feature>/spec.md` first              |
| Spec named/scoped per slice         | Name by feature intent; list slices touched as reference only  |
| Requirement without GWT scenario    | Add `SHALL`/`MUST` + `GIVEN`/`WHEN`/`THEN`                     |
| UI change without layout sketch     | Add `## Interface layout` ASCII sketch before user-verify gate |
| Rationale pasted into spec.md       | Record it in `decisions.md` or a `docs/adr/` ADR               |
| Proceeding to plan without approval | Stop at the user-verify gate; wait for explicit approval       |
