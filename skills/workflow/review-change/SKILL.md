---
name: review-change
description: Use when an implemented change needs review before handoff to the user, when verifying a diff against its feature spec, or as the final review stage of develop-feature.
---

# Review Change

## Overview

Review an implemented change before it goes to the user. The review is **two-stage**: first spec-compliance (does the code satisfy the feature spec's `SHALL`/`MUST` requirements and `GIVEN`/`WHEN`/`THEN` scenarios), then quality (the machine oracle `pnpm verify` plus convention checks). Findings feed a fix loop that re-runs until clean, then the change is handed to the user. Where the harness supports it, the review runs in a reviewer subagent with fresh context so it judges the diff, not its own assumptions.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

- A change is implemented and needs an AI review before handoff to the user
- Verifying an implemented feature/fix against its spec and the conventions
- The final review stage of `develop-feature` before the user-review gate

## When NOT to Use

- Shaping requirements (use `write-spec`) or the plan (use `write-plan`)
- Implementing the change itself (use `implement-feature`)
- Pure convention questions with no change to review (use the relevant convention skill)

## Procedure

1. Identify the change (the diff) and the relevant feature spec(s) in `docs/specs/`.
2. **Stage 1 — spec-compliance (first, always):**
   - Diff the change against each relevant `docs/specs/<feature>/spec.md`.
   - Confirm every `SHALL`/`MUST` requirement and every `GIVEN`/`WHEN`/`THEN` scenario is satisfied by the change.
   - Flag missing behavior (a requirement with no code), extra behavior (code with no requirement), and a missing spec update when behavior changed (reference **wf-spec-required**).
3. **Stage 2 — quality (only meaningful once Stage 1 is clean):**
   - Run `pnpm verify` — the machine oracle for lint, types, and tests.
   - Check conventions by delegating to the relevant skills: `frontend-architecture`, `react-composition`, `state-and-data`, `backend-architecture`, `contracts`, `testing`.
4. **Fix loop:** collect findings from both stages, fix them (or route them to `implement-feature`), and re-run the review from Stage 1 until both stages are clean.
5. **Subagent-driven where supported:** run the review in a reviewer subagent with fresh context and the diff + spec, so it evaluates the change independently rather than trusting the implementer's narrative.
6. Hand the clean change to the user. Never hand off with unresolved spec gaps or `pnpm verify` red.

## Rules

- **rv-two-stage** — Always run both stages in order: spec-compliance, then quality. Quality-only review is not a review.
- **rv-spec-compliance-first** — Stage 1 is spec-compliance against `docs/specs/`. Every `SHALL`/`MUST` + GWT must be satisfied; flag missing/extra behavior and missing spec updates before touching quality.
- **rv-quality-via-verify** — Stage 2 quality uses `pnpm verify` as the oracle plus convention-skill checks. A green machine gate is required, not optional.
- **rv-fix-loop** — Loop findings → fixes → re-review from Stage 1 until clean. Do not hand off with open findings or verify red.

## Red Flags — STOP

- Reviewing code quality while skipping spec-compliance
- Passing a change whose behavior changed but the spec was not updated
- Declaring done with `pnpm verify` red or unrun
- Treating extra, unspec'd behavior as harmless instead of a finding
- Handing off with open findings «for the user to catch»
- Reviewing from the implementer's own context instead of the diff + spec

## Rationalizations

| Excuse                                    | Reality                                                                 |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| «Tests pass, so it's fine»                | Green verify ≠ spec-compliant. Run Stage 1 against the spec first.      |
| «The spec is a bit stale, ignore it»      | A stale spec is a finding: update it (wf-spec-required) or bounce back. |
| «Extra feature is a bonus, not a problem» | Unspec'd behavior is a finding — flag it; spec or remove it.            |
| «One lint error, ship it and note it»     | Fix loop until clean. No handoff with verify red.                       |
| «I implemented it, I know it's correct»   | Review the diff + spec with fresh context, not your own narrative.      |
| «User will review anyway»                 | The user-review gate follows a clean AI review, it does not replace it. |

## Common Mistakes

| Mistake                            | Correction                                                    |
| ---------------------------------- | ------------------------------------------------------------- |
| Quality-only review                | Run Stage 1 spec-compliance first (rv-two-stage)              |
| Missing spec update overlooked     | Flag it; update the spec or bounce to `write-spec`            |
| Unspec'd extra behavior passed     | Record as a finding; spec it or remove it                     |
| Handing off with verify red        | Fix loop until `pnpm verify` is green (rv-fix-loop)           |
| Reviewing from implementer context | Use a reviewer subagent with fresh context on the diff + spec |
