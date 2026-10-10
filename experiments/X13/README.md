# X13 — Fast then slow

*A small model answers by default; a governor escalates to a large model only when it should. Does quality hold while cost falls?*

**Status: RUN 2026-10-10 — see FINDINGS-20261010.md (and experiments-runs/X13/RESULTS.md)**

## Question

If we answer the ordinary turn with a **small, fast System-1 model** and only escalate
to a **large, slow System-2 model** when a cheap metacognitive signal fires — low
confidence, novelty, high stakes, or repeated learner failure — do we keep the
answer quality of an always-large baseline while spending far fewer large-model
tokens? If yes, the companion can run at population scale without a large model on
every turn (the B23 cost risk). If routing drops quality, the saving is fake.

This is the SOFAI frame — fast/slow with a metacognitive governor — from "Thinking
Fast and Slow in AI: the Role of Metacognition" (arXiv:2110.01834), applied to
model-tier choice. The governor reuses Maddie's live action-decision idea (`go`,
`thin`, `cooldown`, `exhausted`, `deferred`) as precedent, not as implementation.

## Method

1. Take the existing eval cases for the follow-up engine (`evals/cases/MP-05/*`) and
   the answer-evaluator (`MP-07`) as the turn workload.
2. **Baseline A (always-large):** run every case on the large model; grade with
   `grade.js`.
3. **Routed (fast→slow):** run every case on the small model first. A governor reads
   cheap signals — the model's own stated confidence, an index-match/novelty flag, a
   stakes flag on the case, and a repeat-failure counter — and escalates to the large
   model only when a signal crosses threshold. Grade the final answer with `grade.js`.
4. Hold the retrieval context identical between arms so the only variable is the
   router.

## Measures

- **Quality:** routed pass rate vs always-large pass rate on the same graded cases.
- **Cost:** large-model tokens (and total tokens) per turn, routed vs baseline;
  escalation rate (% of turns that went to System-2).
- **Governor precision:** of escalated turns, how many the small model would have
  gotten wrong (justified escalations) vs right (wasted escalations).

## Pass/fail

- **Pass:** routed pass rate ≥ (baseline − 2 points) **and** large-model tokens cut
  by ≥ 50%.
- **Fail / kill:** routed quality drops more than 2 points, or the escalation rate is
  so high there is no meaningful token saving. Then fast/slow routing does not pay —
  keep one model tier and look elsewhere for the B23 saving.

## Cost

Small. One pass of the MP-05/MP-07 eval set on a small model + the escalated subset on
a large model + one always-large baseline pass. Bounded by the existing eval case
count; no new human data. Dominant cost is the always-large baseline, run once.

## How to run with the existing tools

- Workload + grader already exist: `evals/cases/MP-05/`, `evals/cases/MP-07/`,
  `evals/grade.js`.
- Add a thin router wrapper around the model call that (a) calls the small model, (b)
  reads the confidence/novelty/stakes/repeat signals, (c) re-calls the large model on
  escalation. No schema change required for the experiment; the stakes flag can live in
  the case fixture.
- Requires a **per-turn token/cost field** to measure cost (B17/B23) — add it to the
  run log for this experiment even if the session schema doesn't carry it yet.
- Model matrix / adapters already exist (`adapters/`, `evals/` model matrix) to point
  "small" and "large" at two tiers.

## What compounds

A cheap controller that spends expensive reasoning only where it changes the answer.
If it holds, every later component (retrieval, bandit) can assume most turns are cheap.

## Dead ends

- A governor that escalates on a signal uncorrelated with being-wrong — pure cost, no
  quality gain.
- Measuring "confidence" as the model's self-report without checking it predicts
  correctness — calibrate the signal against `grade.js` outcomes first.

## Status

PLANNED. Depends on the MP-05/MP-07 eval suite being green (blocked by B05/B06 grader
and content fixes). Feeds `docs/ARCHITECTURE-COMMONS.md` §d.
