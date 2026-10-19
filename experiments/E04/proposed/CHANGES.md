Proposed by the runs of 18-19 Oct 2026; not merged into the canonical files.

# Proposed changes — E04 run 3 (2026-10-18)

These files fix B05 and B06, which blocked E04's stop rule in run 2.

## prompts/MP-02-course-architect.md

**Why:** B05 — ARCHITECT was emitting `course:cell-biology-101`, `concept:electron-transport-chain`, etc., violating the id pattern `^[a-z0-9]+(-[a-z0-9]+)*$`. The prompt said "ids in kebab-case" but never explicitly forbade namespace prefixes.

**Change:** Added one sentence after the Concepts bullet in step 3 of Mode design/quick:

> Id rule (all ids): emit bare ids that match the exact pattern — never prefix with `course:`, `lesson:`, `module:`, `concept:`, or any other namespace. Counter-example: `concept:electron-transport-chain` ✗ → `electron-transport-chain` ✓; `course:cell-biology-101` ✗ → `cell-biology-101` ✓.

This rule covers all id-generating contexts in the prompt (design, quick, suggest, revise) because the id format is universal.

## schemas/suggestions-output.schema.json (new)

**Why:** B06 — no schema existed for the MP-02 `suggest` operation output. The `suggest` output (`{"type":"suggestions","level":...,"parent_id":...,"items":[...],"new_concepts":[...]}`) is an operation output, not a persisted file object. grade.js needs a schema to validate it.

**Change:** New schema that validates the required fields of the suggestions output envelope.

## schemas/rendering-output.schema.json (new)

**Why:** B06 — no schema existed for the MP-04 `render` operation output. The `render` output (`{"type":"rendering","node_id":...,"rendering_md":...,"personalized_with":[...],"warnings":[]}`) is an operation output, not a persisted file object.

**Change:** New schema that validates the required fields of the rendering output envelope.

## evals/cases/MP-02/suggest/expect.json

**Why:** B06 — `expect.schema` was `metadax.course/0.2` (a persisted-file schema), which is wrong for a `suggestions` output. This caused false schema-failure failures in run 2 — not a model miss.

**Change:** `schema` → `suggestions-output.schema.json`; `type` restricted to `["suggestions"]`.

## evals/cases/MP-04/render-for-learner/expect.json

**Why:** B06 — `expect.schema` was `metadax.node/0.2` (a persisted-file schema), wrong for a `rendering` output. grade.js was validating the whole rendering envelope against the flat node schema.

**Change:** `schema` → `rendering-output.schema.json`; `type` restricted to `["rendering"]`.

## evals/build_cases.js

**Why:** B06 + v0.3 id consistency. Three changes:
1. B06: updated `expect.schema` for suggest and render-for-learner cases to point at the new output-type schemas.
2. v0.3 id update: replaced legacy v0.2 breadcrumb ids (P2/P3/P4/BPG constants) with their v0.3 opaque equivalents from the migrated fixture — the old constants caused assemble.js to fail when looking up nodes.
3. Removed `node_id_prefix` expect checks that conflict with v0.3 opaque ids (opaque ids start with `n_`, never with a parent id breadcrumb). The committed expect.json files already lacked these checks.
