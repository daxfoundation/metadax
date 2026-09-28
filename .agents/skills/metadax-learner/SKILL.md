---
name: metadax-learner
description: Use when an adult learner wants to start or continue a MetaDAX lesson from a GitHub course in Claude Code -- read a node, ask recursive follow-ups, quiz, and save progress to a private learner repo. Adults only in Phase 1. Runs FOLLOWUP, TUTOR, EVALUATE and STEWARD, git-native.
metadata:
  suite: metadax v0.2
  client: claude-code
  write_mode: git
---

# MetaDAX learner (Claude Code, git-native)

You are the learner's client. You assemble a prompt stack, execute the meta
prompt yourself, check the result, write it (private learner data to the private
learner repo; shared nodes to the course repo), stamp with `tools/stamp.js`,
validate, and commit and push. Read `docs/INTERFACE.md` for the pipeline and its
CHECK gates; this skill is the learner path.

## Self-hosting: how you run a meta prompt

> Read `workspace/stack-<n>.txt` in full. Treat it as the instructions for this
> step. Write the single JSON object it asks for to `workspace/out-<n>.json`,
> nothing else. Then continue.

You are the model that executes the meta prompt. One call = one JSON object.

## Rules that never bend

- Never compute a timestamp, hash, byte count or random id: write `"runtime"`
  and let `tools/stamp.js` fill it (K-15). The only id you mint is `learner_id`.
- Private never enters the course repo. A private node lives only under
  `learners/<id>/nodes/`; its question text appears in no course-repo file; a
  child of a private node is private.
- Every persisted output goes through `tools/apply_packet.js` or a checked Write, then
  stamp, then validate. Never edit an event, turn or snapshot file once written.
- ASCII only; no secrets, emails or real names anywhere.

## Config and setup

Read or create `metadax.config.json` (course_repo, learner_repo, client
`claude-code`, write_mode `git`, learner_id, device_id, model_hint). Create a
`device_id` once if absent: `tools/stamp.js id device` gives `dev-` + 6
characters; keep it in the config.

If there is no `learner_id`, first run the **age wall** (S-8): ask whether the
learner is 18 or older. If the answer is no, or unknown, say that the Claude
Code and Claude Desktop clients are for adults in Phase 1, that a companion for
younger learners is planned, and stop. Do not create a profile for a minor in
this client.

If the learner is an adult, create the profile: run PROFILE (`from_description`
if the adult describes themselves, else `interview`), with CONFIG
`age_band: "adult"`. Mint the learner id with `tools/stamp.js id learner`
(`lrn-` + 8 lowercase letters or digits) and pass it as `CONFIG.learner_id`.
Write `learners/<id>/profile.json`, stamp (`tools/stamp.js profile ...`),
commit `metadax: MP-01 <id>` to the learner repo and push. Store the id in the
config. `display_name`, if any, is a nickname, never a real name.

Start every session id with `tools/stamp.js id session`
(`ses-YYYYMMDD-xxxx`). Keep it for every event and turn this session.

## Commands the learner can type

Show this short menu under each screen: `learn <id>`, `ask: <question>`,
`quiz`, `back`, `seed`, `save` / `done`.

- **`learn <objective-id>`** -- render this node for this learner. Run CONTENT
  `render` (CONFIG `{"mode":"render","section_id":"sN"}`, blocks LEARNER +
  the node as CONTENT), one section per screen. If a rendering already matches
  the learner's audience key, show it; otherwise render fresh and show
  `rendering_md`. A pure render adds no facts and is not a new node. Log a
  `view` event.

- **`ask: <question>`** -- a follow-up (FOLLOWUP `ask`). Assemble with COURSE,
  OBJECTIVE, PATH (root-to-current, each `{id,title,summary}`), ANCHOR (the
  section the learner is reading: `section_id`, full text, a <=200-char quote,
  or `"none"`), REGISTRY (parent's module file + index + up to 12 candidates),
  LEARNER, INPUT. Run; act on the one `decision`:
  - `new`: apply CHECK gates; decide visibility (MP-05 STEP 4); write the node
    with its `provenance.json` and a registry append to the **course repo** when
    `shared`/`pending_review`, or to the **learner repo** when `private`; stamp;
    make it the current node.
  - `extend`: same as `new` but the covering node id goes in `links` and
    `reuse.of`; write only what the covered node does not say.
  - `reuse`: do not create a node. Show the target (render it if needed) and
    bump its reuse counters with `tools/stamp.js reuse <course-dir> <node-id>`
    (it increments the registry entry and the node's `stats.reuse_count`,
    re-stamps `updated_at` on both, and never touches `core`/`content_sha256`).
  - `ancestor` / `redirect`: navigate to the target (ancestor) or connect to the
    nearest in-scope idea (redirect) and say why; no node created.
  - Always log a follow-up event file.

- **`quiz`** -- TUTOR `quiz` (CONFIG `{"mode":"quiz","attempts":3,"quiz_scope":"node"}`),
  blocks CONCEPTS, CONTENT (core sections labelled with node id and section id),
  LEARNER, PROGRESS, SESSION. It is a turn loop: each turn is one
  `metadax.tutor-turn/0.2` object with `state` on every turn. Save every turn as
  `learners/<id>/sessions/<sid>/turn-<seq>.json` (immutable). Carry `state` from
  the last turn into the next. Free-text answers are graded by EVALUATE (MP-07);
  log a practice event per graded item. A `handoff` runs a follow-up from inside
  the quiz, then re-invokes TUTOR with `CONFIG.returned_from`. After a `summary`
  turn, write a progress snapshot (see `save`).

- **`back`** -- the current node becomes its parent (use PATH).

- **`seed`** -- pick one of the current node's three seeds and run it as an
  `ask:`.

- **`save` / `done`** -- run STEWARD `next_step` (COURSE, PROGRESS, SESSION =
  the session's event files, LEARNER). Write a **new** progress snapshot
  `learners/<id>/progress/<course-id>/<device-id>/<YYYY-MM-DD>.json` (never edit
  an old one; MP-08 merges devices by max competency and better status). Write
  the session event files and a weekly manifest
  (`tools/stamp.js manifest ...`). Stamp, validate
  (`tools/validate.js learner <learner-dir> --course <course-dir>`), commit and
  push the learner repo. Push the course repo too for any shared node written
  this session. If the course-repo push is refused (no write permission), keep
  the node in the learner repo as `pending_review` and tell the learner it will
  be offered to the course author (the D7 fork/publish flow; docs to follow).

## Record hygiene

A learner repo holds one learner and the learner directory *is* the repo root:
`profile.json`, `sessions/`, `progress/`, `manifests/` and `nodes/` sit at the
root, not under a `learners/<id>/` prefix. Where this document writes
`learners/<id>/...` for clarity, read it as that same path from the repo root.

Events: `sessions/<sid>/event-<seq:04d>.json` (`metadax.event/0.2`), one file
per event, never edited (`type` is one of the S6 values incl. `view` and
`practice`). Turns: `sessions/<sid>/turn-<seq:04d>.json`, never edited.
Progress: `progress/<course-id>/<device-id>/<YYYY-MM-DD>.json`, one snapshot
file per device per day, append-only. Weekly rollups: `manifests/`. Every write
is followed by a stamp and, at save time, a validate. Session id from
`tools/stamp.js id session`.
