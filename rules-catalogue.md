# Rules catalogue

Single source of truth for jig rules across guidance, capability, and enforcement layers.
See [DESIGN.md](DESIGN.md) §6.4.

| id               | rule                                                | guidance         | capability | enforcement                      | tests               | status        |
| ---------------- | --------------------------------------------------- | ---------------- | ---------- | -------------------------------- | ------------------- | ------------- |
| pd-pnpm          | Use pnpm for package management                     | project-defaults | —          | —                                | —                   | guidance-only |
| pd-typescript    | Use TypeScript for app code, config, tests, scripts | project-defaults | —          | —                                | —                   | guidance-only |
| pd-turborepo     | Use Turborepo for fullstack monorepos               | project-defaults | —          | —                                | —                   | guidance-only |
| pd-react-vite    | React + Vite for interactive web apps               | project-defaults | create-app | —                                | —                   | generated     |
| pd-fastify       | Fastify + Zod for API services                      | project-defaults | create-app | —                                | —                   | generated     |
| pd-contracts     | Shared Zod contracts in packages/types              | project-defaults | create-app | —                                | —                   | generated     |
| pd-query         | TanStack Query client in src/common/query-client.ts | project-defaults | create-app | —                                | —                   | generated     |
| pd-bem-css       | Colocated plain CSS with BEM class names            | project-defaults | create-app | stylelint/selector-class-pattern | template-dogfood    | enforced      |
| fe-named-exports | Named exports only (Storybook meta exempt)          | —                | —          | import-x/no-default-export       | template-dogfood    | enforced      |
| fe-no-index      | No index.ts barrel files                            | —                | —          | check-file/no-index              | template-dogfood    | enforced      |
| fe-kebab-case    | kebab-case file and folder names                    | —                | —          | unicorn/filename-case            | template-dogfood    | enforced      |
| sp-scaffolder    | Use pnpm create @jig-harness/app scaffolder         | setup-project    | create-app | —                                | l2-setup-scaffolder | generated     |
| sp-verify        | Run pnpm verify before finishing setup              | setup-project    | —          | —                                | l2-setup-scaffolder | guidance-only |
