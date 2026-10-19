# E03 — learner run 3, wave 2 run 2 (2026-10-19)

**SIMULATED** — model-played adult learner personas (sonnet). No real person participated.

## Question

Do the proposed fixes from run 1 (wave 2) make a full learner session validate?
Tested in two arms: B = schema fixes only; C = schema + prompt fixes.
Run 1 (wave 2) of this experiment is Arm A.

## What changed since run 1

- Arm A = run 1 (44 validate errors, FAIL). No changes applied.
- Arm B: applied schema fixes from `proposed/CHANGES.md` — nullable sub-objects in
  `tutor-turn/0.2` and `followup` type added to `event/0.2`.
- Arm C: same schema fixes plus prompt guidance — tutor told not to add `ts` field,
  not to add extra state fields, and given correct followup event shape.
- Schema files: `run2-2026-10-19/tutor-turn-arm-b.schema.json`,
  `run2-2026-10-19/event-arm-b.schema.json` (arm B and C share the same schema).
- Fresh sonnet subagents per arm (Priya — arm B; Tomás — arm C; different made-up personas), same course
  (Probability for adults), same session structure (6 quiz turns + 2 followup events).
  Arms B and C used different personas; the comparison is one session per arm and is therefore small and confounded by persona differences.

## Fix classification

| Fix | Source | Type | Addresses |
|---|---|---|---|
| Nullable sub-objects in `tutor-turn/0.2` (`meta`, `feedback`, `handoff`, `summary`) | proposed/CHANGES.md §1 | **schema change** (relaxes) | B24, 22 turn errors |
| Add `followup` to event `type` enum; add optional `parent_node_id`, `question` | proposed/CHANGES.md §2 | **schema change** (extends) | B26, 16 event errors |
| Prompt note: strip `ts` and extra state fields before writing turn | proposed/CHANGES.md §3 | **prompt change** | B25, B27 |
| Add followup event example to SCHEMAS.md §6 | proposed/CHANGES.md §4 | **prompt change** | B26 (guidance) |

## What ran

- Model: Claude (Anthropic), sonnet.
- Subject: "Probability for adults returning to maths" (course from E01 run 3).
- Arm B learner: Priya (made-up persona), adult, interests: gardening/baking/sudoku. Session: ses-20261019-armb.
- Arm C learner: Tomás (made-up persona), adult, interests: cycling/cooking/card games. Session: ses-20261019-armc.
- Objective: L01.M01.O01 ("Identify random events and describe their outcomes").
- Each arm: 6 quiz turns (intro + 3 feedback + 2 summary), 2 followup events.
- Validator: `run2-2026-10-19/validate-arm.cjs` using `jsonschema-lite.js`.

## Numbers table

| Metric | Arm A (run 1) | Arm B (schema only) | Arm C (schema + prompt) |
|---|---|---|---|
| Total validate errors | 44 | 19 | **0** |
| Turn errors | 28 | 19 | 0 |
| Event errors | 16 | 0 | 0 |
| Errors — nullable sub-objects (B24) | 22 | 0 ✓ | 0 ✓ |
| Errors — model `ts` field (B25) | 6 | 0 (not triggered) | 0 ✓ |
| Errors — wrong event type (B26) | 16 | 0 ✓ | 0 ✓ |
| Errors — extra state field (B27) | 1 | 0 (not triggered) | 0 ✓ |
| New errors (state structure, enums) | 0 | 19 | 0 |
| Guard records rejected / 6 | — | — | 6/6 |

### Arm B new turn errors (not from run 1) — 19 total

Fresh simulation (Priya, turns 1-4) produced structurally different output than run 1
because it lacked assembler-tool guidance on state shape:

