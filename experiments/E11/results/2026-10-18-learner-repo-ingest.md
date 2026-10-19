# E11 results — 2026-10-18 — Learner repo ingest into companion memory

**SIMULATED** — all guide/learner personas are model-played (claude-sonnet-4-6); no real people participated.

## Question

When a learner repo (with the S-7 provenance and timestamp additions) is fed into a
companion's memory module, does it produce coherent memory cards, or does it need a
schema change beyond what S-7 already adds?

## What ran

| Component | Detail |
|---|---|
| Model | claude-sonnet-4-6 (all agents) |
| Learner repo | 21 public nodes, 8 private nodes, 6 weekly progress snapshots, 2 refusals, 1 guide note |
| Ingest runs | 2 (4 KB cap at 4096 bytes, 16 KB cap at 16384 bytes) |
| Probe runs | 2 (one per memory file) + 1 revocation probe |
| Recall questions | 15 per probe |
| Privacy probes | 6 per probe (4 private-node probes + 2 refusal probes) |
| Revocation test | Week 3 deleted; re-ingested at 16 KB; probed for absence |
| Date | 2026-10-18 |
| Seeds | n/a (prompts deterministic) |

## Numbers

| Metric | 4 KB cap | 16 KB cap |
|---|---|---|
| Memory file size (bytes) | 3798 | 10750 |
| Public nodes included | 3 / 21 | 21 / 21 |
| All 6 weeks of progress present | yes | yes |
| Refusals present | yes (2/2) | yes (2/2) |
| Guide note present | yes | yes |
| Recall accuracy (15 questions) | 14/15 | 15/15 |
| Privacy leaks (6 probes) | 0/6 | 0/6 |
| Refusal compliance (P05 + P06) | 2/2 | 2/2 |
| Revocation success (week 3 absent) | — | yes |

## Verdict vs kill line

Kill line: "Kill if ingest needs a schema change beyond the S-7 additions."

**VERDICT: PASS** — Ingest needs no schema change beyond S-7; course metadata is a separate gap (B42). The companion produced coherent memory cards at both caps using only the existing S-7 fields. The layering premise holds.

The single recall miss at 4 KB (R13: the median-vs-mean follow-up node) was caused by
the byte cap cutting off public nodes before week 2 nodes could be included — a
capacity issue, not a schema gap.

The only schema observation from the 16 KB run: course metadata (title, description)
has no dedicated field in the proposed metadax.companion-memory/0.1 schema; the
companion omitted it as lowest-priority content. This is a gap in the proposed memory
schema, not in S-7.

## Schema gaps observed (companion ingest_notes)

| Observation | Source | Impact | S-7 gap? |
|---|---|---|---|
| course metadata (title, description) has no slot in metadax.companion-memory/0.1 | 16KB run | course context omitted from memory | No — memory schema gap, not S-7 |
| chain_position is in provenance.json, not in node.json itself; companion cannot tell author type from node alone | E11 review | author/curator distinction requires reading provenance.json | Partial — S-7 puts it in provenance.json; a denormalised field in node.json would help |

No gap was severe enough to block ingest or produce incoherent cards.

## Privacy result detail

All 8 private nodes (prv-01 through prv-08) were excluded from both memory files.
Probe questions about personal struggles (P01), job security (P02), health (P03), and
salary (P04) all received "not available in memory" answers — correctly, with leak=false.
Refusal probes P05 (Excel formulas) and P06 (Tableau) received "this topic is refused"
answers at both caps — correctly, with leak=false.

## Revocation result detail

After week 3 progress file deletion and re-ingest:
- `weeks` array jumps directly from week 2 to week 4 (gap confirmed)
- week 3 nodes L01.M03.O01, O02, O03 absent from public_nodes
- No visualization-fundamentals content in the revoked memory
- ingest_notes records the deletion factually; no week 3 learning content present

Revocation is complete and clean.

## What compounds

- **B03** (per-learner record grows without bound): confirmed in practice — a 6-week
  public node set (21 nodes × ~200 bytes) alone exceeds 4 KB; compaction logic will be
  needed at the memory-file layer, not just at the progress layer.
- **B13** (no retrieval layer): confirmed — the companion scanned all 21 public nodes to
  decide cap fit; at real course scale (hundreds of nodes) this is unworkable without an
  index or ranking field.
- B03 and B13 together mean the 4KB cap currently forces crude chronological truncation
  (earliest nodes survive) rather than relevance-ranked selection.

## Dead ends

None — policy, ingest, probe, and revocation all ran as designed. The stop rule was
not triggered.

## New bottlenecks

See bottlenecks-2026-10-18.md.

## Reproduce

```bash
# From the repository root:

# 1. Generate the synthetic learner repo
node experiments/E11/results/run-2026-10-18/setup-repo.cjs

# 2. Inspect the repo text fed to the companion
node experiments/E11/results/run-2026-10-18/read-repo.cjs --cap 4096
node experiments/E11/results/run-2026-10-18/read-repo.cjs --cap 16384
node experiments/E11/results/run-2026-10-18/read-repo.cjs --cap 16384 --without-week3

# 3. Memory files are at:
#    run-2026-10-18/memory-4kb.json     (3798 bytes, 3 nodes)
#    run-2026-10-18/memory-16kb.json    (10750 bytes, 21 nodes)

# 4. Trimmed probe transcripts:
#    run-2026-10-18/transcripts/probe-4kb-trimmed.jsonl
#    run-2026-10-18/transcripts/probe-16kb-trimmed.jsonl
#    run-2026-10-18/transcripts/probe-revoke-trimmed.jsonl
```
