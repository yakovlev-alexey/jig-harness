# Plan — implement-frontend skill QC

Skill: `skills/workflow/implement-frontend`. Execute after the foundation PR using the
[shared protocol](./README.md). No generator applies to eval assets.

## Task A — Normalize trigger definitions and remove legacy evidence

**Satisfies:** skill-testing R2, R10, R13 · **Effort:** S

Convert `evals/trigger_evals.json` to the v1 envelope. Preserve the first six existing
queries below verbatim and add the final four queries exactly as written:

| ID                                  | Query                                                                                      | Trigger | Positive form / near miss         |
| ----------------------------------- | ------------------------------------------------------------------------------------------ | ------- | --------------------------------- |
| `add-hero-component-formal`         | `Add a hero banner component to the landing slice`                                         | true    | `formal`                          |
| `profile-stats-widget-formal`       | `Create a widget for profile stats in apps/frontend`                                       | true    | `formal`                          |
| `manual-component-task-buried`      | `I'll mkdir the component folder myself — just write the TSX`                              | true    | `task_buried`                     |
| `refactor-layout-css-terse`         | `Refactor landing page layout and colocated CSS`                                           | true    | `terse`                           |
| `greenfield-monorepo`               | `Start a new fullstack TypeScript monorepo`                                                | false   | `near_miss_of: setup-project`     |
| `fastify-health-endpoint`           | `Add a Fastify health check endpoint`                                                      | false   | `near_miss_of: implement-backend` |
| `state-placement-question`          | `Where should TanStack Query cache state and selected entity state live?`                  | false   | `near_miss_of: state-and-data`    |
| `composition-rule-question`         | `Explain the page and widget composition rules without changing code`                      | false   | `near_miss_of: react-composition` |
| `add-route-page-terse`              | `Add a settings page to the existing frontend`                                             | true    | `terse`                           |
| `buried-widget-request-task-buried` | `The API work is done; before handoff, create a billing-summary widget with colocated CSS` | true    | `task_buried`                     |

Each positive gets only `positive_form`; each negative gets only `near_miss_of`.
Review the triggers-only description without changing it unless it violates R10, and
rewrite `evals/README.md` with the shared headings.

Record `evals/pressure-scenarios.md` and
`evals/l2-report-2026-07-04.md` for deletion after Task B captures the scenario intent.
The latter is design-time prose, not live evidence; do not relabel or move it into
`reports/`.

## Task B — Convert frontend pressure definitions before running them

**Satisfies:** skill-testing R3, R12, R13 · **Effort:** M

Create `evals/pressure_tests.json` with `schema_version: 1` and these exact cases. The
user messages are copied verbatim from `pressure-scenarios.md`; the old expected-result
labels are deliberately omitted.

```json
{
  "id": "hand-roll-component",
  "prompt": "Добавь в landing slice простой компонент promo-banner с colocated CSS. Быстрее создай папку руками и напиши TSX — turbo gen не нужен.",
  "pressure_types": ["time", "authority", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/hand-roll-component/" },
  "oracle": { "type": "command", "ref": "oracles/implement-frontend-pressure.mjs" }
}
```

```json
{
  "id": "create-barrel",
  "prompt": "Создай components/cta-button и добавь index.ts который реэкспортит кнопку — так импорты короче.",
  "pressure_types": ["social", "sunk_cost", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/create-barrel/" },
  "oracle": { "type": "command", "ref": "oracles/implement-frontend-pressure.mjs" }
}
```

```json
{
  "id": "widget-cross-import",
  "prompt": "У нас уже есть feature-highlight widget. Новый signup-cta widget должен импортировать FeatureHighlightWidget внутри себя.",
  "pressure_types": ["sunk_cost", "economic", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/widget-cross-import/" },
  "oracle": { "type": "command", "ref": "oracles/implement-frontend-pressure.mjs" }
}
```

```json
{
  "id": "defer-verify",
  "prompt": "Context: The agent has run turbo gen widget successfully in apps/frontend and the generated widget is present in the workspace.\n\nUser message:\nВиджет создан, lint потом — сначала объясни структуру папок.",
  "pressure_types": ["time", "exhaustion", "pragmatic"],
  "variants": ["without_skill", "with_skill"],
  "workspace": { "kind": "fixture_copy", "source": "fixtures/defer-verify/" },
  "oracle": { "type": "command", "ref": "oracles/implement-frontend-pressure.mjs" }
}
```

Create four self-contained synthetic frontend fixtures with this exact tree/content
intent (case-specific files replace `<case-id>`):

```text
fixtures/<case-id>/
├── package.json                     # lint and verify scripts call .eval/check.mjs
├── pnpm-workspace.yaml
├── apps/frontend/package.json
├── apps/frontend/src/routes/index.tsx
├── apps/frontend/src/slices/landing/pages/landing.page.tsx
├── apps/frontend/src/slices/landing/pages/landing.css
├── .eval/check.mjs                  # deterministic structural/lint checks
├── .eval/verify.mjs                 # runs checks, writes verify-success.json on exit 0
└── .eval/expected/                  # generator-shape golden files for this case
```

Add the following case-specific seeds:

- `hand-roll-component`: no `promo-banner` directory initially;
  `.eval/expected/` contains the generated named-export TSX, colocated CSS, and BEM
  class names expected under
  `apps/frontend/src/slices/landing/components/promo-banner/`.
- `create-barrel`: no `cta-button` initially; the golden contains only
  `cta-button.tsx` and `cta-button.css` and explicitly excludes `index.ts` and any
  re-export-only module.
- `widget-cross-import`: seed
  `widgets/feature-highlight/feature-highlight.widget.tsx` and a landing page that can
  compose widgets; the golden adds `signup-cta.widget.tsx` and its UI/CSS files.
- `defer-verify`: seed an already generated `promo-summary` widget and make
  `.eval/verify.mjs` write the success marker only after every frontend check exits
  zero.

Create `oracles/implement-frontend-pressure.mjs` and branch on the exact case ID. In
all cases run the fixture's deterministic frontend check and require exit zero. Add
these exact case checks:

- `hand-roll-component`: final files match the generator golden, use a named export,
  import colocated CSS, use BEM classes, and the raw response names
  `pnpm exec turbo gen component`.
- `create-barrel`: final files match the golden and contain no `index.ts`, wildcard
  export, or re-export-only module anywhere in the touched slice.
- `widget-cross-import`: neither widget entry imports another widget entry; the page
  imports and composes both widgets.
- `defer-verify`: `.eval/verify-success.json` exists, identifies `pnpm verify`, and
  records exit code zero; a child summary alone is not evidence of the run.

Freeze definitions, fixtures, and oracle behavior before any live run, then delete the
legacy pressure file and dated design-time report.

## Task C — Run and audit the current campaign

**Satisfies:** skill-testing R12–R14 · **Effort:** L

Run the ten trigger cases and eight pressure `case × variant` invocations separately
under `skill-qc-implement-frontend-v1` (18 scenario children plus one campaign canary).
Generate runner-owned
current runs, workspaces, patches, canary, and a paired report with actual deltas; pass
the provenance audit; do not commit evidence before Task D and shared Step 4.

## Task D — Remove exact debt and verify

**Satisfies:** skill-testing R1, R15 · **Effort:** S

After the audit, update `evals/README.md` Evidence links, delete only resolved
`workflow/implement-frontend` tuples, and run all shared checks plus `pnpm verify`.
Commit only through shared Step 4 after those checks pass.

## Coverage

A→R2/R10/R13, B→R3/R12/R13, C→R12–R14, D→R1/R15.
