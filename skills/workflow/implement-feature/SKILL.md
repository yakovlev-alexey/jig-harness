---
name: implement-feature
description: Use when an approved implementation plan exists and its tasks are ready to execute, or the user says "do the plan" / "implement the planned feature".
---

# Implement Feature

## Overview

Execute an approved implementation plan and turn it into working code. This is the third phase of the spine: it presupposes an approved `docs/plans/<name>.md` (which presupposes an approved spec). Implementation stays plan-scoped, uses jig generators and the existing `implement-frontend` / `implement-backend` rails, supports single-agent or subagent-per-task execution, and ends with `pnpm verify` green. If implementation reveals the spec is wrong, it stops and bounces back — it never silently drifts.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

- An approved `docs/plans/<name>.md` exists and its tasks are ready to execute
- User asks to build/implement the planned feature or fix, or to "do the plan"
- Coordinating subagent-per-task execution against a plan

## When NOT to Use

- No approved plan yet (use `write-plan`; if no spec, `write-spec`)
- Only shaping requirements (use `write-spec`) or step breakdown (use `write-plan`)
- Reviewing an already-implemented change (use `review-change`)
- Bootstrapping a new monorepo (use `setup-project`)

## Procedure

1. **Precondition check:** confirm an approved `docs/plans/<name>.md` (and its `docs/specs/<feature>/spec.md`). If missing or unapproved, STOP and bounce to `write-plan` / `write-spec`.
2. Read the plan tasks and their spec-requirement traces. The plan defines the exact scope — nothing more.
3. Execute each task **plan-scoped**. Do not add behavior, endpoints, or UI beyond the plan/spec. If you discover missing scope, stop and revise the spec/plan (via their gates), do not improvise.
4. **REQUIRED SUB-SKILLS / RAILS:** dispatch each task to the right rail — `implement-frontend` for React slices, `implement-backend` for Fastify slices. Use generators, never hand-roll layer/slice folders: `pnpm exec turbo gen <component|widget|page|slice|backend-slice|endpoint|usecase>`.
5. **Execution mode (single or subagent-per-task):**
   - Single-agent: work the tasks in plan order.
   - Subagent-per-task: give each subagent **fresh context** and one specific plan task (with its spec-requirement trace). Model-tier the work — heavier model for ambiguous tasks, lighter for mechanical ones.
6. If implementation shows the spec is wrong or incomplete, STOP and bounce to `write-spec` (re-approve), then re-plan if needed. Do not silently change behavior away from the spec.
7. If behavior changed during implementation, update `docs/specs/<feature>/spec.md` to match (reference **wf-spec-required**; the `spec-present` gate expects a spec change alongside app-source changes).
8. Run `pnpm verify` from the app or monorepo root. Fix every failure before finishing — implementation is incomplete until verify is green.

## Rules

- **imf-plan-scoped** — Implement exactly what the approved plan/spec covers. No scope creep. Discovered scope goes back through `write-spec` / `write-plan`, not into improvised code.
- **imf-use-rails** — Dispatch to `implement-frontend` / `implement-backend` and use `turbo gen`. Never hand-roll slice/layer folders when a generator exists.
- **imf-subagent-fresh-context** — When running subagent-per-task, each subagent gets fresh context plus its specific plan task and spec trace; model-tier by task ambiguity.
- **imf-verify** — Run `pnpm verify` and fix all failures before finishing. No deferral for deadlines or «lint can wait».
- Reference **wf-spec-required** — if behavior changed during implementation, update the spec so code and spec stay in sync.

## Red Flags — STOP

- Implementing endpoints, UI, or behavior not in the approved plan/spec
- Hand-writing slice/layer folders instead of running `turbo gen`
- Changing behavior during implementation without updating the spec
- Improvising "discovered" scope instead of bouncing to `write-spec` / `write-plan`
- Handing subagents stale/shared context instead of fresh context + a specific task
- Declaring done with `pnpm verify` red or unrun

## Rationalizations

| Excuse                                          | Reality                                                                            |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| «While I'm here, I'll add this extra endpoint»  | Scope creep. Bounce to `write-spec`/`write-plan`; keep implementation plan-scoped. |
| «Faster to hand-write the slice than turbo gen» | Generators take seconds and match the enforced shape. Use the rails.               |
| «Behavior changed, I'll update the spec later»  | `spec-present` and review expect the spec to match. Update it now.                 |
| «Subagents can share my context»                | Fresh context per task avoids drift and prompt bleed. Give each its own.           |
| «Spec is wrong, I'll just code the right thing» | Silent drift breaks the contract. Bounce to `write-spec`, re-approve.              |
| «Verify later — the feature works locally»      | Implementation is incomplete until `pnpm verify` is green.                         |

## Common Mistakes

| Mistake                            | Correction                                                               |
| ---------------------------------- | ------------------------------------------------------------------------ |
| Building beyond the plan           | Stay plan-scoped; route new scope through spec/plan gates                |
| Hand-rolled slice/layer folders    | Use `turbo gen` via `implement-frontend` / `implement-backend`           |
| Behavior drift with stale spec     | Update `docs/specs/<feature>/spec.md` (wf-spec-required)                 |
| Subagent with stale/shared context | Give fresh context + one specific plan task (imf-subagent-fresh-context) |
| Finishing with verify red/unrun    | Run `pnpm verify` and fix all failures before finishing                  |
