# Architecture Decision Records

ADRs capture **project-wide, cross-cutting decisions** and the reasoning behind
them — the durable "why". They are the counterpart to specs (durable "what") and
plans (disposable "how"). Feature-scoped decisions live next to their spec in
`docs/specs/<feature>/decisions.md`; use an ADR when a decision affects the
project as a whole.

The format is a light Nygard/MADR flavor. ADRs are **append-only**: once
accepted, an ADR is never rewritten. To change a decision, add a new ADR and
mark the old one `Superseded by NNNN`.

## Numbering

Files are named `NNNN-title.md` with a zero-padded, monotonically increasing
number (`0001-spec-driven-workflow.md`). `0000-template.md` is the template and
is not a decision.

## Index

| ADR                                    | Status   | Title                                |
| -------------------------------------- | -------- | ------------------------------------ |
| [0001](0001-spec-driven-workflow.md)   | Accepted | Spec-driven workflow                 |
| [0002](0002-skills-via-npm-package.md) | Accepted | Skills via npm package               |
| [0003](0003-three-layer-rule-model.md) | Accepted | Three-layer rule model               |
| [0004](0004-monorepo-delivery.md)      | Accepted | Monorepo delivery and versioning     |
| [0005](0005-stack-and-scope.md)        | Accepted | Stack choice and scope boundaries    |
| [0006](0006-skill-taxonomy.md)         | Accepted | Two-tier skill taxonomy              |
| [0007](0007-distribution.md)           | Accepted | Distribution and template resolution |
| [0008](0008-agent-agnostic.md)         | Accepted | Agent-agnostic enforcement           |
