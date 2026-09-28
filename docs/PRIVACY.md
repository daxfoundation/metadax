# MetaDAX privacy

MetaDAX is built so that a learner's data stays with the learner. There is no server, no
telemetry and no MetaDAX account; the data lives in the user's own repositories. This document
describes what is stored, what is never stored, and what to check before publishing.

## What a learner repo holds

A learner repo is a private repository (owned by the adult) holding one person's record:

- a profile (`profile.json`): age band, reading level, language, interests and `supports`
- progress snapshots: one file per device per day
- sessions: immutable event and tutor-turn files
- private nodes: the learner's own follow-ups that are not shared
- weekly manifests

Learners are identified by a pseudonym only: `lrn-` followed by 8 lowercase letters or digits
(for example `lrn-7qk2x9`). The pseudonym is the only identifier; it is never derived from a
name or email.

## What is never stored

Design law 6 and kernel rule K-12 forbid personal and health data anywhere:

- no full name, email address, postal address, school or location
- no birth date, photo or voice
- no diagnosis or health data

A learner's `supports` holds **accommodations, not diagnoses**: MP-01 converts a stated
condition into what helps ("short chunks", "movement breaks") and discards the label. The
learner-id pattern forbids an `@`, and the curator strips any identifier that looks like an
email.

## The 18+ wall in Phase 1

Phase 1 clients are for adults only (decision D1). The wall is enforced by the skills and
specified in `docs/SPEC-v0.2.md` S-8: when a client other than the companion runs profile
creation, it accepts only `age_band: "adult"`. If a learner states a minor age or "unknown",
the client says that the Claude Code and Claude Desktop clients are for adults in Phase 1, and
stops. The prompts keep every minor band intact for a later companion phase, but the Phase 1
clients do not open them. Whether the wall holds in practice is observed by experiment E14.

## What stays in the learner repo

Private nodes never leave the learner repo. A node whose visibility is `private` is written only
to `learners/<learner-id>/nodes/<id>/`, is never appended to a course registry, and its question
text never appears in any course-repo file. A child of a private node is private too. This is
enforced in the follow-up engine's contract (MP-05) and the schemas.

## What a shared follow-up exposes

When a learner chooses to share a follow-up, what becomes visible in the course repo is the
node's question text and its shared core -- not the learner's identity beyond the pseudonym, and
not their renderings. Sharing is governed by a consent flag: a node is `private` unless the
learner (or, for a guardian-managed profile, the guardian) has set `share_my_questions` to true.
Nodes from a minor, an unknown age, or a course that requires review start as `pending_review`
and need approval before they are shared.

## Course repos are private by default

Course repos are private by default (decision D4). Making one public is a deliberate,
irreversible step: a fork of a public course is itself public and survives a later switch back
to private, so the consent text says that public is irreversible.

## No telemetry, no server

There is no telemetry and no server. MetaDAX does not phone home, count usage, or hold any data
outside the user's repositories. The maintainers' own model access is never offered as a service
(decision D10).

## Before publishing a course

Before a teacher makes a course repo public, check:

- **Validate.** Run the validation tool over the repo so every record matches its schema.
- **Grep for `@`.** Search the repo for `@` to catch any email or handle that slipped in; the
  learner-id pattern forbids it, but check anyway.
- **Review pending_review nodes.** Every `pending_review` node must be reviewed and either
  approved to `shared` or removed. A minor-authored node must have its verbatim question stripped
  and `created_by` set so no child's words or identifier are published.
- Confirm no learner name, interest tied to an individual child, or persistent per-child
  identifier appears in any public file.
