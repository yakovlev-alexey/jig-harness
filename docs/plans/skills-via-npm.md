# Plan — Skills via npm

Transient implementation plan for [skills-via-npm spec](../specs/skills-via-npm/spec.md).
Cross-cutting rationale: [ADR 0002](../adr/0002-skills-via-npm-package.md).

**Gate:** Do not implement until this plan is explicitly approved.

**Final verification gate (implement-feature):** `pnpm verify` green in jig-harness;
`pnpm scaffold:verify` passes with skill-link assertions.

---

## Task 1 — Create `@jig-harness/skills` package skeleton

**Satisfies:** R1, R2, R9, R13

Create [packages/skills/](../../packages/skills/) with:

| File                      | Purpose                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| `package.json`            | `name: @jig-harness/skills`; `prepack` → sync; `postinstall` → link; bin `jig-link-skills` |
| `scripts/sync-skills.mjs` | Copy `skills/` → `bundled/`; strip `evals/`; validate manifest ↔ source                    |
| `scripts/link-skills.mjs` | Postinstall/linker entry (shared by bin)                                                   |
| `skills.manifest.json`    | All skills: `{ "name", "tier", "path" }` derived from frontmatter                          |

Implementation notes:

- Resolve monorepo `skills/` via path relative to package (walk up to repo root or use `import.meta.url`).
- `files` field in `package.json`: include `bundled/`, `scripts/`, `skills.manifest.json`.
- Add package to workspace; version `0.0.0` like other harness packages (Changesets fixed group already covers `@jig-harness/*` — confirm no ignore entry needed).

Do **not** commit generated `bundled/` to git; add `bundled/` to `packages/skills/.gitignore` if prepack runs locally during dev.

---

## Task 2 — Implement sync-skills.mjs

**Satisfies:** R1, R2

- Walk repo-root `skills/workflow/` and `skills/convention/` for `SKILL.md`.
- Parse frontmatter `name:` for manifest entries.
- Copy each skill dir to `bundled/<tier>/<folder>/` excluding `evals/`.
- Fail if manifest ⊄ source or source ⊄ manifest.
- Write/update `skills.manifest.json` if generated at sync time, or maintain hand-curated manifest validated by sync — prefer **generated manifest at sync** to avoid drift (update R2 interpretation: manifest is output of sync, checked into repo OR generated only at prepack; pick generated-at-prepack-only to avoid double SSOT).

**Recommendation:** Generate `skills.manifest.json` during sync; do not hand-edit. CI compares manifest output to committed snapshot OR treats manifest as build artifact only inside tarball. Simplest v1: manifest generated at prepack, not committed; coherence check scans repo skills directly.

---

## Task 3 — Implement link-skills.mjs

**Satisfies:** R3, R7, R8, R9, R10

Behavior per spec R3/R7/R8:

1. Resolve project root: `process.env.INIT_CWD` → fallback walk from `node_modules/@jig-harness/skills`.
2. Exit 0 if `JIG_SKIP_SKILLS_LINK=1`.
3. Load agent roots from `.jig-skills.json` or `JIG_SKILLS_AGENTS` env; default four roots.
4. Read manifest / scan `bundled/` for skills; map by frontmatter `name`.
5. For each `(agentRoot, skillName)`: create `<projectRoot>/<agentRoot>/skills/<skillName>` → relative symlink into `node_modules/@jig-harness/skills/bundled/...`.
6. Safety: skip + warn on non-managed existing paths; no-op on correct existing symlink.
7. Write `.jig-skills-linked.json` with `{ version, links: [...] }`.
8. Windows: use `fs.symlink` with `'junction'` type for directories on `win32`.

Export linker so bin and postinstall share one module.

---

## Task 4 — Unit tests for sync and linker

**Satisfies:** R12

Add in `packages/skills/`:

| File                   | Cases                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `sync-skills.test.mjs` | Copies SKILL.md + references; excludes evals; fails on orphan skill                                                |
| `link-skills.test.mjs` | Creates symlinks; idempotent re-run; skips user dir; respects `JIG_SKIP_SKILLS_LINK`; respects `JIG_SKILLS_AGENTS` |

Use `node:test` + temp directories (same pattern as `@jig-harness/spec-present`).

Wire `"test": "node --test ..."` in package.json; ensure root `pnpm test` reaches it via turbo.

---

## Task 5 — Wire fullstack template

**Satisfies:** R4, R5, R9, R11

Edit [templates/fullstack/package.json](../../templates/fullstack/package.json):

```json
"devDependencies": {
  "@jig-harness/skills": "workspace:*",
  ...
},
"scripts": {
  "skills:link": "jig-link-skills"
}
```

