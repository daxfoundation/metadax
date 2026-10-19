Proposed by the runs of 18-19 Oct 2026; not merged into the canonical files.

# E05 Proposed Changes

## proposed/fixtures/e05-registry-50/

**What:** A 50-node follow-up registry for the `cell-biology-obsidian` course module L01.M01, built specifically to stress-test MP-05 reuse decisions.

**Structure:**
- `registry.json` — the 50-node registry with v0.3 opaque ids (`n_` + 26 Crockford base32 chars), one root objective node and 49 depth-2/3/4/5 follow-up nodes.
- `dup-map.json` — metadata mapping near-duplicate node ids to their target base nodes and kind (light/heavy). Used by the scorer; never shown to the model.
- `queries.json` — 60 learner follow-up queries (id + query text only). No expected decisions.
- `answer-key.json` — 60 expected decisions with target_id and category. Never shown to the model.
- `stacks/Q01.txt … Q60.txt` — one pre-assembled MP-00 + MP-05 prompt stack per query.

**Why:**
The existing fixture course (`cell-biology-obsidian`) had a small registry that did not exercise the reuse engine. E05 requires a registry large enough to have both true-positive matches (nodes that should be reused) and hard negatives (traps that look matchable but are different questions). This fixture provides that.

**Node categories:**
- 20 base nodes: the primary knowledge tree (cells, mitochondria, ATP)
- 10 light near-dups: mild paraphrases of base nodes 1-10 (shared meaning, slightly different wording)
- 10 heavy near-dups: extensive paraphrases of base nodes 11-20 (shared meaning, heavily reworded)
- 10 trap nodes: same vocabulary as some base nodes but genuinely different canonical questions

**Query categories:**
- Q01-Q10: near-dup-light — should match light near-dup nodes (reuse)
- Q11-Q20: near-dup-heavy — should match heavy near-dup nodes (reuse)
- Q21-Q30: trap — should NOT match any node (new)
- Q31-Q45: ordinary-reuse — match base nodes exactly (reuse)
- Q46-Q60: ordinary-new — no registry match (new)

**Known fixture limitation (B30):** trap nodes appear in the registry with canonical_questions
that match the trap queries, making expected_decision='new' incorrect for those queries in
practice. A corrected fixture would exclude trap nodes from the registry, or redesign trap
queries to use base-node vocabulary with different intent. This limitation inflates the
false-positive count but does not change the PASS verdict for sonnet.

## proposed/prompts/MP-05-output-enum-patch.md

**What:** Additive enforcement paragraph for the Output block of MP-05.

**Why:** E05 run (SIMULATED) found 10/60 responses used non-standard `decision` values
(`"match"`, `"route"`, `"create"`) and 8/60 used non-numeric `confidence` values (`"high"`).
A strict runtime rejects these. Adding a one-paragraph enforcement reminder directly before
the bullet-point notes closes the gap without changing any decision logic. See B31.
## Run 2 — 2026-10-19

### run2-2026-10-18/fixtures/registry-no-traps.json

**What:** A 40-node version of the e05-registry-50 fixture with trap nodes (n_tr01–n_tr10) removed.

**Why:** B30 identified that placing trap nodes in the registry makes the trap category
untestable — the model correctly reuses them. This cleaned fixture removes all trap nodes so
the 10 trap queries have no candidate to reuse, giving a clean measurement of whether the
model creates new nodes for out-of-scope queries. Run 2 confirmed haiku trap false-reuse
drops from 1.000 (original fixture) to 0.000 (cleaned fixture).

**Status:** Use this fixture (or the design principle it embodies) for any future E05-derived
trap test. The 50-node fixture is retained for historical comparison only.

### run2-2026-10-18/build-clean-fixture.cjs

**What:** Script that reads the original registry.json, strips trap nodes, writes
registry-no-traps.json, and rewrites Q21–Q30 stacks with the cleaned REGISTRY block.

**Why:** Reproducibility — anyone can regenerate the cleaned fixture from the canonical
source files without manual editing.

### run2-2026-10-18/scorer2.cjs

**What:** Extended scorer supporting arbitrary raw-output directories and optional query ID
range filters (e.g. `--dir raw-haiku-orig`, `--ids Q21-Q30`).

**Why:** Run 2 needs to score both the full 60-item haiku run and the 10-item trap-only clean
run from separate directories. The original scorer.cjs is hardcoded to `raw-<model>/` and
cannot be reused without modification.
