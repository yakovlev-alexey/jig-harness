# Decisions — Skill Testing

## 2026-07-07 — Require L2 output evals for convention skills

**Decision:** Convention skills MUST ship L2 application/retrieval evals with
objective oracles and recorded `with_skill` vs `without_skill` deltas (R9), not
`trigger_evals.json` alone.

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
Near-miss negatives are annotated with `near_miss_of` so the case floor can be
checked mechanically instead of relying on prose. Positive cases use
`positive_form: formal | terse | task_buried`, with at least one of each, so the
variation requirement is also enforceable.

**Alternatives considered:**

- Allow a one-line workflow summary in the description — rejected: a summary makes agents
  follow the description and skip the body (observed SDO trap; the spec-driven spine
  descriptions reproduce it, `review-change` most severely).
- Enforce the no-summary rule mechanically via regex in `validate-skills.sh` — rejected as
  the primary gate: too fragile to detect reliably; keep it a review requirement. The
  count floor and near-miss annotation are mechanical and belong in the validator.

**Rationale:** The summary-in-description trap is the highest-leverage L1 defect found in
review; a triggers-only description with a fuller trigger set is a cheap, high-impact fix.

## 2026-07-07 — Skill rule IDs must be catalogued; coherence-check extended

**Decision:** Every own-rule ID in a `SKILL.md` Rules section (table or bullet list)
must have a catalogue row naming that skill; cross-references to another skill's rule
are exempt, and rule-like tokens outside owned Rules declarations are ignored.
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

## 2026-07-15 — Standardize eval definitions and evidence layout

**Decision:** Every skill uses `trigger_evals.json` for trigger definitions,
`evals.json` for application/retrieval definitions, and `pressure_tests.json` for
discipline pressure definitions. Live evidence is stored only under
`runs/<campaign>/<suite>/<case>/<variant>/<run-id>/`; trigger-only summaries are
optional, while paired L2 campaigns require a report under `reports/` that links the
raw runs and records their delta. `fixtures/` contains reusable case input state,
while `oracles/` contains reusable grading logic. Both are omitted when a prompt and
inline checklist suffice. Mutable cases run in per-child fixture copies or worktrees
and preserve standardized `workspace.json` and `patch.diff` artifacts.

**Alternatives considered:**

- Keep dated `l2-*.md` files as both definition and evidence — rejected: names and
  structure vary by skill, reports cannot prove how many agents ran, and prose is hard
  to validate mechanically.
- Put pressure cases into `evals.json` with a `kind` discriminator — rejected: pressure
  tests have distinct pressure-type, paired-run, and rationalization requirements that
  deserve an explicit contract and filename.
- Require empty `fixtures/` and `oracles/` everywhere — rejected: empty directories add
  ceremony and Git does not preserve them; both concepts are useful only for cases that
  need reusable files or grading code.

**Rationale:** Stable source filenames, run paths, and minimum schemas let validators
enforce the same contract across all skills without treating arbitrary Markdown reports
as proof.

## 2026-07-15 — Treat baselines as observations, not prescribed RED results

**Decision:** `without_skill` and `with_skill` name isolated run configurations, not
expected outcomes. The harness records the actual oracle result and delta. A strong model
passing without the skill is never rewritten as RED to satisfy a plan. Two passing
variants indicate capability saturation or zero delta; a passing baseline followed by a
failing with-skill run is reported as a regression or negative delta.

**Alternatives considered:**

- Require every without-skill baseline to fail — rejected: model capability can make a
  valid test pass without guidance, and prescribing failure encourages synthetic or
  mislabeled reports.
- Allow design-time walkthroughs to count as a baseline — rejected: they do not measure
  model behavior and cannot provide raw subagent evidence.

**Rationale:** Evals are measurements. Their contracts should constrain isolation and
evidence quality, not manufacture the desired result.

## 2026-07-15 — Pin one Terra Medium subagent per case variant

**Decision:** Every trigger case and every L2 case variant runs in a separate custom
`skill_eval_runner` subagent pinned to `gpt-5.6-terra` with medium reasoning. The runner
rejects batches. Each run records raw prompt, response, event evidence, oracle result,
root thread ID, and direct child thread ID. Before handoff, those IDs are checked against
Codex thread history. An external runner, not the child, owns manifests and hashes; it
uses fresh child context and an explicit hashed skill resolver set. The App Server proves
the direct-child relation, source kind, and completion. Runner-owned spawn evidence proves
the selected agent type, and a fail-closed runtime canary tied to the custom-agent config
hash proves the effective model and effort; requested TOML values alone are insufficient.

