# X04 — The dead-end atlas

*Abandoned-path shapes shared by consent, clustered into holes, used to re-teach.*

**Status: designed.**

## Question

When learners start down a branch of questions and abandon it, the *shape* of that
abandoned path (where they entered, where they stalled, what they'd just seen) is
information. If learners **consent** to share abandoned-path shapes — stripped of
content — can we **cluster** them into recurring "holes" in a course, and use those
holes to **re-teach** (add a node, reorder, warn the next learner)? If so, failure
compounds into improvement. If the shapes don't cluster or don't predict the next
learner's stall, dead ends stay private noise.

## Method

1. Run many model-played learner threads over one course; script a fraction to
   abandon at varied points.
2. With consent, emit a dead-end shape per abandonment: entry node id, stall node id,
   depth, last-seen summary — content-free, keyed by opaque node id.
3. Cluster shapes deterministically by node + depth signature.
4. Propose a re-teach for the densest cluster; run fresh learners through the
   re-taught course and measure stall reduction.

## Measures

- **Cluster signal:** do abandonments concentrate on a few nodes, or spread flat?
- **Predictiveness:** does a dense cluster predict the next cohort's stalls?
- **Re-teach lift:** stall rate before vs after the re-teach at that hole.
- **Consent integrity:** no shape stored without the consent flag; no content leaks.

## Kill line

If clusters don't predict future stalls, or re-teaching a hole doesn't reduce
stalls, the atlas is decoration — drop it.

## What compounds

A living map of where a course breaks, built from failure, improving the course for
everyone. The opaque-id keying is what lets shapes from different learners line up on
the same node without exposing anyone's content.

## Dead ends

- Breadcrumb ids as the cluster key — two learners' paths to the "same" node carry
  different breadcrumbs and never cluster. (Needs v0.3 opaque ids + stored depth.)
- Sharing the *content* of an abandoned path — privacy break; only the shape travels.
- Treating one abandonment as a signal — needs density.

## What has to exist

| Need | Where today |
|---|---|
| Opaque id + stored depth (stable cluster key) | **v0.3 staged** — `schemas/node.schema.json` (`depth` integer, `parent_id`), `tools/path.js` |
| Progress / event records (where a learner was) | `schemas/progress.schema.json`, `schemas/event.schema.json` |
| Consent / share surface | `docs/guide/share.md` |
| **Dead-end shape schema (content-free)** | **missing** |
| **Clustering script (node+depth signature)** | **missing** — deterministic, buildable now |

## Simulation-first

**Can be tested now, labelled simulated.** A deterministic harness drives model
learners through a course, scripts abandonments at chosen nodes, emits shapes, and
clusters them. This exposes the bottleneck: **do opaque-id-keyed shapes cluster at
all, and does the data model carry enough (entry, stall, depth) to re-teach — without
carrying content?** Cluster density and simulated re-teach lift are *simulated*; the
re-teach proposal can be generated and A/B'd against model learners.

**Only real people can show:** whether *human* learners abandon at the same holes
model learners do, and whether a real cohort consents to share shape at a useful rate.

## Runs

| Date | Run | One-line result | Full result | Bottlenecks found |
|---|---|---|---|---|
| 2026-10-09 | [Simulation 1 (SIMULATED, model-played)](results/2026-10-09-sim.md) | 9 holes from 10 abandoned shapes; 1/8 concepts unreached; markers PASS, scarcity opener flagged on 12/12 offers | [results/2026-10-09-sim.md](results/2026-10-09-sim.md) | B09, B10, B11, B12, B13, B14, B15, B16, B17 |

## Depends on / feeds

Rides on **v0.3 IDs**. The inverse of **X11** (dead-end = entered-then-abandoned;
negative space = never entered). Feeds **BOTTLENECKS.md** (holes are course-level
bottlenecks) and **X12**.
