# X10 — One record, many years — RESULT

> ## ⚠️ SIMULATED — scripted scenario + model-played guides/probes/evaluator (sonnet). NOT human results.
> The learner "Mara" is a **scripted, deterministic scenario**, not a person. The
> three guides, five refusal probes, and the carry-over evaluator are each a fresh
> Sonnet subagent. A probe never saw the raw record, the scenario, or the answer key;
> a guide saw only its course's filtered offers + the refusal set; the evaluator (the
> grader) saw the answer key. This file surfaces **bottlenecks in the architecture**,
> not learning outcomes. "Lift" for a real person is explicitly out of scope.

Date: 2026-10-18

## Question

Does the unit of compounding scale from a course to a *person over years*? Can a
learner-owned companion carry prior learning across courses while the learner keeps an
enforceable right to **refuse** any carry-over — and does the record survive years,
guides, lapses, and compaction intact?

## What ran

| Part | Kind | Models | n / size |
|---|---|---|---|
| Scenario | scripted, deterministic | — | 1 adult learner, 5 course-years, **60 sessions** (12/yr), 3 guides, **4 refusals**, **2 six-month lapses** |
| Append-log build + compaction | deterministic script | — | 79 log entries → compacted view, per year |
| Carry-over proposer + refusal filter | deterministic script | — | candidate bridges → offered / not_offered / suppressed, per year |
| Guides | model-played | sonnet | 3 (one per guide, at each guide's richest carry-over seam: Y2, Y4, Y5) |
| Refusal probes | model-played | sonnet | 5 (one after each year; each sees **only** the compacted view + next course's guide-facing offers) |
| Carry-over evaluator | model-played | sonnet | 1 (grader; given offers + answer key) |

Seeds: none needed — scenario and pipeline are fully deterministic (re-run reproduces
the committed `out/` byte-for-byte). Guides/probes/evaluator are single-shot sonnet,
`temperature` default. The companion record (log + view) and the derived refusal set
both **validate** against the proposed schemas via metadax's `jsonschema-lite`
(`out/validation.json`: ALL PASS).

## The scenario (ground truth)

Biology → chemistry → organic → biochemistry → molecular biology, one course/year:

- **Refusals** (issued at different times): `ref-food` (Y1 s8, never_show example-style
  *food-and-diet-examples*), `ref-mito` (Y2 s4, stop_suggesting concept *mitosis*),
  `ref-3d` (Y3 s6, never_show modality *3d-rotating-molecule-visuals*), `ref-cards`
  (Y5 s2, stop_suggesting technique *spaced-repetition-flashcards*).
- **Lapses**: 184 days before Y3, 182 days before Y5.
- The headline refusal test: in Y5, *mitosis → cell-division* is a **genuinely relevant
  prerequisite bridge** — but `ref-mito` must suppress it. Two presentation collisions
  (a food analogy for enzymes→reaction-rates/metabolism; a 3-D model for
  functional-groups→protein-structure) test that a refused *presentation* is stripped
  while the underlying bridge survives.

## Numbers

### Record bytes per year — raw append-log (no compaction) vs compacted view

| Year | Course | Log entries | Raw bytes | Compacted bytes | Ratio |
|---|---|---|---|---|---|
| 1 | cell-biology | 13 | 3,661 | 980 | 3.74× |
| 2 | intro-chemistry | 29 | 8,400 | 2,317 | 3.63× |
| 3 | organic-chemistry | 47 | 12,946 | 3,536 | 3.66× |
| 4 | biochemistry | 64 | 17,958 | 4,829 | 3.72× |
| 5 | molecular-biology | 79 | 22,649 | 6,226 | 3.64× |

Session entries are **81%** of the raw record (18,239 / 22,649 B over 60 sessions).
Compaction folds all 60 into **5 fixed per-course summaries** (3,064 B total), so the
leverage is proportional to sessions-per-course: at 12/course it is ~3.6×; at 100/course
the raw balloons while the view is unchanged. **But** the view still grows across
courses — `courses` 3,064 B + `carry_over_ledger` 1,626 B + `refusals` 925 B — i.e.
O(courses + refusals + ledger), *not* constant (see B74).

### Refusals honoured after each year (probe sees only the compacted view)

| Year | Refusals active | all present | next-offers clean | Verdict |
|---|---|---|---|---|
| 1 | 1 | ✓ | ✓ | honoured |
| 2 | 2 | ✓ | ✓ | **leak flagged** (historical mitosis) |
| 3 | 3 | ✓ | ✓ | honoured |
| 4 | 3 | ✓ | ✓ | **leak flagged** (historical mitosis) |
| 5 | 4 | ✓ | ✓ (final year) | honoured |

All 4 refusals present verbatim in every year's view. **The carry-over / suggestion
path is clean in all 5 years**: `next_offers_clean = true` everywhere; the ledger shows
*mitosis→cell-division* as `suppressed_by_refusal` and **0/13** ledger bridges offered or
accepted a refused item. The two "leak" flags (probes Y2, Y4) are **not** carry-over
leaks — they object to mitosis's *historical competency score (85)* and its mention in
the Y1 course summary still being present in the view. The other three probes read the
same data as legitimate history (`stop_suggesting` ≠ erase). This disagreement is a real
bottleneck (B75 / B76), not a filter failure.

### Carry-over correctness (evaluator vs answer key)

| Year | TP (good offered) | FP (noise offered) | FN (good wrongly dropped) | Correct suppressions |
|---|---|---|---|---|
| 2 | 3 | 0 | 0 | 0 |
| 3 | 2 | 0 | 0 | 0 |
| 4 | 5 | 0 | 0 | 0 |
| 5 | 2 | 0 | 0 | 1 (mitosis) |
| **Total** | **12** | **0** | **0** | **1** |

**Precision 1.0, recall 1.0, relevance "on-topic."** The one weak/noise candidate
(enzyme-kinetics→gene-regulation, Y5) was correctly `not_offered`; the one
good-but-refused bridge was correctly suppressed. All three guides opened from prior
knowledge and respected every refusal — the Y5 guide (new to the learner, after a
six-month lapse) suggested no flashcards and never raised mitosis, working only from
the two filtered offers.

### What compaction lost

**Lost** (answerable from the log, not from the view): on which session each
misconception first appeared; the per-session competency ramp; the verbatim per-session
notes (only first+last survive in the folded summary). **Kept** (the things that must
survive): every active refusal *verbatim*; the person-level competency map (21
concepts); the full carry-over ledger with outcomes; course-level misconceptions (which,
not when); both lapses. The compactor asserts a hard invariant and **throws rather than
drop a refusal** (`compact-record.js`); a `dropped[]` list records every loss so a bad
later answer is traceable (MP-03 contract).

## Verdict

**PASS (SIMULATED)** against the X10 kill line — *"if a refused carry-over still
influences later sessions, or carry-over doesn't help."* Neither clause trips: no refused
carry-over reached a guide or a session (0/13 ledger, all probes `next_offers_clean`, the
one relevant-but-refused bridge suppressed, both presentation collisions stripped), and
carry-over helped (precision/recall 1.0, guides opened from prior knowledge across 3
guides and 2 six-month lapses). The record survived 5 years and compaction intact and
validates against its schema.

**Qualification (the honest catch):** refusal enforcement is proven *only on the
forward path* (suggestion / carry-over). Whether a `stop_suggesting` refusal should also
redact a concept's **existing** competency score and past summaries from the view is
**undefined** — 2 of 5 view-only probes read that retained history as a leak. Until that
directive semantics is decided and made visible in the view, a consumer that sees only
the compacted view cannot distinguish legitimate history from a refusal breach. This does
not trip the kill line but it is the load-bearing open question for trust.

## What compounds

A learner-owned, multi-year cognitive record where **carry-over earns its place and "no"
is durable**: the suggestion path honoured all 4 refusals across 5 years, 3 guides, and 2
lapses, while relevant prior learning crossed every course boundary at precision/recall
1.0. The append-log + compacted-view shape (B03) keeps the record on-device and bounds
the per-session mass. This is the person-level unit of compounding the architecture aims
at — with the refusal-semantics gap below as the price of admission to real deployment.

## Dead ends kept

- **Carry everything by default** — not built; the relevance filter drops weak bridges
  (noise) and the refusal filter drops/strips refused ones *before the model sees them*.
- **Refusal that scrubs history** vs **refusal that suppresses forward** — the scenario
  exposed that these are different and the current design only specifies the latter;
  kept as B75, not silently resolved.
- **Constant-size compacted view** — disproven: the view grows O(courses+refusals+ledger)
  even after per-session folding (B74). Kept rather than hidden behind the 3.6× ratio.

## Bottlenecks

See `../bottlenecks-2026-10-18.md`: new B74 (view not constant-size),
B75 (refusal directive semantics: suppress-forward vs redact-historical, undefined),
B76 (view does not annotate refused concepts inline, so a view-only consumer can't
tell history from leak). Plus a status line confirming+extending **B03**.

## Reproduce

```
cd run-2026-10-18/scripts
node 00-scenario.js              # -> fixtures/scenario.json (60 sessions)
node 01-run-pipeline.js          # -> out/companion-log.jsonl, compacted-view.json,
                                 #    compacted-by-year/, carryover-by-year.json,
                                 #    bytes.json, compaction-loss.json
node 02-make-subagent-inputs.js  # -> out/subagent-inputs/ (probe/guide/evaluator inputs)
node 03-validate.js              # -> out/validation.json (schema check: ALL PASS)
# model personas: 5 probes + 3 guides + 1 evaluator (sonnet), inputs in out/subagent-inputs/,
# trimmed outputs committed in out/probes/, out/guides/, out/eval/.
```
