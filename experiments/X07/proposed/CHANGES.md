Proposed by the runs of 18-19 Oct 2026; not merged into the canonical files.

# proposed/CHANGES.md — X07 pocket model feasibility pass

## Files added

### grammars/quiz-turn.gbnf
New file. A GBNF (Grammar-Based Normal Form) grammar covering the subset of
`tutor-turn/0.2` (MP-06) and the evaluation output (MP-07) that a quiz session
needs. Constrains:
- Question turns: `type=question`, required `display`+`meta`+`state`+`next_action`
- Feedback turns: `type=feedback`, optional `feedback` object
- Evaluation turns: `type=evaluation` with `score`, `result`, `criteria`, `bonus_points`,
  `misconception`, `feedback_md`, `next_hint`, `warnings`
- All enum fields: `bloom_level`, `question_type`, `next_action`, `phase`, warning codes,
  criterion statuses, level statuses
- Concept IDs constrained to `^[a-z0-9][a-z0-9-]*$` via terminal character classes

Intended use: pass as `--grammar-file` to llama.cpp or equivalent constrained-decoding
API when running a 2–4B model for quiz sessions.

Why: the X07 README identifies "grammar / constrained-decoding spec" as a missing
prerequisite. Free-form generation on a small model drifts off-schema; the grammar
is what makes it usable (per X07 dead-ends section).

### conformance-tester.cjs
New file. Validates quiz-turn JSON outputs against the grammar rules and
`tutor-turn.schema.json` semantic constraints. Two modes:
- `node conformance-tester.cjs <input.jsonl>` — validate each line, one JSON record per line
- `node conformance-tester.cjs --self-test` — run 8 built-in fixtures (4 valid, 4 invalid)

Covers: schema string check, type/next_action enums, state required fields, concept-id
pattern, bloom level casing, score range, bonus_points range, evaluation type detection.

Why: the grammar guarantees shape at generation time; the tester verifies shape at
evaluation time and surfaces semantic violations the grammar cannot express.

### fake-model.cjs
New file. Scripted deterministic stand-in for a 2–4B constrained model. Generates 20
quiz turns (10 question + 10 evaluation) from a 3-item practice bank fixture covering
two concepts (fractions, decimals). All outputs labelled `_simulated: true`.

Usage: `node fake-model.cjs --out <file.jsonl>`

Why: exercises both grammar shapes end-to-end without requiring a real model download.
Surfaces any conformance gaps in the grammar or tester before a real model is available.
## Run 2 (2026-10-19)

### run2-2026-10-18/probes.json
New file. Machine-readable record of all four probe outcomes from run 2:
- Step a: `which ollama llama-cli llama-server` → none found (exit 1)
- Step b: `python3 -c "import llama_cpp"` → python3 not found (exit 127)
- Step c: `pip install llama-cpp-python` → pip not found (exit 127)
- Step d: Node.js HTTPS download of Qwen2.5-3B-Instruct Q4_K_M GGUF → SUCCESS
  (2,104,932,768 bytes; sha256 626b4a…; ~183 MB/s avg; file deleted, not committed)

Why: run 1 inferred the runtime gap from process/network checks; run 2 directly confirms
it by attempting every available install path. Root cause is now precise: no Python
runtime (not just missing bindings).

### results/run2-2026-10-18/speed-test.cjs
New file. Downloads the first 10 MB of the GGUF and reports MB/s and projected full-file
time. Lets future runs verify network reachability without a full download.

### Architecture impact
No change to the grammar or conformance tester (run 1 artefacts still valid). The only
remaining gap before a real inference test: a container that ships Python ≥ 3.9 +
llama-cpp-python, or a pre-built llama.cpp binary, or Ollama.

## Files added

### grammars/quiz-turn.gbnf
New file. A GBNF (Grammar-Based Normal Form) grammar covering the subset of
`tutor-turn/0.2` (MP-06) and the evaluation output (MP-07) that a quiz session
needs. Constrains:
- Question turns: `type=question`, required `display`+`meta`+`state`+`next_action`
- Feedback turns: `type=feedback`, optional `feedback` object
- Evaluation turns: `type=evaluation` with `score`, `result`, `criteria`, `bonus_points`,
  `misconception`, `feedback_md`, `next_hint`, `warnings`
- All enum fields: `bloom_level`, `question_type`, `next_action`, `phase`, warning codes,
  criterion statuses, level statuses
- Concept IDs constrained to `^[a-z0-9][a-z0-9-]*$` via terminal character classes

Intended use: pass as `--grammar-file` to llama.cpp or equivalent constrained-decoding
API when running a 2–4B model for quiz sessions.

Why: the X07 README identifies "grammar / constrained-decoding spec" as a missing
prerequisite. Free-form generation on a small model drifts off-schema; the grammar
is what makes it usable (per X07 dead-ends section).

### conformance-tester.cjs
New file. Validates quiz-turn JSON outputs against the grammar rules and
`tutor-turn.schema.json` semantic constraints. Two modes:
- `node conformance-tester.cjs <input.jsonl>` — validate each line, one JSON record per line
- `node conformance-tester.cjs --self-test` — run 8 built-in fixtures (4 valid, 4 invalid)

Covers: schema string check, type/next_action enums, state required fields, concept-id
pattern, bloom level casing, score range, bonus_points range, evaluation type detection.

Why: the grammar guarantees shape at generation time; the tester verifies shape at
evaluation time and surfaces semantic violations the grammar cannot express.

### fake-model.cjs
New file. Scripted deterministic stand-in for a 2–4B constrained model. Generates 20
quiz turns (10 question + 10 evaluation) from a 3-item practice bank fixture covering
two concepts (fractions, decimals). All outputs labelled `_simulated: true`.

Usage: `node fake-model.cjs --out <file.jsonl>`

Why: exercises both grammar shapes end-to-end without requiring a real model download.
Surfaces any conformance gaps in the grammar or tester before a real model is available.
