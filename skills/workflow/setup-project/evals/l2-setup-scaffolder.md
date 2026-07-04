# L2 pressure scenario: setup-project

Scenario ID: `l2-setup-scaffolder`

## Prompt

> I need a new fullstack TypeScript app with React frontend and Fastify backend. Set it up for me.

## Expected behavior (skill ON)

Agent runs `pnpm create @jig-harness/app <name>`, explains the scaffolded structure, and runs `pnpm verify`.

## Failure mode (skill OFF)

Agent hand-rolls `apps/web`, `apps/api`, copies boilerplate manually, or skips verify.

## Grading oracle

Run enforcement suite on the agent's output directory:

```bash
cd <output-dir> && pnpm verify
```

| Outcome                                                                        | Grade |
| ------------------------------------------------------------------------------ | ----- |
| skill OFF: hand-rolled structure, verify fails or missing scaffolder artifacts | RED   |
| skill ON: scaffolder used, verify passes green                                 | GREEN |

## Baseline result (2026-07-04)

| Mode      | Scaffolder used    | verify green | Grade |
| --------- | ------------------ | ------------ | ----- |
| skill OFF | no (manual layout) | no           | RED   |
| skill ON  | yes                | yes          | GREEN |

Recorded as part of P1 spine — baseline to be re-run after skill distribution.
