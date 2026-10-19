# X02 run 2 — many hands, one course, WITH the B19/B21/B22 fixes — RESULT

> ## ⚠️ SIMULATED
> **Every number in this file is produced by a simulation.** The federation model is
> a deterministic, zero-dependency node script (`run-2026-10-18/federation-sim.cjs`,
> seed `20261009` — run 1's recorded seed). The only model-played part is one `sonnet`
> subagent that judged 40 question pairs for the B20 probe (blind to the answer key).
> **No real learners, teachers, or courses were involved.** Effect sizes are
> hypotheses for real testing, not measured facts about people.

Run: `X02-run2-20261018` · Date: 2026-10-18 · Status: **COMPLETE**
Fixes exercised: **B19** (3-way merge with per-module files + append-only hot modules),
**B21** (accepted lifecycle with `accepted_by`/`reviewed_by` + `contested` flag),
**B22** (stored inverted index on content-hash and stuck-signature).
Spec cited: `prompts/MP-05-followup-engine.md` STEP 3 decision rules (reuse/extend/new/
ancestor) and normative contract points 8, 10; schemas `node`, `registry`,
`registry-index`.

## Question

Run 1 isolated three bottlenecks in the federated registry but left them open: a
single serialization point per module still contends under Zipf-hot load (B19);
unreviewed learner nodes propagate across forks before any teacher sees them, and
there is no way to keep a contested core side by side (B21); candidate lookup
re-scans the union of all forks per follow-up (B22). **Do the three proposed fixes
actually move the numbers — and does the merge still obey X02's kill line (nothing
silently dropped or overwritten, origin survives)?**

## What ran

- **Model:** deterministic script for the federation sim; one `sonnet` subagent for
  the B20 semantic-judge probe. No other model calls.
- **Sizes (unchanged from run 1):** 4 forks (en/es/de/fr) · 200 learners (50/fork) ·
  2,000 follow-ups · 12 weeks · 50-node base registry · Zipf topic draw over 10
  families → hot modules `L01.M01`, `L03.M01`. MP-05 reuse rule implemented as code.
- **Seed:** `20261009` (run 1's recorded seed). 60 concurrency ticks (12 weeks × 5
  slots).
