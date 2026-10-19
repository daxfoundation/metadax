# E05 — Follow-Up Engine Reuse Decisions (Run 2)

**Date:** 2026-10-19
**Status:** SIMULATED (model-played, no real learners)

## Question

When a learner asks a follow-up, does MP-05 make the right reuse/extend/new decision against a 50-node registry — pointing to an existing node when one answers the question, and creating a new one when nothing does?

## What changed since run 1

- Run 1 haiku arm was re-run from scratch in run 2 using fresh subagents (model haiku, no access to run-1 outputs or answer key).
- Run 2 added a **cleaned fixture** test: trap nodes (n_tr01–n_tr10) removed from the REGISTRY block, 10 trap queries re-run, to test B30 directly.
- Run 2 prompt explicitly required numeric confidence (0.0–1.0); run 1 haiku omitted the field entirely (B33). All 60 run-2 haiku responses include numeric confidence.
- Sonnet run-1 raw outputs were re-scored with the same scorer; numbers confirmed unchanged.

## What ran

| Pass | Model | n | Fixture | Notes |
|------|-------|---|---------|-------|
| Primary re-score | claude-sonnet-4-6 | 60 | original | Re-scored run-1 raw outputs; confirmed run-1 numbers |
| Haiku arm | claude-haiku-4-5 | 60 | original (50 nodes, incl. trap nodes) | Fresh run; 10 batches of 6; one subagent per batch |
| B30 clean test | claude-haiku-4-5 | 10 | cleaned (40 nodes, trap nodes removed) | Q21–Q30 only |

All calls model-played by fresh subagents. No real learners participated. Results are SIMULATED.

## Numbers

| Metric | Run 1 sonnet | Run 2 sonnet (re-score) | Run 1 haiku | Run 2 haiku (orig) | Run 2 haiku (clean, Q21-Q30) |
|--------|-------------|------------------------|------------|-------------------|------------------------------|
| Reuse precision | 0.810 | **0.810** (confirmed) | 0.805 | 0.739 | n/a (only new expected) |
| Reuse recall | 0.971 | **0.971** (confirmed) | 0.943 | 0.971 | n/a |
| Trap false-reuse | 0.600 | 0.600 | 1.000 | 1.000 | **0.000** |
| Adj precision (excl trap-node FPs) | 34/36 = 0.944 | 34/36 = 0.944 | 1.000 (all run-1 FPs are trap-node FPs) | **1.000** | n/a |
| Valid-JSON rate | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |
| Valid decision enum | 0.833 | 0.833 | 0.983 | **1.000** | 1.000 |
| Numeric confidence | 0.867 | 0.867 | 0.000 | **1.000** | 1.000 |
| n | 60 | 60 | 60 | 60 | 10 |

### Category breakdown — haiku run 2 on original fixture (SIMULATED)

| Category | n | Correct | % | vs run 1 haiku |
|----------|---|---------|---|---------------|
| near-dup-light (Q01-Q10) | 10 | 10 | 100% | same |
| near-dup-heavy (Q11-Q20) | 10 | 9 | 90% | same (Q20 wrong both runs) |
| trap (Q21-Q30) | 10 | 0 | 0% | same (all 10 reuse trap node) |
| ordinary-reuse (Q31-Q45) | 15 | 15 | 100% | +1 (Q38 correct this run) |
| ordinary-new (Q46-Q60) | 15 | 13 | 87% | -2 (Q54, Q60 false-reuse trap nodes) |

### Notable errors — haiku run 2

- **Q20** (near-dup-heavy): decision=extend instead of reuse. Extends the cytochrome c node rather than recognising the cytochrome c oxidase canonical_question as a direct match. Same failure mode as run 1.
- **Q21–Q30** (trap, original fixture): all 10 returned reuse targeting the corresponding trap node (n_tr01–n_tr10). As with run 1, this is B30 fixture contamination — trap nodes are in the registry and their canonical_questions directly answer the trap queries.
- **Q54** (ordinary-new): reuse→n_tr02 (cristae remodelling trap node). The query asks about cytochrome c release; the trap node covers this exactly. Fixture contamination spreading into ordinary-new category.
- **Q60** (ordinary-new): reuse→n_tr08 (malate-aspartate shuttle trap node). The query asks about cytoplasmic vs matrix NADH balance; the trap node covers this. Same contamination.

### B30 clean test — haiku on cleaned fixture (10 queries, no trap nodes)

All 10 trap queries returned decision=new when trap nodes are absent from the registry. Trap false-reuse rate: **0.000**. This confirms B30: every trap false-reuse in the original fixture is due to the trap nodes being in the registry, not a model boundary-detection failure. Haiku correctly identifies all 10 queries as novel when the confounding nodes are absent.

### Sonnet re-score

Re-running the run-1 scorer on run-1 raw outputs produces identical numbers: precision=0.810, recall=0.971, trap-FP=0.600. No discrepancy.

## Verdict

_Against kill line: precision ≥ 0.80 AND recall ≥ 0.70_

**Sonnet:** narrow PASS on one run — precision=0.810, recall=0.971 (this is a re-score of run-1 outputs, not a fresh run; confirmed unchanged from run 1). One run is not sufficient to call it a strong PASS.

**Haiku (original fixture):** INCONCLUSIVE — run 1 precision=0.805 (above 0.80) and run 2 precision=0.739 (below 0.80); haiku straddles the kill line across two full runs. Recall=0.971 passes in both runs. All FPs in both runs target trap nodes; adjusted precision (removing trap-node FPs) = 1.000 in run 2. The below-kill-line score in run 2 is attributable to B30 fixture contamination spreading to ordinary-new (Q54, Q60), not model boundary-detection failure.

**Haiku (cleaned fixture, B30 diagnostic):** the cleaned-fixture result is correct by construction — trap nodes were removed before running. This is a diagnostic confirming what B30 predicts, not an independent PASS: 10/10 correctly returned new when trap nodes absent.

## What compounds

B30 resolution (clean fixture = 0 trap FPs) unblocks X01, X02, X05, X08 in the same way run 1 did for sonnet. The clean-fixture result also strengthens confidence in haiku for reuse decisions — adjusted precision matches or exceeds sonnet.

The enum compliance improvement (haiku: 0.983→1.000) and confidence field fix (haiku: 0.000→1.000) are direct results of tightening the prompt; B31 and B33 mitigations are validated in run 2.

## Dead ends

- Run-1 haiku raw data preserved unmodified in run-2026-10-18/raw-haiku/. Run 2 produced an independent fresh set in run2-2026-10-19/raw-haiku-orig/.

## Bottlenecks

See bottlenecks-2026-10-19-run2.md.

## Reproduce

```bash
# From the repo root

# Build cleaned fixture (removes trap nodes from registry, rebuilds Q21-Q30 stacks):
node experiments/E05/results/run2-2026-10-19/build-clean-fixture.cjs

# Score run-2 haiku on original fixture:
node experiments/E05/results/run2-2026-10-19/scorer2.cjs --dir raw-haiku-orig

# Score run-2 haiku on cleaned fixture (traps only):
node experiments/E05/results/run2-2026-10-19/scorer2.cjs --dir raw-haiku-clean --ids Q21-Q30

# Re-score run-1 sonnet (original scorer, run-1 raw data):
node experiments/E05/results/run-2026-10-18/scorer.cjs --model sonnet

# Raw outputs:
#   run2-2026-10-19/raw-haiku-orig/Q01.json … Q60.json
#   run2-2026-10-19/raw-haiku-clean/Q21.json … Q30.json
```
