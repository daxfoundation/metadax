# Meta DAX v0.2 change spec (frozen for the Phase 1 build, 2026-09-27)

This file is the single contract for the Phase 1 build. It is frozen: nothing edits it. Where the build found a contradiction, v0.1.1 behaviour was kept for that point and the conflict was reported. Everything not listed here is unchanged from Prompt Suite v0.1.1 (the reasoning is summarised in `docs/CONCEPTS.md`).

## S-1 Version and tone

1. Every `schema` value becomes `metadax.<thing>/0.2`. Files: `00-README.md` header, all `MP-xx` headers, `SCHEMAS.md`, new `CHANGELOG-v0.2.md`.
2. Prompt bodies (the text inside the ```text fences that a client pastes) are written calmly: no ALL-CAPS words, no bold, "must"/"never" in normal case. Section names such as `<<START PATH>>` and the `K-n` / `STEP n` labels stay. The "Normative contract" sections outside the fences keep RFC wording (MUST/SHOULD) because they are for runtimes and reviewers.
3. Depth of a node is still `1 + count("/")` in its id; slug rule, 200-char cap, `bloom_level` name and the Bloom weights 10/15/20/20/15/20 are unchanged.

## S-2 Kernel: K-15 stamping

Add K-15 to MP-00: "Stamping. You never compute timestamps, hashes, byte counts or random ids. Where a schema has `created_at`, `updated_at`, `ts`, `content_sha256` or a `provenance` file, write the literal string `"runtime"` and the client's stamping step (`tools/stamp.py`) fills it in. The one exception is `learner_id` (K-2, MP-01 rule), which you create from letters and digits." Add `unstamped` to the K-14 warning list (a client sets it when it saved a record without stamping).

## S-3 CONFIG keys

Add two keys to SCHEMAS section 8 CONFIG table, read by all operations:

| Key | Values (default) | Meaning |
|---|---|---|
| `client` | `claude-code`, `claude-desktop`, `api`, `chatgpt`, `companion`, `manual` (`manual`) | which client is assembling the stack; prompts do not branch on it except MP-10, which mentions it in its first message |
| `write_mode` | `git`, `packet`, `none` (`packet`) | `git`: the client writes files itself; `packet`: the model ends every output with a COMMIT PACKET (S-9); `none`: nothing is persisted (read-only session) |

## S-4 Node record (SCHEMAS section 3)

Add these fields to every node (new nodes carry them; v0.1 nodes without them stay valid):

- `path`: array of `{id, title, summary}` for every ancestor root to parent, in order, copied from the PATH block the engine received (a `trail` entry is copied as is). Empty for depth-1 nodes. This makes a node self-describing: a client can rebuild the PATH block from the node file alone.
- `created_at`, `updated_at`: RFC 3339 UTC strings, written as `"runtime"` by the model (K-15).
- `content_sha256`: hex sha256 of the JSON Canonicalization Scheme (RFC 8785) serialisation of the `core` object, written as `"runtime"` by the model. `tools/stamp.py` computes it.
- `superseded_by`: node id or null. Set by MP-09 `dedupe` instead of deleting.
- Directory per node is unchanged: `nodes/<id>/node.json`, and beside it `nodes/<id>/provenance.json` (S-7), written by the client, never by the model.

## S-5 Registry (SCHEMAS section 4): per-module files

Replace the single `nodes/index.json` with:

- `registry/index.json`: `{ "schema":"metadax.registry-index/0.2", "course_id", "updated_at", "modules": [ { "id":"L03.M02", "file":"registry/L03.M02.json", "node_count": 12, "updated_at" } ] }`
- `registry/<module-id>.json`: the v0.1 registry shape (`schema`:`metadax.registry/0.2`, `course_id`, `module_id`, `updated_at`, `nodes[]` with the same entry fields as v0.1.1 plus `depth` and `superseded_by`).

Rule: a node belongs to the registry file of the module its id starts with (`L03.M02.O01/...` -> `registry/L03.M02.json`). Reason: two learners committing follow-ups in different modules never touch the same file, so git merges cleanly. MP-05 and MP-09 receive REGISTRY exactly as before (children of parent + course-wide candidates); how the client builds that block from the per-module files is the client's job (MP-03 describes it in one paragraph: read the parent's module file fully, then the index, then up to 12 candidates from other modules by lexical overlap with INPUT).

## S-6 Learner repo: append-only records

Progress (SCHEMAS section 6) becomes snapshot-based:

- `learners/<learner-id>/progress/<course-id>/<device-id>/<YYYY-MM-DD>.json`: one file per device per day, the full v0.1 progress object (`metadax.progress/0.2`) plus `device_id` and `snapshot_date`. The latest date across devices is the current state; MP-08 merges when two devices disagree (max competency per concept, union of levels with the better status winning, union of `followups_asked`). A device id is `dev-` + 6 lowercase letters or digits chosen by the client once and kept in `metadax.config.json`.
- Sessions: `learners/<learner-id>/sessions/<session-id>/event-<seq:04d>.json`, one file per event, never edited. Event object: `{ "schema":"metadax.event/0.2", "session_id", "seq", "ts":"runtime", "type": "follow_up | answer | hint | skip | summary | handoff | return | note", "course_id", "node_id", "concept", "bloom_level", "result", "data": {} }`. `session-id` is `ses-` + `<YYYYMMDD>` + `-` + 4 lowercase letters or digits.
- Tutor turns: `learners/<learner-id>/sessions/<session-id>/turn-<seq:04d>.json`, the full MP-06 turn envelope, one file per turn, never edited.
- Weekly manifest: `learners/<learner-id>/manifests/<YYYY>-W<WW>.json`: `{ "schema":"metadax.manifest/0.2", "learner_id", "week", "device_id", "files":[ { "path", "sha256", "bytes" } ], "bytes_total", "ts":"runtime" }`. Written by `tools/stamp.py manifest`; soft cap 600 KB per week (warn, do not refuse).
- Learner profile (section 5) is unchanged except `schema` 0.2, plus `created_at`, `updated_at`.
- Private nodes stay at `learners/<learner-id>/nodes/<id>/node.json` (unchanged).

MP-08 (steward) reads PROGRESS as the latest snapshot per device and SESSION as the event files; its output is a new snapshot object, never an edit of an old one. MP-11 RECORDS (a records/export operation) is deferred to v0.3; do not write it.

## S-7 Provenance and constraints (additive, companion-compatible)

- `nodes/<id>/provenance.json`, written only by `tools/stamp.py`: `{ "schema":"metadax.provenance/0.2", "node_id", "content_hash": "<same value as node.content_sha256>", "created_by": { "id": "<learner or author pseudonym>", "key_id": null, "chain_role": "author | learner | curator | client" }, "lineage": [ { "node_id", "relation": "parent | reuse | extend | redirect" } ], "constraints": { "constraint_decl_ref": null }, "spec_version": "0.2", "ts":"runtime" }`. `key_id` and `constraint_decl_ref` are null in Phase 1; they are reserved for the Constraint Protocol and are never described as live.
- `course.json` gains an optional `constraint_decl: null` (reserved, same rule) and `created_at`, `updated_at`, `license` (SPDX id string, default `CC-BY-4.0`) and `generated_segments_license` (`CC0-1.0`).

## S-8 Age wall (decision D1)

Prompts keep every minor band and rule in K-5, K-12, MP-01 and MP-05 STEP 4 unchanged (the companion will use them). The Phase 1 clients add a wall in front of them: MP-01 `create` in any client with `client != companion` accepts only `age_band: "adult"`; if the learner states a minor age or `unknown`, the client says that the Claude Code and desktop clients are for adults in Phase 1 and stops. This wall lives in the skills and docs/PRIVACY.md, not in the prompts.

## S-9 COMMIT PACKET (write_mode = packet)

When `write_mode` is `packet`, every operation output that produces files ends with a fenced block:

```text
<<START COMMIT PACKET>>
{ "schema":"metadax.packet/0.2", "repo": "course | learner", "message": "<one line>", "files": [ { "path": "nodes/L01.M01.O01/proteins-essential-atp-synthesis/node.json", "op": "create | update | append", "content": <the JSON object> } ] }
<<END COMMIT PACKET>>
```

`op: "create"` must fail if the path exists (no overwrite, MP-05 contract 8). The client (Claude Code skill, a human in Claude Desktop, or `tools/apply_packet.py`) applies it, then stamps. In `git` mode the model outputs the same objects but the skill writes them directly; MP-xx bodies describe outputs as "the record" and never assume one write mode.

## S-10 Client config

`metadax.config.json` at the root of a working folder (gitignored) is the Claude Code client's only state: `{ "course_repo": "<path or git url>", "learner_repo": "<path or git url>", "learner_id": "lrn-...", "device_id": "dev-...", "client": "claude-code", "write_mode": "git", "model_hint": "<optional: the model id your client uses>" }`. Paths are local checkouts; the skill runs `git pull --rebase` before reading and `git commit` + `git push` after stamping. It never stores tokens: authentication is whatever the user's `git` already has (a PAT in the credential helper, or `gh auth`).

## S-11 Ownership of these changes

The build assigned each change above to one owner so that concurrent work never touched the same files. The assignment table is omitted from the public copy.

## S-12 Rulings made during the build (2026-09-27)

1. **Tools are Node.js, not Python.** Claude Code requires Node, so every user of the Claude Code client already has `node`; Python is not guaranteed on Windows and was absent from the build environments. `tools/<name>.py` reads `tools/<name>.js`, invoked as `node tools/<name>.js`; zero dependencies, Node >= 18. The command lines in skills, adapters, docs and prompts use the `.js` names; any remaining `.py` reference means the `.js` file.
2. **`links[]` entries are objects** `{ "id": <node id>, "relation": "extend" | "reuse" | "redirect" }`, not bare ids, so provenance lineage can be derived from the node alone (the fixture uses this shape).
3. **Objective nodes are registry entries** (`parent_id` null, `intent` null, `canonical_question` may be `""`): the REGISTRY block needs them for `ancestor` and `redirect` decisions, and "every shared node appears exactly once in its module's registry file" stays a single rule.
