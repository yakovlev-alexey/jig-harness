# Decisions — Skills via npm

## 2026-07-06 — Flat skill paths in agent directories

**Decision:** Link skills as `<agentRoot>/skills/<name>/` where `<name>` is the
skill frontmatter `name:` field, not the source tier folder (`workflow/` or
`convention/`).

**Alternatives considered:**

- Preserve tier prefix (`.cursor/skills/workflow/setup-project/`) — rejected:
  agent runtimes and `AGENTS.md` refer to skills by flat name; tier paths add
  noise and break parity with skills.sh installs.
- Single shared `.jig/skills/` directory — rejected: agents discover skills in
  vendor-specific project-local paths; a custom root would need per-agent adapters.

**Rationale:** Flat names match how workflow skills dispatch to convention skills
by name and how the template `AGENTS.md` lists them.

## 2026-07-06 — Exclude evals from the npm bundle

**Decision:** The published `@jig-harness/skills` tarball includes `SKILL.md` and
`references/` only; `evals/` stays in the harness repo for L0/L1/L2 CI.

**Alternatives considered:**

- Ship evals for downstream skill testing — rejected: scaffolded apps do not run
  harness skill evals; including them bloats the tarball with no consumer.
- Ship a separate `@jig-harness/skills-evals` package — rejected: YAGNI for v1.

**Rationale:** Agents need guidance content, not harness QA fixtures.

## 2026-07-06 — Symlinks over committed copies

**Decision:** Project-local skills are symlinks (directory junction on Windows)
into `node_modules/@jig-harness/skills/bundled/`, gitignored at the link targets.

**Alternatives considered:**

- Commit copied skills into the scaffolded repo — rejected: drifts from harness
  version, duplicates npm channel, pollutes git history.
- Copy on postinstall instead of symlink — rejected for v1: duplicates disk use
  and stale copies; kept as optional `JIG_SKILLS_COPY=1` fallback for a future
  release if junction proves insufficient.

**Rationale:** Symlinks keep a single versioned source in `node_modules`, refresh
on `pnpm install` after upgrade, and stay out of git.

## 2026-07-06 — Dual distribution channel

**Decision:** Add npm project-local linking as the primary path for scaffolded
apps; keep `pnpm dlx skills add yakovlev-alexey/jig-harness` for global install
and harness contributors.

**Alternatives considered:**

- Replace skills.sh entirely — rejected: global install remains useful for
  working across non-jig repos and for harness development before publish.
- skills.sh-only with better docs — rejected: does not version-lock skills with
  scaffolded app dependencies.

**Rationale:** Scaffolded apps need skills without a separate manual step; global
install remains valid for other workflows. Cross-cutting rationale is recorded in
[ADR 0002](../../adr/0002-skills-via-npm-package.md).