- **Arms:** three baseline arms (reproducing run 1's behaviour) and two fixed arms,
  all in one seeded pass so deltas are internally valid.
- **B20 probe:** 40 question pairs (30 same-meaning: 15 paraphrase + 15 translation
  es/de/fr; 10 different controls incl. near-misses). One `sonnet` subagent judged
  same/different blind to the answer key; compared against exact content-hash dedup.

> **Reconstruction note (honesty).** Run 1's script `part-a-x02-sim.cjs` was never
> committed to this repo, so this is a faithful **reconstruction** of its design, not
> the original binary. The reconstruction reproduces run 1's conflict pattern —
> single-file conflicts **97.0** vs run 1's **97.3**; federated per-module decision
> split **reuse 1674 / extend 110 / new 10 / ancestor 206** vs run 1's **1649 / 117 /
> 10 / 224**; near-dups **0** federated vs **286** no-index (run 1: 0 vs 228) — but
> diverges on node count (**170 vs 327**) and cross-fork links (**1255 vs 791**).
> The baseline is therefore a partial match to run 1, not a close one. The
> load-bearing claims are the **deltas between the baseline
> and fixed arms within this one run**, which do not depend on matching run 1 exactly.

## The numbers (SIMULATED)

| Arm | conflicts/100 commits | nodes | near-dups | cross-fork links | unreviewed propagating cross-fork | lookup comparisons / follow-up |
|---|---|---|---|---|---|---|
| fed · single file (baseline) | **97.00** | 170 | 0 | 1269 | **841** | union 155.1 |
| fed · per-module (baseline) | **80.80** | 170 | 0 | 1255 | **854** | union 155.3 |
| no index · per-module (baseline) | 80.60 | 455 | 286 | 0 | 0 | union 122.9 |
| **fed · per-module + append-only + accepted (FIX)** | **13.55** | 186 | 16 | 1190 | **0** | **index 1.94** |
| fed · per-module + accepted (FIX, no append-only) | 80.95 | 179 | 9 | 1201 | **0** | index 1.95 |

Run 1 reference (documented): fed per-module **86.5** conflicts/100, 327 nodes, 0
near-dups, 791 cross-fork links; single file **97.3**.

Decisions (fed per-module + append-only, fixed): reuse 1629 · extend 126 · new 10 ·
ancestor 235.

### Measure-by-measure vs run 1

- **Conflicts/100 commits (B19).** Baseline reproduces run 1's pattern: single-file
  **97.0** (run 1 97.3), per-module **80.8** (run 1 86.5) — per-module barely helps
  because Zipf piles commits on the two hot modules. The **append-only fix cuts
  conflicts 80.8 → 13.6 (−83%)**: commuting appends to a hot module's segment log
  carry no write-conflict, so the residual is cold-module contention only. Per-module
  files *without* append-only stay at 81.0 — confirming run 1's "necessary but
  insufficient" reading.
- **Unreviewed nodes propagating cross-fork (target 0) (B21).** Baseline federation
  propagates **841–854** still-`pending_review` nodes across forks (the B21 danger,
  made quantitative). With the accepted-lifecycle gate (only `accepted`/`shared`
  cross a fork boundary), this is **0** in both fixed arms. Target met.
- **Contested cores kept side by side (B21).** The real `merge.js` tool, given two
  nodes tagged one `contest_id` from forks en/de, keeps **both** (`contested: 1
  core, 2 nodes`), **dropped = 0**, neither superseded. Preservation rule holds.
- **Lookup cost per follow-up (B22).** Union scan averages **~155 comparisons** per
  follow-up and grows with the union; the stored inverted index is a single keyed map
  hit — **~1.9 comparisons** (hit + postings), an ~**80×** reduction. Standalone check
  on a 400-entry union: **400 → 4** comparisons, index agrees with scan exactly.

### B20 probe — exact hash vs model judge (SIMULATED)

| Method | same-meaning caught (recall) | different correct | false merges | accuracy |
|---|---|---|---|---|
| exact content-hash (today) | **0 / 30 (0%)** | 10 / 10 | 0 | 25% |
| `sonnet` subagent (blind) | **30 / 30 (100%)** | 10 / 10 | 0 | **100%** |

Exact hashing caught **none** of the 30 paraphrase/translation duplicates — the text
differs, so the hashes differ. The model judge caught **all 30** with **zero** false
merges (it correctly split near-misses: kinetic vs potential energy, osmosis vs
diffusion, "falls at the same rate" vs "pulls harder"). This quantifies B20: the
exact-hash join that drove run 1's 228→0 near-dup number is blind to real paraphrase
and cross-language drift; a semantic layer closes that gap but is a model call, not a
free hash.

## Verdict

**PASS** against the X02 kill line ("if merges silently drop or overwrite
contributions, or origin can't survive a merge, federation is unsafe"). The 3-way
merge dropped **0** contributions, overwrote none (same-id/divergent-content
collisions are surfaced with both kept), preserved origin on every node, and kept the
contested core side by side. The three fixes each move their target metric in the
right direction (conflicts −83%, unreviewed cross-fork → 0, lookup ~80× cheaper).
**One caveat, not a kill:** the B21 gate means dedup now depends on review throughput
— when nodes stay `pending_review` they can't dedup cross-fork, so near-dups creep
back from 0 to ~9–16 in the fixed arms. That is a governance/throughput dial, not a
silent data loss.

## What compounds

Origin-tracked, conflict-aware, append-only composition that a hot course can take
without a central editor. A learner in one fork reuses an *accepted* node authored in
another; the registry stays ~2.4× smaller than the un-indexed island case; a contested
core is kept, not erased; and candidate lookup is O(1), which is the prerequisite the
bundle work (X06) needs.

## Dead ends kept

- **Per-module files alone** do not fix B19 — 81.0 conflicts/100 with the fix's
  lifecycle but no append-log. Sharding the file is not enough; the serialization
  point itself has to go.
- **Exact content-hash as the dedup primitive** — 0/30 recall on paraphrase and
  translation. It is a correctness floor, not a dedup layer.
- **Propagating `pending_review` cross-fork** (run 1's federation default, contract
  point 8) — 841+ unreviewed nodes crossed forks in the baseline. Gated off.

## Bottlenecks

See `bottlenecks-2026-10-18.md`. B19/B21/B22 move from **open** toward fixed (with
evidence); one new bottleneck **B54** is opened (dedup now depends on review
throughput once `pending_review` nodes are barred from crossing forks), and
**B55** records the model-judge dedup cost surfaced by the B20 probe.

## Reproduce

```sh
cd experiments/X02/run-2026-10-18
node federation-sim.cjs        # writes part-a-results.json (all arms, seed 20261009)
node b20-exacthash.cjs         # writes b20-exacthash-result.json (0/30 recall)
# B20 model half: one sonnet subagent judged b20-judge-input.json blind;
# its verdicts are in b20-judge-result.json, scored in b20-judge-scored.json.
```

Tools under `experiments/X02/proposed/tools/` (`merge.js`, `lifecycle.js`,
`inverted-index.js`); schema deltas under `experiments/X02/proposed/schemas/` with
`proposed/CHANGES.md`.
