# The operation contract (docs/INTERFACE.md)

This is the generic interface every Meta DAX client implements. A client is
anything that assembles a prompt stack, runs it against a model, checks the
reply and persists the result to git: Claude Code, Claude Desktop, an API
runner, the companion, or ChatGPT. The prompts (`prompts/MP-00` .. `MP-10`) and
the schemas (`schemas/`, `prompts/SCHEMAS.md`) are the source of truth; this
file says how a client drives them and what it must guarantee before writing a
byte to a repo.

Frozen contract: `docs/SPEC-v0.2.md`. Concepts and reasoning: `docs/CONCEPTS.md`.
Schema version referenced throughout is `0.2`.

Two rules hold everywhere and are repeated because they are load-bearing:

1. The model never computes a timestamp, hash, byte count or random id. It
   writes the literal string `"runtime"` in those fields (kernel K-15). The
   client's STAMP step fills them in with `tools/stamp.js`. The one exception is
   `learner_id`, which MP-01 creates from letters and digits.
2. One operation call produces exactly one JSON object. No prose around it, no
   second object. In `git` mode the client writes the record; in `packet` mode
   the same object rides inside a COMMIT PACKET (S-9) that a human or a tool
   applies.

---

## (a) One operation = one contract

Every operation takes named input blocks (some required, some optional for the
mode), runs one prompt, and returns one JSON object. The table below is built
from each MP's `Inputs` and `Normative contract` sections. Modes are the exact
strings the prompt defines; a client picks the mode, the prompt does not branch
on `client`.

| Op | id | Modes | Required blocks | Optional blocks | Output object | Records it produces |
|---|---|---|---|---|---|---|
| PROFILE | MP-01 | `interview`, `from_description`, `diagnostic`, `update` | CONFIG; INPUT (interview/from_description/update); COURSE (diagnostic) | LEARNER | `metadax.learner/0.2` (`type: profile`; turns `profile_question`, `profile_patch`) | `learners/<id>/profile.json` |
| ARCHITECT | MP-02 | `design`, `quick`, `suggest`, `revise` | CONFIG; INPUT; COURSE (suggest/revise); CONTENT (suggest) | SOURCE, LEARNER | `metadax.course/0.2` (`type: course`/`suggestions`/`patch`/`clarify`) | `course.json` |
| COMPILE | MP-03 | `compress` | CONFIG; INPUT | -- | `type: compiled` (blocks, dropped) | none (feeds the next call) |
| CONTENT | MP-04 | `generate`, `render`, `extend_core` | CONFIG; OBJECTIVE, CONCEPTS, steers (generate/extend_core); CONTENT (render/extend_core) | SOURCE, LEARNER, INPUT | `metadax.node/0.2` (`type: node`/`rendering`/`core_patch`) | `nodes/<id>/node.json`; `nodes/<id>/renderings/<audience-key>.md`; learner-repo node/rendering when private |
| FOLLOWUP | MP-05 | `ask`, `zoom_out` | CONFIG, COURSE, OBJECTIVE, PATH, ANCHOR, REGISTRY, INPUT (ask) | LESSON, MODULE, CONCEPTS, LEARNER, SOURCE | `type: followup`/`zoom_out`/`error` with `decision`, `node` (`metadax.node/0.2`) | node (course or learner repo per visibility); registry append; session event |
| TUTOR | MP-06 | `quiz`, `practice_set` | CONFIG, CONCEPTS, CONTENT; SESSION + INPUT (quiz) | LEARNER, PROGRESS | `metadax.tutor-turn/0.2` (`intro`/`question`/`feedback`/`handoff`/`summary`/`error`); `practice_set` | `sessions/<sid>/turn-<seq>.json`; session events; progress snapshot after a summary |
| EVALUATE | MP-07 | (single) | CONTENT, INPUT, CONFIG | LEARNER | `type: evaluation` (score, result, criteria) | session event (practice result) |
| STEWARD | MP-08 | `next_step`, `teacher_report` | COURSE, PROGRESS, SESSION, LEARNER | -- | `type: progress_update`/`teacher_report` (`metadax.progress/0.2`) | new progress snapshot; `profile_suggestions` (to MP-01 update); `mentor_note` |
| CURATE | MP-09 | `review`, `dedupe`, `promote`, `verify_rendering`, `audit_course` | CONTENT and/or REGISTRY, COURSE per mode; SESSION (promote) | SOURCE | `type: curation` (ops[]) / `type: verification` | none directly; ops a client applies (`alias_of`, `set_visibility`, `superseded_by`, `reject`); proposals |
| RUN | MP-10 | (single dispatcher) | SESSION MEMORY (COURSE, LEARNER, CURRENT, PATH, NODES, PROGRESS, EVENTS) | -- | markdown reply then a JSON state block | dispatches to MP-01..MP-09; `/export` emits `{path, content}` list |

