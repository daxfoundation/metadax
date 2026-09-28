# MetaDAX

MetaDAX is a set of meta prompts and JSON schemas that let a model, git and a
GitHub account run a whole course: a teacher builds a curriculum, a learner
reads it, asks recursive follow-ups, quizzes and saves progress. There is no
server, database or MetaDAX account; the repos are the system.

## Layout

See `docs/LAYOUT.md` for the full tree. In short: `prompts/` (MP-00..MP-10, the
meta prompts), `schemas/` (JSON Schema for every record), `tools/` (assemble,
stamp, validate, apply_packet, path), `skills/` (the two Agent Skills),
`adapters/` (packet-client headers), `docs/` (spec, interface, walkthrough),
`templates/`, `fixtures/`.

## The two skills

This is the git-native Claude Code client. Use the skills in `.claude/skills/`:

- **metadax-teacher** -- an adult creates or extends a course into a course repo.
- **metadax-learner** -- an adult learner reads, follows up, quizzes and saves
  progress to a private learner repo.

The generic client contract is `docs/INTERFACE.md`; a person's step-by-step is
`docs/WALKTHROUGH-CLAUDE-CODE.md`. This client is self-hosting: the model
running a skill also executes the meta prompt (read the assembled stack file,
produce exactly one JSON object, save it).

## Rules for a session in this repo

- K-15: never compute a hash, timestamp, byte count or random id yourself. Write
  the literal `"runtime"` and run `tools/stamp.js`. The only id a model mints is
  `learner_id`.
- Never edit `prompts/` casually. Prompt versions are a decision, not a tidy-up.
- Run `tools/tests/` before committing any change under `tools/`.
- ASCII only in every file. No smart quotes, no em dashes; use `-` and `--`.
- Never write a secret, token, email address or a learner's real name anywhere.
  Authentication is the user's existing `git` credential.
- Phase 1 clients (all but the future companion) are adults-only (spec S-8).
- Keep learner data in the private learner repo; it never enters a course repo.

## Where the docs are

- `docs/SPEC-v0.2.md` -- the frozen v0.2 contract (do not edit).
- `docs/INTERFACE.md` -- the operation contract every client implements.
- `docs/WALKTHROUGH-CLAUDE-CODE.md` -- prerequisites and exact commands.
- `docs/LAYOUT.md` -- the repository tree.
