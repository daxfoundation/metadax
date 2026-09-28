# MetaDAX Prompt Suite v0.2

> Status: v0.2 (2026-09-27): not yet executed by a model end to end; evals pending (evals/).

## What it is

MetaDAX rebuilds the old EdDAX course app as a suite of meta prompts and JSON
schemas, with no application server. A model plus these prompts can design a
course, profile a learner, generate objective content, answer follow-up
questions recursively, run a Bloom-level quiz, grade answers, track progress and
curate the result back into the curriculum. Every artifact is a small JSON file
that a client commits to a git repository, so the state lives in files and in
the conversation rather than in a database. Schema ids are `metadax.*/0.2`.

## The prompts

The suite is eleven MP prompt files plus the schema reference and the changelog.
A client pastes MP-00 first, then the operation prompt, then the schema sections
it needs.

| File | Operation | Role |
|---|---|---|
| `SCHEMAS.md` | - | Every artifact (course, node, per-module registry, learner, progress snapshots and session events, tutor turn, practice item, commit packet) with per-field what-if-wrong notes, the context-stack order, the CONFIG keys, the warning codes and the output/enum index. |
| `MP-00-kernel.md` | - | Shared rules pasted before every operation (ids, depth, safety, stamping). |
| `MP-01-learner-profile.md` | PROFILE | Privacy-safe learner model: interview, from a description, diagnostic, update. |
| `MP-02-course-architect.md` | ARCHITECT | Brief to full course: design, quick, suggest, revise. |
| `MP-03-context-compiler.md` | COMPILE | Deterministic context assembly, plus a compression prompt for small models. |
| `MP-04-node-content.md` | CONTENT | Objective content (shared core), personal rendering, author extension. |
| `MP-05-followup-engine.md` | FOLLOWUP | The recursion: new, extend, reuse, ancestor or redirect; zoom-out. |
| `MP-06-bloom-tutor.md` | TUTOR | Adaptive Bloom quiz; offline practice sets. |
| `MP-07-answer-evaluator.md` | EVALUATE | Rubric grading with numeric scores and the bonus mechanic. |
| `MP-08-progress-steward.md` | STEWARD | Learner-side worker: merges progress snapshots, picks next steps, writes the teacher report. |
| `MP-09-registry-curator.md` | CURATE | Course-side worker: review, global dedupe, promote to curriculum, audit. |
| `MP-10-session-runner.md` | RUN | The whole system in one chat, with commands and `/export`. |
| `CHANGELOG-v0.2.md` | - | Every v0.2 spec change and the files it touched. |

`CHANGELOG-v0.1.1.md` keeps the v0.1.1 red-team history.

## The context stack

Each operation runs against a stack assembled in a fixed order: the MP-00 kernel,
then the operation prompt (MP-01..MP-09), then the SCHEMAS sections that
operation reads, then the CONFIG block, then the data blocks it needs (COURSE,
PROFILE, PATH, REGISTRY, INPUT, ANCHOR and the rest). MP-03 COMPILE describes the
assembly and a compression pass for small-context models; MP-10 runs the same
stack as a single chat. The recursion loop (a follow-up node becomes the parent
of the next follow-up) lives in the data (ids, PATH, per-module registry), so it
works the same at depth 2 and at depth 20.

## Write modes

`CONFIG.write_mode` decides how a client persists what a prompt produces:

- git-native (`git`): the client holds local checkouts of the course and learner
  repos, writes the files itself, then commits and pushes. `tools/stamp.js` fills
  the runtime fields (timestamps, hashes, byte counts, manifest).
- commit packet (`packet`): the model ends every persisting output with a fenced
  commit packet (`metadax.packet/0.2`); a skill, a human, or `tools/apply_packet.js`
  applies it and then stamps. `op: "create"` never overwrites an existing path.

`write_mode none` is a read-only session that persists nothing. The prompt bodies
describe outputs as "the record" and do not assume one write mode.

## Where the clients live

The code that assembles the stack, calls a model and persists output lives
outside `prompts/`:

- `skills/` - the Claude Code and Claude Desktop skills.
- `adapters/` - per-client adapters (API, ChatGPT, companion, manual).
- `docs/INTERFACE.md` - the client-to-prompt contract.
- `docs/WALKTHROUGH-CLAUDE-CODE.md` - one session walked end to end.

A Claude Code client keeps its only state in `metadax.config.json` at the root of
a working folder (gitignored); it never stores tokens and uses whatever `git`
already has for authentication.

## The fixture course

`fixtures/courses/cell-biology-obsidian` is a small course in the v0.2 layout,
used for smoke tests and for the evals under `evals/`.

## Licences

`LICENSES.md` records the licences for the repository. The prompts under
`prompts/` are released under CC0. Course content and generated segments carry
their own SPDX ids, declared per course in `course.json` (`license`, default
`CC-BY-4.0`, and `generated_segments_license`, `CC0-1.0`).
