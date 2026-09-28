# MetaDAX evals

The eval suite executes the v0.2 prompts (`prompts/MP-00` .. `MP-10`) against a
model and checks the reply the way a client's CHECK step does (docs/INTERFACE.md):
one JSON object, schema-valid, and inside the structural gates, before anything
would ever be written to a repo. It is the machinery behind experiments E04 (do
the prompts pass on both vendors?) and E05 (does the follow-up engine reuse
correctly?).

Node >= 18, zero dependencies (SPEC S-12); everything here is plain `node`.

## What an eval case is

One case is a directory `cases/<op>/<case-id>/` with three files:

- `stack.txt` -- the assembled prompt stack, produced by `node tools/assemble.js`
  and committed verbatim. This is the exact input a model receives, on record.
- `input.json` -- the arguments used to assemble the stack (op, mode, the full
  `assemble` argv, byte count, and the blocks that landed), plus a one-line
  description of what the case probes.
- `expect.json` -- the structural expectations grade.js enforces: the output
  `type`, the allowed `decision`(s), the allowed warnings, ids that must or must
  not appear, maximum lengths, whether `state` must be present, and which schema
  to validate against.

A case never contains a model output. Model outputs live under `runs/` and are
committed beside the summary that cites them (the honesty rule, below).

## Layout

```
evals/
  README.md              this file
  build_cases.js         regenerates every case (assembles stack.txt via tools/assemble.js)
  grade.js               grades one model output against a case (parse -> schema -> gates -> expect)
  run_claude_p.js        runs the suite locally with the `claude` CLI, saves raw outputs, writes a summary
  cases/<op>/<case-id>/  stack.txt, input.json, expect.json
  runs/<YYYY-MM-DD>-<model>/<op>/<case>.out.txt   raw model outputs (committed with the summary)
  runs/<YYYY-MM-DD>-<model>/summary.json|.md      per-op: cases, pass, fail, schema-valid rate, mean bytes, wall seconds
  promptfoo/             the same cases as a promptfoo config (CI, dispatch-only; never installed here)
```

The cases in this first cut: MP-05 (12), MP-06 (6), MP-01 (3), MP-02 (2),
MP-04 (2), MP-07 (2). All are built from the bundled fixture course
`fixtures/courses/cell-biology-obsidian` and the fixture learner
`fixtures/learners/lrn-fixture01`.

To rebuild the cases after a fixture, prompt or assembler change:

```
node evals/build_cases.js
```

## How grade.js works

`node evals/grade.js --case cases/MP-05/depth2-new-question --out reply.txt`
(or pipe the reply on stdin; add `--markdown` for markdown-mode replies, where
the last ```json block is extracted). Grading is four layers, and any failure in
any layer fails the case:

1. **Parse** -- exactly one JSON object. A single trailing newline is tolerated.
2. **Schema** -- validate against `schemas/` with `tools/jsonschema-lite.js`,
   using the object's own `schema` field when `schemas/index.json` maps it, else
   the case's `expect.schema` (an index id like `metadax.tutor-turn/0.2`, or a
   filename like `followup-output.schema.json` -- the MP-05 envelope has no
   self-id and is not in the index, so its cases name the file directly).
3. **Gates** -- the docs/INTERFACE.md CHECK gates, read from the case's own
   `stack.txt`: `target_id`/`links[]`/`reuse.of` resolve only to ids in REGISTRY
   or PATH and are never `"trail"`; a new node's id starts with `parent + "/"`;
   `depth == 1 + count("/")`; id <= 200 chars; title <= 80; `node.path[]` equals
   the PATH block received.
4. **Expect** -- the `expect.json` assertions.

Output is one JSON line: `{case, pass, schema_valid, reasons[]}`.

`node evals/grade.js --selftest` grades one embedded known-good output (passes)
and one embedded known-bad output (fails at every layer), and prints PASS/FAIL.

## How to run it locally

```
node evals/run_claude_p.js                 # all cases, default model, via the `claude` CLI
node evals/run_claude_p.js --op MP-05       # one operation
node evals/run_claude_p.js --case depth2-new-question
node evals/run_claude_p.js --model sonnet   # a model id the `claude` binary accepts
node evals/run_claude_p.js --markdown       # grade markdown-mode replies
```

For each case the runner feeds `stack.txt` to
`claude -p --output-format text --model <id>` on stdin (240 s timeout), saves the
raw output to `runs/<date>-<model>/<op>/<case>.out.txt`, grades it, and writes
`summary.json` and `summary.md` (per op: cases, pass, fail, schema-valid rate,
mean output bytes, wall seconds).

The `claude` binary must be authenticated (`claude -p "reply with ok"` returns a
word, not "Please run /login"). In an environment where a nested `claude -p` is
not logged in, the runner records a
`run:` error per case instead of a model reply, and no numbers are produced --
see the E04/E05 result files for the state of the first execution.

## How it runs in CI

Cross-vendor certification runs through **promptfoo**, not this local runner.
`evals/promptfoo/` holds the same cases as a promptfoo config with two providers
(Anthropic Messages and OpenAI Responses). It is configured but **not installed
and not run** here; it runs from `.github/workflows/certify.yml`, which is
`workflow_dispatch` only (D8: no certify/steward Actions in Milestone 1). See
`evals/promptfoo/README.md`.

## The certification idea (decision D3)

A prompt is certified for a **named model set**, not "for models" in general. The
set is two primary models, one per vendor, plus a smaller floor model that a
low-cost deployment can rely on. A model is named in this repo only once an eval
here has actually run it, and only with the exact model id the run reports
(docs/ACCURACY.md items 3 and 8). This first cut names no model as certified,
because no model has yet executed the suite: on the first attempt the nested
`claude -p` probe returned "Please run /login" (not logged in), so the runner
could not reach a model. The exact ids will be filled in from a run's output the
first time one lands.

## The honesty rule

Every number in a result file (`experiments/E04/results/`,
`experiments/E05/results/`) comes from a run whose raw outputs are committed
beside it. No summary is written by hand; `run_claude_p.js` writes `summary.json`
and the result file quotes it. Where no run has happened, the result file says
"not yet run" and states why. This is docs/ACCURACY.md item 3, applied to evals.
