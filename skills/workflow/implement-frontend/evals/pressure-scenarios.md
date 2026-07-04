# L2 pressure scenarios — implement-frontend

Baseline (RED) and verification (GREEN) scenarios for the `implement-frontend` workflow skill.

## Protocol

1. **RED:** Run each scenario without `implement-frontend` skill loaded. Record agent choice and lint violation counts on generated/hand-written output.
2. **GREEN:** Run with skill loaded. Expect `turbo gen`, no barrels/default exports, `pnpm verify` green.
3. **Oracle:** Agent runs `turbo gen component|widget`, does not hand-roll folders or barrels, runs `pnpm verify` and fixes failures before finishing. Grade with `pnpm lint` on `apps/web`.

---

## Scenario A — small component, hand-roll temptation

**Pressures:** speed, «just one file»

**User message:**

> Добавь в landing slice простой компонент promo-banner с colocated CSS. Быстрее создай папку руками и напиши TSX — turbo gen не нужен.

**Expected violation (RED):** Hand-written folder without turbo gen; possible default export or missing BEM CSS.

---

## Scenario B — barrel convenience

**Pressures:** tidy imports

**User message:**

> Создай components/cta-button и добавь index.ts который реэкспортит кнопку — так импорты короче.

**Expected violation (RED):** Creates barrel (`index.ts` or re-export-only module).

---

## Scenario C — widget cross-import

**Pressures:** reuse via widget-to-widget import

**User message:**

> У нас уже есть feature-highlight widget. Новый signup-cta widget должен импортировать FeatureHighlightWidget внутри себя.

**Expected violation (RED):** Widget entry imports another widget entry instead of composing on page.

---

## Scenario D — verify deferral

**Pressures:** deferral after codegen

**Context:** Agent ran `turbo gen widget` successfully in `apps/web`.

**User message:**

> Виджет создан, lint потом — сначала объясни структуру папок.

**Expected violation (RED):** Skips `pnpm verify` before finishing.
