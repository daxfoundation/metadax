# X07 — The pocket model

*A small on-device model, run under a grammar, with the bundle holding the teaching.*

**Status: designed.** (Extends E10: "can a small (2–4B) on-phone model run the quiz from a practice bank?")

## Question

If the *teaching* lives in the bundle (X06) — the nodes, the practice bank, the
rubric — can a small **2–4B on-device model**, constrained by a **grammar** so its
output is always schema-valid, run a real learning session offline? The bet is that
intelligence can be small when knowledge is carried. If the pocket model can quiz,
mark, and follow up acceptably under a grammar, learning runs with no cloud and no big
model. If it can't, the thin-link reach of X06 stops at content delivery.

## Question for the architecture

How much of the "intelligence" can move to the edge, and how much must stay central?
This is the load-bearing question for a *decentralised* learning system.

## Method

1. Take an X06 bundle. Constrain a 2–4B model with a grammar that forces the
   `practice-item` / `tutor-turn` shapes.
2. Run quiz, marking, and one level of follow-up fully on-device.
3. Compare against a large-model baseline on the same bundle.

## Measures

- **Schema validity under grammar:** share of outputs valid (target near 100% — the
  grammar should guarantee it).
- **Marking agreement** with the large-model / rubric baseline.
- **Follow-up quality:** does one level of on-device follow-up stay on-spec?
- **Footprint:** memory + latency on a phone-class device.

## Kill line

If, even under a grammar, the pocket model's marking disagrees badly with the baseline
or can't follow up on-spec, the edge can't hold the session — keep the model in the
cloud and treat X06 as delivery-only.

## What compounds

A division of labour: carried knowledge + small edge intelligence + central
composition. Proves the "compounding intelligence" claim doesn't require a frontier
model at every seat.

## Dead ends

- Free-form generation on a small model — drifts off-schema; the grammar is what makes
  it usable.
- Pushing *composition/merge* (X02) onto the pocket model — too heavy; the edge runs
  sessions, the centre composes.

## What has to exist

| Need | Where today |
|---|---|
| Practice bank (quiz source) | `schemas/practice-item.schema.json` (v0.3-fixed to accept opaque-id `#pNN`) |
| Turn schema for grammar target | `schemas/tutor-turn.schema.json`, `prompts/MP-06` |
| Bundle to run against | **X06 (missing)** |
| **Grammar / constrained-decoding spec** | **missing** |
| **Small-model runner** | **missing** |

## Simulation-first

**Can be tested now, labelled simulated.** A model-played "small" guide (prompted to
behave as a constrained small model) runs a bundle's quiz; a deterministic grammar
check validates every output; a large-model baseline marks the same answers. This
exposes the bottleneck *before* any real small model: **does the grammar fully
determine valid output, and where does small-model marking diverge from the
baseline?** Validity and agreement numbers are *simulated* — a true 2–4B run is needed
for footprint and real capability.

**Only real people can show:** real on-phone latency/memory and whether a human learner
finds the pocket session good enough.

## Depends on / feeds

Needs **X06** (bundle). Extends **E10**. Feeds **X12**.
