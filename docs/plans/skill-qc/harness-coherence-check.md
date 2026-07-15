# Plan — skill rule-ID coherence (foundation PR)

Implement the exact owned-declaration grammar from skill-testing R11. This is part of
the atomic validator-first foundation PR and uses the shared diagnostic/debt core from
[harness-eval-contract](./harness-eval-contract.md). No generator applies.

## Task A — Extract a deterministic owned-rule parser

**Satisfies:** skill-testing R1, R11, R15 · **Effort:** M

Create `scripts/skill-qc/rule-ownership.mjs` and export pure functions that parse one
`SKILL.md` string. Implement R11 literally:

- scan level-two headings named `Rules` or ending in ` Rules` or ` Defaults`;
- own only IDs in a table's first column;
- own only IDs in a bullet prefix before its first em dash;
- keep an owned prefix owned when text after the em dash says `Reference` or `see`;
- treat a prefix beginning `Reference` or `See` as borrowed;
- scope a `Delegated enforcement` heading until the next same-or-higher heading;
- scope a standalone `Delegated enforcement:` label through the next contiguous list or
  table and end it at the next other block;
- ignore examples, filenames, and rule-like tokens outside declaration sections.

Return owned IDs with source locations; do not print or exit from the parser.

## Task B — Integrate ownership with catalogue coherence

**Satisfies:** skill-testing R1, R11, R15 · **Effort:** S

Refactor `scripts/coherence-check.mjs` so its catalogue parser exposes the guidance
column as well as id and enforcement. Export a pure `collectCoherenceDiagnostics`
function for the aggregate debt command, keep CLI execution behind the direct-entry
guard, and apply only coherence-code waivers in CLI mode. Import the ownership parser and
emit shared diagnostics for:

- `RULE_OWNED_UNCATALOGUED` when no catalogue row exists;
- `RULE_GUIDANCE_MISMATCH` when the row's guidance column does not name the owner skill.

Preserve existing custom-rule ↔ catalogue enforcement checks. CLI rendering and exit
belong in the entrypoint; importable functions return diagnostics.

## Task C — Add grammar and integration fixtures

**Satisfies:** skill-testing R11, R15 · **Effort:** M

Add `scripts/skill-qc/tests/coherence.test.mjs` with temporary skill/catalogue fixtures
covering every branch:

- literal `Rules`, `Stack Defaults`, and `Composition Rules` headings;
- table first-column ownership and borrowed IDs in later columns;
- bullet ownership before an em dash plus a borrowed ID after it;
- a bullet whose prefix starts with `Reference` or `See`;
- heading-scoped and label-scoped delegated blocks and their termination boundaries;
- an uncatalogued ID, a guidance-owner mismatch, and a valid catalogue row;
- rule-like filenames and examples outside declaration sections.

Assert diagnostic code, skill, path, subject, and stable fingerprint.

## Task D — Verify catalogue repairs remain debt-controlled

**Satisfies:** skill-testing R1, R11, R15 · **Effort:** XS

Run `pnpm run test:skill-validators` and `pnpm run coherence`. Current uncatalogued
owned IDs may pass only through exact skill debt entries created by the foundation PR;
the corresponding per-skill PR deletes each entry after repairing `rules-catalogue.md`
or the declaration.

## Coverage

A→R1/R11/R15, B→R1/R11/R15, C→R11/R15, D→R1/R11/R15.
