# Meta DAX tools

The deterministic half of a Meta DAX client. The model never computes hashes,
timestamps, byte counts or random ids (SPEC S-2); these tools do. Every value an
LLM writes that must be stamped is emitted as the literal string `"runtime"` and
filled in here.

**Node >= 18, zero dependencies.** CommonJS, invoked as `node tools/<name>.js`.
Why Node and not Python: Claude Code ships with Node, so every user of the
Claude Code client already has it; Python is not guaranteed on Windows. No npm
install, no network. Each CLI tool exits
non-zero on failure and never writes outside the repo path it is given.

| Tool | Purpose | Example |
|---|---|---|
| `canon.js` | RFC 8785 (JCS) JSON canonicalisation and sha256 (library + CLI) | `node tools/canon.js node.json --hash` |
| `lib.js` | shared helpers: read/write JSON, node ids, module-of, RFC 3339 time, ISO week, random ids (library) | `const lib = require('./tools/lib.js')` |
| `jsonschema-lite.js` | the JSON Schema 2020-12 subset validator used by `validate.js` (library) | `const jsl = require('./tools/jsonschema-lite.js')` |
| `path.js` | slug rule, child id (collision suffix + 200-char cap), PATH array, depth | `node tools/path.js slug "Cytochrome c: structure and role"` |
| `stamp.js` | fill `"runtime"` timestamps, hashes and ids; write `provenance.json` | `node tools/stamp.js node nodes/L01.M01.O01/node.json --by lrn-7qk2x9 --role learner` |
| `assemble.js` | build the context stack for one operation (SCHEMAS section 8) | `node tools/assemble.js --op MP-05 --course ./course --node L01.M01.O01/... --input "..." --prompts ./prompts --out stack.txt` |
| `apply_packet.js` | apply an S-9 COMMIT PACKET (create/update/append), then stamp | `node tools/apply_packet.js packet.json --course ./course --learner ./learner --stamp` |
| `validate.js` | structural + schema validation of a course or learner repo | `node tools/validate.js course ./course` |

## Stamping ids

```
node tools/stamp.js id learner    # lrn- + 8 lowercase [a-z0-9]
node tools/stamp.js id device     # dev- + 6
node tools/stamp.js id session    # ses-<YYYYMMDD>- + 4
```

## Stamping a course, the registry index, and reuse

`stamp.js course` and `stamp.js node` accept either the JSON file or the
directory that holds it (`course.json` / `node.json` are found inside a directory
argument), so both forms work:

```
node tools/stamp.js course ./course             # dir form
node tools/stamp.js course ./course/course.json # file form (equivalent)
```

```
node tools/stamp.js index ./course
```

`index` re-stamps `registry/index.json` `updated_at`, recomputes every module's
`node_count`, creates the index if it is missing, and fills `course_id` from
`course.json` when it is empty or the `my-course` placeholder. `stamp.js course`
runs this same index step at the end, so after writing `course.json` a single
`stamp.js course ./course` stamps both the course and the index.

```
node tools/stamp.js reuse ./course L01.M01.O01/proteins-essential-atp-synthesis
```

`reuse` increments the node's registry-entry `reuse_count` and the node's
`stats.reuse_count`, re-stamping `updated_at` on both. It never touches `core` or
`content_sha256`, so the content hash stays stable.

## Canonicalisation (JCS) note

`canon.js` implements the JSON Canonicalization Scheme (RFC 8785) for the
Meta DAX subset: object keys are sorted by their UTF-16 code units (JavaScript's
default string comparison), there is no insignificant whitespace, strings use
the RFC 8785 minimal-escape rule, and integers are their base-10 digits. Floats
follow the ES6 Number-to-string rule (`String(n)`), so an integral value renders
without a fractional part. Meta DAX records avoid floats: competency is an
integer, and the one float in a schema (`reuse.confidence`) is written only by
the model and is never hashed. `content_sha256` is the sha256 of the canonical
serialisation of a node's `core` object; `stamp.js` computes it and `validate.js`
recomputes it to detect tampering.

## Tests

```
node tools/tests/run.js
```

The suite builds a tiny course in a temp dir (2 objectives, 3 follow-ups
including one at depth 3), stamps it, validates (expects OK), corrupts a hash
(expects FAIL), checks the slug and canon worked examples, and validates the
bundled fixtures. It then runs `tools/tests/run_b.js`, which assembles MP-05 and
MP-06 stacks (checking block order and REGISTRY contents), applies a create
packet with `--stamp` and re-validates, refuses a create on an existing path,
and applies a registry append. It runs on plain `node` with no packages.
