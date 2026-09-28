# MetaDAX v0.2 JSON Schemas

JSON Schema (draft 2020-12) files for every persisted v0.2 object and for the
main operation-output objects. The prose in `prompts/SCHEMAS.md` (v0.2) is the
source of truth; these files are its machine-checkable form so that
`tools/validate.js`, the evals and any client can validate records without
reading the prose.

## The `$id` note

Every schema's `$id` is a URL of the form
`https://metadax.daxfoundation.org/schemas/0.2/<name>.schema.json`. This URL is
used **only as an identifier** (and as the base for same-document `$ref`). It is
not fetched over the network and does not need to resolve; nothing dereferences
it.

## Index

Persisted file objects (each carries a `schema` field mapped in `index.json`):

| `schema` value | File | Object (SCHEMAS.md section) |
|---|---|---|
| `metadax.course/0.2` | `course.schema.json` | course.json (S2) |
| `metadax.node/0.2` | `node.schema.json` | node record (S3) |
| `metadax.provenance/0.2` | `provenance.schema.json` | provenance.json (S3b) |
| `metadax.registry-index/0.2` | `registry-index.schema.json` | registry/index.json (S4) |
| `metadax.registry/0.2` | `registry.schema.json` | registry/&lt;module&gt;.json (S4) |
| `metadax.learner/0.2` | `learner-profile.schema.json` | profile.json (S5) |
| `metadax.progress/0.2` | `progress.schema.json` | progress snapshot (S6) |
| `metadax.event/0.2` | `event.schema.json` | session event (S6) |
| `metadax.tutor-turn/0.2` | `tutor-turn.schema.json` | tutor turn envelope (S7) |
| `metadax.manifest/0.2` | `manifest.schema.json` | weekly manifest (S6) |
| `metadax.packet/0.2` | `packet.schema.json` | commit packet (S10) |

Objects without a top-level `schema` field (not in `index.json`, validated by
picking the file directly):

| File | Object |
|---|---|
| `practice-item.schema.json` | MP-06 `practice_set` item (S7) |
| `followup-output.schema.json` | MP-05 `ask` output envelope (S9 / MP-05) |
| `config.schema.json` | `metadax.config.json` client config (SPEC S-10) |
| `error.schema.json` | K-3 error object |

`index.json` maps each `schema` field value to its schema file, for
`tools/validate.js` and the fixture test. It also carries a `by_operation`
object mapping the operations whose outputs have no `schema` field to their
schema file (`MP-05` -> `followup-output.schema.json`, `MP-07` ->
`practice-item.schema.json`); readers that only expect string values skip it.

## How to validate

- **With the bundled test:** `node schemas/tests/check_fixtures.js` walks every
  `*.json` under `fixtures/`, looks up the schema by the file's `schema` field
  via `index.json`, and prints PASS/FAIL per file (exit 1 on any FAIL).
- **With `tools/validate.js`:** the Node tool uses `index.json` the same way.
- **With any 2020-12 validator:** each file is a standalone, self-contained
  draft-2020-12 schema (all `$ref`s are same-document `#/$defs/...`), so it
  loads in ajv or any conformant validator with no external references.

`tools/validate.js` applies these with its built-in jsonschema-lite checker,
limited to: type, required, enum, const, pattern, minLength, maxLength, minimum,
maximum, items, properties, additionalProperties, anyOf, oneOf, same-document
$ref -- keep the schemas within that subset.

## Conventions

- `$schema` is `https://json-schema.org/draft/2020-12/schema` on every file.
- `additionalProperties: false` on every object, except where the prose says
  keys may be added: `supports` values in the learner profile are open, unknown
  keys in `metadax.config.json` are ignored, and the event `data` object is open.
- Every timestamp field (`created_at`, `updated_at`, `ts`, `last_seen`) accepts
  either an RFC 3339 UTC string or the literal `"runtime"` (design law 8 / K-15).
  Every hash field (`content_sha256`, `content_hash`, `sha256`) accepts either
  64 lowercase hex characters or `"runtime"`.
- Array-length rules the prose states in words ("exactly 3 seeds", "1-3
  bullets") are **not** enforced: `minItems`/`maxItems` are outside the
  jsonschema-lite subset above. They remain prose contracts checked elsewhere.
- The `node` inside `followup-output.schema.json` is typed only as an object
  (or null), because the subset supports same-document `$ref` only and cannot
  reference `node.schema.json` across files. Validate an emitted node against
  `node.schema.json` directly.
