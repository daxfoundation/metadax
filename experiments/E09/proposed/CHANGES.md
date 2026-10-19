Proposed by the runs of 18-19 Oct 2026; not merged into the canonical files.

# E09 proposed changes

Files and the finding that motivates each.

## schema/record.schema.json

**Changes proposed:**
1. Add optional `learner_age_band` (same enum as `age_band`) at the top level, to capture the learner's actual age when it differs from the package's target band. Motivated by B39.
2. Add optional `duration_min` (integer ≥ 0) at the top level. Motivated by B41.
3. Add optional `next_note` (string, max 500) at the top level. Motivated by B41.
4. Add optional `jurisdiction` (string, max 80) at the top level. Motivated by B41.

**No changes to** `mistakes[].name` — the field name is correct; it is the validator that needs to enforce it (see tools/validate-record.mjs).

## tools/validate-record.mjs

**Changes proposed:**
1. In the mistakes loop, add a check: if `m` is an object and does not have a `name` property, emit an error ("mistakes[i] must have a 'name' property"). Motivated by B38.
2. Extend the DIAGNOSIS regex to include: `neurotypical`, `neurodivergent`, `neurodiverse`. Motivated by B40.
3. Add a warning (not error) when `guide_note` or `learner_words` contains "learning profile" within 30 characters of a condition-adjacent noun (rough heuristic). Motivated by B40.
