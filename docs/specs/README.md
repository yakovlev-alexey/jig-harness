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