Notes that bind a client:

- Node record fields (S-4): every node carries `path` (ancestor `{id,title,summary}`
  root-to-parent, empty for depth 1), `created_at`, `updated_at`, `content_sha256`,
  `superseded_by`. The model writes `"runtime"` for the three stamped fields.
- Registry (S-5): a node belongs to `registry/<module-id>.json`, chosen by the
  prefix of its id (`L03.M02.O01/...` -> `registry/L03.M02.json`), plus a
  `registry/index.json` listing the module files. There is no course-wide
  `nodes/index.json` in 0.2.
- Provenance (S-7): `nodes/<id>/provenance.json` is written only by
  `tools/stamp.js`, never by the model. `key_id` and `constraint_decl_ref` are
  null in Phase 1.

---

## (b) The client pipeline

Seven steps, in order. A client may skip PERSIST/STAMP/COMMIT in a read-only
session (`write_mode = none`) but never reorders the rest.

**PREPARE.** `git pull --rebase` both repos (course and learner) so REGISTRY and
PROGRESS are current. Read `metadax.config.json` (S-10) for repo paths,
`learner_id`, `device_id`, `client`, `write_mode`, `model_hint`.

**ASSEMBLE.** Build the stack file: kernel (MP-00) + the operation prompt +
each input block the mode needs, with CONFIG carrying `client` and `write_mode`.
Use `tools/assemble.js`, e.g.

```
run: node tools/assemble.js --op MP-05 --course <dir> --learner <dir> \
  --learner-id <id> --node <id> --input "<text>" \
  --config client=claude-code --config write_mode=git \
  --prompts prompts --out workspace/stack-<n>.txt
```

or assemble by hand from the same pieces. The assembler truncates INPUT to 500
chars and `ANCHOR.quote` to 200 chars (MP-03), and builds REGISTRY from the
per-module files: read the parent's module file in full, then `registry/index.json`,
then up to 12 candidates from other modules by lexical overlap with INPUT.

**RUN.** Any model. The reply is exactly one JSON object. On the self-hosting
Claude Code client the model running the skill is also the model that executes
the meta prompt: it reads the stack file in full, treats it as the instructions
for the step, and writes the single JSON object to `workspace/out-<n>.json`. On
the API runner the stack is posted to the Messages or Responses API and the one
object comes back in the completion. Nothing else is produced.

**CHECK.** Structural gates the client enforces before persisting anything.
These are not optional; a reply that fails a gate is not written.

- Ids come only from REGISTRY or PATH (or are minted by the operation's id
  rule). No id is ever invented. `target_id`, `links[]`, `reuse.of` must resolve
  in REGISTRY or PATH and are never the literal `"trail"`.
- Prefix rule: a new node's id starts with `parent_id + "/"`, and the parent is
  the last entry in PATH. `depth == 1 + count("/")`.
- Slug rule (SCHEMAS S-1): lowercase, ASCII letters/digits/spaces only, drop
  stop-words, first 5 words joined by `-`, cut to 32 chars at a word boundary,
  collision suffix `-2`, `-3`.
- Id length <= 200 characters. Title <= 80 characters, plain text, not the
  answer.
- No overwrite: `op: "create"` fails if the path already exists (MP-05 contract 8).
  Edits become new nodes with the old one marked `superseded_by` (MP-09), never
  an in-place rewrite of a shared node's `core` sections or ids.
- Private never in the course repo: a `private` node lives only under
  `learners/<id>/nodes/<id>/node.json`; its question text appears in no
  course-repo file; a child of a private node is private.
