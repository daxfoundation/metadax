# MetaDAX licensing

This document expands decision D2 (`docs/DECISIONS.md`) and mirrors `LICENSES.md` at the repo
root. If the two ever disagree, `LICENSES.md` is authoritative for the file-path mapping.

## Which licence applies to which path

| Path | Licence | SPDX id |
|---|---|---|
| `prompts/`, `schemas/`, eval fixtures | CC0 1.0 | `CC0-1.0` |
| `tools/`, `templates/`, `.github/`, `skills/`, `adapters/` | Apache-2.0 | `Apache-2.0` |
| `docs/`, `README.md` and other prose | CC BY 4.0 | `CC-BY-4.0` |
| Generated course content | author's choice, default CC BY 4.0 (CC BY-SA allowed) | `CC-BY-4.0` / `CC-BY-SA-4.0` |
| Raw generated segments (marked `generated: true`) | CC0 1.0 | `CC0-1.0` |

## Why each choice

**Prompts and schemas: CC0.** The prompts are the product, and CC0 maximises forking and model
reuse -- anyone can build on them with no attribution burden. The `course.json` and node schemas
belong here so tooling can reuse them freely.

**Docs: CC BY 4.0.** Prose is attributable work; CC BY lets others quote and adapt it while
keeping credit to the source.

**Code: Apache-2.0.** The three Python tools and any templates or Actions are Apache-2.0 for the
patent grant and for compatibility with the Apache-licensed prior art worth reading.

**Generated course content: author's choice, default CC BY 4.0.** A teacher owns their curation
choices and may pick the licence; the default is CC BY 4.0 so the corpus stays mixable with
openly licensed sources. CC BY-SA is allowed, but note it would block mixing that content into a
BY-only corpus.

**Raw generated segments: CC0.** Segments marked `generated: true` are declared CC0 because a
prompt alone may not confer authorship on the output (per the US Copyright Office's 2025 report),
so a stronger licence might attach to nothing. Declaring CC0 is the honest position. A
`course.json` records this as `generated_segments_license: "CC0-1.0"` (`docs/SPEC-v0.2.md` S-7).

## The ingest whitelist for grounding sources

When MetaDAX grounds content on outside sources, only these licences may be ingested:

- CC0
- CC BY
- OGL v3 (the UK Open Government Licence)
- CC BY-SA -- only for projects that are themselves BY-SA
- public domain

Non-commercial (NC) and no-derivatives (ND) sources are **link-only**: they may be pointed to but
never ingested.

## What is never ingested

Naming only what the exploration report names:

- **CK-12 must never be ingested, even for retrieval.** Its licence bans AI/ML training,
  automated content creation and aggregation, and grants CK-12 rights over modifications.
- **OpenStax** now licenses newly released and updated versions BY-NC-SA (with limited
  exceptions); only archived CC BY editions are usable.

**Oak National Academy** (OGL) is the intended first grounding corpus (decision D5): about 10,000
lessons with objectives, misconceptions and quizzes, reachable through a REST API and an MCP
server. It is on the whitelist. Grounding on Oak is tested by experiment E07.

## Attribution format for forks

Under decision D7, a teacher may publish or fork a course, and the Foundation may fork a published
course, steward its copy, and keep it CC BY -- with attribution to the original teacher. The
mechanics:

- A public course carries a root manifest recording the course id, the licence, the schema
  version, and a provenance pointer.
- Attribution is recorded per file, supported by each node's `provenance.json` (content hash,
  creator, lineage; `docs/SPEC-v0.2.md` S-7), so a downstream fork can meet its attribution
  obligations file by file.
- A fork of a public course is itself public and carries the same manifest and licence.

The exact stewardship process (how the Foundation forks, attributes and maintains a copy) is a
pending decision (`docs/DECISIONS.md`).

## Contributions: DCO

Contributions use the Developer Certificate of Origin: sign off each commit with `git commit -s`.
Inbound equals outbound -- a contribution is under the same licence as the path it touches, and
the Foundation takes no relicensing power over it.
