# X14 — Fetch the spot, not the course

*Whole-course context versus index-plus-sample. How much quality do we lose, how many tokens do we save, and does it hold as the library grows?*

**Status: RUN 2026-10-10 — see FINDINGS-20261010.md (and experiments-runs/X14/RESULTS.md)**

## Question

Today the full course snapshot is the per-turn context for every session (B13):
context scales with course size, not learner activity — the dominant cost driver and
the thing that won't fit a real course. If instead the companion retrieves only **the
matching node, its ancestors, and a small sample of variants** under a token budget,
does answer quality hold while tokens per turn stop scaling with course size? And does
that still hold as the library grows from small to large?

If quality holds and tokens flatten, sampled retrieval is the mechanism behind Jason's
"nice sampling" — *it never downloads every module for all 8 billion of us*. If quality
falls off, the sample is too small or the index misses the right node.

## Method

1. Build three library sizes — **small / medium / large** — from existing fixtures
   plus synthetic near-duplicate variants (paraphrases + translations) so canonical
   nodes have multiple variants (exercises B20).
2. **Baseline (whole-course):** per turn, pass the full course snapshot as context;
   answer; grade.
3. **Sampled (index+sample):** per turn, index-lookup the canonical node by
   objective/level/language; fetch node + ancestors (O(1) v0.3 PATH trail) + a
   budgeted sample of variants by quality + exploration; answer; grade.
4. Run the same learner turns through both arms at each of the three sizes.

## Measures

- **Answer quality:** sampled pass rate vs whole-course pass rate (same graded turns).
- **Tokens per turn:** context tokens per turn, both arms, at each size — does the
  sampled arm stay flat as the library grows while the baseline rises?
- **Retrieval hit rate:** did the index return the node a whole-course run would have
  used? (precision/recall of the index lookup).
- **Dedup effect:** canonical-node count vs raw node count after near-duplicate
  collapse; how many variants the sample actually drew from.

## Pass/fail

- **Pass:** sampled pass rate ≥ (baseline − 2 points) at all three sizes **and**
  sampled tokens/turn roughly flat across sizes while baseline grows with size.
- **Fail / kill:** sampled quality degrades with size (index misses the right node as
  the library grows), or tokens don't flatten. Then retrieval+sample as specified does
  not solve B13 — revisit the index fields or the sampling policy.

## Cost

Medium. Three library builds + two arms × the turn set. Synthetic variant generation is
cheap; the large-library whole-course baseline is the expensive arm (big context per
turn) — cap the turn count and `log()` the cap rather than running the full set.

## How to run with the existing tools

- v0.3 O(1) PATH trail already gives bounded ancestors (`docs/ID-FORMAT-v0.3.md` §4);
  ancestry is reconstructable from the registry `parent_id` chain.
- Registry is already sharded per module (`registry/<module-id>.json`); the experiment
  adds a **hash-prefix-sharded index of descriptors** (objective/level/language/media/
  review/usage) — new for this experiment (B02/B22).
- Near-duplicate collapse needs a semantic layer beyond exact hash (B20): use embedding
  similarity *or* a scripted teacher-review grouping to assign variants to canonical
  ids; label results as using whichever method.
- Grade with `evals/grade.js`; reuse `tools/canon.js` for stable content hashes.
- Add the per-turn token field (shared with X13).

## What compounds

Context that scales with the learner's question, not the course's size. Every library
can grow without making turns more expensive — the precondition for a real-scale
commons.

## Dead ends

- An index that stores content, not descriptors — then it inherits the B02 size wall.
- A sample so small it misses the one variant that would have landed; measure recall,
  not just tokens.

## Status

RUN 2026-10-10, see experiments-runs/X14/RESULTS.md. Feeds
`docs/ARCHITECTURE-COMMONS.md` §b, §c.
