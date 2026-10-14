# X-experiments — plan, dependencies, run order

**Status: X01–X12 designed.** Cards live in `experiments/X01/ … X12/`, written in the
same shape as the public E-cards (question / method / measures / kill line / what
compounds / dead ends / what has to exist / simulation-first). Nothing here has been
built or run; each is **designed**. This is a way to find the bottlenecks, never *the*
way.

## The narrative, in plain words

We are running these experiments to find the bottlenecks, so we can work out the right
universal learning architecture. Each result, pass or fail, goes in a dated file.

The E-cards (E01–E14) test whether the current pieces *work*. The X-experiments test
whether those pieces **compound** — across languages (X01), across people (X02),
across bandwidth (X06), across devices (X07), and across years (X10) — and whether a
*distributed, decentralised, nothing-erased* library (X09) actually makes knowledge
and intelligence accumulate faster than doing it the ordinary way. X12 puts the whole
stack in front of a blind external yardstick and asks if an outsider will certify the
result. Every run — pass or fail — writes one dated file and one line in
`BOTTLENECKS.md`. That register *is* the deliverable: the bottlenecks we find are what
the universal learning architecture has to be designed around.

## Dependency map

```
Today's real work                 X-experiments
-----------------                 -------------
E04/E05 (ran 2026-10-09) ───────► X01  one thread, two worlds
                          └──────► X02  many hands, one course
v0.3 IDs (opaque+depth) ──┬──────► X02
                          ├──────► X04  dead-end atlas
                          └──────► X11  negative space
E03 + companion ──────────┬──────► X03  nurse's walkthrough
                          └──────► X10  one record, many years
E05 private-branch ──────────────► X08  behind the company wall
E05 candidates + MP-07 rubric ──► X05  flagged by the learner
E06 ─────────────────────────────► X06  same course, every bandwidth
E10 ─────────────────────────────► X07  the pocket model
E12 (not yet run) ───────────────► X09  nothing quietly edited

Chains:
  X06 ─► X07 ─► X12          (bandwidth → pocket model → five minutes to master's)
  X04 ◄─inverse─► X11        (entered-then-abandoned  vs  never-entered)
  X10 ◄─shares no-push/refusal─► X11
  X01 ─► X02                 (technique records are the simplest federated payload)
  X02 ◄─preservation rule─► X09   (contested cores never overwritten)
  X08 ─► X02                 (what crosses the outward gate enters federation)
  everything ─► X12          (capstone; blind external yardstick)
```

### Prerequisite summary

| X | Rides on (ready) | Also needs (missing) |
|---|---|---|
| X01 | E04/E05 | technique-record schema |
| X02 | E04/E05, v0.3 IDs | 3-way registry merge, contested-core record |
| X03 | E03, E04 MP-06, companion | teacher-mode profile, override record |
| X04 | v0.3 IDs, progress/event | dead-end shape schema, clustering script |
| X05 | E05, MP-07 rubric | steer-flag field, "leads" rubric |
| X06 | E06, scale sizes | bundle format, delta sync, deferred-queue, sharded index |
| X07 | E10, practice-item, X06 | grammar/constrained decoding, small-model runner |
| X08 | E05 private-branch, v0.3 | org declaration, ancestry-aware outward gate |
| X09 | provenance schema, MP-03 compaction | **E12**, Constraint-Protocol declaration, append-log store |
| X10 | E03, companion, progress | carry-over logic, durable refusal record |
| X11 | v0.3 IDs, progress | coverage map, offer-ranking + no-push suppression |
| X12 | evals/grade.js | X01,X02,X04,X06,X07,X09,X10,X11 + blind external yardstick |

## Run order

Ordered so the deepest shared bottleneck surfaces earliest.

1. **X01, X02** — ride directly on today's E04/E05 and v0.3 work; test the two smallest
   units of compounding (a move; a course across forks). Build the technique-record
   schema and the 3-way merge first.
2. **X04, X11** — once v0.3 IDs are stable, the dead-end atlas and negative space both
   fall out of a well-defined registry tree keyed by opaque id. Build them together;
   they are inverses and share machinery.
3. **X06 → X07 → X12 (begin)** — the bandwidth/pocket/master's chain. X06's bundle is
   the prerequisite for X07; X07 is the prerequisite for a credible X12 stack.
4. **X09** — gated on **E12** (provenance + signed commits → verifiable record). Run the
   append-only-vs-edit-in-place comparison once E12 lands.
5. **X03, X05, X08, X10** — slot in as prerequisites land: X03/X10 after the companion
   path is exercised; X05 after the "leads" rubric exists; X08 after the outward gate.
6. **X12 (full)** — last. Assemble the stack, submit to a blind external yardstick,
   ablate to rank load-bearing parts.

Simulation-first throughout: every card has a section describing what model-played
teachers/learners + deterministic scripts can expose **now**, which bottleneck that
surfaces, and what only real people can show. Simulated results are always labelled
simulated.

## Where results go

- Each run: one dated result file (same convention as `experiments/E*/results/` and
  the dated scale/run docs).
- Each bottleneck found: one row in `experiments/BOTTLENECKS.md`, with its evidence
  file quoted.
- Honesty rule: a result is written only when an actual run produces it — never from a
  plan or an expectation.
