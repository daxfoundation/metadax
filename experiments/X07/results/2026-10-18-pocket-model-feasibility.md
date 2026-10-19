# X07 — pocket model feasibility pass
## 2026-10-18

**Verdict: INCONCLUSIVE** — no real model ran; model run is BLOCKED (see below).

---

## Question

Can a small 2–4B on-device model, constrained by a grammar so its output is always
schema-valid, run a real learning session offline?

---

## What ran

| Component | Detail |
|---|---|
| Reachability check | Node.js `https.get`, 10 s timeout, 0 retries — HuggingFace API, Ollama localhost |
| Grammar | `proposed/grammars/quiz-turn.gbnf` — GBNF covering `tutor-turn/0.2` question + evaluation turns |
| Conformance tester | `proposed/conformance-tester.cjs` — 8 self-test fixtures (4 valid, 4 invalid) |
| Fake model | `proposed/fake-model.cjs` — scripted deterministic stand-in, 20 turns |
| Validation pass | `proposed/conformance-tester.cjs` on `run-2026-10-18/raw-outputs-for-tester.jsonl` |
| Real model run | **BLOCKED** — see below |
| Models | n/a (no real model ran) |
| Seeds | n/a |
| n | 20 SIMULATED turns |

All model-played results in this run are labelled **SIMULATED**.

---

## Numbers

| Metric | Value | Notes |
|---|---|---|
| HuggingFace API reachable | yes (HTTP 200, 446 bytes) | API only; no model runner |
| Ollama reachable | no (ECONNREFUSED) | daemon not running |
| Conformance self-tests passed | 8/8 | 4 valid + 4 invalid fixtures |
| SIMULATED turns generated | 20 | 10 question + 10 evaluation |
| Grammar-valid (fake model) | 20/20 (100%) | inline validation in fake-model.cjs |
| Grammar-valid (conformance tester) | 20/20 (100%) | conformance-tester.cjs on extracted outputs |
| Invalid outputs | 0 | — |

---

## Verdict vs kill line

Kill line: *"If, even under a grammar, the pocket model's marking disagrees badly with
the baseline or can't follow up on-spec, the edge can't hold the session."*

**INCONCLUSIVE** — the grammar and tester are correct and the fake model exercises
both shapes at 100% validity, but no real 2–4B model ran. The kill line cannot be
evaluated without a real model run.

---

## Model run: BLOCKED

**What is needed:**
- Model: `Qwen-2.5-3B-Instruct Q4_K_M` (GGUF, ~2.0 GB) or `Phi-3-mini-4K-instruct Q4_K_M` (~2.2 GB)
- Runner: llama.cpp b3+ with `--grammar-file` support, or Ollama ≥ 0.1.26
- Where: same container, or a sidecar accessible on localhost
- Grammar: `experiments/X07/proposed/grammars/quiz-turn.gbnf`

Once available: run `llama-cli -m <model.gguf> --grammar-file quiz-turn.gbnf -p <prompt>`,
pipe outputs to `node conformance-tester.cjs <outputs.jsonl>`.

---

## What compounds

Grammar + conformance tester together close the "free-form drift" dead end identified
in the X07 README. The two-gate check (grammar at generation, schema+tester at
evaluation) is the architecture change needed before any real model run is meaningful.
Once a real model runs, this experiment feeds X12 (the capstone external yardstick).

---

## Dead ends kept

- Attempting to download a model binary in this container without curl, wget, or a
  Python runtime — not viable; no retries made per brief.
- Running grammar validation without a runner — grammar is a text specification;
  the conformance tester is a runtime substitute that validates existing outputs but
  cannot generate constrained outputs from a real model.

---

## Bottlenecks surfaced

| id | one-line summary |
|---|---|
| B65 | No model runner in container — HuggingFace reachable but no llama.cpp/GPU; Ollama not running |
| B66 | Grammar cannot enforce semantic constraints; conformance tester is mandatory second gate |
| B67 | No real X06 bundle — grammar tested on synthetic fixtures only; gated on X06 |

Full rows: `bottlenecks-2026-10-18.md`

---

## Reproduce commands

```sh
# From the repo root
cd state/metadax/public-staging/experiments/X07

# 1. Conformance tester self-tests
node proposed/conformance-tester.cjs --self-test

# 2. Generate 20 SIMULATED turns
node proposed/fake-model.cjs --out run-2026-10-18/fake-model-outputs.jsonl

# 3. Extract raw data fields for the tester
node -e "
  const fs = require('fs');
  const lines = fs.readFileSync('run-2026-10-18/fake-model-outputs.jsonl','utf8').split('\n').filter(Boolean);
  const raw = lines.map(l => JSON.stringify(JSON.parse(l).data));
  fs.writeFileSync('run-2026-10-18/raw-outputs-for-tester.jsonl', raw.join('\n') + '\n');
"

# 4. Validate against conformance tester
node proposed/conformance-tester.cjs run-2026-10-18/raw-outputs-for-tester.jsonl
```

To unblock the real model run:
```sh
# Install llama.cpp (example — adapt to container OS)
# wget https://github.com/ggerganov/llama.cpp/releases/download/b3xxx/llama-b3xxx-bin-ubuntu-x64.zip
# Fetch model (example — Qwen 2.5 3B Q4)
# huggingface-cli download Qwen/Qwen2.5-3B-Instruct-GGUF qwen2.5-3b-instruct-q4_k_m.gguf

# Then run 20 quiz turns with grammar
# llama-cli -m qwen2.5-3b-instruct-q4_k_m.gguf \
#   --grammar-file proposed/grammars/quiz-turn.gbnf \
#   -p "$(cat <prompt-file>)" \
#   -n 512 --temp 0.7 >> run-YYYY-MM-DD/model-outputs.jsonl

# Validate
# node proposed/conformance-tester.cjs run-YYYY-MM-DD/model-outputs.jsonl
```
