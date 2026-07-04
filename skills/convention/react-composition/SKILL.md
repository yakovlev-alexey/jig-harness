---
name: react-composition
description: Use when building or refactoring React pages, route targets, widgets, presentational components, widget nesting, page-owned layout, colocated CSS, render props, or Storybook states.
---

# React Composition

## Overview

Pages compose workflows and own layout. Widgets connect state or behavior to stateless UI. Components stay presentational by default.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

- Adding or refactoring a page, widget, or presentational component
- Deciding CSS ownership, BEM classes, or widget folder shape
- User asks about page↔widget composition or colocated CSS

## When NOT to Use

- Folder/import/barrel conventions without React composition context (use `frontend-architecture`)
- Server/client state wiring (use `state-and-data`)

## Composition Rules

| Rule ID                              | Convention                                                                                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **rc-routing-at-app-root**           | Keep routing at the app/root boundary. `App.tsx` owns route setup, providers, and route-to-page wiring.                                      |
| **rc-no-page-imports-page**          | Pages are route targets; pages must not import or render other pages.                                                                        |
| **rc-no-widget-imports-widget**      | Widget entry files (`*.widget.tsx`) must not import or render other widget entry files. Compose widgets on the page via `children` or slots. |
| **rc-components-are-presentational** | Components receive data, callbacks, and positioning class names via props; they do not own business state.                                   |
| **rc-widget-suffix**                 | Widget entry files use the `.widget.tsx` suffix inside `widgets/<name>/`.                                                                    |
| **rc-colocated-css**                 | Each page, component, and widget imports colocated CSS in the same folder.                                                                   |
| **rc-bem-class-names**               | Use BEM-style classes: `block`, `block__element`, simple `--modifier` for state/variants.                                                    |

## CSS Ownership

- `src/styles.css`: global tokens, reset/base, truly global utilities only.
- `src/App.tsx`: imports `styles.css` directly.
- Page CSS: page-owned layout and placement (pages pass positioning `className` to children).
- Component/widget CSS: classes rendered only by that component or widget.

## Widget-Owned UI

If a presentational component exists only for one controlling widget, keep it inside that widget folder:

```text
widgets/profile-stats/
  profile-stats.tsx
  profile-stats.css
  profile-stats.widget.tsx
```

Do not duplicate the same UI under both `components/` and `widgets/`.

## Capability

Prefer `turbo gen component` or `turbo gen widget` instead of hand-writing folders. Generator output must pass `pnpm verify`.

## Storybook (guidance)

Create stories for standalone components and widgets when Storybook exists, when building a design system, or when the user asks. Showcase empty, loading, error, disabled, long-content, and happy-path states.

## Red Flags — STOP

- Page importing another page
- Widget entry importing another widget entry
- Tailwind/shadcn in jig scaffold (use BEM + colocated CSS per **rc-bem-class-names**)
- Global CSS for slice-specific layout

## Common Mistakes

| Mistake                                        | Correction                       |
| ---------------------------------------------- | -------------------------------- |
| Widget imports sibling widget                  | Compose both widgets on the page |
| Business state inside presentational component | Move behavior to widget or page  |
| Missing colocated CSS import                   | Add `./<name>.css` beside TSX    |
| Hand-written widget folder                     | Run `turbo gen widget`           |

See `references/composition-examples.md`. Full crosswalk: `rules-catalogue.md` in jig-harness.
