# X09 — Nothing quietly edited

*Constraint Protocol declarations on every contribution — do knowledge and intelligence compound when nothing is erased?*

**Status: designed.**

## Question

If every contribution carries a **Constraint Protocol declaration** (what it asserts,
what it changes, what it must not break) and **nothing is ever silently edited or
erased** — corrections are new records that supersede, never overwrites — do knowledge
and intelligence actually compound *faster*, or does an append-only, nothing-erased
library drown in its own history? This is the core bet of the whole programme stated
as a measurable question.

## Method

1. Run a course's evolution two ways: (a) append-only with Constraint Protocol
   declarations and supersede-not-overwrite; (b) a conventional edit-in-place control.
2. Inject corrections, contradictions, and improvements over many rounds.
3. Measure retained-knowledge, contradiction-detection, and whether the append-only
   side can still be *read* efficiently (compaction without erasure).

## Measures

- **Compounding rate:** useful knowledge retained + reused over rounds, append-only vs
  edit-in-place.
- **Contradiction surfacing:** supersede chains make conflicts visible (vs hidden by
  overwrite).
- **Readability under growth:** can the current view be reconstructed cheaply via
  compaction (as PATH/record compaction already does) without losing history?
- **Declaration coverage:** every contribution carries a valid declaration.

## Kill line

If append-only + declarations don't beat edit-in-place on retained/reused knowledge,
*or* the history becomes unreadable at scale, the "nothing erased" rule costs more than
it compounds — revisit it.

## What compounds

The whole thesis: a library where every change is declared and nothing is lost is the
substrate for compounding. X09 is where that stops being a slogan and becomes a number.

## Dead ends

- Overwrite-on-correction — erases the signal X04/X02 and this card depend on.
- Append-only with *no* compaction — history becomes unreadable (the scale run shows a
  single unbounded record/index is the failure mode; compaction is the fix, applied
  without erasing source).

## What has to exist

| Need | Where today |
|---|---|
| Provenance + verifiable record | **needs E12** (provenance + signed commits → verifiable record) — *not yet run* |
| Provenance schema | `schemas/provenance.schema.json` |
| Contribution guidance / declaration surface | `CONTRIBUTING.md` (staged) |
| Compaction precedent (shrink view, keep source) | PATH/record compaction — `prompts/MP-03`; append-log + compaction design from scale run |
| **Constraint Protocol declaration schema** | **missing** |
| **Supersede-chain / append-log store** | **missing** |

## Simulation-first

**Can be tested now, labelled simulated.** A deterministic harness evolves a course
over scripted rounds under both regimes, attaching declarations on the append-only
side, and measures retained/reused knowledge and contradiction surfacing with a model
judge. This exposes the bottleneck: **does append-only + declarations measurably
compound better, and does compaction keep it readable — before E12's signed-record
machinery exists?** All compounding/readability figures are *simulated*.

**Only real people can show:** whether real contributors write honest declarations,
and whether a nothing-erased history earns the trust that drives real compounding.

## Depends on / feeds

**Needs E12.** Shares the preservation rule with **X02** (contested cores) and the raw
material of **X04** (dead ends are never erased). The capstone question behind **X12**.
