# E05 -- Does the follow-up engine reuse correctly from a registry?

## Question

When a learner asks a follow-up, does the engine make the right reuse/extend/new decision
against the registry -- pointing to an existing node when one answers the question, and
creating a new one when nothing does?

## Why it matters

Reuse without copying is what keeps the knowledge tree from silting up with near-duplicates
("Reuse without copying" in `docs/CONCEPTS.md`). It is also the meaning-level capability
EdDAX never had; EdDAX only reused by browsing. If precision is low, the tree fills with
duplicates; if recall is low, learners are pointed to nodes that do not actually answer them.

## Method

Build a 50-node registry with 20 planted near-duplicates (same meaning, different words) and
10 different-intent traps (same words, different meaning). Run the follow-up engine (MP-05)
over a question set and score its decisions.

## Metrics

- precision of the reuse/extend/new decisions
- recall of the reuse/extend/new decisions

## Stop rule

Kill if precision is under 0.8 or recall is under 0.7.

## Owner

M (an automated run by the maintainers).

## Estimated effort

2 days.

## Dependencies

MP-05 as certified by E04, and a registry fixture in the per-module layout
(`docs/SPEC-v0.2.md` S-5).

## Status

not started

## Results

not yet run -- see `results/2026-09-27-first-run.md`. The 12 MP-05 cases, the
grader (reuse/extend/new/ancestor/redirect gates) and the runner are built and
committed, but no model has executed them: a nested `claude -p` is unavailable in
the build container ("Please run /login"). No precision/recall is reported until a
recorded run produces it.
