# X11 — The negative space

*Unexplored regions shaded and offered — never pushed.*

**Status: designed.**

## Question

A course is a tree of nodes; a learner has entered some and not others. Can the system
map the **negative space** — the regions *never entered* — shade them on the map, and
**offer** them without ever pushing? If the offer is useful and never coercive,
learners discover what they didn't know to ask. If the map is wrong or the offers nag,
negative space becomes clutter or pressure.

## Method

1. Over a learner's history, compute the entered set against the full registry; the
   complement is negative space.
2. Shade it (by distance from what they know, by objective-relevance) and surface a
   small, ranked set of offers.
3. Measure uptake when offered vs a pushed control, and learner-reported pressure.

## Measures

- **Map correctness:** shaded region = registry minus entered set, keyed by opaque id.
- **Offer uptake:** acceptance rate of offered negative-space nodes.
- **No-push integrity:** declining an offer suppresses it; it is never re-pushed
  (shared with X10 refusal).
- **Discovery value:** do accepted offers lead somewhere the learner rates useful?

## Kill line

If offers have to be pushed to get any uptake, or learners feel pressured, "offer
never push" doesn't work — rethink discovery.

## What compounds

A discovery layer that turns the whole decentralised library into a gentle map of
what's next — the complement of the dead-end atlas (X04). Together they cover both
*entered-and-abandoned* and *never-entered* space.

## Dead ends

- Breadcrumb ids — can't cleanly compute "entered vs not" across forks; needs opaque
  ids + `parent_id` so the registry tree is well-defined. (v0.3.)
- Pushing offers — the one thing the card forbids; measured against a pushed control
  precisely to prove push is worse.
- Offering the entire complement — overwhelming; offers must be ranked and few.

## What has to exist

| Need | Where today |
|---|---|
| Well-defined registry tree (entered vs not) | **v0.3** — `schemas/registry.schema.json`, `schemas/node.schema.json` (`parent_id`, `depth`), `tools/path.js` |
| Progress (entered set) | `schemas/progress.schema.json` |
| Offer / decline surface | `docs/guide/next-session.md` |
| **Coverage map (complement over registry)** | **missing** — deterministic, buildable now |
| **Offer ranking + no-push suppression** | **missing** |

## Simulation-first

**Can be tested now, labelled simulated.** A deterministic script computes negative
space over a registry from a model learner's history, ranks offers, and runs an
offer-arm vs push-arm with model learners; a model judge rates pressure. This exposes
the bottleneck: **does the registry tree support a clean entered/not-entered
complement, and can offers be ranked few-and-relevant — before any human UX?** Uptake
and pressure figures are *simulated*.

**Only real people can show:** whether *human* learners accept gentle offers and
whether "never pushed" actually feels better than nudging.

## Runs

| Date | Run | One-line result | Full result | Bottlenecks found |
|---|---|---|---|---|
| 2026-10-09 | [Simulation 1 (SIMULATED, model-played)](results/2026-10-09-sim.md) | 1/8 concepts unreached (inertial-frame); 85% seeds unfollowed (exposure-dominated); offers PASS on closers, scarcity opener flagged | [results/2026-10-09-sim.md](results/2026-10-09-sim.md) | B09, B10, B11, B12, B13, B14, B15, B16, B17 |

## Depends on / feeds

Rides on **v0.3 IDs**. Inverse of **X04**. Shares no-push/refusal with **X10**. Feeds
**X12**.
