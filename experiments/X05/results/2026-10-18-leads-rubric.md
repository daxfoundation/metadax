# X05 — Leads Rubric vs Learner Steer Flags
## Run 2026-10-18

**SIMULATED** — model-played learner and evaluator subagents, no real participants.

---

## Question

Does a blind "leads" rubric agree with learner steer flags? Can it catch planted
leading turns without knowing which ones are planted?

---

## What ran

- **Model:** claude-sonnet-4-6 for all subagents
- **Sessions:** 10 tutoring sessions (5 × `cell-membrane`, 5 × `water-cycle`)
- **Turns:** 120 total (12 per session)
- **Planted leading turns:** 12 (1–2 per session), recorded in `key.json`
- **Learner agents:** 10 fresh subagents (one per session); each saw only their session's
  guide turns and returned `[{turn: N, reason: "..."}]` for any they felt were leading
- **Evaluator agent:** 10 fresh subagents (one per session); each applied the
  `EVALUATE_LEADS` rubric (in `proposed/evals/leads-rubric.md`) and returned full
  `[{turn: N, leads: bool, reason: "..."}]` arrays, blind to the key
- **Seeds/temperature:** not set; single pass

---

## Numbers

| Instrument | True positives | False positives | False negatives | Precision | Recall |
|---|---|---|---|---|---|
| Learner flags | 12 | 6 | 0 | **0.667** | **1.000** |
| Leads rubric | 12 | 8 | 0 | **0.600** | **1.000** |

| | Value |
|---|---|
| Agreement (learner flag == rubric lead, per turn) | **114 / 120 = 0.950** |
| Disagreement turns | 6 |
| Random-baseline precision (12 planted / 120 total) | 0.100 |

---

## Verdict vs kill line

**INCONCLUSIVE — but not killed.**

Kill line: "If the blind rubric can't predict good next steps better than random where
the learner doesn't flag, automated leading isn't ready."

In this simulation the rubric's precision (0.60) is 6× the random baseline (0.10) and
its recall is 1.0 — it found every planted turn. Learner flags also caught all 12 with
slightly higher precision (0.667). Both instruments beat random by a wide margin on
planted turns.

The run is INCONCLUSIVE rather than PASS because:
1. **Same-model bias:** learner and evaluator are both claude-sonnet-4-6. The 0.95
   agreement rate is inflated — both models share an interpretation of "leading." A
   human learner may flag different turns than the model, or miss ones the model caught.
2. **No downstream-advance measurement:** the X05 card requires measuring which choice
   (rubric-led vs flag-led) yields better learner progress. This simulation only measures
   detection, not outcome.
3. **Concept-specificity gap:** rubric FPs are concentrated in cell-membrane sessions
   (7 of 8 rubric FPs came from s02–s04); the rubric produced 0 FPs on all five
   water-cycle sessions. Same-concept neighbouring context ("fatty interior", "simple
   diffusion cannot provide") triggered over-flagging in biology; plain procedural
   language in water-cycle did not.

---

## What compounds

If a "leads" rubric can be written and beats random on planted turns, it can flag
*candidate leading turns* for review without requiring constant learner input. The 0.95
agreement in simulation is a ceiling; real divergence cases (where rubric and learner
disagree) are the signal for X11 (offer-never-push) and the steering layer.

---

## Dead ends kept

- Attempting to measure downstream advance without branched sessions: cannot compute
  which path led to better outcomes from a single-path transcript. This would need
  parallel branches (rubric-led vs flag-led) within the same session.
- Using the same model for learner and evaluator: eliminates the most interesting
  disagreement signal. Future runs should use different models or temperature settings.

---

## Bottlenecks

New: B60, B61, B62 (see `bottlenecks-2026-10-18.md`).

Existing bottlenecks not touched by this run: B01–B23 all remain open/unchanged.

---

## Reproduce

```sh
cd state/metadax/public-staging/experiments/X05/run-2026-10-18
node run_x05.cjs --generate           # writes sessions.json, key.json
node run_x05.cjs --learner-prompt N   # print learner prompt for session N
node run_x05.cjs --eval-prompt N      # print evaluator prompt for session N
# (run model calls, save outputs to learner-flags-sNN.json, rubric-scores-sNN.json)
node run_x05.cjs --stats              # writes stats.json
```
