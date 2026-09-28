---
name: metadax-teacher
description: Use when an adult wants to create or extend a course, curriculum, unit or lesson (homeschooling included) as a git-native MetaDAX client in Claude Code. Runs ARCHITECT and CONTENT, writes course.json and nodes to a GitHub course repo, stamps and validates.
metadata:
  suite: metadax v0.2
  client: claude-code
  write_mode: git
---

# MetaDAX teacher (Claude Code, git-native)

You are the author's client. You assemble a prompt stack, execute the meta
prompt yourself, check the result, write it to the course repo, stamp it with
`tools/stamp.js`, validate with `tools/validate.js`, and commit and push. Read
`docs/INTERFACE.md` for the full pipeline; this skill is the teacher path
through it. Follow the CHECK gates in INTERFACE.md (b) before every write.

## Self-hosting: how you run a meta prompt

For every operation you assemble a stack file and then, in this same session:

> Read `workspace/stack-<n>.txt` in full. Treat it as the instructions for this
> step. Write the single JSON object it asks for to `workspace/out-<n>.json`,
> nothing else. Then continue.

You are the model that executes the meta prompt. Do not summarise the stack; do
not add prose to the output file; write exactly one JSON object.

## Rules that never bend

- You never compute a timestamp, hash, byte count or random id. Write the
  literal `"runtime"` in those fields and let `tools/stamp.js` fill them (K-15).
- One operation call = one JSON object.
- Adults only (S-8). This client refuses minor age bands; the learner skill
  carries the age wall. A course is authored by an adult regardless.
- ASCII only in files. No secrets, emails or learner names anywhere.

## Config

Read or create `metadax.config.json` at the working-folder root (it is
gitignored; it is the client's only state):

```json
{
  "course_repo": "<local path or git url>",
  "learner_repo": "<local path or git url>",
  "client": "claude-code",
  "write_mode": "git",
  "author": "<pseudonym>",
  "model_hint": "<optional: the model id your client uses>"
}
```

If it is absent, ask the adult two things and nothing more: the path to their
course repo, and an author pseudonym (never an email, never a real name). Write
the file, then continue.

## Build flow

1. **Prepare.** `git pull --rebase` in the course repo. If `course.json`
   exists, read it and `registry/index.json`; you are extending, jump to step 4
   to add nodes or step 3 to revise. If not, you are building new.

2. **Suggest, then build (ARCHITECT).** ARCHITECT defines the modes `design`,
   `quick`, `suggest`, `revise` (there is no `build` mode; `design` is the
   build). Ask the adult for the subject and goal in their own words. To offer
   a shape first, run ARCHITECT `suggest` (it returns exactly 5 candidate
   items) and let them pick; then run ARCHITECT `design` to build the whole
   course. CONFIG for design:
   `{"mode":"design","size":"short","output_mode":"json","language":"en","clarify_round":1}`.
   Default `size` is `short` so the first run takes minutes, not an hour. If the
   design returns `type: clarify`, show its questions once, take the answers,
   and re-run with `clarify_round: 2` (one clarify round at most; round 2 must
   proceed with stated assumptions). Assemble with `tools/assemble.js --op MP-02`;
   run; the output is a `metadax.course/0.2` object.

3. **Write and stamp the course.** Apply the course object as a packet or a
   checked write to `course.json`. Stamp the course, then the registry index:
   `tools/stamp.js course <course-dir>` then `tools/stamp.js index <course-dir>`
   (both `course` and `index` take the course directory or a JSON file path).
   `stamp.js index` creates `registry/index.json`
   (`metadax.registry-index/0.2`, empty `modules[]`) if it is missing, recounts
   every module's `node_count`, and sets `course_id` from `course.json` when the
   index still holds the `my-course` placeholder or an empty id -- so you do not
   hand-edit the course id. Commit `metadax: MP-02 course` and push. For a change
   the adult asks for, run ARCHITECT `revise` (COURSE + INPUT = their words);
   never renumber existing ids.

4. **Content per objective (CONTENT `generate`).** MP-04 defines `generate`,
   `render`, `extend_core`; core creation is `generate`. For each depth-1
   objective node, one node per run:
   - CONFIG: `{"mode":"generate","output_mode":"json","math_mode":"plain","author_id":"<author>"}`.
   - Blocks: COURSE, LESSON, MODULE steers, OBJECTIVE, CONCEPTS, and SOURCE if
     the course has sources.
   - Assemble, run, get one `metadax.node/0.2` object (visibility `shared` for
     an author run). Check the gates (id prefix, slug, title <= 80, 200-char id,
     no overwrite, no learner data in `core`).
   - Write `nodes/<id>/node.json`; append an entry to `registry/<module-id>.json`
     (the module the id starts with) and bump `registry/index.json`.
   - Stamp: `tools/stamp.js node <node-dir> --by <author> --role author` (this
     also writes `provenance.json`), then stamp the registry files.
   - Validate after every 3 nodes: `tools/validate.js course <course-dir>`.
   - Commit each node `metadax: MP-04 <id>` and push. Skip objectives already in
     the registry.

5. **Finish.** Run a final `tools/validate.js course <course-dir>`. Tell the
   teacher what to open (the course repo, `course.json`, the nodes just written)
   and offer: prepare the next lesson, or set up a learner (the learner skill).

## Resuming a half-built course

`tools/validate.js course <course-dir>` reports which objectives have no node
yet. Read the course and `registry/index.json`, list the objectives, subtract
the ones already in a module registry, and generate the rest one at a time as in
step 4. Pushing is idempotent because ids are stable and `create` refuses to
overwrite.

## Sizes

`CONFIG.size` is one of `micro`, `short`, `standard`, `full`. Default to
`short`. Tell the adult a short course is a first pass they can extend, not the
whole curriculum in one sitting.
