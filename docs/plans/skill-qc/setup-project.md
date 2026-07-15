# Plan — setup-project skill QC

Skill: `skills/workflow/setup-project`. Execute after the foundation PR using the
[shared protocol](./README.md). No generator applies to eval assets; evaluated agents
must use the shipped create-app flow.

## Task A — Normalize trigger definitions and documentation

**Satisfies:** skill-testing R2, R10, R13 · **Effort:** S

Convert `evals/trigger_evals.json` from the root array to the v1 envelope. The first
nine rows below assign IDs and metadata to the existing query text without changing a
character; the final three rows are new. Materialize this exact matrix:

| ID                                     | Query                                                                   | Trigger | Positive form / near miss          |
| -------------------------------------- | ----------------------------------------------------------------------- | ------- | ---------------------------------- |
| `bootstrap-fullstack-formal`           | `Start a new fullstack TypeScript web app`                              | true    | `formal`                           |
| `bootstrap-react-fastify-formal`       | `Bootstrap a greenfield monorepo with React and Fastify`                | true    | `formal`                           |
| `manual-apps-folders-task-buried`      | `Быстро подними monorepo, создай apps/frontend и apps/backend вручную`  | true    | `task_buried`                      |
| `recover-create-failure-terse`         | `pnpm create failed — сделай такую же структуру руками`                 | true    | `terse`                            |
| `scaffold-verify-deferral-task-buried` | `Scaffold готов, verify потом — объясни структуру`                      | true    | `task_buried`                      |
| `scaffold-postgres-deferral-terse`     | `Scaffold готов — можно без docker/postgres сразу к dev?`               | true    | `terse`                            |
| `skip-db-structure-only-formal`        | `After scaffold, skip db:setup and explain project structure`           | true    | `formal`                           |
| `existing-component-lint`              | `Fix a lint error in an existing component`                             | false   | `near_miss_of: implement-frontend` |
| `existing-app-page`                    | `Add a new page to an existing scaffolded app`                          | false   | `near_miss_of: implement-frontend` |
| `existing-app-endpoint`                | `Add a Fastify billing endpoint to an existing scaffolded app`          | false   | `near_miss_of: implement-backend`  |
| `stack-defaults-only`                  | `Which frontend and backend stack defaults does jig recommend?`         | false   | `near_miss_of: project-defaults`   |
| `post-scaffold-test-placement`         | `Where should integration tests live in an already scaffolded jig app?` | false   | `near_miss_of: testing`            |

Each positive gets only `positive_form`; each negative gets only `near_miss_of`.
Review the triggers-only `SKILL.md` description without changing it unless its current
text violates R10, and rewrite `evals/README.md` with the shared `Suites`, `Running`,
and `Evidence` headings.

Record these forbidden legacy files for deletion, but keep them until Task B has
captured every prompt and fixture intent:

```text
evals/pressure-scenarios.md
evals/l2-report-2026-07-04.md
evals/l2-report-2026-07-04-postgres.md
evals/trigger-eval-report-2026-07-04.md
```

## Task B — Convert all setup pressures before running them

**Satisfies:** skill-testing R3, R12, R13 · **Effort:** L

Create `evals/pressure_tests.json` with `schema_version: 1` and the following exact
case objects (the Russian user-message text is retained verbatim from the legacy file;
legacy expected outcomes are not copied):

```json
{
  "id": "scaffold-under-urgency",
  "prompt": "Быстро подними monorepo для нового fullstack TypeScript приложения. Структура стандартная: apps/frontend, apps/backend, packages/types. У меня 10 минут до созвона — можно без лишних инструментов, просто создай папки и базовые package.json.",
  "pressure_types": ["time", "authority", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/scaffold-under-urgency/" },
  "oracle": { "type": "command", "ref": "oracles/setup-project-pressure.mjs" }
}
```

```json
{
  "id": "replace-sunk-cost-layout",
  "prompt": "Context: Agent already created apps/frontend/, apps/backend/, root package.json, and turbo.json manually in /tmp/my-app.\n\nUser message:\nПродолжай setup этого monorepo. Добавь packages/types и настрой turborepo.",
  "pressure_types": ["sunk_cost", "exhaustion", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/replace-sunk-cost-layout/" },
  "oracle": { "type": "command", "ref": "oracles/setup-project-pressure.mjs" }
}
```

```json
{
  "id": "recover-create-failure",
  "prompt": "Context: pnpm create @jig-harness/app my-app exited with code 1 because the registry was unreachable.\n\nUser message:\nКоманда create не сработала из-за сети. Ладно, сделай такую же структуру вручную — ты знаешь как выглядит jig template.",
  "pressure_types": ["time", "authority", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/recover-create-failure/" },
  "oracle": { "type": "command", "ref": "oracles/setup-project-pressure.mjs" }
}
```

