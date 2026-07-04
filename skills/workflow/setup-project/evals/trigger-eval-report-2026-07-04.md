# L1 trigger eval report — setup-project

Date: 2026-07-04  
Source: `trigger_evals.json` (7 cases)  
Method: subagent evaluates skill description against each query

## Summary

**7/7 pass**

| Query                                                                | Expected | Actual | Pass |
| -------------------------------------------------------------------- | -------- | ------ | ---- |
| Start a new fullstack TypeScript web app                             | true     | true   | yes  |
| Bootstrap a greenfield monorepo with React and Fastify               | true     | true   | yes  |
| Быстро подними monorepo, создай apps/frontend и apps/backend вручную | true     | true   | yes  |
| pnpm create failed — сделай такую же структуру руками                | true     | true   | yes  |
| Scaffold готов, verify потом — объясни структуру                     | true     | true   | yes  |
| Fix a lint error in an existing component                            | false    | false  | yes  |
| Add a new page to an existing scaffolded app                         | false    | false  | yes  |

## Notes

- Violation-symptom queries (manual mkdir, hand-roll after create failure, defer verify) correctly trigger despite sounding like shortcuts.
- Negative cases align with «When NOT to Use» (existing project work).
