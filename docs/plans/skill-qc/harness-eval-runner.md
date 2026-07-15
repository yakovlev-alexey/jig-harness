# Plan — pinned subagent runner and provenance (foundation PR)

Implement the live R14 layer after the static contract exists, in the same atomic
foundation PR. CI tests use injected fakes; a real runtime canary is a separate
pre-handoff smoke because trusted effective model/effort fields are runtime-dependent.
Use Node built-ins and existing repository packages; add no runtime dependency. No
generator applies.

## Task A — Define the custom agent and parseable receipt

**Satisfies:** skill-testing R14 · **Effort:** S

Create `.codex/agents/skill-eval-runner.toml` with:

- `name = "skill_eval_runner"`;
- a narrow one-skill-eval-case×variant description covering trigger, eval, and pressure
  suites;
- `model = "gpt-5.6-terra"` and `model_reasoning_effort = "medium"`;
- developer instructions that reject multiple case IDs/variants, require fresh context,
  forbid writing manifests/events/oracles, and end with exactly one machine-parseable
  receipt containing scalar `case_id`, scalar `variant`, `selected_skills`, `result`,
  and `rationalizations`.

Define and validate the receipt schema in `scripts/skill-qc/runtime/receipt.mjs`. Reject
missing, duplicate, malformed, or mismatched receipts before publishing a run.

## Task B — Implement and run a fail-closed runtime capability probe

**Satisfies:** skill-testing R14, R15 · **Effort:** M

Create:

```text
scripts/probe-skill-eval-runtime.mjs
scripts/skill-qc/runtime/capabilities.mjs
scripts/skill-qc/runtime/codex-transport.mjs
scripts/skill-qc/runtime/events.mjs
```

Generate the installed experimental protocol schema into a temporary directory with
`codex app-server generate-json-schema --experimental --out <tmp>`, then launch
`codex app-server --listen stdio:// --strict-config` through the transport adapter. Never
commit the generated schema.

The probe creates a synthetic temporary repository and isolated home/resolver capsule,
copies the Task A agent config into it, and proves from schema-backed RPC responses and
allowlisted events that one fresh coordinator requested `skill_eval_runner` and spawned
one fresh direct `subAgent*` child. It also proves the effective resolver inventory,
effective agent type, model, reasoning effort, child workspace path, and access boundaries
by accepting a sentinel read/write inside the allowed roots and rejecting both a read and
a write against sentinels outside the capsule/workspace. Child prose and requested TOML
values are not trusted proof.

Expose one normalized capability mapping from the adapter:
`{ coordinatorCwd, childCwd, resolverRoots, readableRoots, writableRoots, agentType }`.
Bind each field to a schema path/event in code comments and require the probe to prove the
returned values. Unsupported or absent runtime fields have no fallback mapping.

Record the supported transport/event mapping as code comments beside the adapter, not as
a new durable requirement. If any trusted field is unavailable, implement the fail-closed
`SKILL_EVAL_RUNTIME_UNSUPPORTED` diagnostic and continue building/test-driving the
infrastructure, but do not start skill campaigns or remove live-evidence debt. Run the
probe with `pnpm run skill-eval:probe` before the real smoke.

## Task C — Build scalar CLI and isolated resolver

**Satisfies:** skill-testing R9, R12–R14 · **Effort:** L

Create:

```text
scripts/run-skill-eval.mjs
scripts/skill-qc/runtime/args.mjs
scripts/skill-qc/runtime/resolver.mjs
scripts/skill-qc/runtime/hashes.mjs
```

The CLI requires one scalar `--skill`, `--suite`, `--case`, `--variant`, and
`--campaign`; reject arrays, repeated flags, batch files, or mismatched suite variants
before spawn. Start a fresh coordinator root with no forked conversation turns and
allow exactly one direct custom-agent child.

Materialize this no-symlink topology before spawn:

