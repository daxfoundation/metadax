# MetaDAX decisions

These are the decisions the maintainers took on 2026-09-27. They are the source of truth for
the Phase 1 build. Each is recorded as decided, followed by its consequence in this
repository. The frozen contract they shape is `docs/SPEC-v0.2.md`.

## D1 -- Age

Phase 1 clients are for adults (18+) only; younger learners come later through a companion.

**Consequence in this repo.** The age wall is specified in `docs/SPEC-v0.2.md` S-8 and
enforced in the skills and in `docs/PRIVACY.md`. The prompts keep every
minor band and rule intact for the companion to use later; the wall lives in front of them.
Observed by experiment E14.

## D2 -- Licences

Prompts and schemas CC0 1.0; docs CC BY 4.0; code Apache-2.0; generated course content:
author's choice, default CC BY 4.0, CC BY-SA allowed; generated raw segments CC0; DCO
sign-off for contributions.

**Consequence in this repo.** Mirrored in `LICENSES.md` at the repo root and expanded in
`docs/LICENSING.md`. The per-node and per-course licence fields are in `docs/SPEC-v0.2.md`
S-7 (`course.json` gains `license` defaulting to `CC-BY-4.0` and
`generated_segments_license` `CC0-1.0`).

## D3 -- Certification model set

Two primary models, one from each vendor, plus a smaller floor model (named in `evals/`
when the evals exist; do not name models here).

**Consequence in this repo.** The model matrix is defined in `evals/` and exercised by
experiment E04. Model names appear only where an eval actually ran them; this
document, and all docs, name no models (`docs/ACCURACY.md`).

## D4 -- Course repo default

Course repos private by default; the author publishes when ready.

**Consequence in this repo.** Documented in `docs/PRIVACY.md` and `docs/LICENSING.md`.
Publishing is a deliberate, irreversible step; a fork of a public course is itself public.

## D5 -- Oak grounding

Oak National Academy grounding via its MCP tools is wanted ("definitely").

**Consequence in this repo.** Oak is named as the first grounding corpus in
`docs/CONCEPTS.md` and `docs/LICENSING.md` (OGL, on the ingest whitelist). Tested by
experiment E07.

## D6 -- Assets in Phase 1

Diagrams (Mermaid / SVG) and embeds of PhET simulations / H5P content only;
scenario/simulation generation later.

**Consequence in this repo.** Recorded in `docs/CONCEPTS.md` and `docs/ARCHITECTURE.md`.
Tier-1 generated assets are gated on experiment E08; until E08 passes, only Tier-0 (Mermaid,
SVG) and Tier-3 (curated PhET, H5P) are promised.

## D7 -- Publishing

Teachers publish or fork; the Foundation may fork a published course with attribution and
steward its copy (CC BY).

**Consequence in this repo.** The attribution-on-fork rule is in `docs/LICENSING.md`; the
provenance that supports per-file attribution is in `docs/SPEC-v0.2.md` S-7. The stewardship
process itself is a pending decision (below).

## D8 -- Certify-vs-steward Actions

Neither in Milestone 1.

**Consequence in this repo.** No CERTIFY-on-push or STEWARD-on-push reusable Action is built
in Milestone 1. Certification runs as an experiment (E04) in the Foundation repo's CI, not as
a shipped reusable Action.

## D9 -- Prompt Forge

Prompt Forge is an experiment only.

**Consequence in this repo.** Prompt Forge appears only as experiment E13. It is not part of
the Phase 1 prompt suite.

## D10 -- No hosted service

The maintainers' own model access is used to build and test MetaDAX; it is never offered to
third parties as a service.

**Consequence in this repo.** Anything the maintainers run must have a plain
GitHub-Actions-plus-your-own-API-key equivalent that anyone can run.

## D11 -- Offline bundle client

The offline bundle client is later, but every schema honours its checklist (append-only,
per-device, text-first, weekly manifest).

**Consequence in this repo.** The client is deferred; the checklist is honoured in
`docs/SPEC-v0.2.md` S-6 (append-only, per-device progress; immutable tutor turns; weekly
manifest). Tested by experiments E06 and E10.

## D12 -- Naming

Naming is decided by the maintainers.

**Consequence in this repo.** Repository, topic and course names are decided by the
maintainers, not fixed in these docs.

## Also decided

The first client is Claude Code with the user's own GitHub credential. Claude Desktop, an API
runner, ChatGPT and the companion are further clients of the same interface (see
`docs/INTERFACE.md`). Claude Code is the first client tested (experiment E01; the Claude
Desktop variant is E01b).

## Decided since

- **The test subject for the first generated course.** Newton's laws of motion, introductory,
  for an adult (experiment E01, 2026-09-27).

## Decisions pending

These are open, for the maintainers to settle:

- **An OpenAI API key for cross-vendor certification.** E04 needs both vendors' keys as
  repository secrets to certify across the model set (D3).
- **The Foundation's stewardship process.** How a published course is forked, attributed and
  maintained under D7 -- the mechanics are not yet decided.
