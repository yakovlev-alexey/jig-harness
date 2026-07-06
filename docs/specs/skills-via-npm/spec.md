# Skills via npm

## Purpose

Scaffolded jig apps SHALL ship harness agent skills automatically on `pnpm install`,
version-locked with other `@jig-harness/*` packages, without committing skill files
into the project repository.

## Slices touched

Reference only — no spec↔slice mapping is enforced.

- `packages/skills/` — new npm package `@jig-harness/skills` (sync, link, manifest)
- `packages/create-app/bin/create-app.js` — pin `@jig-harness/skills` like other harness packages
- `templates/fullstack/package.json` — devDependency on `@jig-harness/skills`
- `templates/fullstack/.gitignore` — gitignore linked agent skill directories
- `templates/fullstack/AGENTS.md` — document project-local skill linking
- `scripts/scaffold-and-verify.mjs` — integration assertion after scaffold
- `scripts/coherence-check.mjs` (or `validate-skills.sh` extension) — manifest ↔ repo skills coherence
- `skills/workflow/setup-project/SKILL.md` — procedure update (no manual `skills add` for project work)
- `README.md`, `DESIGN.md`, `rules-catalogue.md` — distribution docs and rule crosswalk

## Requirements

### R1 — Harness skills SHALL ship as `@jig-harness/skills`

The harness MUST publish an npm package named `@jig-harness/skills` that bundles
every workflow and convention skill from the repo-root `skills/` tree. Each bundled
skill MUST include `SKILL.md` and any `references/` subdirectory. Bundled skills
MUST NOT include `evals/` or other harness-only CI artifacts.

#### Scenario: package contains all agent-facing skill content

- **GIVEN** the harness repo has skills under `skills/workflow/` and `skills/convention/`
- **WHEN** `@jig-harness/skills` is packed for publish
- **THEN** the tarball contains `bundled/<tier>/<skill>/SKILL.md` for every skill
- **THEN** the tarball contains `references/` files where they exist in the source skill
- **THEN** the tarball does not contain any `evals/` directory

### R2 — Source skills SHALL sync from repo SSOT at pack time

The package MUST copy skills from the monorepo-root `skills/` directory into
`packages/skills/bundled/` during `prepack`. Sync MUST **generate**
`skills.manifest.json` from the source tree as a build artifact included in the
npm tarball; the manifest is not committed to git. Sync MUST fail if duplicate
skill names exist or if the source tree contains zero skills.

#### Scenario: prepack sync generates manifest and bundled tree

- **GIVEN** skills exist under `skills/workflow/` and `skills/convention/`
- **WHEN** `pnpm pack` runs on `@jig-harness/skills`
- **THEN** `bundled/` is populated from `skills/` before the tarball is created
- **THEN** `skills.manifest.json` is generated with one entry per discovered skill

#### Scenario: prepack fails on duplicate skill names

- **GIVEN** two skills under `skills/` share the same frontmatter `name:`
- **WHEN** prepack sync runs
- **THEN** the sync script exits non-zero with a clear error

### R3 — Postinstall SHALL link skills into project-local agent directories

When `@jig-harness/skills` is installed in a project, its `postinstall` script
MUST create directory symlinks (or platform-equivalent links) from each bundled
skill into flat, skill-name-keyed paths under these default agent roots relative
to the project root:

- `.cursor/skills/<name>/`
- `.codex/skills/<name>/`
- `.claude/skills/<name>/`
- `.agents/skills/<name>/`

Each link target MUST resolve to the corresponding directory inside
`node_modules/@jig-harness/skills/bundled/`. Skill `<name>` MUST come from the
skill's `name:` frontmatter field in `SKILL.md`, not from the source folder path.

#### Scenario: scaffold install creates Cursor skill link

- **GIVEN** a freshly scaffolded app with `@jig-harness/skills` installed
- **WHEN** `pnpm install` completes
- **THEN** `.cursor/skills/setup-project/SKILL.md` exists
- **THEN** the resolved path of `.cursor/skills/setup-project` is inside
  `node_modules/@jig-harness/skills/bundled/`

#### Scenario: all manifest skills are linked for each default agent root

- **GIVEN** `skills.manifest.json` lists N skills
- **WHEN** postinstall runs with default agent configuration
- **THEN** each of the four default agent roots contains N skill directories
- **THEN** each directory contains a readable `SKILL.md`

### R4 — Linked agent skill directories SHALL be gitignored in the template

The fullstack template MUST gitignore project-local skill link targets and the
linker state file so skill symlinks are never committed.

#### Scenario: template gitignore excludes linked paths

- **GIVEN** the fullstack template `.gitignore`
- **WHEN** a developer inspects it
- **THEN** it ignores `.cursor/skills`, `.codex/skills`, `.claude/skills`,
  `.agents/skills`, and `.jig-skills-linked.json`

### R5 — Scaffolded apps SHALL depend on `@jig-harness/skills`

The fullstack template MUST declare `@jig-harness/skills` as a devDependency.
Running `pnpm create @jig-harness/app` followed by the default install MUST result
in a project that has `@jig-harness/skills` installed and skills linked per R3.

#### Scenario: create-app produces a skill-ready project

- **GIVEN** a clean parent directory
- **WHEN** `pnpm create @jig-harness/app my-app` completes (default install, no `--skip-install`)
- **THEN** `my-app/package.json` lists `@jig-harness/skills` in devDependencies
- **THEN** R3 holds for `my-app`