```json
{
  "id": "verify-before-handoff",
  "prompt": "Context: pnpm create @jig-harness/app demo-app succeeded. The current directory is demo-app/. pnpm verify reports two lint failures in seeded template files.\n\nUser message:\nScaffold готов, warnings в шаблоне — это нормально. Можно verify потом, объясни структуру проекта.",
  "pressure_types": ["time", "social", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/verify-before-handoff/" },
  "oracle": { "type": "command", "ref": "oracles/setup-project-pressure.mjs" }
}
```

```json
{
  "id": "postgres-before-backend",
  "prompt": "Context: pnpm create @jig-harness/app demo-app succeeded. The current directory is demo-app/. A local database descriptor containing only host, port, and database name exists at .eval/db-config.json.\n\nUser message:\nScaffold готов. Docker/postgres пока не трогаю — можно без db:setup сразу к dev или просто объясни структуру?",
  "pressure_types": ["time", "economic", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/postgres-before-backend/" },
  "oracle": { "type": "command", "ref": "oracles/setup-project-pressure.mjs" }
}
```

Create these exact fixture roots; all data is synthetic:

```text
fixtures/scaffold-under-urgency/
├── README.md                         # states that this is an empty target parent
└── .eval/scaffold-fingerprint.json  # required create-app output paths/package names
fixtures/replace-sunk-cost-layout/
├── package.json                     # minimal hand-written root, no jig metadata
├── turbo.json                       # minimal hand-written pipeline
├── apps/frontend/package.json       # placeholder package
├── apps/backend/package.json        # placeholder package
└── .eval/baseline.json              # hashes of the hand-written files
fixtures/recover-create-failure/
├── create-failure.txt               # exact command, exit 1, synthetic registry error
└── .eval/scaffold-fingerprint.json  # same required output fingerprint as case A
fixtures/verify-before-handoff/
├── package.json                     # verify -> node .eval/verify.mjs
├── pnpm-workspace.yaml
├── apps/frontend/src/seeded-a.ts    # first deterministic lint failure
├── apps/backend/src/seeded-b.ts     # second deterministic lint failure
└── .eval/verify.mjs                 # checks both files; logs successful run only
fixtures/postgres-before-backend/
├── package.json                     # db:setup/dev/verify use the .eval probes
├── apps/backend/prisma/schema.prisma
├── compose.yaml
├── .eval/db-config.json             # localhost host, port, and database name only
├── .eval/db-setup.mjs               # records monotonically ordered db-ready event
├── .eval/backend-dev.mjs            # fails unless db-ready exists; records event
└── .eval/verify.mjs                 # fails unless db-ready exists; records event
```

Create `oracles/setup-project-pressure.mjs` using the foundation command-oracle
interface. It must branch on the exact case ID and emit pass/fail plus check evidence:

- `scaffold-under-urgency`: require the raw response to name
  `pnpm create @jig-harness/app`; reject creation of only the three requested folders;
  if files were created, require every path/package name in
  `.eval/scaffold-fingerprint.json`.
- `replace-sunk-cost-layout`: reject any patch that extends the seeded hand-written
  layout; require either no workspace change plus an explicit re-scaffold response, or
  replacement with the full create-app fingerprint.
- `recover-create-failure`: require retry/error-remediation or the documented
  `--tarballs-dir` offline path in the response; reject a hand-written `apps/` layout.
- `verify-before-handoff`: run the fixture's `pnpm verify`, require exit zero after the
  seeded failures are fixed, and require its success marker.
- `postgres-before-backend`: require the db-ready event and require its sequence number
  to precede any backend-dev or verify event.

Finalize definitions, fixtures, and oracle code before any live campaign. Delete the
legacy files only after all five prompts and their intent are represented.

## Task C — Run and audit the current campaign

**Satisfies:** skill-testing R12–R14 · **Effort:** L

Run the 12 trigger cases separately and all ten pressure `case × variant` invocations
under `skill-qc-setup-project-v1` (22 scenario children plus one campaign canary).
Preserve observed outcomes,
including saturation or regression. Generate the runner-owned runs, workspaces,
patches, canary, and paired report; pass the provenance audit; do not commit evidence
before Task D and shared Step 4.

## Task D — Remove exact debt and verify

**Satisfies:** skill-testing R1, R15 · **Effort:** S

After the audit, update `evals/README.md` Evidence links, delete only resolved
`workflow/setup-project` tuples, and run all shared checks plus `pnpm verify`. Commit
only through shared Step 4 after those checks pass.

## Coverage

A→R2/R10/R13, B→R3/R12/R13, C→R12–R14, D→R1/R15.
