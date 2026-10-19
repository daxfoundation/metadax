# E03 — learner run 3 (2026-10-18)

**SIMULATED** — model-played adult learner persona (Marcus, sonnet). No real person
participated.

## Question

Can an adult learner session run end to end — profile, render, three follow-ups (one at
depth 3), a 6-turn quiz with MP-07 evaluations, and save — with the ids at depth
correct under v0.3 and quiz state carried cleanly?

## What ran

- Model: Claude (Anthropic), sonnet.
- Subject: "Probability for adults returning to maths" (course from E01 run 3).
- Learner persona: Marcus, adult, interests: cooking/cycling/chess.
- Learner id: lrn-b4shpjal. Device: dev-e03rn3. Session: ses-20261018-nfjp.
- Objective taken: L01.M01.O01 ("Identify random events and describe their outcomes").
- Operations: MP-01 (from_description), MP-04 render, MP-05 × 3, MP-06 × 6, MP-07 × 2,
  MP-08 (next_step).
- Run 3 (regression after run 2: v0.3 ids, stamp + assemble fixes now in place).
- Course repo: /tmp/run. Learner repo: /tmp/run-learner.

## Numbers

| Metric | Value |
|---|---|
| Tool errors (non-zero exit) | 0 |
| Validation failures (validate.js) | 44 (28 in turn files, 16 in event files) |
| Follow-up nodes created | 3 |
| Follow-up node IDs (v0.3 valid) | 3/3 ✓ |
| Depth chain correct (depth field) | depth 1→2→3 ✓ |
| Max depth reached | 3 |
| Quiz turns | 6 (intro, 3 × feedback, 2 × summary) |
| MP-07 evaluations | 2 (turn 3: partial/42; turn 4: correct/100) |
| Competency at save | 78 (random-event: Remember passed, Understand passed) |
| Quiz state carried turn-to-turn | ✓ (competency progression: 0→40→40→78→78→78) |
| Saves lost | 0 |
| JSON state in learner-facing view | 0 / 6 turns |
| Progress snapshot written | ✓ (2026-10-18.json) |

## Verdict

**FAIL.** validate.js fails on all 6 turns and 2 events (44 errors total). Four
distinct root causes (see Bottlenecks). The model-level results (v0.3 IDs correct, quiz
state carried, MP-07 evaluations valid, saves intact) show the core flow works; the
failures are schema strictness mismatches and one model K-15 violation.

Kill line (brief): "zero tool errors and validate is OK throughout."
Zero tool errors: ✓. Validate OK: ✗. Verdict: FAIL.

## Follow-up table

| # | Node id | Depth | Decision | Parent |
|---|---|---|---|---|
| 1 | n_a3dwz4c8spkj0mqkctxghyhgqm | 2 | new | L01.M01.O01 |
| 2 | n_rqp1q2tzt6f49k2sftpvbk2m78 | 3 | new | n_a3dwz4c8spkj0mqkctxghyhgqm |
| 3 | n_s6n2dy8rhtsj5dpbfttpg77mhc | 2 | new | L01.M01.O01 |

All three node ids match `^n_[0-9a-hjkmnp-tv-z]{26}$` (v0.3 opaque id format). Depth
field equals `parent.depth + 1` in all cases. The depth-3 chain is
`L01.M01.O01 → n_a3... (d2) → n_rqp... (d3)`.

## Quiz turn table

| Turn | Type | MP-07? | Score | Competency |
|---|---|---|---|---|
| 1 | intro | — | — | 0 |
| 2 | feedback | — | — | 40 |
| 3 | feedback | ✓ partial | 42 | 40 |
| 4 | feedback | ✓ correct | 100 | 78 |
| 5 | summary | — | — | 78 |
| 6 | summary | — | — | 78 |

## Validation failures

44 errors across all 6 turns and events 3–4.

