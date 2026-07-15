# Plan — react-composition skill QC

Skill: `skills/convention/react-composition`. Execute after the foundation PR using the
[shared protocol](./README.md). This plan edits `SKILL.md`, so the pre-change observation
gate is mandatory. No generator applies to eval assets.

## Task A — Finish trigger and application definitions

**Satisfies:** skill-testing R2, R9, R10, R13 · **Effort:** M

Convert `evals/trigger_evals.json` to the exact v1 matrix below. Preserve the first six
queries byte-for-byte. Twelve cases are intentional: the two existing negatives route
to their actual owners, while four added negatives exercise the originally identified
composition boundaries.

```json
{
  "schema_version": 1,
  "cases": [
    {
      "id": "landing-widget-task",
      "query": "Add a widget to the landing page slice",
      "should_trigger": true,
      "positive_form": "terse"
    },
    {
      "id": "page-imports-page",
      "query": "Should this page import another page component?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "widget-colocated-css",
      "query": "Where does colocated CSS go for a widget?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "widget-imports-widget",
      "query": "Can one widget import another widget?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "near-miss-backend-slice-layout",
      "query": "Organize backend Fastify slice folders",
      "should_trigger": false,
      "near_miss_of": "backend-architecture"
    },
    {
      "id": "near-miss-project-scaffold",
      "query": "Scaffold a new monorepo with create-app",
      "should_trigger": false,
      "near_miss_of": "setup-project"
    },
    {
      "id": "widget-composition-terse",
      "query": "Widget composition?",
      "should_trigger": true,
      "positive_form": "terse"
    },
    {
      "id": "buried-dashboard-composition",
      "query": "I'm extending the dashboard; before coding, decide page-owned layout, widget boundaries, and colocated CSS.",
      "should_trigger": true,
      "positive_form": "task_buried"
    },
    {
      "id": "near-miss-frontend-barrel",
      "query": "Can I add an index.ts barrel for this frontend slice?",
      "should_trigger": false,
      "near_miss_of": "frontend-architecture"
    },
    {
      "id": "near-miss-widget-cache-invalidation",
      "query": "How should this widget invalidate the users query after a mutation?",
      "should_trigger": false,
      "near_miss_of": "state-and-data"
    },
    {
      "id": "near-miss-widget-integration-test",
      "query": "Should this widget integration test use Playwright with MSW or React Testing Library?",
      "should_trigger": false,
      "near_miss_of": "testing"
    },
    {
      "id": "near-miss-implement-approved-widget",
      "query": "Implement the approved account-widget plan now.",
      "should_trigger": false,
      "near_miss_of": "implement-frontend"
    }
  ]
}
```

Keep the current `SKILL.md` description unchanged; its page/widget/component trigger
list is already procedure-free. Rewrite `evals/README.md` to the shared template and
state twelve trigger cases.

Create `evals/evals.json` with this exact definition:

```json
{
  "schema_version": 1,
  "cases": [
    {
      "id": "cross-widget-presentational-reuse",
      "kind": "application",
      "prompt": "The seeded AccountSummaryWidget directly imports RecentOrdersWidget. Refactor the dashboard so the route owns composition and layout, each widget entry remains independent, and all route/widget styling stays colocated with BEM classes. Make the changes in the workspace.",
      "variants": ["without_skill", "with_skill"],
      "workspace": {
        "kind": "fixture_copy",
        "source": "fixtures/cross-widget-presentational-reuse/"
      },
      "oracle": {
        "type": "command",
        "ref": "oracles/cross-widget-presentational-reuse.mjs"
      }
    }
  ]
}
```

Create the exact support tree:

```text
evals/
├── fixtures/cross-widget-presentational-reuse/
│   └── apps/frontend/src/
│       ├── routes/
│       │   ├── dashboard.tsx
│       │   └── dashboard.css
│       └── slices/dashboard/widgets/
│           ├── account-summary/
│           │   ├── account-summary.widget.tsx
│           │   └── account-summary.css
│           └── recent-orders/
│               ├── recent-orders.widget.tsx
│               └── recent-orders.css
└── oracles/cross-widget-presentational-reuse.mjs
```

Seed `dashboard.tsx` as a TanStack route that renders only `AccountSummaryWidget`;
seed `account-summary.widget.tsx` with the violation — a direct concrete import and
render of `RecentOrdersWidget`; seed both widget CSS files and `dashboard.css` with one
valid BEM block each, but omit the corresponding CSS imports so the child must repair
ownership. The oracle must require `dashboard.tsx` to import and render both concrete
`.widget.tsx` entries and `./dashboard.css`; require each widget entry to import only
its colocated CSS; reject every widget-entry-to-widget-entry import and every
page-to-page import; require `.widget.tsx` suffixes and named exports; require route
layout classes in `dashboard.css`, widget-owned classes in the matching widget CSS,
and BEM names; reject `index.ts`/`index.tsx`, Tailwind, and global slice-specific CSS.
The runner-side command oracle emits stable evidence for every check and the workspace
input hash; the scenario child never grades itself.

## Task B — Observe, then repair the owned-rule declaration

**Satisfies:** skill-testing R9, R11, R14 · **Effort:** M

Before editing `SKILL.md`, run the affected application case with and without the current
skill in campaign `skill-qc-react-composition-prechange`; record the actual result.

Then remove the local owned ID `rc-components-are-presentational` from `SKILL.md` and
retain the explicit borrowed reference to `state-and-data` /
`sd-no-store-in-presentational`. Do not add a duplicate catalogue row. Commit the
complete post-edit subject — `SKILL.md`, definitions, fixture, oracle, and README — as a
clean final-subject checkpoint. Immediately run
`cross-widget-presentational-reuse/without_skill` and
`cross-widget-presentational-reuse/with_skill` as the first two scenario invocations of
campaign `skill-qc-react-composition-v1`; this is the post-edit pair, not an extension of
the pre-change campaign. Preserve the observed result and never relabel saturation as
failure.

## Task C — Run and audit the current campaign

**Satisfies:** skill-testing R9, R13, R14 · **Effort:** M

Continue `skill-qc-react-composition-v1` by running the twelve trigger cases separately.
Do not rerun either application variant already recorded by Task B. Generate the report
from the one existing post-edit pair plus the trigger runs. Generate current-hash runs,
canary, report, workspace metadata, and patch, pass provenance audit, and commit them only
through shared Step 4 after all checks pass.

## Task D — Remove exact debt and verify

**Satisfies:** skill-testing R1, R11, R15 · **Effort:** S

Delete only resolved `convention/react-composition` tuples and run the shared checks plus
`pnpm verify`.

## Coverage

A→R2/R9/R10/R13, B→R9/R11/R14, C→R9/R13/R14, D→R1/R11/R15.
