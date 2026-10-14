# X12 — Five minutes to master's

*Everything together, measured against a blind external yardstick.*

**Status: designed.** (The capstone. Runs last.)

## Question

Put it all together — federated courses (X02), captured techniques (X01), the
dead-end atlas (X04) and negative space (X11), thin-link bundles (X06), the pocket
model (X07), the cross-year companion (X10), nothing-erased provenance (X09) — and ask
the only question that matters: can a learner, in a short, intense run, reach a level
a **blind external yardstick** certifies as advanced ("master's-level" in one narrow
topic)? Not graded by our own rubric — by an external judge that doesn't know how the
learning happened. If yes, the compounding architecture works end to end. If no, we
learn which piece is load-bearing and still broken.

## Method

1. Assemble a full stack on one narrow objective: federated course + companion +
   bundle + pocket model + atlas/negative-space guidance.
2. Run model-played (then, later, real) learners through an intensive session.
3. Submit the outcome to a **blind external** assessment — an external rubric or
   examiner with no view of the pipeline.
4. Ablate: remove one subsystem at a time and re-measure, to find what's load-bearing.

## Measures

- **External certification rate:** blind yardstick's pass level.
- **Ablation deltas:** drop in outcome when each subsystem (federation, techniques,
  atlas, companion, pocket model) is removed — ranks the architecture's load-bearing
  parts.
- **Honesty gap:** our own rubric's score vs the external one (overfitting check).

## Kill line

If the full stack can't beat a single-model, no-architecture baseline on the blind
yardstick, the compounding machinery isn't earning its complexity — strip back to what
the ablations show actually matters.

## What compounds

The end-to-end proof (or disproof) that compounding knowledge + compounding
intelligence + the schemas beneath them produce a learner outcome an outsider will
certify. Every ablation result is a line in the bottleneck register.

## Dead ends

- Grading with our own rubric only — risks overfitting; the yardstick must be blind
  and external.
- Running it before the pieces exist — X12 is defined now but **gated** on X06→X07 and
  the rest; running early just measures the missing parts.

## What has to exist

| Need | Where today |
|---|---|
| Federated registry | **X02 (missing)** / v0.3 ids staged |
| Technique records | **X01 (missing)** |
| Dead-end atlas + negative space | **X04 / X11 (missing)** |
| Bundle + delta sync | **X06 (missing)** |
| Pocket model | **X07 (missing)** |
| Cross-year companion | **X10 (missing)** / `schemas/companion.schema.json` exists |
| Nothing-erased provenance | **X09 (missing)**, needs **E12** |
| Rubric-grading precedent (our side) | `evals/grade.js`, MP-07 rubric |
| **Blind external yardstick** | **missing** — external examiner/rubric, not ours |

## Simulation-first

**Can be tested now only in part, labelled simulated.** With model-played learners and
whatever subsystems are built, a deterministic harness can run the pipeline and submit
to a *separate, blind* model examiner (blind = no pipeline context) and run ablations.
This exposes the bottleneck: **which subsystem's removal most hurts the outcome** —
answerable in simulation even before every piece is real. The headline "five minutes to
master's" number is **not** simulable credibly; simulation only ranks load-bearing
parts.

**Only real people can show:** the real headline — a *human* learner certified by a
*human* external examiner. That is the experiment; everything before it is scaffolding.

## Depends on / feeds

The terminal experiment. Needs **X01, X02, X04, X06→X07, X09 (via E12), X10, X11**.
Every run feeds **BOTTLENECKS.md**.