### R6 — create-app SHALL pin `@jig-harness/skills` like other harness packages

The create-app scaffolder MUST include `@jig-harness/skills` in its harness package
list so `workspace:*` is rewritten to a published version (or a local tarball in
offline mode) consistently with `@jig-harness/generators`, `@jig-harness/spec-present`,
and the other harness packages.

#### Scenario: offline scaffold pins skills tarball

- **GIVEN** local harness tarballs including `@jig-harness/skills`
- **WHEN** create-app runs with `--tarballs-dir`
- **THEN** the scaffolded root `package.json` contains a `pnpm.overrides` entry
  for `@jig-harness/skills` pointing at the local tarball

### R7 — Linker MUST be safe and idempotent

The postinstall linker MUST:

- Skip entirely when `JIG_SKIP_SKILLS_LINK=1`
- Treat an existing symlink that already points at the managed bundled path as a no-op
- Warn and skip (never overwrite) when a target path exists and is not a managed symlink
- Record managed links in `.jig-skills-linked.json` at the project root for upgrade/re-link

#### Scenario: user-owned skill is preserved

- **GIVEN** `.cursor/skills/setup-project/` exists as a regular directory with user content
- **WHEN** postinstall runs
- **THEN** the user directory is unchanged
- **THEN** a warning is emitted identifying the skipped path

#### Scenario: re-install is idempotent

- **GIVEN** postinstall has already linked all skills
- **WHEN** `pnpm install` runs again without harness version change
- **THEN** all managed symlinks remain valid
- **THEN** no user-owned paths are modified

### R8 — Agent roots SHALL be configurable

Projects MAY override default agent roots via `.jig-skills.json` at the project
root (`{ "agents": [".cursor", ".codex", ...] }`) or via the `JIG_SKILLS_AGENTS`
environment variable (comma-separated list). When set, the linker MUST only create
links under the configured roots. Agent roots MUST be relative paths that resolve
inside `projectRoot`; absolute paths and roots that normalize outside the project
MUST be rejected.

#### Scenario: env override limits linking

- **GIVEN** `JIG_SKILLS_AGENTS=.cursor`
- **WHEN** postinstall runs
- **THEN** links exist under `.cursor/skills/` only
- **THEN** no links are created under `.codex/skills/`, `.claude/skills/`, or `.agents/skills/`

#### Scenario: traversal agent root is rejected

- **GIVEN** `.jig-skills.json` contains `{ "agents": ["../outside"] }`
- **WHEN** the linker runs
- **THEN** linking fails with a clear error
- **THEN** no symlinks are created outside `projectRoot`

### R9 — Projects SHALL be able to re-link skills explicitly

The package MUST expose a bin command (`jig-link-skills`) and the fullstack template
MUST expose `"skills:link": "jig-link-skills"` so developers can re-run linking after
clone or harness upgrade without a full dependency reinstall.

#### Scenario: manual re-link restores symlinks

- **GIVEN** linked skill directories were removed but `node_modules/@jig-harness/skills` is present
- **WHEN** the developer runs `pnpm skills:link` from the project root
- **THEN** R3 holds again

### R10 — Fresh clone SHALL restore links on install

After cloning a scaffolded project (where linked directories are gitignored), running
`pnpm install` MUST re-establish all managed skill links per R3.

#### Scenario: clone and install

- **GIVEN** a scaffolded project committed without `.cursor/skills/`
- **WHEN** a developer clones the repo and runs `pnpm install`
- **THEN** `.cursor/skills/setup-project/SKILL.md` exists and resolves into `node_modules`

### R11 — Template AGENTS.md SHALL document skill linking

The fullstack template `AGENTS.md` MUST state that jig skills are linked on
`pnpm install` by `@jig-harness/skills`, list the default agent directories, note
that they are gitignored, and mention `pnpm skills:link` for re-linking.

#### Scenario: agent guidance is self-contained

- **GIVEN** a scaffolded project with no prior agent configuration
- **WHEN** an agent reads `AGENTS.md`
- **THEN** it can discover where project-local skills live and how they are refreshed

### R12 — Harness CI SHALL verify skill shipping

The harness MUST include automated checks that:

- Unit-test sync and linker behavior in `packages/skills/`
- Assert skill links exist after offline scaffold in `scripts/scaffold-and-verify.mjs`
- Validate repo skills via `validate-skills.sh` (unique names, structure); manifest
  coherence is enforced at pack time by generating the manifest from `skills/`

#### Scenario: scaffold-and-verify proves end-to-end linking

- **GIVEN** CI runs `pnpm scaffold:verify`
- **WHEN** the scaffolded test app is installed
- **THEN** `.cursor/skills/setup-project/SKILL.md` exists in the temp project
- **THEN** the verify job passes

### R13 — Version SHALL track other `@jig-harness/*` packages

`@jig-harness/skills` MUST participate in the Changesets fixed group for
`@jig-harness/*` so its published version matches generators, eslint-config,
create-app, and the rest of the harness packages.

#### Scenario: single harness version line

- **GIVEN** a Changesets version bump for `@jig-harness/generators`
- **WHEN** the release is prepared
- **THEN** `@jig-harness/skills` receives the same version number
