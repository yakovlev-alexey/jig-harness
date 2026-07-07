---
name: fixture-skill
description: Fixture skill for coherence-check GREEN cases.
---

# Fixture Skill

## Overview

File names such as assert-user-can-be-created.ts must not be treated as rule ids.

## Rules

- **fx-good-rule** — Catalogued own rule in a bullet list.
- **fx-own-rule** — Own rule with a cross-reference. Reference **wf-borrowed-rule**: enforced elsewhere.

Delegated enforcement (graded by lint):

- **sd-delegated-rule** — see `state-and-data`

| Rule ID         | Convention                                             |
| --------------- | ------------------------------------------------------ |
| **fx-table-ok** | see `other-skill` / **ot-cross-ref-only** (first col). |

## Examples

import from '../domain/assert-user-can-be-created.js';
