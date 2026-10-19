Proposed by the runs of 18-19 Oct 2026; not merged into the canonical files.

# X11 proposed changes — 2026-10-18 (run 2)

SIMULATED run; proposals are deterministic data-model + tool changes.

| File | New/changed | Why (bottleneck) |
|---|---|---|
| `schemas/negative-space.schema.json` | new | **B14** forces the exposure split (`followed`/`declined`/`unseen`); `declined` counts only if the seed was offered; the only reported choice-bearing figure is `exposure_normalised_decline_rate`. |
| `schemas/offer.schema.json` | new | **B16** an offer is information + symmetric choice; wording must carry no scarcity/novelty/pressure framing (frozen banned-phrase list). |
| `tools/negative-space.js` | new (ref impl) | **B14** computes the exposure split and the exposure-normalised decline rate; keeps `raw_unfollowed_share` only for comparison, flagged. |
| `tools/build-offers.js` | new (ref impl) | **B16** neutral generator; a `BANNED` regex list is asserted against every text and the tool **exits non-zero** rather than ship steering wording. |
| `tools/kanon-aggregate.js` | new (ref impl) | **B15** k-anonymity sketch (k=5): publish a hole only if ≥k distinct sessions contributed; suppressed cells are reported, never silently dropped. |

## Finding that changed the design

Removing the scarcity opener (B16) fixed the offers — an independent evaluator
flagged **0/6** offer texts. But that same independent audit flagged **all 11
marker texts** for social-proof framing ("some learners paused here…"), which
run 1's *self*-review had passed as clean. Social proof is itself a mild steer,
and self-review missed it. This is recorded as a new bottleneck (see
`../bottlenecks-2026-10-18.md`): the neutral-wording contract must extend to
markers, and steering audits must be independent of the generator's author.