- Visibility rules (MP-05 STEP 4): `private` unless the learner opted in to
  sharing; else `pending_review` for any minor band, `"unknown"`, LEARNER
  `"none"`, or a course whose `policy.learner_nodes` is `pending_review`; else
  `shared`. A learner running CONTENT `generate` never produces a `shared` node.
- `core` carries no learner-specific content (K-6); personalization lives only
  in `rendering_md`.
- Age wall (S-8, this client only): MP-01 `create` with `client != companion`
  accepts only `age_band: "adult"`. A stated minor age or `"unknown"` stops the
  session with the adults-only message. The wall lives here and in the skills,
  not in the prompts.

**PERSIST.** In `git` mode the client writes each file with `op` semantics
(`create` refuses to overwrite; `append` adds a registry or event entry). In
`packet` mode the model's output already ends with a COMMIT PACKET (S-9); the
client, a human, or `tools/apply_packet.js` applies it:

```
run: node tools/apply_packet.js <packet.json> --course <dir> --learner <dir> --stamp
```

**STAMP.** Fill every `"runtime"` field with `tools/stamp.js` (K-15). Node,
course, profile, snapshot, event, turn, manifest and registry each have a
subcommand; ids come from `tools/stamp.js id learner|device|session`. Stamping
also writes `nodes/<id>/provenance.json`. A record saved without stamping
carries the `unstamped` warning until a later stamp pass fixes it. Every stamp
subcommand takes either the JSON file path or the directory that holds it
(`course`/`node` also accept the course or node directory and find
`course.json`/`node.json` inside).

```
run: node tools/stamp.js node <node-dir> --by <author> --role author
```

**VALIDATE.** `tools/validate.js course <dir>` and
`tools/validate.js learner <dir> --course <dir>`. A teacher validates after
every 3 nodes and once at the end; a learner validates each persisted output.
When the repo is a separate checkout outside this `metadax` tree it has no
`schemas/` of its own; validate then prints
`WARN: schema validation skipped (no schemas/ found; pass --schemas <dir>)`.
Add `--schemas <metadax>/schemas` to run the schema checks against this clone.

**COMMIT / PUSH.** Commit with a message `metadax: <op> <id>`, `git push` the
course repo for shared/pending nodes and the learner repo for private data. If
the course-repo push is refused (no write permission), keep the node in the
learner repo as `pending_review` and tell the learner it will be offered to the
course author later (the D7 fork/publish flow; docs to follow).

---

## (c) The four client profiles

All run the same pipeline; they differ only in RUN and PERSIST.

**Claude Code (git-native, self-hosting).** `client=claude-code`,
`write_mode=git`. The model running the skill executes the meta prompt itself,
so RUN is "read the stack file, write one JSON object, save it". PERSIST is a
checked file write; the skill then shells out to `tools/stamp.js` and
`tools/validate.js` and `git commit`/`push`. Authentication is whatever `git`
already has (a PAT in the credential helper, or `gh auth`); no token is ever
stored in a repo. This is the reference client and the one the skills implement.

**Claude Desktop.** `client=claude-desktop`, `write_mode=packet`. The model
cannot be assumed to write files, so every file-producing output ends with a
COMMIT PACKET. A human applies it (web editor, or paste into an Issue that a
learner-repo workflow ingests) or runs `tools/apply_packet.js`. Do not assume a
GitHub connector: desktop users without one apply packets by hand or with the
tool. Uses the adapters (`adapters/HEADER.claude.md`, `adapters/COMMIT-PACKET.md`).

**API runner.** `client=api`, `write_mode=packet` (or `git` if the runner has a
local checkout). A thin script, about 20 lines, not written here. Its contract:
read the assembled stack file; post it to the Anthropic Messages API
(`POST /v1/messages`, model from `model_hint`, single user turn, the stack as
the content) or the OpenAI Responses API (`POST /v1/responses`, `input` = the
stack); take the one JSON object from the completion; if `write_mode=packet`,
pass it to `tools/apply_packet.js --stamp`; else write, stamp and validate as
the git client does; then commit and push. The script holds the API key from the
environment, never from a repo. It performs the same CHECK gates as any other
client before persisting.

**Companion (Phase 3 bundle).** `client=companion`, `write_mode=git` into a
local checkout, offline, deferred sync by `git bundle`. It is the only client
that keeps the minor age bands (the age wall in (b) applies to every client
except `companion`). Not built in Phase 1; the pipeline is designed so it drops
in without a schema change.

