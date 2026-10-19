# X01 — One thread, two worlds — RESULT (2026-10-18)

> ## ⚠️ SIMULATED
> **Every number here comes from model-played agents, not people.** Guide, learners
> and evaluator are Task subagents on **sonnet**; each learner is a fresh subagent
> given only its persona + the tutor's messages — never the answer key, the grader,
> or another persona. Deterministic parts (schema validation, id minting, direction
> and attempt arithmetic) are committed scripts. Effect directions are hypotheses for
> real testing, not measured facts.

Run: `X01-two-worlds-20261018` · Status: **COMPLETE**

## Question

Can a guide's teaching move be captured once as a **content-free technique record**,
separate from its subject, and reused in a *different subject* and a *different
language* and still land — enough that teaching technique compounds independently of
content? This run also builds the missing primitive itself (the fix for **B18**).

## What ran

- **Models:** guide = sonnet (one batched instance per cohort); 12 learners = sonnet
  (one fresh subagent per persona per turn, blind); evaluator = sonnet (blind to cohort,
  learners shuffled + anonymized). Design by opus.
- **Spot:** Newton's third law, the "kite line" stuck spot — learner puts action and
  reaction on one body and concludes they cancel / the bigger one wins
  (`stuck_signature: cancellation-fallacy`, with `attribute-to-wrong-owner`).
- **Cohort A** (n=6: 3 EN, 3 ID code-switching into Javanese): guide has **no** prior
  techniques, discovers the moves, and **mints** technique records as it goes.
- **Cohort B** (n=6, same split, **new subjects** archery / rowing / rocket): a new
  guide **reuses A's records**, re-rendering each content-free core into the learner's
  subject + language.
- **Sizes/seeds:** cap = 3 learner attempts; mint id = sha256(core+origin_language)
  (deterministic, seedless). No npm, Node stdlib only.

## The numbers

| Measure | Cohort A (mint / discover) | Cohort B (reuse) |
|---|---|---|
| Resolved (blind evaluator) | **6/6** | **6/6** |
| Mean attempts to resolution | **1.50** | **1.83** |
| Attempts vector | [1,2,2,1,1,2] | [1,2,2,2,2,2] |
| Resolved at attempt 1 | 3/6 | 1/6 |

**Technique reuse across languages (Cohort B, 6/6 applications landed):**

| Direction | n | Landed | Technique |
|---|---|---|---|
| EN → EN | 2 | 2 | name-each-owner |
| ID → ID | 2 | 2 | separate-accounts |
| **EN → ID** | 1 | **1** (b-i2, rocket) | name-each-owner (en origin) |
| **ID → EN** | 1 | **1** (b-e2, rowing) | separate-accounts (id-x-jv origin) |

- **Core fidelity after translation (blind evaluator): 4/4 faithful.** Both cores,
  rendered into EN and into Indonesian/Javanese for a new subject, preserved the move's
  structure verbatim in meaning.
- **Records that failed to transfer: 0.** Every reused technique landed; the content-free
  core survived both a subject change and a language change.

## Verdict (vs the X01 kill line)

Kill line: *"If applying a captured technique does not beat the no-technique control on
learner-advance (or only works in the original language), technique records do not
compound."*

**INCONCLUSIVE, split cleanly in two:**

- **The language clause is NOT triggered — PASS on transfer.** The captured core worked
  in both cross-language directions (EN→ID and ID→EN) and across three new subjects,
  with 4/4 faithful translation and 0 transfer failures. The X01 primitive is now
  *expressible* (schema-valid, B18) and *language-independent* in simulation.
- **The learner-advance clause is NOT met here — the speedup did not reproduce.** Reuse
  did **not** beat the baseline: resolution was 6/6 in both cohorts and Cohort B took
  *slightly more* turns (1.83 vs 1.50). But note the baseline: Cohort A's guide is a
  strong model that **reinvents the same move**, not a true no-technique control. So this
  run shows the move transfers, not that reuse is faster than inventing it fresh. The
  earlier run (2026-10-09) found a speedup (5.5→2.33) only against a weak model-hints-only
  control. **Whether reuse speeds learning is control-dependent and remains open.**

## What compounds

Teaching *technique* as a first-class, content-free, language-independent unit: minted
once in English/Javanese on kites, reused on rockets in Indonesian and rowing in English
with its meaning intact. The compounding that this run *does* demonstrate is
**representational** — one move, many subjects, two languages, faithful — which is exactly
the payload X02's federation and X12's stack need. The *efficiency* compounding (fewer
turns) is unproven against a strong guide.

## Dead ends kept

- **Reuse ≠ speedup against a competent guide.** A guide that can reinvent the move makes
  the captured record redundant *for speed*; the record's value is portability and
  consistency, not turn-count. Negative kept: do not claim turn savings without a true
  no-technique (move-suppressed) control arm.
- **Self-reported "it clicks" is not resolution.** Several learners said a move "clicked"
  while still holding the misconception; only the blind evaluator's criterion counted. Had
  the guide scored itself, Cohort B would have looked faster — a measurement trap.
- **The run environment could not start nested sessions**, so
  the guide could not privately drive its own learner; the relay had to be orchestrated
  turn-by-turn. Recorded so the next run budgets for it.

## Bottlenecks

New: **B51** (stuck-signature vocabulary is the real transfer bottleneck),
**B52** (no move-suppressed control arm), **B53** (code-switch register has no
schema field). Confirmed/updated: **B18** (schema now exists in `proposed/`, validated).
See `bottlenecks-2026-10-18.md`.

## Reproduce

```
# ground + schema validation (Node stdlib only, no npm)
cd run-2026-10-18
node validate.cjs validate ../proposed/schemas/technique.schema.json techniques.json
node validate.cjs validate ../proposed/schemas/tutor-turn.schema.json sample-tutor-turn.json
# deterministic technique ids
node -e 'const{mintTechniqueId}=require("./validate.cjs");const t=require("./techniques.json");console.log(t.map(x=>x.slug+"="+x.id))'
# simulation: the 12 learner subagents + guide + evaluator were run as model-played
# Task subagents (sonnet); trimmed transcripts in cohort-A-sessions.json,
# cohort-B-sessions.json; blind scoring in evaluator-results.json.
```

Artifacts: `run-2026-10-18/` — `techniques.json` (2 minted records), `cohort-A-sessions.json`,
`cohort-B-sessions.json`, `evaluator-results.json`, `fixtures/scenario.json`, `validate.cjs`,
`sample-tutor-turn.json`. Proposed schemas: `proposed/schemas/technique.schema.json`,
`proposed/schemas/tutor-turn.schema.json` (+ `proposed/CHANGES.md`).
