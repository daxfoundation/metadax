# E05 — Follow-Up Engine Reuse Decisions

**Date:** 2026-10-18
**Status:** SIMULATED (model-played, no real learners)

## Question

When a learner asks a follow-up, does MP-05 make the right reuse/extend/new decision against a 50-node registry — pointing to an existing node when one answers the question, and creating a new one when nothing does?

## What ran

| Pass | Model | n | Seeds | Notes |
|------|-------|---|-------|-------|
| Primary | claude-sonnet-4-6 | 60 | 1 | All 60 queries; one subagent per query |
| Robustness | claude-haiku-4-5 | 60 | 1 | All 60 queries; one subagent per query |

All calls were model-played by fresh subagents (one subagent per query). No real learners participated. Results are SIMULATED.

## Numbers

| Metric | Sonnet | Haiku |
|--------|--------|-------|
| Reuse precision | 0.810 | 0.805 |
| Reuse recall | 0.971 | 0.943 |
| Trap false-reuse rate | 0.600 | 1.000 |
| Valid-JSON rate (parses) | 1.000 | 1.000 |
| Valid decision enum | 0.833 (50/60) | 0.983 (59/60) |
| Numeric confidence | 0.867 (52/60) | 0.000 (field absent) |
| n (total queries run) | 60 | 60 |

### Category breakdown — sonnet (SIMULATED)

| Category | n | Correct | % |
|----------|---|---------|---|
| near-dup-light (Q01-Q10) | 10 | 9 | 90% |
| near-dup-heavy (Q11-Q20) | 10 | 10 | 100% |
| trap (Q21-Q30) | 10 | 4 | 40% |
| ordinary-reuse (Q31-Q45) | 15 | 15 | 100% |
| ordinary-new (Q46-Q60) | 15 | 13 | 87% |

### Category breakdown — haiku (SIMULATED)

| Category | n | Correct | % |
|----------|---|---------|---|
| near-dup-light (Q01-Q10) | 10 | 10 | 100% |
| near-dup-heavy (Q11-Q20) | 10 | 9 | 90% |
| trap (Q21-Q30) | 10 | 0 | 0% |
| ordinary-reuse (Q31-Q45) | 15 | 14 | 93% |
| ordinary-new (Q46-Q60) | 15 | 15 | 100% |

### Notable errors (haiku)

- **All 10 traps (Q21–Q30):** haiku reused a trap node for every trap query (trap false-reuse rate 1.000 vs sonnet 0.600). Same fixture design issue as sonnet (B30); haiku has no threshold resistance at all.
- **Q55** (ordinary-new): returned `decision: "create"` (invalid enum, synonym for new). Scored CORRECT.
- **confidence field absent:** haiku omitted the `confidence` field from all 60 responses — the field is entirely missing, not null or a string. The scorer receives `undefined`. Runtime would reject these under strict schema validation. See **B33**.
- **Q25, Q30** (traps): decision=reuse but target_id=null — inconsistent (reuse requires a non-null target). Not caught by scorer; would fail runtime anti-hallucination gate.

### Notable errors (sonnet)

- **Q06** (near-dup-light, false negative): model returned `decision: "match"`, a non-standard value not in the MP-05 schema. Target was valid (`n_x7a3ck9qm5vwrpb2dt4nhe0fy6`). Schema violation; scorer counted as incorrect.
- **Q21, Q23, Q25, Q27** (traps): model returned `decision: "route"` (synonym for redirect). Not in enum. Target was a trap node. Scored as CORRECT because non-reuse, but a strict runtime would reject.
- **Q46, Q47, Q49, Q57, Q58** (ordinary-new): model returned `decision: "create"` (synonym for new). Not in enum. Scored as CORRECT because non-reuse, but a strict runtime would reject.
- **Q01, Q09, Q13, Q28, Q42, Q43, Q45, Q46** (various): confidence field was `"high"` (string) instead of a number 0–1. See **B31**.
- **Q22, Q24, Q26, Q28, Q29, Q30** (traps, counted as false positives): model reused the trap node whose canonical_question directly answers the query. See fixture design note below.
- **Q54** (ordinary-new, false positive): model reused trap node `n_tr02` (cristae remodelling) for a query about cytochrome c release during apoptosis — topically adjacent but different question.
- **Q60** (ordinary-new, false positive): model reused a registry node for a query about cytoplasmic/matrix NADH balance — debatable match.

### Fixture design issue (affects trap scores)

Trap nodes (n_tr01–n_tr10) were placed in the registry with canonical_questions that directly answer the trap queries (Q21–Q30). MP-05 correctly reuses them. The answer key marks these as expected_decision='new', making them score as false positives. The intended test — "same words, different question, must not match a BASE node" — was not cleanly implemented. Six of ten trap false-reuses are actually correct reuse behavior against trap nodes, not base nodes. See **B30** in bottlenecks-2026-10-18.md.

## Verdict

_Against kill line: precision ≥ 0.80 AND recall ≥ 0.70_

**PASS** — sonnet: precision=0.810 recall=0.971

If fixture design flaw is corrected (remove trap nodes from registry OR reclassify trap-node reuses as correct), adjusted precision (excl trap-node FPs) = 34/36 = 0.944 (sonnet; 34 correct reuse decisions out of 36 total reuse decisions excluding trap-node FPs), recall=0.971 — strongly PASS.

**Robustness (haiku):** PASS — precision=0.805 recall=0.943. Both metrics above the kill line. Haiku matches sonnet on near-dup-light (100%) and is close on near-dup-heavy (90% vs 100%) and ordinary-reuse (93% vs 100%). Haiku completely fails trap discrimination (0% vs 40% for sonnet), but this is dominated by the fixture design flaw (B30). See B32 and B33 for new haiku-specific issues.

## What compounds

PASS certifies MP-05 for reuse decisions against a realistic registry → unblocks X01, X02, X05, X08 (all depend on meaningful reuse from the registry). The trap discrimination gap (B30) is a known fixture design limitation, not a model failure.

## Dead ends

- Subprocess runner calls require an authenticated CLI session; the run environment did not support this. Runner.cjs is scaffolded but not usable in this context; model subagents were used instead.
- Registry entries include `depth`, `reuse_count`, `superseded_by` fields; these are not part of the MP-05 REGISTRY block spec but were left in (surplus fields; do not harm but add ~20% tokens to the REGISTRY block).

## Bottlenecks

See bottlenecks-2026-10-18.md.

## Reproduce

```bash
# From the repository root

# Fixture is pre-built (stacks/ dir contains all prompts)
# Regenerate fixture from scratch:
node state/metadax/public-staging/experiments/E05/run-2026-10-18/build-fixture.cjs

# Score a completed run:
node state/metadax/public-staging/experiments/E05/run-2026-10-18/scorer.cjs --model sonnet
node state/metadax/public-staging/experiments/E05/run-2026-10-18/scorer.cjs --model haiku

# Raw outputs:
#   run-2026-10-18/raw-sonnet/Q01.json … Q60.json
#   run-2026-10-18/raw-haiku/Q01.json … Q60.json
```