| Error cause | Count | Turns affected |
|---|---|---|
| `meta.question_type` not in enum ("mcq"/"open" vs actual enum values) | 4 | 1–4 |
| `feedback.hint` / `.misconception` typed as string but set to null | 3 | 2–4 |
| `state.phase` not in enum ("question"/"complete" vs "main"/"remedial") | 4 | 1–4 |
| `state.levels` wrong type (array instead of object) | 4 | 1–4 |
| `state.competency` wrong type (integer instead of object) | 4 | 1–4 |
| **Total** | **19** | |

Arm B turns 5–6 (summary turns) had correct structure; only turns 1–4 (raw model
output without assembler) carried these errors. Run 1's nullable sub-object errors
(B24) do not appear in arm B; the schema fix is effective.

## Guard records — arm C schema, 6/6 rejected

| # | Record | Violation | Rejected? |
|---|---|---|---|
| 1 | Turn missing `schema` field | missing required property | YES |
| 2 | Turn with `"type": "lecture"` | type not in enum | YES |
| 3 | Event with `"seq": "three"` | expected integer, got string | YES |
| 4 | Event with `"type": "teleport"` | type not in enum + anyOf fails | YES |
| 5 | Turn with extra top-level field `injected_field` | additional property not allowed | YES |
| 6 | Turn with `"display": null` | expected type object, got null | YES |

The arm C schema correctly rejects all 6 deliberate violations.

## Verdict

**Arm C: PASS.** 0 validate errors across 6 turns and 2 events. Guard: 6/6 rejected. Scoped to one session per arm; arms B and C used different personas (Priya — arm B; Tomás — arm C, both made-up), so the comparison is small and confounded by persona.

Kill line (brief): "validate is OK throughout."
No tool calls were made in either arm. Validate OK: ✓. Verdict: **PASS**.

Note: arm C's prompt fixes (no ts field, no extra state fields, correct followup shape) address B25 and B27 only. They do not address arm B's state/enum errors (B81: state.levels as array, state.competency as integer; B82: feedback.hint/misconception set to null).

Arm B: FAIL (19 turn errors). Schema fixes alone removed the 16 event errors and the
22 nullable sub-object turn errors from run 1, but the schema cannot prevent the model
from generating structurally wrong state objects (wrong types, wrong enums) without
assembler-tool or prompt guidance.

## What compounds

- Both schema fixes confirmed effective: event errors drop from 16→0 in arm B/C;
  nullable sub-objects no longer cause false positives.
- Prompt guidance (arm C) produces schema-compliant turns even without the assembler
  tool, confirming B25 and B27 are prompt-fixable.
- The assembler tool (run 1) produces better baseline state structure than free
  simulation; new arm B errors (state.levels as array, competency as integer) show the
  assembler is load-bearing for turn-level schema compliance.

## Dead ends kept

- Arm B simulation error 19 is a confound: the model generated structurally different
  state (array where object expected) because the arm B prompt did not include state
  schema details. This is not a failure of the proposed fixes; it shows schema fixes
  require prompt guidance to be effective.

## Bottlenecks

See `bottlenecks-2026-10-19-run2.md`.

## Reproduce commands

```sh
# Validate arm B
node experiments/E03/results/run2-2026-10-19/validate-arm.cjs \
  experiments/E03/results/run2-2026-10-19/arm-b \
  experiments/E03/results/run2-2026-10-19/tutor-turn-arm-b.schema.json \
  experiments/E03/results/run2-2026-10-19/event-arm-b.schema.json

# Validate arm C
node experiments/E03/results/run2-2026-10-19/validate-arm.cjs \
  experiments/E03/results/run2-2026-10-19/arm-c \
  experiments/E03/results/run2-2026-10-19/tutor-turn-arm-b.schema.json \
  experiments/E03/results/run2-2026-10-19/event-arm-b.schema.json

# Guard test
node experiments/E03/results/run2-2026-10-19/validate-guard.cjs \
  experiments/E03/results/run2-2026-10-19/guard \
  experiments/E03/results/run2-2026-10-19/tutor-turn-arm-b.schema.json \
  experiments/E03/results/run2-2026-10-19/event-arm-b.schema.json
```
