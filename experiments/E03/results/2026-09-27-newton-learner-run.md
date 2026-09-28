# E03 run 2 -- adult learner takes the Newton course (2026-09-27)

An automated run in the Claude desktop app: Claude (Anthropic) wrote the simulated
learner's messages and every engine output (MP-01, MP-04 render, MP-05 x6, MP-06 x8,
MP-07 x3, MP-08). This tests the protocol,
tools, schemas and prompt compliance, not how a real person learns. Adult path (the E03 card
describes the parent-mediated path; that variant was not run).

Full illustrated report: https://claude.ai/artifact/Nv4j2tpPh9PidXvLiAaP31

## Timeline

| Step | Operation | Result |
|---|---|---|
| 1 | age wall | "yes, 38" -> continue; probes "no, I am 15" and "not sure" -> stop, nothing written |
| 2 | MP-01 from_description | profile.json, learner_id lrn-jdgntm3e; discarded: exact age, occupation detail |
| 3 | MP-04 render | private rendering of L01.M02.O01 (renderings/8cf3e497df35.md); personalised with interests, reading_level, supports, language, tone |
| 4 | MP-05 | new conf 0.2 -> L01.M02.O01/tracking-coasting-space-probes (depth 2, pending_review) |
| 5 | MP-05 | new conf 0.4 -> L01.M02.O01/tracking-coasting-space-probes/coasting-probe-still-slows (depth 3, pending_review) |
| 6 | MP-05 | new conf 0.35 -> L01.M02.O01/tracking-coasting-space-probes/coasting-probe-still-slows/first-law-idealisation (depth 4, pending_review) |
| 7 | MP-05 | reuse conf 0.9 -> L01.M02.O02 |
| 8 | MP-05 | ancestor conf 0.95 -> L01.M02.O01 |
| 9 | MP-05 (quiz handoff) | extend conf 0.6 -> L01.M02.O01/riding-position-air-resistance (depth 2, pending_review) |
| 10-17 | MP-06 x8, MP-07 x3 | quiz on L01.M02.O01: Remember first try, Understand after 2 hints, Apply first try; competency 83 |
| 18 | MP-08 next_step | snapshot progress/newtons-laws-of-motion/dev-yosq38/2026-09-28.json; 2 next steps; manifest written |

## Follow-ups

| # | Asked on | Learner input | Intent / scope | Decision |
|---|---|---|---|---|
| 1 | L01.M02.O01 s4 | the spacecraft that keeps going for years with no engine - how do we actually know that? has anyone measured it? | challenge / adjacent | new 0.2 |
| 2 | L01.M02.O01/tracking-coasting-space-probes s3 | wait, so the Sun's gravity is still pulling on Voyager? then the net force isn't really zero - does that break the first law? | challenge / in_scope | new 0.4 |
| 3 | L01.M02.O01/tracking-coasting-space-probes/coasting-probe-still-slows s2 | so is anything ever truly free of all forces? or is the first law just an idealisation nobody ever sees? | deepen / in_scope | new 0.35 |
| 4 | L01.M02.O01 s2 | ok different question - why does a football rolling across the grass slow down and stop by itself? | deepen / in_scope | reuse 0.9 |
| 5 | L01.M02.O01/tracking-coasting-space-probes/coasting-probe-still-slows/first-law-idealisation s2 | hang on, I'm lost - remind me what the first law actually says, in one line? | clarify / in_scope | ancestor 0.95 |
| 6 | L01.M02.O01 s4 | why does my bike slow down so much faster when I sit up straight than when I tuck down low? | deepen / adjacent | extend 0.6 |

Depth reached: 4 (`.../first-law-idealisation`, bridge_to_objective present). Every new node
went through the client gates and validate.js OK before commit.

## Quiz turns

| Turn | Learner input | Tutor turn | Level | Result | Attempt | Hints | Competency |
|---|---|---|---|---|---:|---:|---:|
| 1 | quiz | intro | Remember | - | 1 | 0 | 0 |
| 2 | B | feedback | Understand | correct | 1 | 0 | 22 |
| 3 | Because inertia is a force that pushes you forward when the ... | feedback | Understand | partial | 2 | 1 | 22 |
| 4 | hint | feedback | Understand | - | 2 | 2 | 22 |
| 5 | Oh I see - the brakes only act on the bus, so the bus slows ... | feedback | Apply | correct | 1 | 0 | 39 |
| 6 | ask: why does my bike slow down so much faster when I sit up... | handoff | Apply | - | 1 | 0 | 39 |
| 7 | back | question | Apply | - | 1 | 0 | 39 |
| 8 | (a) Zero - my pedalling balances the friction and air resist... | summary | Apply | correct | 1 | 0 | 83 |

MP-07 scores: turn 3 partial 17; turn 5 correct 100; turn 8 correct 100. The client recomputes each rubric
score from the criterion statuses; all matched. Competency recomputed by the client from the
events: Remember 10 + Understand 7.5 + Apply 20 = 37.5 / 45 = 83.

## Save

STEWARD chose two `continue` steps (velocity-and-acceleration and force at Remember),
because the learner started at L01.M02 and the first law's prerequisites have no evidence.
Profile observations proposed: 4. mentor_note null (consent false).

## Files

Course repo: 29 commits, 64 files; learner repo: 9 commits, 36 files,
18 events and 8 turns in ses-20260928-18ot. validate course: OK; validate learner --course: OK.
The client glue used for this run (the structural gates, the learner-side writer, the quiz
driver), every assembled stack, every raw output and the run log are kept by the
maintainers; they are not published in this repository.

## Findings

- F-L2 (fixed, tools/stamp.js): `reuse` created `stats: {reuse_count}` without the required
  `views` on a node that had no stats, so the first real reuse failed validate.js. Now creates
  {views: 0, reuse_count: 0}; regression test in run_c.js.
- F-L3 (fixed, tools/assemble.js): `--content` was ignored for MP-07, so EVALUATE saw the node
  sections and no rubric. MP-07 now honours --content; regression test in run_c.js.
- F-L1 (fixed in client): follow-up 3 used an unknown concept id (`balanced-forces`); neither the
  client gates nor validate.js check concept ids. Node repaired in its own commit; client gate
  added. Recommend validate.js cross-checks concepts against course.json.
- F-L4 (open, spec): the MP-05 CONCEPTS block holds only the objective's concepts; follow-ups
  2-3 used `net-force` (a real course concept outside the block).
- F-L5 (open): nothing supplies device_id / snapshot_date to MP-08; the client passed them as
  CONFIG keys. Suggest assemble.js adds them, or stamp.js snapshot fills snapshot_date.
- F-L6 (open, spec): "never schedule a concept whose prerequisites are below 50" silently drops
  the consolidate step for an unquizzed depth-4 branch.
- F-L7 (open, spec): MP-06 climbs to the concept's bloom_target (Apply) even when the
  OBJECTIVE targets Understand.
- F-L8 (fixed in client): follow-up events 2-6 lacked canonical_question / intent / depth /
  concepts that MP-08 reads.

## E03 metrics

- JSON state in the learner-facing view: 0 of 8 turns (state lives in the turn files; the
  display object is what is shown).
- Approval dialogs: not measured (automated run).
- Tokens per turn (stack, est. bytes/4): MP-06 6698 -> 9576; MP-05 9272 -> 9983; MP-08 13671.
- First rule break: follow-up 2 (net-force outside the CONCEPTS block, F-L4), then follow-up 3
  (unknown concept id, F-L1). No schema-level break by the model.
- Saves lost: 0.
