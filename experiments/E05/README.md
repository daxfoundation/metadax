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

done (simulated; one vendor's models): ran 2026-10-09 (the 12 follow-up cases; no precision or recall),
2026-10-18 and 2026-10-19

## Results

- `results/2026-10-09-run.md` — runs 1 and 2 (2026-10-09; the 12 MP-05 cases, no precision or recall); raw data in `results/2026-10-09-raw/`.
- `results/2026-10-18-reuse-decisions.md` — run 1 (simulated, 2026-10-18); raw data in `results/run-2026-10-18/`.
- `results/2026-10-19-reuse-decisions-run2.md` — run 2 (simulated, 2026-10-19); raw data in `results/run2-2026-10-19/`.
- Proposed (not merged) changes in `proposed/`; new bottleneck rows are in `experiments/BOTTLENECKS.md`.

Historical note from 2026-09-27, kept as written (the first model runs were on 2026-10-09):
not yet run -- see `results/2026-09-27-first-run.md`. The 12 MP-05 cases, the
grader (reuse/extend/new/ancestor/redirect gates) and the runner are built and
committed, but no model has executed them: a nested `claude -p` is unavailable in
the build container ("Please run /login"). No precision/recall is reported until a
recorded run produces it.
