---
name: specs
description: Use when writing or updating a feature spec, spec.md format, SHALL/MUST requirements, GIVEN/WHEN/THEN scenarios, feature decisions.md logs, or choosing between a feature decision and a project-wide ADR.
---

# Specs

## Overview

Specs are feature-scoped, flat, living documents. A spec is the durable **what**: `SHALL`/`MUST` requirements with `GIVEN`/`WHEN`/`THEN` acceptance scenarios. Decisions and ADRs are the durable **why**. Plans are the disposable **how**. Code plus `pnpm verify` is the enforcer.

Specs are decoupled from code slices. One spec describes one feature by intent; that feature may span many slices, and a slice may host many features.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

- Creating or updating a `docs/specs/<feature>/spec.md`
- Writing requirements as `SHALL`/`MUST` with `GIVEN`/`WHEN`/`THEN` scenarios
- Recording a feature decision in `docs/specs/<feature>/decisions.md`
- Deciding between a feature-scoped decision and a project-wide `docs/adr/` ADR
- User asks how specs are named, scoped, or kept in sync with code

## When NOT to Use

- Turning an approved spec into a step-by-step implementation plan (that is the `write-plan` workflow)
- Backend slice layer placement (use `backend-architecture`)
- Frontend slice folder layout (use `frontend-architecture`)
- Shared Zod contract shape (use `contracts`)
- Greenfield stack choice before scaffold (use `project-defaults`)

## Artifact Model

```text
docs/
  specs/<feature>/spec.md       # what this feature does now (SHALL/MUST + GIVEN/WHEN/THEN); may span many slices
  specs/<feature>/decisions.md  # append-only feature decision log
  adr/README.md                 # ADR index
  adr/0000-template.md          # ADR template
  adr/NNNN-*.md                 # cross-cutting decisions
  plans/<name>.md               # transient implementation plan per change
```

Specs = durable "what", decisions/ADRs = durable "why", plans = disposable "how", code + `pnpm verify` = the enforcer.

## Rules

| Rule ID                    | Convention                                                                                                                                                                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **wf-spec-required**       | Every change that modifies app source must add or update at least one spec under `docs/specs/**`. Machine-enforced by the `spec-present` gate.                                                                                                           |
| **wf-spec-feature-scoped** | One spec = one feature. A feature may span multiple slices, and a slice may host multiple features. Specs are named by intent, not by folder. No spec↔slice mapping is enforced or guided; the spec references the slices/paths it touches.              |
| **wf-spec-flat**           | Flat living specs, edited in place. Git is the history. No delta/archive/versioned-copy folders.                                                                                                                                                         |
| **wf-spec-gwt**            | Requirements are written as `SHALL`/`MUST` statements, each with `GIVEN`/`WHEN`/`THEN` acceptance scenarios.                                                                                                                                             |
| **wf-decisions-colocated** | Feature-scoped decisions live in `docs/specs/<feature>/decisions.md` (append-only log). Project-wide / cross-cutting decisions live in `docs/adr/NNNN-*.md`. The trigger is content (a decision with real alternatives/tradeoffs), not a size threshold. |
| **wf-adr-append-only**     | ADRs and the decisions log are append-only. Once a decision is accepted it is immutable; supersede it with a new entry/ADR instead of editing history.                                                                                                   |

## spec.md Structure

Name the feature folder by intent (`docs/specs/user-registration/`, not `docs/specs/backend-users-slice/`). A spec states its purpose, lists numbered `SHALL`/`MUST` requirements, and gives each requirement one or more `GIVEN`/`WHEN`/`THEN` scenarios.

```markdown
# User Registration

## Purpose

Let people create an account with a unique email so they can sign in.

## Slices touched

- apps/backend/src/slices/users
- apps/frontend/src/slices/users
- packages/types/src/slices/users

## Requirements

### R1 — Reject duplicate emails

The system SHALL reject duplicate emails on user creation.

#### Scenario: existing email

- **GIVEN** a user already exists with email `alice@example.com`
- **WHEN** a client POSTs `/users` with email `alice@example.com`
- **THEN** the API responds `409 Conflict` and no second user is created

#### Scenario: new email

- **GIVEN** no user exists with email `bob@example.com`
- **WHEN** a client POSTs `/users` with email `bob@example.com`
- **THEN** the API responds `201 Created` and the user is persisted
```

The `## Slices touched` list is a reference for readers. Nothing checks it, and it does not create a spec↔slice mapping (`wf-spec-feature-scoped`).

## decisions.md Structure

`decisions.md` is an append-only log of feature-scoped decisions. Each entry records the date, the decision, the alternatives considered, and the rationale. Do not rewrite past entries — supersede them (`wf-adr-append-only`).

```markdown
# Decisions — User Registration

## 2026-07-06 — Enforce email uniqueness at the DB layer

**Decision:** Add a unique index on `users.email` and map the constraint error to `409`.

**Alternatives considered:**

- Check-then-insert in the usecase — rejected: racy under concurrency.
- Application-only uniqueness — rejected: no protection against direct writes.

**Rationale:** The DB is the only place that can guarantee uniqueness under concurrent inserts.
```

## Decisions vs ADR

Record the **why** once. Do not duplicate rationale inside `spec.md` — the spec holds the **what**.

- **Feature-scoped decision** → `docs/specs/<feature>/decisions.md`. It only affects this feature.
- **Project-wide / cross-cutting decision** → `docs/adr/NNNN-*.md`. It affects multiple features, the stack, or a convention.

The trigger is **content**, not size: a decision qualifies when it has real alternatives and tradeoffs. A one-line "we named the button Save" is not a decision. Promote a feature decision to an ADR when its consequences reach beyond the feature.

## Common Mistakes

| Mistake                                 | Correction                                                |
| --------------------------------------- | --------------------------------------------------------- |
| Spec organized per slice/folder         | Name specs by feature intent; one feature may span slices |
| Editing an accepted ADR                 | Supersede with a new ADR; ADRs are append-only            |
| Vague requirement without GWT           | Write `SHALL` + `GIVEN`/`WHEN`/`THEN` scenarios           |
| Duplicating a "why" inside spec.md      | Record decisions in `decisions.md` / ADR                  |
| Delta/archive/versioned spec copies     | Edit the living spec in place; git is the history         |
| Feature decision that changes the stack | Promote to a project-wide `docs/adr/` ADR                 |

Full rule ↔ enforcement crosswalk: `rules-catalogue.md` in jig-harness.
