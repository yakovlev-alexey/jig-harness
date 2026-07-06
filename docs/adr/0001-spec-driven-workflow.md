# 0001. Spec-driven workflow

- Status: Accepted
- Date: 2026-07-06

## Context

The harness shipped its workflow as guidance-only skills. Guidance is easy to
ignore under pressure: agents skip writing down the intended behavior, decisions
get lost in chat history, and nothing durable records what a feature is supposed
to do or why it was built that way. We wanted a durable "what" (specs), a durable
"why" (decisions and ADRs), and a machine gate so the workflow cannot be silently
skipped — without adopting a heavyweight external process.

## Decision

Adopt a native, spec-driven workflow spine:

- A spine of jig skills: `write-spec` → `write-plan` → `implement-feature` →
  `review-change`, plus a thin `develop-feature` orchestrator that chains them.
- Flat, living, **feature-scoped** specs at `docs/specs/<feature>/spec.md`,
  written as `SHALL`/`MUST` requirements with `GIVEN`/`WHEN`/`THEN` acceptance
  scenarios. Specs are edited in place; git is the history. A feature may span
  many code slices — no spec↔slice mapping is enforced.
- Decisions recorded append-only: feature-scoped ones colocated at
  `docs/specs/<feature>/decisions.md`, project-wide ones as `docs/adr/NNNN-*.md`.
- A coarse `spec-present` gate wired into `pnpm verify`/CI: any change under
  `apps/*/src/**` must also touch `docs/specs/**`. It does not map code to a
  feature; whether the _right_ spec changed is left to review.

## Consequences

- Every app-source change carries a spec update, so intended behavior stays
  documented and reviewable.
- Decisions and their alternatives are preserved outside chat history.
- Authors take on light overhead per change; the gate is coarse, so the
  correctness of the spec update depends on `review-change` and user review, not
  the machine.
- The skills integrate with `rules-catalogue.md` and `pnpm verify` instead of a
  separate tool.

## Alternatives considered

- **External spec CLIs (OpenSpec, Spec Kit).** Rejected: they add a dependency
  and their own format/lifecycle, and do not integrate with the jig
  rules-catalogue or `pnpm verify`. We borrow their mental model (specs as truth,
  design/plan/implement/review split) but own the format.
- **Keep guidance-only skills, no gate.** Rejected: the core failure was that
  guidance is skippable; without a machine gate the workflow provides no
  guarantee.
- **Slice-scoped specs with an enforced spec↔slice mapping.** Rejected: features
  routinely span slices and a slice can host many features, so the mapping is
  noise. Specs are feature-scoped and decoupled from folders.
