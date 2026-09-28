# MetaDAX Prompt Suite: CHANGELOG v0.2 (2026-09-27)

v0.2 applies `docs/SPEC-v0.2.md`, the frozen change spec for the Phase 1 build.
Everything not listed there is unchanged from v0.1.1. Schema ids
move to `metadax.*/0.2`. All changes are text edits to the prompts and schemas
plus new client, tooling, fixture and doc files; none had been re-run against a
model when this changelog was written (the first end-to-end runs are recorded in
`experiments/E01/results/` and `experiments/E03/results/`). The v0.1.1
red-team history stays in `CHANGELOG-v0.1.1.md`.


## Changes

| Spec | Files touched | What v0.2 does |
|---|---|---|
| S-1 Version and tone | `SCHEMAS.md`; `MP-01`..`MP-04`, `MP-07`..`MP-10` bodies; `MP-00`; `MP-05`; `MP-06`; `00-README.md`; `CHANGELOG-v0.2.md` (new) | Every `schema` value becomes `metadax.<thing>/0.2`. Prompt bodies inside the ```text fences are rewritten calmly: no ALL-CAPS words, no bold, "must"/"never" in normal case. Section labels (`<<START PATH>>`), `K-n` and `STEP n` stay; the normative sections outside the fences keep RFC wording. Depth, slug rule, 200-char cap and the Bloom weights are unchanged. |
| S-2 Kernel K-15 stamping | `MP-00-kernel.md` | Adds K-15: the model never computes timestamps, hashes, byte counts or random ids; it writes the literal `"runtime"` where a schema has `created_at`, `updated_at`, `ts`, `content_sha256` or a provenance file, and the client's `tools/stamp.js` fills them in. Only `learner_id` (K-2) is model-created. Adds `unstamped` to the K-14 warning list. |
| S-3 CONFIG keys | `SCHEMAS.md` (section 8 CONFIG table); `MP-10-session-runner.md`; `MP-03-context-compiler.md` | Adds `client` (which client assembles the stack) and `write_mode` (`git`, `packet`, `none`; default `packet`), read by all operations. No prompt branches on `client` except MP-10, which names both `CONFIG.client` and `CONFIG.write_mode` in its first message. MP-03 passes them through the assembled stack. |
| S-4 Node record | `SCHEMAS.md` (section 3); `MP-04-node-content.md`; `MP-03-context-compiler.md`; `MP-09-registry-curator.md`; `MP-05-followup-engine.md` | Every node gains `path[]` (ancestor `{id,title,summary}` copied from the PATH block, empty at depth 1), `created_at`/`updated_at`/`content_sha256` (`"runtime"`), and `superseded_by` (node id or null). MP-04 emits these fields; MP-03 rebuilds the PATH block from `node.path[]`; MP-09 `dedupe` sets `superseded_by` instead of deleting. A `provenance.json` sits beside each node, written only by the client. |
| S-5 Registry per-module files | `SCHEMAS.md` (section 4); `MP-03-context-compiler.md`; `MP-09-registry-curator.md`; `MP-05-followup-engine.md` | Replaces the single `nodes/index.json` with `registry/index.json` plus one `registry/<module-id>.json` per module, so two learners committing follow-ups in different modules never touch the same file. MP-03 assembles the REGISTRY block (parent module file, then index, then up to 12 cross-module candidates by lexical overlap); MP-09 `promote` moves a registry entry within its module file. |
| S-6 Learner repo append-only records | `SCHEMAS.md` (section 6); `MP-08-progress-steward.md`; `MP-01-learner-profile.md`; `MP-06-bloom-tutor.md` | Progress becomes snapshot-based (one file per device per day); sessions and tutor turns become one immutable file per event/turn; a weekly manifest is written by `tools/stamp.js`. MP-08 reads the latest snapshot per device and the event files, and outputs a new snapshot (never an edit), merging across devices when they disagree. MP-01 profile gains `created_at`/`updated_at`. MP-06 writes one turn envelope per turn. |
| S-7 Provenance and constraints | `SCHEMAS.md` (section 7); `MP-02-course-architect.md` | Adds `nodes/<id>/provenance.json` (written only by `tools/stamp.js`), with `content_hash`, `created_by`, `lineage`, a reserved `constraints.constraint_decl_ref` and `spec_version`. `course.json` gains reserved `constraint_decl: null`, plus `created_at`, `updated_at`, `license` (default `CC-BY-4.0`) and `generated_segments_license` (`CC0-1.0`). `key_id` and `constraint_decl_ref` stay null and are never described as live. |
| S-8 Age wall | not a prompt change (`skills/`, `docs/PRIVACY.md`); note landed in `MP-01-learner-profile.md` | The prompts keep every minor band and rule in K-5, K-12, MP-01 and MP-05 STEP 4 (the companion uses them). The Phase 1 clients add a wall: `MP-01 create` in any client with `client != companion` accepts only `age_band: "adult"`, and a stated minor age or `unknown` stops with a Phase-1-adults message. That wall lives in the skills and privacy doc; MP-01 carries a note pointing at it. |
| S-9 COMMIT PACKET | `SCHEMAS.md` (section 10); `MP-10-session-runner.md` | When `write_mode` is `packet`, every operation output that produces files ends with a fenced `<<START COMMIT PACKET>> ... <<END COMMIT PACKET>>` block (`metadax.packet/0.2`, `repo`, `message`, `files[]` with `op` create/update/append and the JSON content); `op: "create"` fails if the path exists. In `git` mode the client writes the files and MP-10 says "saved" only after the client confirms; in `none` mode nothing is persisted. |
| S-10 Client config | not a prompt change (`skills/`, `docs/INTERFACE.md`, `docs/WALKTHROUGH-CLAUDE-CODE.md`); summarized in `00-README.md` | `metadax.config.json` at the root of a working folder (gitignored) is the Claude Code client's only state (`course_repo`, `learner_repo`, `learner_id`, `device_id`, `client`, `write_mode`, `model_hint`). The skill runs `git pull --rebase` before reading and `git commit`/`push` after stamping, and never stores tokens. The README describes it; the behaviour lives in the skills. |

| S-12 rulings | skills, adapters, docs and prompts | Tools are Node.js, zero dependencies (not Python); `links[]` entries are `{id, relation}` objects (relation: extend, reuse, redirect); objective nodes are registry entries (`parent_id` null, `intent` null, `canonical_question` may be empty); a learner repo holds one learner and its root is the learner directory (`learners/<learner-id>/` in docs means the repo root). |

## Deferred to v0.3

- MP-11 RECORDS: a records/export operation over the learner repo. Not written in v0.2.
- LITE prompts for small on-device models: condensed MP-05 and MP-06 (about 600 tokens each) and a shorter manual-mode SCHEMAS excerpt, tested on 1-4B models.
- `constraint_decl` semantics: the field is reserved and null in v0.2; the Constraint Protocol that would give it meaning is not defined here and is never described as live.
- MP-02 `build` naming: the skills map a "build" verb to the `design` mode; a first-class `build` mode name is left for v0.3.
