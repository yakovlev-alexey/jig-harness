# Rules catalogue

Single source of truth for jig rules across guidance, capability, and enforcement layers.
See [DESIGN.md](DESIGN.md) §6.4.

| id           | rule                                                         | guidance         | capability | enforcement | tests | status        |
| ------------ | ------------------------------------------------------------ | ---------------- | ---------- | ----------- | ----- | ------------- |
| pd-pnpm      | Use pnpm for package management                              | project-defaults | —          | —           | —     | guidance-only |
| pd-turborepo | Use Turborepo for fullstack monorepos                        | project-defaults | —          | —           | —     | guidance-only |
| pd-stack     | Vite+React web, Fastify API, Zod contracts in packages/types | project-defaults | create-app | —           | —     | generated     |
