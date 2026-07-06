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

| ADR                                  | Status   | Title                |
| ------------------------------------ | -------- | -------------------- |
| [0001](0001-spec-driven-workflow.md) | Accepted | Spec-driven workflow |
