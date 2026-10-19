Proposed by the runs of 18-19 Oct 2026; not merged into the canonical files.

# proposed/CHANGES.md — E11 proposed additions

## proposed/companion/INGEST.md

New file. Proposes the ingestion policy for a companion that reads a learner repo and
writes a bounded memory file.

Why: E11 needed a concrete policy to test against. The policy codifies what the companion
reads (public nodes, profile, refusals, guide notes, weekly progress), what it must never
include (private nodes), how it enforces the byte cap (priority order), and what schema
gaps it should record (E11 stop-rule observable). This is a draft; it does not require a
schema change — it sits on top of the existing S-7 fields.

Key decisions encoded:
- Refusals are always included first, never trimmed, regardless of cap.
- Private nodes (learners/<id>/nodes/) are never read.
- The companion records schema gaps in ingest_notes; this is how E11 surfaces B-series findings.
- Cap enforcement uses drop-whole-section rather than mid-value truncation.

Status: proposed; pending review by the memory-module owner.
