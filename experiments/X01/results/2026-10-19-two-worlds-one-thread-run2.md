# X01 — One thread, two worlds — RESULT run 2 (2026-10-19)

> ## ⚠️ SIMULATED
> **Every number here comes from model-played agents, not people.** Guide and learners
> are fresh sonnet subagents per session; each learner receives only its persona + the
> guide's messages — never the answer key, grader, or other personas. Effect directions
> are hypotheses for real testing, not measured facts.

Run: `X01-two-worlds-20261019-run2` · Status: **COMPLETE**

## Question

Run 1 was INCONCLUSIVE because it lacked a control arm where the technique was
withheld (B52). Does applying a captured technique record beat a **no-technique**
guide on learner-advance — or does the earlier B vs A gap vanish once that control
is in place and run-to-run noise is measured?

## What changed since run 1

- **New arm C added:** same learner personas and subjects as run 1 Cohort B
  (archery/rowing/rocket), same guide prompt, but the guide receives **no technique
  records** — the true no-technique control that was missing from run 1.
- **Arm A re-run:** same 6 kite/Javanese-kite learner personas as run 1 Cohort A,
  guide discovers from scratch — used to measure run-to-run noise on A.
- Run 1 Arm B (technique-reuse) results carried forward unchanged.

## What ran

- **Models:** guide = sonnet (fresh subagent per session); 12 learners = sonnet
  (fresh subagent per persona, blind); evaluator = sonnet (same criterion as run 1).
- **Arm A rerun** (n=6): kite/layang-layang, guide discovers, no technique bank.
- **Arm C** (n=6): archery/rowing/rocket, guide has **no technique records**.
- **Arm B** (n=6, from run 1): archery/rowing/rocket, guide **has** technique records.
  Carried forward — not re-run.
- Cap: 3 learner attempts. Node stdlib only; no npm.

## The numbers

| Measure | A run 1 (discover) | A run 2 (discover, rerun) | B run 1 (technique) | C run 2 (no technique) |
|---|---|---|---|---|
| n | 6 | 6 | 6 | 6 |
| Resolved | **6/6** | **6/6** | **6/6** | **6/6** |
| Mean attempts | **1.50** | **2.17** | **1.83** | **1.67** |
| Attempts vector | [1,2,2,1,1,2] | [2,2,2,2,3,2] | [1,2,2,2,2,2] | [2,1,2,1,2,2] |
| Resolved at attempt 1 | 3/6 | 0/6 | 1/6 | 2/6 |

**Key comparisons:**

| Comparison | Difference |
|---|---|
| A run-to-run spread (noise) | 2.17 − 1.50 = **0.67** |
| B (technique, run 1) vs C (no technique, run 2) | 1.83 − 1.67 = **0.167** |
| B/C gap as fraction of noise | 0.167 / 0.667 = **0.25** (25%) |

## Verdict (vs the X01 kill line)

Kill line: *"If applying a captured technique does not beat the no-technique control on
learner-advance (or only works in the original language), technique records do not
compound."*

**INCONCLUSIVE — kill-line condition partially met.**

- **The no-technique guide (C) performed comparably to the technique-reuse guide (B):**
  both 6/6 resolved; C mean 1.67 vs B mean 1.83 — the control was slightly faster
  (1.67 vs 1.83), but the gap is within the 0.67 run-to-run spread, so this run can
  neither confirm nor rule out the kill line. Note: B is from run 1 and C is from run 2,
  so this is a cross-run comparison.
- **The B vs C gap (0.167) is 25% of the A noise spread (0.667),** meaning any
  technique-vs-no-technique signal is below measurement noise at this n.
- The ceiling is in resolution (6/6); the measure is attempts (1–3). At n=6 per arm,
  all arms saturate at 6/6 resolved; the instrument has no headroom to show a lift.
- The run-to-run noise on A (mean 1.50 → 2.17, +0.67) is estimated from one pair of A
  runs and is larger than the B−C gap; it calls all earlier point-estimates into question.

**The earlier "A (1.50) beats B (1.83)" direction from run 1 is now explained as
run-to-run variance, not a technique-reuse cost.**

## What compounds (revised)

The representational compounding from run 1 stands: one move, many subjects, two
languages, faithful translation. What does not yet compound in simulation: the
efficiency claim. At n=6, 100% ceiling resolution in all arms leaves no space for a
technique lift to appear.

## Dead ends kept

- **Technique records show no detectable speed lift at n=6 / 100% ceiling.** All
  arms hit 6/6 resolved; a speed difference requires either a harder scenario (not
  all learners resolving in 3 attempts) or a larger n. Negative kept.
- **Run-to-run noise on A is larger than any B vs C signal.** Mean attempts on the
  same arm, same scenario, same model, different sessions: 1.50 vs 2.17 (Δ=0.67).
  Single-run point estimates are unreliable at this n without replication.
- **"No technique" guides reinvent the core move.** In Arm C (no technique), guides
  consistently reached for the "name the owner of each force" frame — the same move
  captured in run 1's technique records — without being given it. This means the
  move is discoverable on demand by a strong model, weakening the value of the record
  for same-model use. A technique record's value may be **portability** (across
  weaker guides, or guides new to the content) rather than speed.

## Bottlenecks

New: **B87** (ceiling effect), **B88** (run-to-run noise), **B89**
(move is discoverable on demand). See `bottlenecks-2026-10-19-run2.md`.

## Reproduce

```bash
# All scripts and fixtures under:
cd state/metadax/public-staging/experiments/X01/run2-2026-10-19

# Session fixtures:
cat fixtures/sessions.json

# Raw session results (arm A rerun):
cat arm-a-rerun-sessions.json

# Raw session results (arm C, no technique):
cat arm-c-sessions.json

# Evaluation and comparisons:
cat evaluator-results.json

# Trimmed transcripts:
ls transcripts/

# Validation (reuse run 1 validate.cjs):
node ../run-2026-10-18/validate.cjs validate ../proposed/schemas/technique.schema.json ../run-2026-10-18/techniques.json
```

Artifacts: `run2-2026-10-19/` — `fixtures/sessions.json`, `arm-a-rerun-sessions.json`,
`arm-c-sessions.json`, `evaluator-results.json`, `transcripts/` (12 trimmed sessions).
