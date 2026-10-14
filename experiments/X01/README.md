# X01 — One thread, two worlds

*A guide's move, captured once as a technique record, reused across two languages.*

**Status: designed.** (Not built, not run. A way to test compounding, never the way.)

## Question

When a guide makes one good teaching move inside a thread of questions — a framing,
an analogy, a diagnostic question that unlocks a stuck learner — can that move be
captured as a **technique record** separate from the content it appeared in, and then
reused in a *different* course and a *different* language, and still land? If it can,
teaching technique compounds independently of subject matter. If it can't, every
course re-invents its own pedagogy and nothing accumulates.

## Method

1. Run a short learner thread in course A (e.g. cell biology) with a model-played
   guide. At the moment a move works, mint a **technique record**: the move's intent,
   trigger condition, and shape — no subject nouns.
2. Hand that record, plus a fresh learner in course B in another language (German
   input → English or German reply), to a second guide instance that has the record
   but not the original thread.
3. Measure whether the guide (a) retrieves the record when the trigger recurs and
   (b) applies it so the learner advances.

## Measures

- **Retrieval:** technique surfaced when its trigger condition recurs (precision /
  recall against planted triggers).
- **Transfer:** learner-advance rate with the record vs a control guide without it.
- **Language independence:** transfer holds when the second thread is in another
  language.

## Kill line

If applying a captured technique does **not** beat the no-technique control on
learner-advance (or only works in the original language), technique records do not
compound — drop them and keep pedagogy inline in each course.

## What compounds

Teaching *technique* as a first-class, content-free, language-independent unit —
captured once, reused everywhere. This is the smallest unit of "compounding
intelligence" in the system: not facts, but moves.

## Dead ends

- A technique record that smuggles in subject nouns — then it's just a content node
  and won't transfer.
- Over-triggering: a move retrieved for every thread becomes noise; the trigger
  condition has to be selective.

## What has to exist

| Need | Where today |
|---|---|
| Follow-up / reuse engine (retrieve-on-trigger) | `prompts/MP-05`, exercised in E05 run 2 (12/12 well-formed decisions correct) |
| Cross-language input→reply | demonstrated: E04/E05 `other-language-input` case (German in → English out) — `evals/cases/MP-05/other-language-input` |
| Grader for decision-in-allowed-set | `evals/grade.js` |
| **Technique-record schema** (content-free move) | **missing** — new schema; closest kin is `prompts/MP-13` Prompt Forge (E13 teaching-method variants) |
| **Trigger-condition matcher** | **missing** |

## Simulation-first

**Can be tested now, labelled simulated.** Model-played guide in course A emits a
technique record at a scripted "aha" turn; a deterministic script plants the same
trigger in course B (and a German variant); a second model-guide, given only the
record, is scored by `grade.js`-style rubric on retrieve + apply. This exposes the
first bottleneck cheaply: **can a move be stated content-free enough to transfer at
all, or does every useful move depend on its subject?** Simulated transfer numbers
are *simulated* and prove only that the representation is expressible and retrievable.

**Only real people can show:** whether a transferred move actually helps a *human*
learner in a language they think in, and whether guides in the wild capture moves
worth reusing rather than trivia.

## Runs

| Date | Run | One-line result | Full result | Bottlenecks found |
|---|---|---|---|---|
| 2026-10-09 | [Simulation 2 (SIMULATED, model-played)](results/2026-10-09-sim.md) | "Two receipts" technique cut attempts-to-pass 5.5→2.33 and pass rate 67%→100% (n=3, direction only); technique-record schema entirely missing (B18) | [results/2026-10-09-sim.md](results/2026-10-09-sim.md) | B18, B19, B20, B21, B22, B23 |

## Depends on / feeds

Rides on **E04/E05** (reuse engine + cross-language case). Feeds **X02** (shared
technique records are the simplest thing a federated registry carries) and **X12**.