**Alternatives considered:**

- Let one subagent execute a whole JSON suite — rejected: a single synthesized report
  cannot prove scenario isolation and lets earlier cases influence later answers.
- Run `codex exec -m gpt-5.6-terra` directly per case — rejected: that creates a root
  agent, not the required subagent.
- Trust manifest IDs without checking thread history — rejected: schema validation can
  detect inconsistencies but cannot prove that a recorded child thread existed.
- Treat absence from the child response as without-skill isolation — rejected: the skill
  could remain available through inherited context or a duplicate resolver entry.
- Let children share the repository checkout for application cases — rejected: concurrent
  runs can contaminate each other's patches and oracle results.
- Depend on an undocumented `skill-loaded` App Server event — rejected: trigger grading
  uses a structured single-case selection receipt preserved in the raw child response.
- Infer effective model and effort from the requested TOML alone — rejected: the same
  runtime and config must emit a trusted canary event or the campaign remains unverified.

**Rationale:** One `case × variant` per direct child thread is stricter than one report
per scenario and gives reviewable provenance for model and effort.

## 2026-07-15 — Bootstrap strict validators with monotonically decreasing debt

**Decision:** The validator-first PR ships all strict checks immediately and lists only
the current exact violations in `scripts/skill-qc-known-debt.json`. Waivers are keyed by
skill, stable diagnostic code, and normalized fingerprint. After bootstrap, CI permits
deletions only by comparing against `SKILL_QC_BASE`; stale, broadened, new, or unmatched
waivers fail. The mechanism is removed after debt reaches zero.

**Alternatives considered:**

- Opt skills into validation as they migrate — rejected: unlisted and newly added skills
  could evade the contract.
- Merge validators only after one atomic migration of every skill — rejected: the change
  is too large to review safely and does not provide an early gate for subsequent work.
- Land globally failing validators and tolerate red `verify` between waves — rejected:
  it removes CI as a useful signal and contradicts the requirement that every step remain
  green.

**Rationale:** Exact debt makes the new contract enforceable from the first merge while
preventing the migration allowance from becoming a permanent escape hatch.

## 2026-07-15 — Parse owned skill rule IDs with an explicit grammar

**Decision:** Owned declarations are recognized only in level-two `Rules`, `* Rules`,
or `* Defaults` sections. Tables own IDs from the first column; bullets own IDs before
their first em dash. Content after that dash and delegated-enforcement blocks is
reference-only.

**Alternatives considered:**

- Scan only a literal `## Rules` section — rejected: shipped skills use headings such as
  `Stack Defaults` and `Composition Rules`.
- Exempt any row or bullet containing `Reference` or `see` — rejected: mixed declarations
  can own one rule and reference another in the same line.
- Scan every rule-shaped token in a skill — rejected: filenames, examples, and borrowed
  rule IDs produce false positives.

**Rationale:** The grammar matches existing authoring patterns while separating owned
declarations from cross-references deterministically enough for fixture tests.

## 2026-07-15 — Publish only completed attempts and bind independent checklist grading

**Decision:** Rejected inputs and attempts that fail during spawn, lifecycle capture,
receipt validation, or oracle infrastructure publish no final run directory. The runner
stages outside `evals/runs/` and publishes atomically only after a valid child receipt and
an executed oracle; an observed oracle `fail` remains valid evidence. Checklist oracles
must be graded independently of the scenario child and bind their criterion evidence to
the exact prompt, response, and criteria hashes. Workspace change records use before and
after hashes with null on the nonexistent side so added, deleted, and renamed files are
unambiguous.

**Alternatives considered:**

- Publish a partial five-file run after spawn failure — rejected: there is no raw child
  response or observed oracle verdict, so placeholders would look like evidence they are
  not.
- Let the scenario child fill its own checklist — rejected: self-grading is not an
  objective oracle and lets the behavior under test attest to its own success.
- Give every changed path only one hash — rejected: deleted and renamed files have no
  single current byte representation.

**Rationale:** Atomic publication keeps `runs/` limited to auditable scenario outcomes,
while independent checklist evidence and two-sided file hashes close provenance gaps
without weakening the one-case-one-child rule.
