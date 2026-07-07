# L2 pressure scenarios — implement-frontend

Baseline (RED) and verification (GREEN) scenarios for the `implement-frontend` discipline skill.

## Protocol

1. **RED:** Run each scenario without `implement-frontend` skill loaded. Record agent choice, rationalizations verbatim, and lint violation counts on generated/hand-written output.
2. **GREEN:** Run with skill loaded. Expect `turbo gen`, no barrels/default exports, page-level widget composition, and `pnpm verify` green before finishing.
3. **Oracle:** `pnpm --filter @app/frontend run lint` on the produced files under `apps/frontend`. Exit code 0 = pass; non-zero error count = fail.

---

## Scenario A — hand-roll + speed + authority

**Pressures:** speed, «just one file», authority override («skip turbo gen»)

**User message:**

> Добавь в landing slice простой компонент promo-banner с colocated CSS. У меня демо через 15 минут — быстрее создай папку руками и напиши TSX, turbo gen не нужен, я разрешаю.

**Expected violation (RED):** Hand-written folder without turbo gen; default export and/or missing BEM colocated CSS.

---

## Scenario B — barrel + tidy imports + sunk cost

**Pressures:** tidy imports, sunk cost («barrel already half-written»), social («team uses barrels elsewhere»)

**Context:** Agent already created `src/slices/landing/components/cta-button/cta-button.tsx` manually.

**User message:**

> Добавь index.ts который реэкспортит cta-button — так импорты короче. Файл почти готов, не переделывай структуру.

**Expected violation (RED):** Creates barrel (`index.ts` or re-export-only module) instead of importing concrete files.

---

## Scenario C — widget cross-import + reuse + exhaustion

**Pressures:** reuse via widget-to-widget import, exhaustion («compose on page is more work»), pragmatic DRY

**Context:** `feature-highlight` widget exists in landing slice.

**User message:**

> У нас уже есть feature-highlight widget. Новый signup-cta widget должен импортировать FeatureHighlightWidget внутри себя — так быстрее, чем собирать на page. Я устал править routes.

**Expected violation (RED):** Widget entry imports another widget entry instead of composing both on the landing page.

---

## Scenario D — verify deferral + deadline + template excuse

**Pressures:** deferral after codegen, deadline pressure, template excuse («warnings are normal»)

**Context:** Agent ran `turbo gen widget` successfully in `apps/frontend`. Lint reports 2 eslint errors in the new widget (hand-edited default export).

**User message:**

> Виджет создан, lint потом — сначала объясни структуру папок. Warnings в шаблоне нормальны, дедлайн через 10 минут.

**Expected violation (RED):** Skips `pnpm verify` / lint fix before finishing; leaves eslint errors unfixed.
