# X02 — Many hands, one course

*A federated registry across forks: learner-origin share, merge conflicts, contested cores.*

**Status: designed.**

## Question

If many guides fork the same course and each extends it in their own direction, can
a **federated registry** let their additions flow back and compose into one richer
course — crediting the learner or guide a node originated with, resolving merge
conflicts, and surviving a *contested core* (two forks that disagree about a central
node)? If composition works, knowledge compounds across people who never coordinate.
If it doesn't, every fork is an island and the library never grows past one author.

## Method

1. Seed a base course with a v0.3 registry (opaque ids, `parent_id` chains).
2. Three model-played guides fork it and each adds a branch; one adds a node whose
   `parent_id` collides in meaning with another fork's node (contested core).
3. Merge the three registries. Record origin on each node; attempt automatic conflict
   resolution; escalate the contested core.
4. Measure how much composes cleanly, how conflicts are surfaced, whether origin
   survives the merge.

## Measures

- **Compose rate:** share of forked nodes that merge without human intervention.
- **Origin fidelity:** each merged node still names the fork/learner it came from.
- **Conflict surfacing:** every genuine semantic collision flagged, none silently
  overwritten (ties to BOTTLENECKS "nothing quietly edited", X09).
- **Contested-core outcome:** both versions preserved and offered, never one erased.

## Kill line

If merges silently drop or overwrite contributions, or origin can't survive a merge,
federation is unsafe — stop and redesign the registry before any multi-author claim.

## What compounds

A course that grows from many hands without a central editor. Origin-tracked,
conflict-aware composition is the backbone of a *distributed, decentralised*
knowledge base — the thing that makes "compounding knowledge" more than one person's
notes.

## Dead ends

- Last-write-wins merges — they erase, violating the preservation rule.
- Breadcrumb ids as merge keys — two forks mint different breadcrumbs for the same
  concept and never match. (Solved by opaque ids + `parent_id`; see v0.3.)
- Centralising every private record to merge it — defeats the decentralisation the
  scale work relies on.

## What has to exist

| Need | Where today |
|---|---|
| Opaque ids + `parent_id` chain (merge keys, no breadcrumb collisions) | **v0.3 staged** — `schemas/node.schema.json`, `schemas/registry.schema.json`, `tools/path.js` (`mintNodeId`, collision re-mint); `docs/ID-FORMAT-v0.3.md` |
| Per-module sharded registry | `schemas/registry-index.schema.json` (0.3) |
| Reuse/extend/new/ancestor decisions | `prompts/MP-05` (E05) |
| Provenance on each node | `schemas/provenance.schema.json` |
| Learner-origin share / consent | guide docs `docs/guide/share.md` |
| **Merge tool (3-way registry merge, conflict detection)** | **missing** |
| **Contested-core resolution record** | **missing** |

## Simulation-first

**Can be tested now, labelled simulated.** Deterministic script forks a base
registry, model-guides add branches, the script runs a 3-way merge and plants one
contested core. This exposes the bottleneck that matters first: **do opaque ids +
`parent_id` actually make independent forks mergeable, or do semantic duplicates slip
through with different ids?** A model judge scores whether conflicts were surfaced.
All compose/conflict numbers are *simulated* — they test the data model, not human
coordination.

**Only real people can show:** whether strangers' contributions are *worth*
composing, and whether a contested core reflects a real pedagogical disagreement
rather than a schema artifact.

## Runs

| Date | Run | One-line result | Full result | Bottlenecks found |
|---|---|---|---|---|
| 2026-10-09 | [Simulation 2 (SIMULATED, model-played)](results/2026-10-09-sim.md) | Federated index cut near-dups 228→0 and registry size 41%; single-file merge bottleneck isolated at 97.3 vs 86.5 conflicts/100 commits; per-module files necessary but insufficient (B19) | [results/2026-10-09-sim.md](results/2026-10-09-sim.md) | B18, B19, B20, B21, B22, B23 |

## Depends on / feeds

Rides on **E04/E05** and **v0.3 IDs**. Shares the preservation rule with **X09**.
Carries the technique records from **X01**. Feeds **X12**.