**Root cause A — nullable sub-objects (schema bug).** The tutor-turn schema declares
`meta`, `feedback`, `handoff`, `summary` as `"type": "object"` (not nullable). Every
turn correctly sets unused sub-fields to null (intro sets feedback/handoff/summary null;
summary turns set meta/feedback/handoff null), but the schema rejects null. This accounts
for 21 of the 28 turn errors. Fix: make each of these fields
`"anyOf": [{"type":"object"}, {"type":"null"}]`.

**Root cause B — model ts field (K-15 violation).** All 6 turns carry a `ts` timestamp
added by the model (`ts: additional property not allowed`). K-15 says the model never
computes timestamps; the client gate should strip or reject any `ts` field on a turn
before writing. This accounts for 6 of the 28 turn errors.

**Root cause C — event schema mismatch.** Follow-up events 3 and 4 used a non-enum
type value and carried fields not in the event schema (parent_node_id, question) while
missing required fields (course_id, concept, bloom_level, result, data). The event
schema for follow-up events either needs a `followup` type enum value, or the guide
needs to write follow-up events in a different schema shape. 16 errors.

**Root cause D — extra state field.** Turn 6 carries `state.bloom_level_scores`
(1 error); not in schema; schema uses `additionalProperties: false`.

## What compounds

- v0.3 IDs compound correctly: depth-3 follow-up uses the opaque `n_...` format; the
  depth field is stored and correct; B01 (depth cap) is confirmed fixed.
- MP-07 evaluations (stub from assemble fix F-L3 in run 2): both MP-07 calls produced
  valid evaluation objects; F-L3 is confirmed fixed.
- stamp.js reuse fix (F-L2 run 2): not triggered (no reuse in this session).

## Dead ends kept

No dead ends. The state-carry and ID fixes work; the failures are schema-level.

## Bottlenecks

See bottlenecks-2026-10-18.md.

## Reproduce commands

```sh
# profile
node /tmp/metadax/tools/assemble.js --op MP-01 --learner /tmp/run-learner \
  --config mode=from_description --config output_mode=json \
  --config learner_id=lrn-b4shpjal --config client=claude-code \
  --prompts /tmp/metadax/prompts --out /tmp/e03-workspace/stack-mp01.txt
# (learner agent reads stack, writes out-mp01.json; extract .profile to profile.json)
node /tmp/metadax/tools/stamp.js profile /tmp/run-learner/profile.json
git -C /tmp/run-learner add . && git -C /tmp/run-learner commit -m "metadax: MP-01 lrn-b4shpjal"

# render: assemble MP-04 render, execute, write rendering
# follow-ups: assemble MP-05, execute, stamp node/registry, commit course repo
# quiz: assemble MP-06, execute, write turn files; assemble MP-07 for graded turns
# save: assemble MP-08, execute, write progress snapshot, stamp, validate, commit
node /tmp/metadax/tools/validate.js learner /tmp/run-learner --course /tmp/run \
  --schemas /tmp/metadax/schemas
```

## Comparison vs run 2

| Metric | Run 2 (2026-09-27) | Run 3 (2026-10-18) |
|---|---|---|
| Subject | Newton's laws | Probability for adults |
| Follow-up depth reached | 4 | 3 |
| Opaque v0.3 ids used | ✓ (run 2 already had v0.3) | ✓ confirmed |
| Tool errors | 2 (F-L2 stamp.js; F-L3 assemble.js) | 0 |
| Validate course | OK | OK |
| Validate learner | not reported separately | FAIL (44 errors) |
| Tutor-turn null fields | not caught | 22 errors (schema too strict) |
| Model ts field | not caught | 6 errors (K-15 violation) |
| Event schema | not validated separately | 16 errors |
| quiz state carry | ✓ | ✓ |
| MP-07 evaluations | ✓ (after F-L3 fix) | ✓ |

Run 2 tool bugs (F-L2, F-L3) are fixed. Run 3 exposes three new schema-level issues not
previously caught because learner validate was not run in run 2.
