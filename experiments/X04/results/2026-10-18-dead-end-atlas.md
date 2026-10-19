# X04 — dead-end atlas — Simulation 2 — RESULT

> ## ⚠️ SIMULATED — model-played learners (sonnet). NOT human results.
> Every "learner" is a fresh Sonnet subagent given only its persona and the
> course map; it never saw an answer key, a grader, or another persona. Stalls,
> take-up and declines are **model behaviour**, never evidence of how a person
> would act. This file surfaces **architecture bottlenecks**, not learning
> outcomes.

Date: 2026-10-18 · Course: `newtons-laws-motion` (50 nodes, 7 objectives,
8 concepts, 107 distinct seeds) · run 2 of X04/X11, re-running run 1's design
(`../2026-10-09-sim.md`) with the B09–B16 fixes.

## Question

Run 1 built the atlas but hit nine bottlenecks. Do the fixes hold: do shapes
keyed by a **stable opaque node_id** cluster one physical spot into **one** hole
(not three), can markers pin to the exact node, and can the atlas be rebuilt
**without the session logs**?

## What ran

| Wave | Learners (n) | Model | Role | Turns |
|---|---|---|---|---|
| 1 (atlas) | 12 | sonnet | stall + explore | ≤8 |
| 2 (markers present) | 6 | sonnet | respond to markers/offers | ≤4 |

One subagent per persona; same 18 personas as run 1. Deterministic pipeline
(zero-dep Node, committed under `run-2026-10-18/scripts/`), re-runs
byte-reproducibly (opaque ids are hash-derived, not minted).

## Numbers (run 1 → run 2)

| Measure | Run 1 | Run 2 |
|---|---|---|
| Shapes extracted | 10 | 19 |
| Holes | 9 | 11 |
| **Fragmentation: `mass@L02.M01` holes** | **3** (each 1 session) | **1** main hole @depth 2 carrying **3** sessions (+1 shallow depth-1 hole) |
| Cluster key | `(concept, signature)` | **`(node_id, depth)`**, signature = label |
| Marker resolves to | `(module, concept, depth)` | **opaque `node_id`** |
| Node record carries abandoned state | no | **yes** (`status`/`abandoned_count`/`lost_count`) |
| **Atlas rebuilt from registry alone (no logs)?** | no (B10) | **yes — byte-identical** to log-built markers |
| Consent-withheld shapes | forced true | 0 (all consented); k-anon sketch added |
| k-anon (k=5) holes published / suppressed | — | 0 / 11 (suppressed at n≤12) |

The three run-1 `mass@L02.M01` holes (too-abstract / prerequisite-gap /
patience-exhausted) now merge: the depth-2 spot is one hole whose
`signature_distribution` is `{answer_too_abstract:2, depth_without_payoff:1}`.

## Verdict vs the kill line

Kill line: *"If clusters don't predict future stalls, or re-teaching a hole
doesn't reduce stalls, the atlas is decoration."*

**INCONCLUSIVE.** This run did not test predictiveness or re-teach lift (no
re-taught course + fresh cohort). Wave-2 stall records came back unpopulated, so
even the weak predictiveness read is unavailable. What run 2 **does** settle is
the data-model half: the structural blockers that made the run-1 atlas
un-rebuildable and fragmented (B09–B12) are fixed and demonstrated. The kill
line itself still needs a re-teach A/B — unchanged from run 1.

## What compounds

Stable opaque-id keying + depth makes one spot one hole, and the atlas now lives
**on the registry**, so it survives without the logs — the two properties the
card said were needed for a living map of where a course breaks.

## Dead ends kept

- Per-learner minted ids as the spot key: confirmed dead (run 1's bug); the same
  stall only clusters once the spot has a **stable** id.
- Signature as a cluster key: fragments one spot — demoted to a label.
- `other@null` thin holes from 2 non-conforming stall records: the vocab/ depth
  coercion quarantined them instead of forking named holes (B59).

## Bottlenecks

New: B58 (depth splits one objective), B59 (no write-time stall schema).
Fixed/updated: B09, B10, B11, B12. See `../bottlenecks-2026-10-18.md`. Steering
finding (markers) lives in X11 (B77).

## Reproduce

```
cd run-2026-10-18
node scripts/00-build-snapshot-v03.cjs course.snapshot.v02.json course.snapshot.v03.json id-map.json
node scripts/01-extract-shapes.cjs sessions shapes/shapes.json
node scripts/02-cluster-holes.cjs shapes/shapes.json course.snapshot.v03.json shapes/holes.json
node scripts/04-build-markers.cjs shapes/holes.json shapes/markers.json
node scripts/05-annotate-registry.cjs course.snapshot.v03.json shapes/holes.json shapes/markers.json registry.annotated.json
node scripts/06-rebuild-from-registry.cjs registry.annotated.json shapes/markers.from-registry.json   # == markers.json
node scripts/07-kanon.cjs shapes/holes.json shapes/kanon.k5.json 5
```
