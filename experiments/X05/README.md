# X05 — Flagged by the learner

*Learner steer-flags versus a blind "leads" rubric.*

**Status: designed.**

## Question

Two ways to know where a thread of questions should go next: ask the **learner** to
flag "take me here / not there" (steer flags), or run a **blind rubric** that scores
each candidate next-question for how well it *leads* (toward the objective, toward a
productive struggle) without knowing what the learner wants. Which better predicts a
good next step — and do they agree? If the blind rubric matches learner steering, the
system can lead well without constant input. If they diverge, we learn where
automated leading goes wrong.

## Method

1. At branch points in model-played threads, collect (a) a learner steer-flag and
   (b) a blind "leads" rubric score over the same candidates, computed without the
   flag.
2. Advance threads both ways.
3. Measure agreement, and which choice yields better learner-advance downstream.

## Measures

- **Agreement:** rate at which the blind rubric's top candidate matches the learner's
  flag.
- **Downstream advance:** objective progress following flag-led vs rubric-led choices.
- **Divergence map:** where rubric and learner disagree — these are the interesting
  cases.

## Kill line

If the blind rubric can't predict good next steps better than random where the
learner doesn't flag, automated leading isn't ready — require learner steering.

## What compounds

A rubric for *leading* that improves as disagreements with real learners are logged
and fed back. The divergence cases are training signal for the universal learning
architecture's steering.

## Dead ends

- A rubric that peeks at the learner's flag — then it isn't blind and can't be
  evaluated against steering.
- Treating every learner flag as ground truth — learners sometimes steer away from
  productive struggle; the rubric is partly there to catch that.

## What has to exist

| Need | Where today |
|---|---|
| Candidate next-questions per branch | `prompts/MP-05` follow-up engine (E05) |
| Event record (to log flags + choices) | `schemas/event.schema.json` |
| Rubric-graded evaluation pattern | `evals/grade.js`; MP-07 rubric case (E04 run 2 ✅) |
| **Steer-flag field on the learner turn** | **missing** |
| **"Leads" rubric** | **missing** — build in `evals/` in the MP-07 rubric style |

## Simulation-first

**Can be tested now, labelled simulated.** A deterministic harness presents branch
candidates; a model learner emits steer-flags; a *separate blind* model/rubric scores
the same candidates without the flag; the script compares. This exposes the
bottleneck: **can a blind rubric for "leading" be written at all, and does it beat
random where the learner is silent?** Agreement and advance numbers are *simulated*
and only validate the rubric is expressible and non-trivial.

**Only real people can show:** whether *human* learners' flags reflect real learning
preference, and whether divergences mark the rubric leading them somewhere genuinely
better or worse.

## Depends on / feeds

Rides on **E05** (candidate generation) and the **MP-07 rubric** pattern. Feeds the
steering layer used in **X11** (offer-never-push) and **X12**.
