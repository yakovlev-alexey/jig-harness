# Plan — validate-skills L0 entrypoint (foundation PR)

Companion to [harness-eval-contract](./harness-eval-contract.md). This plan preserves
the existing Bash frontmatter and agentskills.io checks while moving versioned eval
validation into importable Node modules. No generator applies.

## Task A — Delegate eval validation to the shared Node entrypoint

**Satisfies:** skill-testing R1, R2, R10, R13 · **Effort:** S

Edit `scripts/validate-skills.sh`:

- retain the `SKILL.md` existence, frontmatter, line-limit, `Use when` prefix,
  unique-name, and optional agentskills.io checks;
- remove the inline `node -e` parser that expects a root array;
- after structural skill discovery, invoke `node scripts/validate-skill-evals.mjs`
  exactly once for the repository and propagate its exit status;
- use `rg`/Node directory traversal in new code instead of adding more `find`/`grep`
  parsing;
- keep diagnostics emitted by the Node validator intact rather than collapsing them
  into a generic `invalid trigger_evals.json` message.

The Node validator is implemented in the contract plan; both plans land atomically so
the shell script never references a missing entrypoint.

## Task B — Cover shell-to-Node behavior hermetically

**Satisfies:** skill-testing R1, R2, R10, R15 · **Effort:** S

Create `scripts/skill-qc/tests/cli.test.mjs` with shell-entrypoint cases. Create temporary
repositories inside the test and set `SKILLS_REF_VALIDATE=0`; do not read real
`skills/` fixtures. Assert the exact diagnostic code and path for:

- missing `description` frontmatter;
- missing or empty `trigger_evals.json` envelope;
- a valid `schema_version: 1` trigger file delegated to the Node validator;
- multiple eval diagnostics preserved in stable sorted order.

The test MUST assert structured diagnostic fields, not only a non-zero exit status.

## Task C — Verify L0 integration in the foundation PR

**Satisfies:** skill-testing R1, R2, R10, R13, R15 · **Effort:** XS

Run `pnpm run test:skill-validators` and `pnpm run validate-skills`. Confirm current
skill violations match exact waivers and a synthetic unwaived trigger violation exits
non-zero with its stable code.

## Coverage

A→R1/R2/R10/R13, B→R1/R2/R10/R15, C→R1/R2/R10/R13/R15.
