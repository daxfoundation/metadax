Proposed by the runs of 18-19 Oct 2026; not merged into the canonical files.

# CHANGES — X05 proposed files

## proposed/schemas/tutor-turn.schema.json

**What:** Version bump 0.2 → 0.3. Adds optional `steer_flag` object to the top-level
tutor-turn schema.

**Fields added:**
- `steer_flag.flagged_by` — opaque learner or session id of who raised the flag
- `steer_flag.reason` — structured code: `leads_to_answer | reveals_answer | too_narrow | embeds_answer | other`
- `steer_flag.reason_text` — optional free-text explanation (≤ 300 chars)
- `steer_flag.turn_index` — 0-indexed position of the turn in the session

**Why:** X05 plants leading turns and asks learner personas to flag them. Without a
structured field on the turn record, flags can only live as side-file data keyed on
(session_id, turn_index). Attaching the flag to the turn itself makes it retrievable
with the turn and machine-readable for downstream precision/recall computation.

**Backwards compatibility:** `steer_flag` is optional and absent in all v0.2 records.
Existing records remain valid against v0.3 (additionalProperties is false in v0.2 too;
v0.3 simply adds the new optional key). Consumers that do not know about `steer_flag`
can safely ignore it.

---

## proposed/evals/leads-rubric.md

**What:** New rubric prompt — `EVALUATE_LEADS` — written in the MP-07 style.

**Why:** X05 requires a *blind* evaluator that scores each tutor turn for leading
without knowing which turns were planted or what the learner flagged. The rubric
defines five leading conditions and a conservative default (prefer false). This is
the missing piece listed in the X05 card's "What has to exist" table.

**Placement:** `evals/leads-rubric.md` alongside the existing `evals/grade.js`
and `evals/cases/`. Future integration: add a `EVALUATE_LEADS` case to
`evals/cases/` and wire it into `grade.js` as a new operation type.
