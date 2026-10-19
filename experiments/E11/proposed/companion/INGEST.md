# INGEST — Companion memory ingestion policy for learner repos

Version: 0.1 (proposed, E11)
Spec reference: SPEC-v0.2.md §S-7

---

## Purpose

This policy governs how a companion reads a learner repo and writes a bounded
memory file for use in future sessions. The memory file is the companion's only
persistent view of the learner; it must be accurate, private-safe, and small.

---

## 1. What the companion reads

The companion reads, in order:

| Source | Path | Include? |
|---|---|---|
| Course metadata | `course.json` | Yes — title and description only |
| Learner profile | `learners/<id>/profile.json` | Yes — full profile |
| Refusals | `learners/<id>/never_show.json` | Yes — full list (mandatory) |
| Guide notes | `learners/<id>/guide_note.json` | Yes — full note |
| Weekly progress | `learners/<id>/progress/<course>/<device>/<date>.json` (latest per week) | Yes — weekly_summary field only |
| Public follow-up nodes | `nodes/<id>/node.json` where `visibility == "public"` | Yes — id, title, concept, week, core.body |
| Private follow-up nodes | `learners/<id>/nodes/<id>/node.json` where `visibility == "private"` | **NO — never read, never included** |
| Provenance files | `nodes/<id>/provenance.json`, `learners/<id>/nodes/<id>/provenance.json` | No — not needed for memory |
| Sessions / events | `learners/<id>/sessions/` | No — raw events not needed for memory |

---

## 2. Privacy rules (mandatory, never relaxed)

1. **Private nodes stay in the learner's copy.** The companion never reads
   `learners/<id>/nodes/` and never includes any content derived from private
   nodes in the memory file.

2. **Refusals are always included in full.** Refusal entries are copied verbatim
   into the memory file regardless of the cap. If the cap is so small that
   refusals cannot fit, the companion writes the refusals and omits everything
   else. Refusals are never summarised or paraphrased.

3. **No personal identifiers beyond learner_id.** The memory file includes only
   display_name and learner_id from the profile. Real names, email addresses, or
   workplace names are omitted.

4. **Content flagged in refusals must not appear.** If the learner has refused
   topic X, the companion must not include, recommend, or reference topic X
   anywhere in the memory file, even in passing.

---

## 3. Cap enforcement

The cap is a hard ceiling on the UTF-8 byte length of the memory file.

Priority order when space is limited:

1. Refusals (always first, never trimmed)
2. Learner profile (full)
3. Guide notes
4. Progress summaries (most recent week first; drop earlier weeks if necessary)
5. Public follow-up nodes (most recent week first; drop earlier weeks if necessary)
6. Course metadata (title and description last; omit if needed)

When a section cannot fit in full, drop it entirely rather than truncating a
JSON value mid-string. Never truncate refusals.

---

## 4. Memory file schema

```json
{
  "schema": "metadax.companion-memory/0.1",
  "learner_id": "<id>",
  "generated_at": "runtime",
  "cap_bytes": <integer>,
  "refusals": [
    { "id": "<r-id>", "pattern": "<topic>", "reason": "<reason>" }
  ],
  "profile": {
    "display_name": "<name>",
    "age_band": "<band>",
    "preferred_language": "<lang>",
    "goals": ["<goal>"],
    "background": "<text>"
  },
  "guide_notes": ["<text>"],
  "weeks": [
    { "week": <int>, "date": "<YYYY-MM-DD>", "topics": ["<topic>"], "summary": "<text>",
      "competency": "<level>", "sessions_completed": <int> }
  ],
  "public_nodes": [
    { "id": "<id>", "title": "<title>", "concept": "<concept>", "week": <int>, "body": "<text>" }
  ],
  "ingest_notes": "<any observations the companion made about schema gaps or policy issues>"
}
```

---

## 5. Schema observations the companion must record

The companion records any field it needed but could not find in the S-7 schema
in `ingest_notes`. This is the primary output for E11's stop rule:

> **Kill if ingest needs a schema change beyond the S-7 additions.**

Examples of things to note:
- A field needed to distinguish "learner-created" from "guide-created" nodes
- A field needed to understand why a node is private
- A field needed to capture which nodes are "unresolved" vs "understood"

---

## 6. Revocation

If the learner deletes a week's progress files (e.g., removes all
`progress/<course>/<device>/<week-date>.json` files for a given week), the
companion re-ingests from scratch. Weeks that no longer have a progress file
must not appear in the new memory file.

The companion never caches deleted data between ingest runs.

---

## 7. What this policy does not cover

- Signed provenance (S-7 `key_id`) — not populated in Phase 1
- Constraint declarations (S-7 `constraint_decl_ref`) — not used in Phase 1
- Cross-device merge (MP-08) — handled before ingest; the companion receives
  already-merged progress
- Multi-course learners — single course per memory file in Phase 1
