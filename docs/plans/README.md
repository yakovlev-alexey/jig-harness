# Plans

Plans are transient implementation notes: each `docs/plans/<name>.md` records the
disposable **how/steps** for one change, with tasks traced back to spec
requirements. They are produced by the `write-plan` workflow skill from an
approved spec. Plans are disposable — delete them after a change lands or keep
them around per project taste; git is the real history. Unlike specs and
decisions, plans carry no durable guarantees.

A large effort may be decomposed **vertically** into a subfolder of one plan per unit
of work, with an index README. See [`skill-qc/`](skill-qc/README.md) — one plan per
skill for the 2026-07-07 skill-library QC hardening.
