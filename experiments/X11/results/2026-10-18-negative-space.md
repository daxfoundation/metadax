# X11 — negative space — Simulation 2 — RESULT

> ## ⚠️ SIMULATED — model-played learners (sonnet). NOT human results.
> Each "learner" is a fresh Sonnet subagent given only its persona; it never saw
> an answer key, a grader, or another persona. Uptake, declines and pressure are
> **model behaviour**. This surfaces **architecture bottlenecks**, not outcomes.

Date: 2026-10-18 · Course: `newtons-laws-motion` (107 distinct seeds, 8
concepts) · run 2, re-running run 1's design with the B14/B15/B16 fixes.
Shared artifacts live under `../X04/run-2026-10-18/`.

## Question

Run 1's "85% of seeds unfollowed" was exposure-blind, and its offers all carried
a scarcity opener. Does an **exposure-normalised** share mean something, and does
**neutral wording** survive an independent steering audit?

## What ran

Wave 1 = 12 atlas learners (shared with X04) define the negative space. Wave 2 =
6 learners (sonnet, ≤4 turns) shown **neutral** offers + atlas markers; an
independent Sonnet evaluator audited every marker/offer text for steering.

## Numbers (run 1 → run 2)

| Measure | Run 1 | Run 2 |
|---|---|---|
| Raw unfollowed-seed share | 0.85 (reported as signal) | 0.907 (kept, flagged exposure-blind) |
| Exposure split (followed / declined / **unseen**) | not computed | 10 / 2 / **95** |
| **Exposure-normalised decline** (declined ÷ exposed) | — | **0.167** (inventory) · 0.60 (offer-level, 6/10) |
| Offer texts flagged as steering | **12 / 12** (scarcity opener) | **0 / 6** |
| Marker texts flagged as steering | 0 / 8 (self-judged) | **11 / 11** (independent) |
| Offer wording gate | none | banned-phrase gate (tool exits non-zero on a hit) |
| Wave-2 offers: shown / took / declined | 12 / 7 / 5 | 10 / 4 / 6 |
| Wave-2 markers: entered / arrived / exited / not-entered | 8 / 6 / 2 / 1 | 3 / 2 / 1 / 5 |

The headline for B14: of 107 seeds, **95 were never surfaced to anyone**; the raw
0.907 is almost entirely those. Only 12 seeds were exposed, and the choice-bearing
decline among them is small (0.167 inventory / 0.60 offer-level) — a figure that
actually reflects learner choice rather than seed-generation rate.

## Verdict vs the kill line

Kill line: *"If offers have to be pushed to get uptake, or learners feel
pressured, 'offer never push' doesn't work."*

**INCONCLUSIVE, with one firm negative.** No push arm ran this round, so uptake
vs push is untested (as in run 1). Firm result: an **independent** audit flags
0/6 offers — the B16 scarcity steer is gone — **but** flags all 11 markers for
social-proof framing that run 1's self-review had passed. "Offer never push"
cannot be certified while the atlas markers still steer; the steering risk moved
from offers to markers rather than disappearing. Pressure itself is affect only a
human can report.

## What compounds

Exposure-normalised metrics make negative space mean something at any cohort
size; a frozen banned-phrase gate stops scarcity wording shipping by accident.

## Dead ends kept

- Raw unfollowed share as a signal: confirmed meaningless (dominated by `unseen`).
- Trusting the generator's author to audit its own wording: contradicted —
  self-review missed the marker steer an independent reviewer caught.
- k-anon at small n: suppresses everything (0/11), so it is not a small-cohort
  fix (B78).

## Bottlenecks

New: B77 (markers steer via social proof; audits must be independent),
B78 (k-anon useless at cohort scale). Fixed/updated: B14, B15, B16. See
`../bottlenecks-2026-10-18.md`.

## Reproduce

```
# wave-1 negative space builds the offer inventory; wave-2 measures exposure
node run-2026-10-18/scripts/03-negative-space.cjs ../X04/run-2026-10-18/course.snapshot.v03.json ../X04/run-2026-10-18/sessions run-2026-10-18/negative-space.wave1.json
node run-2026-10-18/scripts/04-build-offers.cjs run-2026-10-18/negative-space.wave1.json ../X04/run-2026-10-18/course.snapshot.v03.json run-2026-10-18/offers.json
node run-2026-10-18/scripts/03-negative-space.cjs ../X04/run-2026-10-18/course.snapshot.v03.json run-2026-10-18/sessions run-2026-10-18/negative-space.wave2.json
```
