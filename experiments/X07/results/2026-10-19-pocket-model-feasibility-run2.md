# X07 pocket model — run 2 (2026-10-19)

**Question:** Can a real 2–4B GGUF model run a grammar-constrained quiz session in this container?

## What changed since run 1

Run 1 confirmed no Ollama daemon (ECONNREFUSED) and verified HuggingFace API reachability,
but did not probe Python, pip, or llama.cpp directly. Run 2 probes those paths (probes b and c)
and attempts a real model download (probe d) to determine whether inference is possible.
Untried routes not covered by run 2: a prebuilt llama.cpp binary fetched the same way as the
model, and a source build of llama.cpp.

For this run, installing packages was allowed; one model file may be downloaded.

## What ran

| item | detail |
|---|---|
| Probe a | `which ollama llama-cli llama-server` |
| Probe b | `python3 -c "import llama_cpp"` |
| Probe c | `pip install --break-system-packages --only-binary=:all: llama-cpp-python ...` |
| Probe d | Node.js https download of Qwen2.5-3B-Instruct Q4_K_M GGUF |
| Model file | qwen2.5-3b-instruct-q4_k_m.gguf (2,104,932,768 bytes) |
| Inference run | not attempted — no runner available |

## Numbers

| measure | run 1 | run 2 |
|---|---|---|
| model | fake (simulated) | Qwen2.5-3B-Instruct Q4_K_M (downloaded; not run) |
| valid turns / 20 | 20/20 (SIMULATED) | — |
| tokens/s | n/a (simulated) | — (no runner) |
| peak RAM | n/a (simulated) | — (no runner) |
| semantic pass / 20 | SIMULATED | — (no runner) |
| download speed | — | ~183 MB/s avg |
| download time | — | ~11.5 s for 2.1 GB |

## Probe outcomes (exact)

**Step a** — `which ollama llama-cli llama-server`
```
(no output)
EXIT: 1
```
None of the three binaries found.

**Step b** — `python3 -c "import llama_cpp"`
```
/bin/bash: line 1: python3: command not found
EXIT: 127
```
No Python runtime of any kind. python, python3, pip, pip3 all absent.

**Step c** — `pip install --break-system-packages --only-binary=:all: llama-cpp-python ...`
```
/bin/bash: line 1: pip: command not found
EXIT: 127
```
Blocked immediately. No Python runtime → no pip → wheel install impossible.

**Step d** — Node.js https download from HuggingFace
```
URL:     https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q4_k_m.gguf
Model:   Qwen2.5-3B-Instruct, quant Q4_K_M
Bytes:   2,104,932,768 (1.96 GiB)
SHA256:  626b4a6678b86442240e33df819e00132d3ba7dddfe1cdc4fbb18e0a9615c62d
Licence: other (Qwen License Agreement)
Speed:   183 MB/s average (peaked at 184 MB/s); full file in ~11.5 s
```
Download succeeded. File deleted after sha256; not committed.

**Inference:** not attempted — no engine exists to load the GGUF.

## Verdict

**INCONCLUSIVE** — same as run 1.

Specific blockers confirmed:
1. No Python runtime in container (`python3: command not found`).
2. Therefore `pip install llama-cpp-python` is impossible.
3. No Ollama, no llama.cpp binaries.
4. Download of the model file is feasible and fast (~183 MB/s; file arrived complete).
   But a downloaded GGUF with no runner is inert.

The kill line (marking disagreement or off-spec follow-up under a grammar) cannot be reached
until a runner exists. The grammar and conformance tester from run 1 remain ready.

## What compounds

The result sharpens the architecture requirement: the container (or deployment environment)
must ship with a pre-installed inference engine. The grammar and tester are ready; the
blocker is purely environmental, not architectural. A container with llama.cpp or Ollama
could proceed directly to the 20-turn conformance run using run 1's fixtures.

## Dead ends kept

- Downloading the GGUF without a runner is not a blocker workaround; the file is inert.
- node-llama-cpp exists as an npm package but `npm install` was not attempted (for this
  run, installing packages was allowed only for pip; npm was not in scope).

## Bottlenecks

See `bottlenecks-2026-10-19-run2.md`.

## Reproduce commands

All scripts use public paths.

```sh
# Probe a
which ollama llama-cli llama-server

# Probe b
python3 -c "import llama_cpp"

# Probe c
pip install --break-system-packages --only-binary=:all: llama-cpp-python \
  --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu

# Probe d — download speed test (10 MB only; not full download)
node experiments/X07/results/run2-2026-10-19/speed-test.cjs

# View full probe results
cat experiments/X07/run2-2026-10-19/probes.json
```
