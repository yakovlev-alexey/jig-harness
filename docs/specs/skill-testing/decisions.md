# Decisions — Skill Testing

## 2026-07-07 — Require L2 output evals for convention skills

**Decision:** Convention skills MUST ship L2 application/retrieval evals with
objective oracles (R9), not `trigger_evals.json` alone.

**Alternatives considered:**

- Keep convention skills L1-only (trigger evals) — rejected: pattern/reference/technique
  skills' primary success metric is L2 (application/retrieval); L1-only leaves output
  quality unproven and gives no `with_skill` vs `without_skill` signal.
- LLM-judge-only L2 — rejected as the CI gate: needs calibration and is non-deterministic;
  prefer deterministic oracles (lint on produced code, structural checks) first, LLM-judge
  only where content is not code-checkable.

**Rationale:** Matches the skill-type → test-strategy matrix; supplies the behavioral
delta the library currently lacks for its eight convention rulebooks.

## 2026-07-07 — Descriptions state triggers only; trigger sets meet a near-miss floor

**Decision:** `SKILL.md` descriptions carry triggers/symptoms only, never a workflow
summary; `trigger_evals.json` carries ≥10 cases with ≥4 near-miss negatives (R10).

**Alternatives considered:**

- Allow a one-line workflow summary in the description — rejected: a summary makes agents
  follow the description and skip the body (observed SDO trap; the spec-driven spine
  descriptions reproduce it, `review-change` most severely).
- Enforce the no-summary rule mechanically via regex in `validate-skills.sh` — rejected as
  the primary gate: too fragile to detect reliably; keep it a review requirement and add
  only a soft count-floor check to the validator.

**Rationale:** The summary-in-description trap is the highest-leverage L1 defect found in
review; a triggers-only description with a fuller trigger set is a cheap, high-impact fix.

## 2026-07-07 — Skill rule IDs must be catalogued; coherence-check extended

**Decision:** Every own-rule ID in a `SKILL.md` Rules table must have a catalogue row
naming that skill; cross-references to another skill's rule are exempt.
`coherence-check.mjs` is extended to enforce this (R11).

**Alternatives considered:**

- Exempt procedural workflow rule IDs from the catalogue — rejected: `sp-*`, `if-*`, and
  `ib-*` are already catalogued, so exempting the spine's `ws-*`/`wp-*`/`imf-*`/`rv-*`/`df-*`
  would be inconsistent and would hide the current drift from CI.
- Drop local procedural rule IDs entirely from the spine skills — rejected: those IDs are
  useful anchors for red-flag lists and rationalization-table references inside the skill.

**Rationale:** Realises ADR 0003's "catalogue is the connective tissue" for the guidance
layer, not just for custom ESLint rules. If the review later wants this promoted from a
feature decision to an amendment of ADR 0003, supersede this entry with an ADR reference.