Edit [templates/fullstack/.gitignore](../../templates/fullstack/.gitignore) — add:

```
.cursor/skills
.codex/skills
.claude/skills
.agents/skills
.jig-skills-linked.json
```

Edit [templates/fullstack/AGENTS.md](../../templates/fullstack/AGENTS.md) — add skill-linking paragraph per R11 (after generator section, before verify).

---

## Task 6 — Wire create-app scaffolder

**Satisfies:** R5, R6

Edit [packages/create-app/bin/create-app.js](../../packages/create-app/bin/create-app.js):

- Add `'@jig-harness/skills'` to `HARNESS_PACKAGES` array (line ~21–29).

No separate copy step — postinstall on `pnpm install` handles linking.

---

## Task 7 — Update offline scaffold scripts and README

**Satisfies:** R6, R12

Edit [scripts/scaffold-and-verify.mjs](../../scripts/scaffold-and-verify.mjs):

- Include `@jig-harness/skills` in tarball pack list (align with `HARNESS_PACKAGES`).
- After scaffold install, assert `.cursor/skills/setup-project/SKILL.md` exists and resolves into `@jig-harness/skills`.

Edit [README.md](../../README.md) offline tarball example — add `@jig-harness/skills` to pack loop.

Edit README "Agent skills" section — primary path: npm auto-link on install; secondary: skills.sh for global.

---

## Task 8 — Coherence / manifest check

**Satisfies:** R12

Extend [scripts/coherence-check.mjs](../../scripts/coherence-check.mjs) or [scripts/validate-skills.sh](../../scripts/validate-skills.sh):

- Assert every `skills/**/SKILL.md` frontmatter `name` is unique.
- Optionally assert names referenced in [templates/fullstack/AGENTS.md](../../templates/fullstack/AGENTS.md) exist in repo skills.

---

## Task 9 — Update harness skills and docs

**Satisfies:** R11 (harness-side); supports R5 user experience

| File                                                                                   | Change                                                                                                                                |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| [skills/workflow/setup-project/SKILL.md](../../skills/workflow/setup-project/SKILL.md) | After scaffold step: skills auto-link on install; remove implicit manual `skills add` for project work; add rule **sp-skills-linked** |
| [DESIGN.md](../../DESIGN.md) §5 locked table                                           | Refine "Convention skills" row to dual channel                                                                                        |
| [DESIGN.md](../../DESIGN.md) §6.3                                                      | Document `@jig-harness/skills` npm channel alongside skills.sh                                                                        |
| [DESIGN.md](../../DESIGN.md) §6.1 topology                                             | Add `packages/skills`                                                                                                                 |
| [rules-catalogue.md](../../rules-catalogue.md)                                         | Add row `sp-skills-linked` → guidance: setup-project, capability: `@jig-harness/skills`                                               |
| [docs/adr/README.md](../adr/README.md)                                                 | Index ADR 0002 (done in this docs pass)                                                                                               |

---

## Task 10 — Template dogfood / harness root devDependency (if needed)

**Satisfies:** R5 (in-repo dogfood parity)

Evaluate whether [templates/fullstack](../../templates/fullstack/) dogfood in CI needs `@jig-harness/skills` linked when running template verify in-repo. The template already uses `workspace:*` — after adding the dep, `pnpm install` at harness root should link skills into `templates/fullstack/.cursor/skills/` (gitignored). Confirm template dogfood script tolerates gitignored paths.

If template dogfood runs from harness root without installing template deps separately, no extra work. Verify via existing `template:dogfood` / CI workflow.

---

## Requirement coverage matrix

| Requirement | Task(s)  |
| ----------- | -------- |
| R1          | 1, 2     |
| R2          | 2        |
| R3          | 3        |
| R4          | 5        |
| R5          | 5, 6, 10 |
| R6          | 6, 7     |
| R7          | 3, 4     |
| R8          | 3, 4     |
| R9          | 1, 3, 5  |
| R10         | 3, 4, 7  |
| R11         | 5, 9     |
| R12         | 4, 7, 8  |
| R13         | 1        |

All requirements covered. No orphan tasks.

---

## Out of scope (v1)

- `JIG_SKILLS_COPY=1` copy fallback (document as future if junction insufficient)
- Per-skill opt-out in scaffold
- Global `~/.cursor/skills` sync
- Thin Cursor/Claude adapter rules beyond AGENTS.md

---

## User-verify gate

Present this plan for approval before starting Task 1. After implementation,
run:

```bash
pnpm verify
pnpm scaffold:verify
```

and confirm skill symlinks in the scaffolded temp app.
