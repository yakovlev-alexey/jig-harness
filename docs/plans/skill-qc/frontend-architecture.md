# Plan — frontend-architecture skill QC

Skill: `skills/convention/frontend-architecture`. Execute after the foundation PR using
the [shared protocol](./README.md). No generator applies to eval assets.

## Task A — Normalize trigger definitions and documentation

**Satisfies:** skill-testing R2, R10, R13 · **Effort:** S

Convert `evals/trigger_evals.json` to the following exact v1 matrix. The first six
queries remain byte-for-byte equal to the current array; the final four are new:

```json
{
  "schema_version": 1,
  "cases": [
    {
      "id": "react-component-placement",
      "query": "Where should I put a new React component in this app?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "slice-barrel-question",
      "query": "Can I add an index.ts barrel for this slice?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "allowed-slice-segments",
      "query": "What slice segments are allowed under src/slices?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "helper-common-or-slice",
      "query": "Should this helper live in common/ or the slice?",
      "should_trigger": true,
      "positive_form": "formal"
    },
    {
      "id": "near-miss-fastify-validation",
      "query": "Fix a Fastify endpoint validation error",
      "should_trigger": false,
      "near_miss_of": "backend-architecture"
    },
    {
      "id": "near-miss-greenfield-bootstrap",
      "query": "Bootstrap a new fullstack monorepo from scratch",
      "should_trigger": false,
      "near_miss_of": "project-defaults"
    },
    {
      "id": "component-placement-terse",
      "query": "Component placement?",
      "should_trigger": true,
      "positive_form": "terse"
    },
    {
      "id": "buried-checkout-file-layout",
      "query": "I'm adding checkout; before implementation, organize its route, slice folders, import paths, and file names.",
      "should_trigger": true,
      "positive_form": "task_buried"
    },
    {
      "id": "near-miss-page-widget-composition",
      "query": "Compose the profile page from two widgets and decide which layer owns their layout.",
      "should_trigger": false,
      "near_miss_of": "react-composition"
    },
    {
      "id": "near-miss-shared-filter-state",
      "query": "Should a shared UI filter use Nano Stores or TanStack Query?",
      "should_trigger": false,
      "near_miss_of": "state-and-data"
    }
  ]
}
```

Keep the current `SKILL.md` description unchanged because it contains triggers only.
Rewrite `evals/README.md` to the shared template and state ten trigger cases.

## Task B — Add two isolated application cases

**Satisfies:** skill-testing R9, R13 · **Effort:** M

Create `evals/evals.json` with exactly these cases:

```json
{
  "schema_version": 1,
  "cases": [
    {
      "id": "cross-slice-helper-placement",
      "kind": "application",
      "prompt": "The checkout and profile slices contain duplicate normalizeDisplayName helpers. Refactor them to one correctly owned shared helper and update both callers. Do not add barrels or a cross-slice import; make the changes in the workspace.",
      "variants": ["without_skill", "with_skill"],
      "workspace": {
        "kind": "fixture_copy",
        "source": "fixtures/cross-slice-helper-placement/"
      },
      "oracle": {
        "type": "command",
        "ref": "oracles/cross-slice-helper-placement.mjs"
      }
    },
    {
      "id": "presentational-component-layout",
      "kind": "application",
      "prompt": "Add a UserSummary presentational component for the seeded users slice and render it from UserListWidget. Use the project's folder, file, export, and import conventions; make the changes in the workspace.",
      "variants": ["without_skill", "with_skill"],
      "workspace": {
        "kind": "fixture_copy",
        "source": "fixtures/presentational-component-layout/"
      },
      "oracle": {
        "type": "command",
        "ref": "oracles/presentational-component-layout.mjs"
      }
    }
  ]
}
```

Create this exact support tree (file contents are synthetic and compile as isolated
TypeScript/React snippets; no credentials or package installation state):

```text
evals/
├── fixtures/
│   ├── cross-slice-helper-placement/
│   │   └── apps/frontend/src/slices/
│   │       ├── checkout/
│   │       │   ├── components/customer-name/customer-name.tsx
│   │       │   └── utils/normalize-display-name.ts
│   │       └── profile/
│   │           ├── components/profile-heading/profile-heading.tsx
│   │           └── utils/normalize-display-name.ts
│   └── presentational-component-layout/
│       └── apps/frontend/src/slices/users/widgets/user-list/
│           └── user-list.widget.tsx
└── oracles/
    ├── cross-slice-helper-placement.mjs
    └── presentational-component-layout.mjs
```

For `cross-slice-helper-placement`, seed both helper files with the same pure trim and
whitespace-collapse implementation and seed each component with a direct relative
import of its local copy. The oracle must require exactly one implementation at
`apps/frontend/src/common/utils/normalize-display-name.ts`, require both callers to
import that concrete file, reject any import between `slices/checkout` and
`slices/profile`, reject every `index.ts`/`index.tsx` and re-export-only module, and
require lowercase kebab-case plus a named `normalizeDisplayName` export.

For `presentational-component-layout`, seed `user-list.widget.tsx` with a typed
`{ name, email }` user value and a TODO render site, but no component directory. The
oracle must require exactly
`components/user-summary/user-summary.tsx`, a named `UserSummary` export, one component
entity in that file, and a direct concrete import from `user-list.widget.tsx`; reject
default component exports, barrels/re-export-only modules, other file casing, and
placement under `common/` or `widgets/`. Do not grade CSS, hooks, or state ownership in
this frontend-architecture case. Both command oracles emit stable per-check evidence
and the workspace input hash under the shared runner-side grading contract.

## Task C — Run and audit the current campaign

**Satisfies:** skill-testing R9, R13, R14 · **Effort:** M

Run each trigger and each application `case × variant` as separate children under
`skill-qc-frontend-architecture-v1`. Generate runs, canary, report, workspace metadata,
and patches, pass provenance audit, and commit them only through shared Step 4 after all
checks pass.

## Task D — Remove exact debt and verify

**Satisfies:** skill-testing R1, R15 · **Effort:** S

Delete only resolved `convention/frontend-architecture` tuples and run all shared checks
plus `pnpm verify`.

## Coverage

A→R2/R10/R13, B→R9/R13, C→R9/R13/R14, D→R1/R15.
