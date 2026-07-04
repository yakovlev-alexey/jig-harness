---
name: implement-frontend
description: Use when adding or refactoring React frontend slices — components, widgets, pages, colocated CSS, or slice folders — in an existing jig-scaffolded app, or when about to hand-write component directories instead of turbo gen.
---

# Implement Frontend

## Overview

Add or refactor frontend slice UI using jig generators and convention skills. Do not hand-roll component or widget folders when generators exist.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

- User asks to add a component, widget, or page in an existing scaffolded app
- Refactoring presentational UI, widget composition, or colocated CSS in `apps/frontend`
- Agent is about to `mkdir` under `src/slices/*/components` or `widgets` manually

## When NOT to Use

- Bootstrapping a new monorepo (use `setup-project`)
- Backend endpoints, usecases, or API slices (use `implement-backend` when available)
- Greenfield stack choice (use `project-defaults`)

## Procedure

1. Identify the owning product slice (e.g. `landing`, `profile`) before creating files.
2. **REQUIRED SUB-SKILLS:** Use `frontend-architecture` for folder/import/export rules and `react-composition` for page/widget/CSS rules.
3. From `apps/frontend`, run the appropriate generator:
   - Presentational component: `pnpm exec turbo gen component`
   - Widget with colocated UI: `pnpm exec turbo gen widget`
4. Wire the new UI into the page or route target. Pages compose widgets; widgets do not import other widget entry files.
5. Run `pnpm verify` from the app or monorepo root. Fix every failure before finishing.

## Rules

- **if-use-generators** — Use `turbo gen component` or `turbo gen widget`. Never hand-roll slice folders when generators exist. Never create barrels or re-export-only modules.
- **if-verify** — Run `pnpm verify` before finishing. No deferral for deadlines or «lint can wait».

Delegated enforcement (graded by lint):

- **fe-named-exports**, **fe-no-index**, **fe-no-reexport**, **fe-kebab-case** — see `frontend-architecture`
- **rc-no-page-imports-page**, **rc-no-widget-imports-widget**, **rc-bem-class-names**, **rc-colocated-css**, **rc-widget-suffix** — see `react-composition`

## Red Flags — STOP

- Hand-writing `src/slices/.../components/<name>/` without running `turbo gen component`
- Creating `index.ts` or re-export-only alias files
- Default exports (except Storybook meta)
- Page importing another page; widget entry importing another widget entry
- Skipping `pnpm verify` after adding UI

## Rationalizations

| Excuse                                       | Reality                                                                       |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| «Just one small component, faster to mkdir»  | Generator takes seconds; hand-roll drifts from enforced shape. Run turbo gen. |
| «I'll fix lint later»                        | Frontend work incomplete until verify passes green.                           |
| «Barrel keeps imports tidy»                  | Barrels violate fe-no-index / fe-no-reexport. Import concrete files.          |
| «Copy an existing folder structure manually» | Copy skips generator contract. Run turbo gen.                                 |

## Common Mistakes

| Mistake                       | Correction                             |
| ----------------------------- | -------------------------------------- |
| Hand-written component folder | Delete; run `turbo gen component`      |
| Widget imports sibling widget | Compose on page; split workflows       |
| Missing colocated CSS import  | Add `./<name>.css` beside TSX          |
| Skipping verify               | Run `pnpm verify` and fix all failures |
