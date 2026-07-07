# Plan — backend-architecture (skill QC)

Skill: [skills/convention/backend-architecture](../../../skills/convention/backend-architecture/SKILL.md).
Type: pattern · encoded-preference · model-invoked. Shared gate & verification:
[README](./README.md). Traces to skill-testing R9, R10.

## Task A — Add an L2 application eval (lint oracle)

**Satisfies:** skill-testing R9 · **Effort:** M

Add `evals/l2-<date>.md` with an application case graded by the enforced custom rules:

- "Add a `create-user` usecase that checks for duplicate emails before insert." →
  oracle: read via a query, write via a command, composed in the usecase (no command↔
  query import → `be-no-command-query-cross-calls`); domain has no I/O
  (`be-domain-no-io`); endpoint → usecase → command/query flow (`be-layer-flow`);
  kebab-case files. Run the rules on the produced files.

Grade `with_skill` vs `without_skill`.

## Task B — Grow trigger set to the near-miss floor

**Satisfies:** skill-testing R10 · **Effort:** S

`trigger_evals.json` is 6 (4+/2−). Grow to ≥10 with ≥4 near-miss negatives — boundary
against `contracts` (shared Zod), `state-and-data` (frontend), and `testing` (backend
integration) — plus positive variation.

## Coverage

A→R9, B→R10. No orphan tasks.