**ChatGPT.** `client=chatgpt`, `write_mode=packet`. Same packet path as Claude
Desktop, delivered as Agent Skills readable from `.agents/skills/`. Custom GPTs
are not a distribution channel (creation is closed; retirement 2026-12-11). Uses
`adapters/HEADER.chatgpt.md`.

---

## (d) What a client must never do

1. Compute a timestamp, hash, byte count or random id in the model. Always
   `tools/stamp.js` (K-15). The only id the model makes is `learner_id`.
2. Let the model write files unchecked. Every persisted output passes the CHECK
   gates first, through `apply_packet.js` or a checked write followed by stamp
   and validate.
3. Put learner data in a course repo. Profiles, progress, sessions, turns and
   private nodes live only in the private learner repo. A minor-authored node
   that is shared has its verbatim `question` stripped and `created_by` set to
   anonymous first.
4. Skip the age wall. Phase 1 clients (all but the companion) are adults-only.
5. Store a token, secret, email or a learner's real name anywhere in any repo.
   Authentication is the user's existing `git` credential.

---

## (e) Worked example: one follow-up question

An adult learner reading section `s2` of node `L01.M01.O01` (course
`cell-biology`, learner `lrn-4k9m2p3q`, device `dev-a1b2c3`) asks:
"how does ATP actually store the energy?" The client is Claude Code,
`write_mode=git`. Both repos are checkouts on disk.

1. PREPARE: `git pull --rebase` in both repos.
2. ASSEMBLE: `tools/assemble.js --op MP-05 ... --node L01.M01.O01 --input "how does ATP actually store the energy?" --config client=claude-code --config write_mode=git --prompts prompts --out workspace/stack-7.txt`. REGISTRY is built from `registry/L01.M01.json` (the parent's module) plus `registry/index.json` plus up to 12 candidates. PATH is empty of `trail`; ANCHOR is section `s2` with its text and a <=200-char quote.
3. RUN: the model reads `workspace/stack-7.txt`, returns one object to `workspace/out-7.json` with `decision: "new"`, a `node` whose id is `L01.M01.O01/atp-stores-energy-phosphate-bonds`, `created_at`/`updated_at`/`content_sha256` all `"runtime"`, and three seeds.
4. CHECK: id starts with `L01.M01.O01/`; depth is 2; slug is within 32 chars; title <= 80; no overwrite (the path is new); the learner is an adult who opted in to sharing, so visibility is `shared`; `core` has no learner detail.
5. PERSIST (git): write `nodes/L01.M01.O01/atp-stores-energy-phosphate-bonds/node.json`; append an entry to `registry/L01.M01.json`; bump the module in `registry/index.json`; append `event-0003.json` to the learner's session.
6. STAMP: `tools/stamp.js node ...` fills the three fields and writes `nodes/L01.M01.O01/atp-stores-energy-phosphate-bonds/provenance.json`; `tools/stamp.js registry ...` and `tools/stamp.js event ...` stamp the rest.
7. VALIDATE: `tools/validate.js course <course-dir>` and `tools/validate.js learner <learner-dir> --course <course-dir>` pass.
8. COMMIT/PUSH: in the course repo, `metadax: MP-05 L01.M01.O01/atp-stores-energy-phosphate-bonds`, push; in the learner repo, commit the session event and push.

Files that appear in the **course repo**:

```
nodes/L01.M01.O01/atp-stores-energy-phosphate-bonds/node.json
nodes/L01.M01.O01/atp-stores-energy-phosphate-bonds/provenance.json
registry/L01.M01.json                       (entry appended, updated_at stamped)
registry/index.json                         (module node_count and updated_at bumped)
```

Files that appear in the **learner repo** (a learner repo holds one learner and
its root *is* the learner directory, so the paths below are from the repo root):

```
sessions/ses-20260927-7h2k/event-0003.json
```

Had the learner not opted in to sharing, the node would instead be `private`,
written to `nodes/L01.M01.O01/atp-stores-energy-phosphate-bonds/node.json` in the
learner repo, absent from the course repo and its registry, and its question text
would appear in no course-repo file.
