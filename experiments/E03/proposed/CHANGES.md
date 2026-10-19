Proposed by the runs of 18-19 Oct 2026; not merged into the canonical files.

# Proposed changes — E03 run 3

## schemas/tutor-turn.schema.json

**Why (B24):** `meta`, `feedback`, `handoff`, and `summary` are declared as
`"type": "object"` without allowing null. Every turn correctly sets unused sub-objects
to null, but the schema rejects null. Causes 22 validation errors per 6-turn session.

**Change:** For each of the four sub-objects, change:
```json
"meta": { "type": "object", ... }
```
to:
```json
"meta": { "anyOf": [{"type": "object", ...}, {"type": "null"}] }
```
Same change for `feedback`, `handoff`, and `summary`.

---

## schemas/event.schema.json  (or new schemas/followup-event.schema.json)

**Why (B26):** The event schema's `type` enum does not include `"followup"`.
The model produced follow-up events with fields (`parent_node_id`, `question`) that
reflect what a follow-up event naturally needs, but these are not in the schema. The
16 event validation errors stem from this missing event type.

**Change (option A):** Add `"followup"` to the `type` enum and add optional fields
`parent_node_id` (nodeId) and `question` (string) to the event schema.

**Change (option B):** Define a separate `followup-event.schema.json` for follow-up
events, referenced by the learner skill and SCHEMAS.md section 6.

---

## prompts/MP-06-bloom-tutor.md (note / client gate)

**Why (B25, B27):** The model adds a `ts` timestamp to turn files (K-15
violation) and occasionally adds extra fields to `state` (e.g. `bloom_level_scores`).

**Change:** Add a client-side validation note to the learner skill SKILL.md:
> Before writing any turn file: strip any field not in `tutor-turn/0.2` schema
> (especially `ts`, which `tools/stamp.js turn` writes — never the model). Validate
> the `state` object against the sub-schema. If extra fields are present, log a
> warning and remove them.

---

## prompts/SCHEMAS.md section 6 (events)

**Why (B26):** The follow-up event shape is undocumented. SCHEMAS.md section 6
shows `view`, `quiz_start`, `followup`, `practice` event types in the enum but the
example only shows a `practice` event. The required fields for a `followup` event
(`course_id`, `concept`, `bloom_level`, `result`, `data`) are not illustrated.

**Change:** Add a `followup` event example to SCHEMAS.md section 6 alongside the
existing `practice` example.
## Run 2 (2026-10-18)

Classification of each proposed fix:

| Fix | Type | Effective in arm? |
|---|---|---|
| Nullable sub-objects in `tutor-turn/0.2` | schema change (relaxes) | B and C (0 nullable errors) |
| Add `followup` to event `type` enum | schema change (extends) | B and C (0 event errors) |
| Prompt note: strip `ts`, no extra state fields | prompt change | C only (arm B still has state-structure errors) |
| Add followup event example to SCHEMAS.md §6 | prompt change | C only |

**Result:** Arm B = 19 errors (19 turn, 0 event) FAIL. Arm C = 0 errors PASS.
Schema fixes alone remove event errors but do not prevent model state-structure
violations. Prompt guidance (arm C) is required for full schema compliance.

**New finding (B81):** Without assembler-tool guidance, the model produces wrong
types for `state.levels` (array instead of object) and `state.competency` (integer
instead of object). This is an additional prompt-fix target not in run 1's proposed
changes.

**New finding (B82):** `feedback.hint` and `feedback.misconception` are typed as
`string` (not nullable) in the schema. When the model sets these to null, validation
fails. Consider making them nullable or omitting them when absent.
