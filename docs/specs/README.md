# Specs

Specs are the durable, feature-scoped **what**: each `docs/specs/<feature>/spec.md`
describes what one feature does now, as `SHALL`/`MUST` requirements paired with
`GIVEN`/`WHEN`/`THEN` acceptance scenarios. They are flat and living — edited in
place as behavior changes, with git as the history (no delta or archive folders).
A feature may span many code slices and a slice may host many features, so specs
are decoupled from folders: no spec↔slice mapping is enforced. Feature-scoped
decisions live beside the spec in `decisions.md`. See the `specs` convention skill
for the format and the `write-spec` workflow skill for how specs are produced and
updated.

## Harness feature specs

These specs describe the **jig-harness repo** itself — packages, skills, template
wiring, and CI. They are distinct from **template app specs** (e.g. `users` under
`templates/fullstack/docs/specs/`) that describe product behavior in scaffolded apps.

| Feature              | Spec                                                           | Status |
| -------------------- | -------------------------------------------------------------- | ------ |
| Skills via npm       | [`skills-via-npm/spec.md`](skills-via-npm/spec.md)             | ✅     |
| Setup project        | [`setup-project/spec.md`](setup-project/spec.md)               | ✅     |
| Implement frontend   | [`implement-frontend/spec.md`](implement-frontend/spec.md)     | ✅     |
| Implement backend    | [`implement-backend/spec.md`](implement-backend/spec.md)       | ✅     |
| Testing              | [`testing/spec.md`](testing/spec.md)                           | ✅     |
| Vite SSR             | [`vite-ssr/spec.md`](vite-ssr/spec.md)                         | ✅     |
| Spec-driven workflow | [`spec-driven-workflow/spec.md`](spec-driven-workflow/spec.md) | ✅     |
| Skill testing        | [`skill-testing/spec.md`](skill-testing/spec.md)               | ✅     |