```text
<run-temp>/
├── home/                    # HOME and CODEX_HOME; no inherited user skills/config
├── resolver/                # coordinatorCwd; read-only to the child
│   └── .codex/
│       ├── agents/skill-eval-runner.toml
│       └── skills/<name>/... # exact copied payloads, never evals/
└── workspace/               # childCwd; the only writable root for mutable cases
```

For prompt-only cases, `workspace/` is an empty read-only directory. For `fixture_copy`,
it contains the copied case tree. For `git_worktree`, it is the clean temporary worktree
at the checkpoint SHA. Pass `resolver/` explicitly as the only resolver root,
`workspace/` as child cwd, `resolver/` plus `workspace/` as the only readable roots, and
only mutable `workspace/` as a writable root through the normalized Task B adapter.
Exclude `resolver/` from workspace diffing and source hashes.

Inventory project and global candidates by real path and name before isolation, reject
escaping or ambiguous same-name/different-hash entries, and then require a trusted
RPC/config echo of the effective capsule set before the child task.

Hash every available skill's `SKILL.md` and supporting runtime files while excluding
`evals/`. Use every canonical project skill as the controlled resolver universe:
`with_skill` includes the exact subject payload, `without_skill` omits every candidate
copy of the subject, and `trigger` includes the subject and all project siblings without
forcing selection. Save the canonical ordered name-and-payload-hash set;
`selected_skills` must be a subset of that effective set. If the installed runtime cannot
disable other discovery or attest the effective set, emit `SKILL_EVAL_RUNTIME_UNSUPPORTED`
before spawn.

Require all tested definitions, fixtures, oracles, custom-agent config, and subject
runtime payload files to be tracked and match the checkpoint HEAD. Snapshot the
path/status (never contents) of unrelated pre-existing dirty paths; do not copy them into
the resolver or child workspace, and ignore them only while unchanged. During a campaign,
fail on any hashed-input change or any new non-runner path in the tested skill. Allow only
the current campaign's runner-owned `runs/` and `reports/` in the tested scope; staging
lives under the Git common directory. A `git_worktree` case always materializes the
checkpoint SHA.

Inject transport and filesystem adapters into pure orchestration functions so tests do
not launch a real Codex process.

## Task D — Isolate mutable workspaces and execute oracles

**Satisfies:** skill-testing R3, R9, R12–R14 · **Effort:** L

Create:

```text
scripts/skill-qc/runtime/workspace.mjs
scripts/skill-qc/runtime/oracle.mjs
scripts/skill-qc/runtime/checklist-grader.mjs
scripts/skill-qc/runtime/artifacts.mjs
```

For `fixture_copy`, copy the case fixture to a fresh writable temp directory. For
`git_worktree`, create a clean temporary worktree at the tested SHA. Never share a
mutable workspace between children. Run the oracle after child completion with the
declared cwd and timeout, collect sanitized stdout/stderr/checks/rationalizations,
compute a normalized patch, and write `workspace.json`. Records use `change`,
`before_sha256`, `after_sha256`, and `previous_path`; added/deleted sides use null and
renames retain both paths. Remove the temp workspace in `finally`; cleanup failure makes
the attempt invalid. Prompt-only `none` cases stay read-only.

Activation grading is derived only from the receipt and trigger definition: a positive
must select the target, an ordinary negative must omit it, and a `near_miss_of` negative
must select that sibling and omit the target. Persist expected and observed skill names
in `oracle.json`.

Command oracles run the referenced executable with `spawn` and no `shell: true`, in the
declared oracle cwd, with a minimal environment, timeout, and capped sanitized output.
Pass one canonical JSON object on stdin containing schema version, case, variant,
materialized prompt, raw response, selection receipt, and relative workspace metadata;
the oracle exits 0/1 and may emit one JSON `checks` array on stdout. Hash the referenced
oracle bytes as `oracle_source_sha256`; for `fixture_copy`, also bind the canonical input
tree as `fixture_source_sha256`.

