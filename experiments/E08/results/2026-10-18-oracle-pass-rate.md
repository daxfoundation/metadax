# E08 — Generated interactive assets: pure-function oracle pass rate
**Date:** 2026-10-18  
**Status:** SIMULATED — model-played generators only; no real guides or learners.

---

## Question

When a model generates the pure-function computational core of a Tier-1 interactive
learning asset from a plain-text spec, what share pass all oracle tests on the first
attempt, and after one repair round?

---

## What ran

**Models:** claude-sonnet-4-6 (referred to below as "sonnet"), claude-haiku-4-5-20251001 ("haiku").  
**Specs:** 12 plain-text asset specs (see `run-2026-10-18/specs/`).  
**Oracle tests:** 12 node:test suites, 82 tests total, held back from generators  
  (see `run-2026-10-18/oracles/`).  
**Generation:** one fresh Task subagent per spec per model; learner sees spec only.  
**Repair:** one round; generators see failing test names + messages only.  
**Seeds/n:** 1 run per (model × spec); deterministic JS, no random seed needed.

### Assets

| id | spec |
|----|------|
| 01 | projectile range (no drag) |
| 02 | fraction simplifier with steps |
| 03 | unit converter with significant figures |
| 04 | thin-pool allocation model |
| 05 | nested storage layer list |
| 06 | compound interest table |
| 07 | Punnett square |
| 08 | step-by-step linear equation balancer |
| 09 | sorting visualiser step list |
| 10 | probability tree |
| 11 | Newton's-third-law force pair checker |
| 12 | recipe scaler with unit rounding |

---

## Results

### Pass rate table

| model   | R1 assets (12) | R1 tests (82) | repair needed | R2 assets | R2 tests |
|---------|---------------|---------------|---------------|-----------|----------|
| sonnet  | 12/12 (100%)  | 82/82 (100%)  | none          | n/a       | n/a      |
| haiku   | 12/12 (100%)  | 82/82 (100%)  | none          | n/a       | n/a      |

### Per-asset breakdown (both models, round 1)

| # | spec                          | sonnet | haiku |
|---|-------------------------------|--------|-------|
| 01 | projectile range             | 7/7 ✓  | 7/7 ✓ |
| 02 | fraction simplifier          | 6/6 ✓  | 6/6 ✓ |
| 03 | unit converter               | 8/8 ✓  | 8/8 ✓ |
| 04 | thin-pool allocation         | 7/7 ✓  | 7/7 ✓ |
| 05 | storage layers               | 6/6 ✓  | 6/6 ✓ |
| 06 | compound interest            | 7/7 ✓  | 7/7 ✓ |
| 07 | Punnett square               | 7/7 ✓  | 7/7 ✓ |
| 08 | equation balancer            | 8/8 ✓  | 8/8 ✓ |
| 09 | sort steps                   | 7/7 ✓  | 7/7 ✓ |
| 10 | probability tree             | 6/6 ✓  | 6/6 ✓ |
| 11 | force pairs                  | 6/6 ✓  | 6/6 ✓ |
| 12 | recipe scaler                | 7/7 ✓  | 7/7 ✓ |

### Failure classes

None observed. No failures to classify.

---

## Verdict vs kill line

**Kill line (E08 card):** physics-correct pass rate ≥ 60% → Tier-1 may be admitted.

**Verdict: PASS** — both models achieved 100% on the first attempt across all 82 oracle
tests. The 60% threshold is exceeded by 40 percentage points with no repair needed.

**Important scope caveat:** this run tests only the *pure-function computational core*
of each asset (a JS function, no DOM, no canvas). The original E08 card calls for
rendered JSXGraph/p5.js sketches tested with a Playwright browser harness. The gap
between pure-function correctness and full interactive rendering correctness is
unmeasured by this experiment. See bottlenecks B36 and B37.

---

## What compounds

- Both models are strong enough on the computational core that a pure-function →
  rendering wrapper pipeline (generate core → wrap in JSXGraph/p5.js template) is
  viable without a repair round, provided oracle tests gate the core before wrapping.
- Haiku matches sonnet exactly here; cost differential is ~5× in haiku's favour,
  which matters at population scale (see B23).
- These results feed into E09 (if it exists) or any future asset-generation pipeline
  that gates on functional correctness.

---

## Dead ends kept

- No repair round was triggered, so the repair-round architecture was exercised for
  design purposes only (script written, not run).
- Failure classes are empty; architecture for classifying them (parse-failure,
  wrong-return-shape, wrong-value, not-exported) documented in runner but unused.

---

## Bottlenecks

See `bottlenecks-2026-10-18.md` in this folder.  
New: B36, B37.  
Existing: B01–B23 unchanged (E08 does not overlap with the core certification chain).

---

## Reproduce commands

```bash
# From repo root, on branch xp-1018-e08:
cd state/metadax/public-staging/experiments/E08/run-2026-10-18
node runner.mjs --model sonnet --round 1
node runner.mjs --model haiku  --round 1
# Raw output: raw/sonnet-r1.json, raw/haiku-r1.json
```
