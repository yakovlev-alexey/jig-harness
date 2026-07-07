# Plan — validate-skills trigger eval floor (skill QC, cross-cutting)

The shared validator for the R10 trigger-eval floor. This is separate from
[harness-coherence-check](./harness-coherence-check.md): coherence owns rule-ID
catalogue checks; `validate-skills.sh` owns structural and trigger-fixture checks.
Shared gate & verification: [README](./README.md). Traces to skill-testing R10.

## Task A — Enforce trigger case count and near-miss annotation

**Satisfies:** skill-testing R10 · **Effort:** S

Extend [scripts/validate-skills.sh](../../../scripts/validate-skills.sh) so
`validate_evals()` checks each `evals/trigger_evals.json` has:

- at least 10 total cases;
- at least one positive and one negative case;
- at least 4 negative near-miss cases;
- each near-miss negative has `near_miss_of` as a non-empty string naming an existing
  skill under `skills/`;
- no positive case carries `near_miss_of`.

Keep the existing `{ query: string, should_trigger: boolean }` schema requirement.
Extra fields remain allowed so older eval tooling that only reads those two fields keeps
working.

## Task B — Add RED/GREEN validator fixtures

**Satisfies:** skill-testing R10 · **Effort:** S

Add a small fixture test or script-level check proving validation fails when:

- the file has fewer than 10 cases;
- it has fewer than 4 annotated near-miss negatives;
- `near_miss_of` names no installed sibling skill;
- a positive case carries `near_miss_of`.

Also prove a 10-case file with 4 correctly annotated near-miss negatives passes.

## Coverage

A→R10, B→R10. No orphan tasks.