Checklist grading goes through an injected runner-side grader adapter;
it validates stable criterion IDs, one evidence record per criterion, opaque grader ID,
grading time, and the exact combined input hash. The scenario child cannot be the grader;
if no independent adapter is supplied, the attempt fails without publication.

Import `scripts/skill-qc/sensitive-data.mjs` from the contract plan. Validate every
rationalization before publication: each non-empty quote occurs verbatim
in `response.md`, and each non-null `maps_to` names an entry parsed from the tested
skill's rationalization table. Give children only synthetic fixtures and a minimal
secret-free environment. Scan definitions, fixture bytes, materialized prompt/response,
events, oracle output, and workspace artifacts for private-key headers, credential/auth
or session material, and configured token patterns; any hit is an infrastructure failure
with no final run.

After acquiring the Task E run lock, reject any orphan under
`<git-common-dir>/jig-skill-qc-staging/<skill>/<campaign>/` before spawn. Verify with
`stat.dev` that this directory and the final run parent share a filesystem; otherwise
fail before spawn. Write an accepted attempt into its one opaque child, which is outside
both the worktree and `evals/runs/`, validate and hash all artifacts, then atomically
rename it into the R13 path only after a valid receipt and an
executed oracle. The external runner is the sole writer of manifest, allowlisted events,
oracle, and hashes. Rejected input, spawn/lifecycle/receipt failure, missing checklist
grader, oracle-infrastructure failure, or cleanup failure exits non-zero, removes
staging, and publishes no final run. An executed oracle verdict of `fail` is a completed
run and is published.

## Task E — Create and verify the runtime canary

**Satisfies:** skill-testing R14 · **Effort:** M

Create `scripts/skill-qc/runtime/canary.mjs` and
`scripts/skill-qc/runtime/lock.mjs`. Put exclusive locks under the repository Git common
directory at `jig-skill-qc-locks/<skill>/<campaign>.<operation>.lock`, acquire with atomic
`open(..., "wx")`, record owner PID/start time, and never silently steal an ambiguous
stale lock. Acquire `<campaign>.run.lock` before input preflight and hold it through
staging cleanup/publication, serializing scalar children for one skill campaign without
batching them. Before the first run in a campaign, acquire the campaign-canary lock and
spawn one fresh canary with the same runtime version, agent type, and config hash. Capture only
trusted allowlisted effective fields and the runtime-event hash into
`reports/<campaign>.runtime-canary.json`, then release the lock. Concurrent scalar
runners reuse only an exact matching completed canary. Refuse to publish or verify
campaign runs when the canary is missing, stale, self-reported, or cannot prove effective
`skill_eval_runner`, `gpt-5.6-terra`, and medium reasoning.

Each run's spawn capture must match the canary's agent type, runtime version, and config
hash. Requested TOML values alone never satisfy this task.

## Task F — Aggregate one campaign report atomically

**Satisfies:** skill-testing R9, R12–R14 · **Effort:** M

Create `scripts/report-skill-eval-campaign.mjs` and
`scripts/skill-qc/runtime/report.mjs`. The scalar CLI accepts one skill and campaign,
acquires the Task E `<campaign>.report.lock`, scans only completed validated run
directories, and requires both variants for every included paired L2 case. With
`--require-complete`, it
additionally requires every declared trigger plus both variants of every declared L2
case; current campaigns and README evidence use this mode, while explicitly partial
pre-change diagnostics do not. It atomically writes `reports/<campaign>.md` with `Runs`,
`Deltas`, and a runner-owned `Provenance` block containing `status: pending` plus the
canonical `report_input_sha256`, and links the canary.

Render observed pass/pass, fail/pass, pass/fail, and fail/fail combinations as
saturation/zero delta, improvement, regression/negative delta, or unchanged failure
without rewriting raw evidence. Reject missing, duplicate, stale, statically invalid, or
canary-invalid runs; provenance is intentionally pending until Task G. Re-running the
report with the same run-set hash preserves an existing verified block, while a changed
run set resets it to pending.

## Task G — Audit direct-child provenance

**Satisfies:** skill-testing R14, R15 · **Effort:** M

