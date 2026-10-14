# X06 — Same course, every bandwidth

*Bundles, delta sync, and a deferred-question queue over a thin link.*

**Status: designed.** (Extends E06: "does a week's round-trip fit through a 50 kbps link?")

## Question

Can one course serve a learner on a fat connection and a learner on 50 kbps equally —
by shipping a self-contained **bundle**, syncing only **deltas** afterward, and
holding the learner's follow-up questions in a **deferred-question queue** that drains
when a link appears? If a week's learning round-trips through a thin, intermittent
link, the system reaches people the network doesn't. If it needs the cloud every
turn, it only serves the well-connected.

## Method

1. Build a course bundle (nodes, practice bank, registry slice) and measure its size.
2. Simulate a 50 kbps, intermittent link. Do a week of learning offline; queue
   follow-ups that need the guide.
3. On reconnect, sync deltas and drain the queue. Measure bytes, round-trip time, and
   whether anything was lost.

## Measures

- **Bundle size** and cold-sync time at 50 kbps.
- **Delta size** for a week (should be ≪ bundle).
- **Queue integrity:** every deferred question answered, in order, none dropped.
- **Offline completeness:** share of a week's learning done with no link.

## Kill line

If a week can't round-trip through 50 kbps, or the queue loses questions, the thin-link
promise fails — simplify the bundle or the sync before claiming reach.

## What compounds

Reach independent of bandwidth, and a sync model (bundle + deltas + queue) that the
pocket model (X07) and the five-minutes test (X12) both build on. Records are already
small (scale run: package ~1.5 KB, sidecar ~5.6 KB, index entry ~0.4 KB).

## Dead ends

- Shipping one big `index.json` in the bundle — it is 415 MB at 10^6 nodes (scale run
  Part 2); bundle a **sharded** slice, not the whole index.
- Chatty per-turn sync — defeats the thin link; batch into deltas.
- A queue without ordering/idempotency — drains wrong or double-answers.

## What has to exist

| Need | Where today |
|---|---|
| Small, valid records at scale | measured — `experiments/scale/part2-scale.cjs`, `part2-results.json` |
| Sharded index (not one file) | design known from scale run; **index-sharding not yet implemented** |
| Practice bank (offline quiz source) | `schemas/practice-item.schema.json` (v0.3-fixed) |
| **Bundle format** | **missing** |
| **Delta-sync protocol** | **missing** |
| **Deferred-question queue** | **missing** |

## Simulation-first

**Can be tested now, labelled simulated.** A deterministic harness builds a bundle,
throttles I/O to 50 kbps with scripted dropouts, runs model-played offline learning,
queues follow-ups, and drains on a simulated reconnect. This exposes the bottleneck:
**what actually has to be in the bundle for a week offline, and does the delta stay
small — or does something force a per-turn round-trip?** Byte and timing figures are
*simulated* (derived from real record sizes + a modelled link).

**Only real people can show:** whether a real intermittent rural/field link behaves
like the model, and whether a week offline is enough for a real learner.

## Depends on / feeds

Extends **E06**. Feeds **X07** (pocket model consumes the bundle) → **X12**.
