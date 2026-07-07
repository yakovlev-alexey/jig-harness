---
name: develop-feature
description: Use when asked to build or ship a feature or fix end to end ("build X", "ship Y"), or to take a change from intent to reviewed result, and no single phase is named.
---

# Develop Feature

## Overview

Thin orchestrator for the spec-driven spine. Chains the four phases — `write-spec`, `write-plan`, `implement-feature`, `review-change` — with user-verify gates between them. Handles both features and fixes. It owns the sequence and the gates; it does **not** re-implement any phase logic itself.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

- User asks to build/ship a feature or fix end to end ("build X", "ship Y")
- No single phase is named — the whole loop from intent to reviewed change is needed
- Coordinating the spec → plan → implement → review flow with its gates

## When NOT to Use

- User names a single phase (use that phase skill directly: `write-spec`, `write-plan`, `implement-feature`, `review-change`)
- Bootstrapping a new monorepo (use `setup-project`)
- Pure convention/format questions (use the relevant convention skill)

## Procedure

1. **write-spec** → capture the durable **what** in `docs/specs/<feature>/spec.md`. **User-verify gate:** get explicit approval before planning.
2. **write-plan** → turn the approved spec into `docs/plans/<name>.md` with traced tasks. **User-verify gate:** get explicit approval before implementing.
3. **implement-feature** → execute the approved plan (single-agent or subagent-per-task) and run `pnpm verify`.
4. **review-change** → two-stage review (spec-compliance, then quality) → fix loop until clean → hand to the user.

At every step, dispatch to the phase skill. Do not inline its logic. If a later phase reveals an earlier artifact is wrong, bounce back to the owning phase and re-clear its gate.

## Rules

- **df-chain-phases** — Run the phases in order: `write-spec` → `write-plan` → `implement-feature` → `review-change`. Do not skip or reorder.
- **df-respect-gates** — Honor the user-verify gates after `write-spec` and `write-plan`, and the user-review handoff after `review-change`. Do not proceed past a gate without explicit approval.
- **df-delegate** — Dispatch to the phase skills; never inline spec-writing, planning, implementation, or review logic in this orchestrator.

## Red Flags — STOP

- Writing code without first clearing the spec and plan gates
- Skipping or reordering phases ("just implement it")
- Inlining a phase's logic here instead of dispatching to its skill
- Passing a user-verify gate without explicit approval

## Rationalizations

| Excuse                                  | Reality                                                      |
| --------------------------------------- | ------------------------------------------------------------ |
| «It's small, skip the spec/plan phases» | The spine applies to every change; run the phases and gates. |
| «I'll just build it here to save a hop» | This skill delegates. Dispatch to `implement-feature`.       |
| «Gates slow us down»                    | Gates are the workflow's contract with the user. Honor them. |
| «Combine plan and implement in one go»  | Each phase has its own gate/oracle. Keep them discrete.      |

## Common Mistakes

| Mistake                         | Correction                                                 |
| ------------------------------- | ---------------------------------------------------------- |
| Skipping spec/plan for speed    | Run all four phases in order (df-chain-phases)             |
| Inlining phase logic here       | Dispatch to the phase skill (df-delegate)                  |
| Proceeding past a gate silently | Get explicit user approval at each gate (df-respect-gates) |
