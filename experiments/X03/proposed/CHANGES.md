Proposed by the runs of 18-19 Oct 2026; not merged into the canonical files.

# Proposed changes — X03 run 2026-10-18

## proposed/schemas/guide-mode-profile.schema.json
**New file.** Defines the per-stage ownership structure for a guide-mode session. Three ownership values: `guide`, `guide+system`, `system`. Includes `system_can` and `system_cannot` arrays so the guide's authority boundaries are machine-readable, not just prose. Required by X03; feeds X10 (carry-over of guide decisions across years).

## proposed/schemas/override-record.schema.json
**New file.** Immutable record of a guide overriding a system-generated item. Fields: `override_id`, `timestamp`, `guide_id`, `stage_id`, `item_id`, `original_content`, `replacement_content` (nullable), `action` (replace/remove/flag), `reason` (required, non-empty), `clinical_safety_flag`. Designed to be append-only: once written, a record cannot be removed. Feeds the bottleneck register directly — patterns in override reasons are a map of where the system is weakest.

## proposed/experiments/X03/README.md
**Corrected card.** Replaces "teacher" with "guide" and "learner" throughout; replaces "role" with "ownership" where the card referred to stage ownership. No substantive change to the method or measures. Adds a note that this run produced guide-mode-profile and override-record schemas as its primary artefacts.