Create `scripts/audit-skill-eval-provenance.mjs` and
`scripts/skill-qc/runtime/provenance.mjs`. Given one scalar skill and campaign, query
Codex thread history and prove every recorded child is one unique completed direct
`subAgent*` child of the recorded root. Match case/variant receipt, agent type, runtime,
config hash, and canary. Missing local history produces `unverified`, never success.

Acquire the report lock and require its current `report_input_sha256`. On success,
atomically replace only the report's `Provenance` block with `status: verified`,
`audited_at`, unique child count, the same report-input hash, and a SHA-256 of the
allowlisted root→child/case/variant/status projection. On failure, leave the pending
report unchanged and exit non-zero. The static validator checks this block and its run-set
binding; the history query remains the authoritative live audit.

Do not claim thread-list exposes model or effort; those fields come only from the trusted
canary event.

## Task H — Add hermetic runner, report, and provenance tests

**Satisfies:** skill-testing R13–R15 · **Effort:** L

Create:

```text
scripts/skill-qc/tests/runner.test.mjs
scripts/skill-qc/tests/report.test.mjs
scripts/skill-qc/tests/provenance.test.mjs
```

Use fake spawn/history/workspace/oracle adapters. Cover scalar success, batch/repeated
flag rejection before spawn, fresh context, with/without/trigger resolver contents,
global duplicate exclusion, skill/config/case hashes, one workspace per child, cleanup
after success/failure, timeout, added/deleted/renamed workspace records, atomic
publication, no final run on infrastructure failure, published observed oracle failure,
receipt mismatch, positive/ordinary-negative/near-miss activation semantics, expected and
observed activation names, independent checklist grading, rationalization quote/mapping
validation, oracle/fixture source freshness, synthetic-data enforcement and secret
rejection with no final run, allowlisted events, canary locking and staleness, complete
report matrices, run/report locking, orphan staging, report idempotence, pending→verified
provenance, verified-block invalidation after a run-set change, direct-child mismatch,
duplicate child IDs, missing history without report mutation, pre-existing unrelated
dirty paths, hashed-input drift, and sanitized output. Assert stable diagnostic codes and
artifact content.

## Task I — Run one real smoke without claiming more than the runtime proves

**Satisfies:** skill-testing R14, R15 · **Effort:** S

Add this synthetic v1 prompt-only fixture:

```text
scripts/skill-qc/tests/fixtures/runtime-smoke/
├── README.md
├── expected-receipt.json
├── subject/
│   ├── SKILL.md
│   └── evals/trigger_evals.json
└── siblings/
    ├── smoke-sibling-a/SKILL.md
    ├── smoke-sibling-b/SKILL.md
    ├── smoke-sibling-c/SKILL.md
    └── smoke-sibling-d/SKILL.md
```

The subject has frontmatter name `runtime-smoke-skill` and a description that triggers
only on a synthetic `runtime-smoke` request;
`trigger_evals.json` has ten valid cases with case `runtime-smoke-formal` plus all R10
forms and four near-misses targeting the four siblings. `expected-receipt.json` fixes the
full receipt as case `runtime-smoke-formal`, variant `trigger`, selected skill
`runtime-smoke-skill`, result marker `runtime-smoke-ok`, and an empty rationalizations
array. README states that no credential-like data is allowed.

After unit tests and `pnpm verify` pass, the probe materializes that fixture in a
temporary repository and runs only `runtime-smoke-formal/trigger` through the real
transport. Inspect the allowlisted event, canary, artifacts, and
direct-child history through the internal audit function, then remove the temporary
repository. This smoke is never committed as skill campaign evidence. If the probe or
canary cannot prove the required runtime/resolver/model/effort properties, record only
the fail-closed diagnostic and block Stage 2.

## Coverage

A→R14, B→R14/R15, C→R9/R12–R14, D→R3/R9/R12–R14, E→R14,
F→R9/R12–R14, G→R14/R15, H→R13–R15, I→R14/R15.
