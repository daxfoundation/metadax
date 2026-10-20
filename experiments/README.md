# Meta DAX experiments

This folder holds one card per Phase 0 experiment, E01 through E14. The purpose of the
experiments is described in `docs/EXPERIMENTS.md`.

## How to read a card

Each `E<nn>/README.md` has the same sections:

- **Question** -- the single thing the experiment asks.
- **Why it matters** -- what a result changes for the build.
- **Method** -- how the run is done.
- **Metrics** -- what is measured.
- **Stop rule** -- the line at which the experiment is killed or its default stands.
- **Owner** -- who runs it: **U** = a real adult user, **M** = an automated run by the
  maintainers (a model acting as the client), **CI** = this repo's GitHub Actions with API
  keys.
- **Estimated effort** -- a rough time estimate from the catalogue.
- **Dependencies** -- which build parts (prompts, tools, skills, evals) the experiment
  needs before it can run.
- **Status** -- see the vocabulary below.
- **Results** -- a pointer to the dated files in this experiment's `results/` folder.

## Where results go

Beside each card is a `results/` folder. A run lands there as a dated markdown file (for
example `E04/results/2026-10-05.md`), with personal data stripped. A result is written
**only when an actual run produces it** -- never from a plan or an expectation. The
maintainers review the files before any result is summarised. Until then a card's Results
section reads "none yet".

## Status vocabulary

| Status | Meaning |
|---|---|
| **not started** | no run has begun; the card describes what will be done |
| **running** | a run is in progress; partial output may exist but is not yet reviewed |
| **done** | at least one run completed and was reviewed against the stop rule |
| **abandoned** | the experiment was stopped without a usable result, with the reason recorded |

E01–E14 and X01–X11 have all been run at least once in the 18-19 Oct 2026 round (E01 and
E03 were first run 2026-09-27; E04 and E05 were first run 2026-10-09, on one vendor's
model, see their results folders). Most runs had models standing in for the people and are
labelled **simulated** in the result files. Seven cards — E03, E05, E13, E14, X01, X07, X08 — also have a run-2
follow-up (2026-10-19). Results and raw data sit in each card`s results/ folder; proposed
(not merged) changes in proposed/; new bottlenecks in BOTTLENECKS.md (B24–B93) and the
round`s write-up in FINDINGS-20261019.md. E02, E07, E10 and X12 are not yet run — see
FINDINGS-20261019.md section Blocked.
