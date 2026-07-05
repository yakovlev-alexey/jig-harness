---
name: frontend-architecture
description: Use when organizing TypeScript frontend files, vertical product slices, common shared code, imports, exports, file names, folders, barrels, or frontend package boundaries.
---

# Frontend Architecture

## Overview

Organize frontend code by vertical product behavior. Folder names reveal what the user can do: `landing`, `profile`, `checkout`, `budget-plan`.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

- Adding or moving files under `src/slices/` or `src/common/`
- Deciding import paths, export style, or folder shape for frontend code
- User asks about slice segments, barrels, kebab-case, or cross-slice imports

## When NOT to Use

- React page/widget composition rules (use `react-composition`)
- Server/client state (use `state-and-data`)
- Greenfield stack defaults before scaffold (use `project-defaults`)

## Preferred Shape

```text
src/
  App.tsx
  styles.css
  slices/
    <product-area>/
      components/
      pages/
      widgets/
      store/
        model/
        selectors/
        queries/
        commands/
      utils/
      constants/
  common/
    components/<name>/
    utils/
```

Slice segments (`components/`, `pages/`, `widgets/`, etc.) are **flat**: one folder level under the segment, e.g. `components/hero-banner/`, not `components/ui/hero-banner/`.

## Rules

| Rule ID                       | Convention                                                                                                                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **fe-slices-layout**          | Product slices live under `src/slices/<product-area>/`; shared code under `src/common/`.                                                                                           |
| **fe-allowed-segments**       | Allowed slice segments: `components`, `pages`, `widgets`, `store`, `utils`, `constants`. Segments are flat — `components/<name>/`, not nested subcategories like `components/ui/`. |
| **fe-one-entity-per-file**    | One component, widget, page, story, selector, query, command, store, helper, or constants group per file.                                                                          |
| **fe-kebab-case**             | Name folders and files in lowercase kebab-case.                                                                                                                                    |
| **fe-named-exports**          | Always use named exports. Storybook CSF files may default-export their `meta` object only.                                                                                         |
| **fe-no-index**               | Never create or rely on `index.ts`, `index.tsx`, or barrel files.                                                                                                                  |
| **fe-no-reexport**            | Never create re-export-only modules (`export { X } from './x'` as the entire file). Import concrete files directly.                                                                |
| **fe-no-cross-slice-imports** | Discourage imports between slices. If unavoidable, import the smallest concrete named file — never barrels.                                                                        |
| **fe-file-budget**            | Keep files under ~150 lines (warn) / 250 lines (error). Split into sub-components, colocated `use-*.ts` hooks, or `utils/` when growing.                                           |
| **fe-function-budget**        | Keep functions/components under ~60 lines (warn) / 100 lines (error). Extract presentational sub-components or hooks when JSX or logic grows.                                      |
| **fe-complexity**             | Cyclomatic complexity ≤ 12. Extract branches into helpers or smaller functions.                                                                                                    |
| **fe-hook-file-naming**       | Custom hooks live in colocated `use-*.ts` (or `.tsx`) beside their widget/component; one hook export per file. Promote to `common/` only on reuse — no preemptive `hooks/` folder. |

## Decomposition & size budgets

When a file or function approaches its budget, decompose before adding more logic:

1. **Sub-components** — split presentational JSX into smaller components in the same slice folder.
2. **Hooks** — extract stateful or effectful logic into a colocated `use-*.ts` beside the widget/component.
3. **Utils** — move pure helpers into `utils/` (slice-local first; `common/utils/` only on reuse).

Soft `warn` thresholds nudge early; hard `error` caps block further growth. Storybook stories, tests, generators, and config files are exempt.

## Reuse Rules

Use `common/` only for code already reused by multiple slices or intentionally designed for imminent reuse. Do not extract to `common/` preemptively.

## Capability

Prefer `turbo gen component` or `turbo gen widget` from `@app/frontend` instead of hand-writing boilerplate. Generator output must pass `pnpm verify`.

## Red Flags — STOP

- Creating `index.ts` / `index.tsx` for convenience
- Re-export files that alias slice exports
- Nested segment subcategories like `components/ui/` — use flat `components/<name>/`
- `common/query-client/query-client.ts` one-file folders — use `common/query-client.ts`
- One-file folders for utilities or store files outside `components/`, `pages/`, `widgets/`
- Hook exported from a non-`use-*.ts` file or multiple hooks in one file
- File or function growing past decomposition budgets without splitting

## Common Mistakes

| Mistake                            | Correction                                                |
| ---------------------------------- | --------------------------------------------------------- |
| Broad `common/` extraction         | Keep code slice-local until reuse is real                 |
| Barrel files for convenience       | Import concrete files; run generators                     |
| Cross-slice imports for one helper | Move helper to `common/` or duplicate minimally           |
| Hand-written component folders     | Run `turbo gen component`                                 |
| Monolithic component file          | Extract sub-components, colocated `use-*.ts`, or `utils/` |
| Hook in `helpers.ts` or widget TSX | Name file `use-<name>.ts` beside the consumer             |

See `references/slice-layout.md` for layout examples. Full rule ↔ enforcement crosswalk: `rules-catalogue.md` in jig-harness.
