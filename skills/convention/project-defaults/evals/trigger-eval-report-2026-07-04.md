# L1 trigger eval report — project-defaults

Date: 2026-07-04  
Source: `trigger_evals.json` (6 cases)  
Method: subagent evaluates skill description against each query

## Summary

**6/6 pass**

| Query                                            | Expected | Actual | Pass |
| ------------------------------------------------ | -------- | ------ | ---- |
| What stack should I use for a new fullstack app? | true     | true   | yes  |
| Where do shared Zod schemas go?                  | true     | true   | yes  |
| Explain packages/types after scaffold            | true     | true   | yes  |
| Should I use shadcn in this jig project?         | true     | true   | yes  |
| Refactor this React component to use hooks       | false    | false  | yes  |
| Add Prisma to the existing API                   | false    | false  | yes  |

## Notes

- Post-scaffold explanation queries trigger correctly.
- jig-specific negative (shadcn) triggers — skill covers pd-bem-css / no shadcn.
- Component refactor and Prisma addition correctly do not trigger.
