---
name: write-plan
description: Use when an approved feature spec exists and needs breaking into implementation steps, or the user asks for a task breakdown or "how are we going to build this".
---

# Write Plan

## Overview

Turn an approved feature spec into a transient, step-by-step implementation plan at `docs/plans/<name>.md`. The plan is the disposable **how**: exact files, generators to run, and slices touched, at a level of detail a zero-context implementer (or subagent) can execute. Every task traces back to a spec requirement. Planning is the second phase of the spine — it presupposes an approved spec and stops at a user-verify gate before any code.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

- An approved `docs/specs/<feature>/spec.md` exists and needs breaking into implementation steps
- User asks for a plan, task breakdown, or "how are we going to build this"
- Preparing work for single-agent or subagent-per-task execution

## When NOT to Use

- No approved spec yet, or the spec is still changing (go back to `write-spec`)
- Executing an already-approved plan (use `implement-feature`)
- Reviewing an implemented change (use `review-change`)
- Deciding spec format or requirement wording (use `specs` / `write-spec`)

## Procedure

1. **Precondition check:** confirm an approved `docs/specs/<feature>/spec.md` exists. If it is missing, incomplete, or unapproved, STOP and bounce back to `write-spec`. Do not plan against an imagined spec.
2. Read the spec's numbered `SHALL`/`MUST` requirements and `GIVEN`/`WHEN`/`THEN` scenarios — these are the plan's source of truth.
3. Create `docs/plans/<name>.md`. Name it after the change (e.g. `user-registration.md`), not a slice.
4. Break the work into ordered tasks. For each task, write **zero-context-implementer detail**: exact files to create/edit, which generator to run (`pnpm exec turbo gen <component|widget|page|slice|backend-slice|endpoint|usecase>`), the slices touched, and which convention rails apply (`implement-frontend` / `implement-backend`).
5. **Trace every task to the spec:** each task cites the requirement id(s) it satisfies (e.g. "satisfies R1, R3"). No task may exist without a spec requirement behind it, and no requirement should be left uncovered.
6. Note the final gate: implementation ends with `pnpm verify` green (do not run it here — that is `implement-feature`).
7. **STOP at the user-verify gate.** Present the plan for explicit approval before any implementation begins.

## Rules

- **wp-approved-spec-first** — Never write a plan without an approved `docs/specs/<feature>/spec.md`. Missing or unapproved spec → bounce to `write-spec`. Reference **wf-spec-required**.
- **wp-trace-to-spec** — Each plan task cites the spec requirement(s) it satisfies. Every requirement is covered by at least one task; no task lacks a requirement.
- **wp-zero-context-detail** — Tasks name exact files, generators to run, and slices touched — enough for a fresh agent or subagent to execute without re-deriving intent.
- **wp-user-gate** — Stop after writing the plan and get explicit user approval before proceeding to `implement-feature`.

## Red Flags — STOP

- Writing a plan when no approved spec exists (or the spec is still in flux)
- Tasks with no spec requirement cited — or spec requirements left with no task
- Hand-wavy steps («wire up the backend», «add the UI») a fresh agent could not execute
- Naming the plan after a slice instead of the change
- Skipping the user-verify gate and starting to implement
- Re-deriving or rewriting requirements in the plan instead of citing the spec

## Rationalizations

| Excuse                                       | Reality                                                                    |
| -------------------------------------------- | -------------------------------------------------------------------------- |
| «Spec is basically approved, start planning» | «Basically» is not approved. Bounce to `write-spec` and get the gate.      |
| «I'll figure out the files while coding»     | Vague plans force re-derivation. Name exact files and generators now.      |
| «Traceability is bureaucracy»                | Untraced tasks = scope creep or missed requirements. Cite requirement ids. |
| «Plan and spec overlap — merge them»         | Spec is durable what; plan is disposable how. Keep them separate.          |
| «One big task is simpler»                    | Subagent execution needs discrete, executable tasks. Break it down.        |
| «Skip approval, plan is obvious»             | The user-verify gate is the point. Present the plan and wait.              |

## Common Mistakes

| Mistake                             | Correction                                                          |
| ----------------------------------- | ------------------------------------------------------------------- |
| Planning with no approved spec      | Bounce to `write-spec`; get approval first (wp-approved-spec-first) |
| Task with no requirement cited      | Add the `SHALL`/`MUST` id(s) each task satisfies                    |
| Uncovered spec requirement          | Add a task for it; every requirement needs coverage                 |
| Vague step a fresh agent can't run  | Name exact files, generators, and slices (wp-zero-context-detail)   |
| Implementing straight from the plan | Stop at the user-verify gate; wait for approval                     |
