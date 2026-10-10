# MetaDAX Prompt Suite v0.2 -- Schemas and Artifacts

> Status: v0.2 (2026-09-27): applies the frozen change spec `docs/SPEC-v0.2.md` to v0.1.1 (see `CHANGELOG-v0.2.md`). Normative. Every prompt in this suite reads and writes ONLY the artifacts defined here. Schema ids are `metadax.*/0.2`, except `node`, `registry` and `registry-index`, which are `0.3` (opaque ids; see ID-FORMAT v0.3 and `docs/ID-FORMAT-v0.3.md`).
> Keywords MUST / MUST NOT / SHOULD / MAY follow RFC 2119.
> Lineage: each schema names the EdDAX (the earlier prototype) structure it replaces.

---

## 0. Design laws (apply to every schema)

1. **Recursion lives in the data, not in the prompt.** One node schema serves depth 1 and depth 50. The Follow-Up Engine (MP-05) is the same call at every depth; only the PATH block grows.
2. **Knowledge is shared; presentation is personal.** A node stores an audience-neutral `core` (shared course asset) and zero or more audience `renderings` (personal or cached per audience band). Reuse copies nothing: it re-renders the existing core for the next learner.
3. **The tree owns; links reuse.** Every node has exactly one parent (tree = ownership + breadcrumb). Cross-branch reuse is a `links[]` edge, never a duplicate node. The structure is a tree with a link overlay (a DAG for reading, a tree for writing).
4. **Ids are opaque; the parent link is the ancestry (v0.3).** A node id is a short opaque token that encodes nothing about depth, parent or slug. A node's ancestry is its `parent_id` chain, rebuilt from the registry; its breadcrumb travels in the node's own `path[]` array, so a node stays self-describing without the id carrying the path. (v0.2 ids were breadcrumb paths capped at 200 chars, which stopped a question thread at depth ~8; v0.3 lifts that cap.)
5. **Every value an LLM writes is bounded.** Titles, summaries and questions carry hard length limits, because EdDAX stored whole answers in `qnas.title` (17 of 25 follow-up rows in the prototype's saved data).
6. **Accommodations, not diagnoses.** Learner profiles store what helps (short chunks, frequent checks), never medical labels.
7. **Learner-authored assets are pending until reviewed** when the author is a minor or the course policy says so.
8. **The model never stamps.** Timestamps, hashes, byte counts and random ids are written by the client's stamping step, never by the model. Where a schema has `created_at`, `updated_at`, `ts`, `content_sha256` or a `provenance` file, the model writes the literal string `"runtime"` and `tools/stamp.js` fills it in (MP-00 K-15). The one exception is `learner_id` (K-2, MP-01), created from letters and digits.

---

## 1. Identifiers

| Thing | Pattern | Example |
|---|---|---|
| course | kebab slug | `cell-biology-101` |
| lesson | `L` + 2 digits | `L03` |
| module | lesson + `.M` + 2 digits | `L03.M02` |
| objective node (depth 1) | module + `.O` + 2 digits | `L03.M02.O01` |
| follow-up node (depth >= 2) | opaque `n_` + 26 Crockford-base32 chars (128 random bits), minted by the client's stamping step; encodes nothing about parent, depth or slug; no length cap | `n_3qr5v8x2k0ydh7m1p4w6t9b2c` |
| section anchor | `s` + integer, unique within a node's core | `s3` |
| concept | kebab slug, course-unique | `electron-transport-chain` |
| practice item | node id + `#p` + 2 digits, counting that node's items in order | `L03.M02.O01#p01` |
| learner | pseudonym `lrn-` + 6+ lowercase letters or digits; never an email or real name. MP-01 creates it (`lrn-` + 8 random characters) unless CONFIG.learner_id supplies one | `lrn-7qk2x9` |

**Slug rule (follow-up nodes).** In v0.3 the slug is a separate, display-only `slug` field (for breadcrumbs and URLs); it is **not** part of the id. The engine (MP-05) computes it from the node's **title**. A runtime MAY recompute it with the same rule; if it does, the recomputed slug wins.
1. Lowercase the title.
2. Keep only ASCII letters, digits and spaces. Every other character is removed (`Cytochrome c:` becomes `cytochrome c`; `I-IV` becomes `iiv`).
3. Drop the stop-words `a, an, the, of, in, on, for, to, and, or, with, how, what, why, which, does, do, is, are, by, from, its, their`.
4. Keep the first 5 remaining words, in order, and join them with `-`.
5. If the result is longer than 32 characters, cut it back to the last whole word within 32. (A single word longer than 32 characters is cut at 32. If no word remains, the slug is `node`.)
6. On a display collision with an existing sibling slug, a runtime MAY append `-2`, `-3`, ... -- but this is cosmetic only; node identity is the opaque id, never the slug.

Worked: "Proteins essential for ATP synthesis" -> `proteins-essential-atp-synthesis` (32 chars, kept). "Cytochrome c: structure and role" -> `cytochrome-c-structure-role`. "Plant and animal mitochondria compared" -> `plant-animal-mitochondria-compared` is 34 chars -> `plant-animal-mitochondria`.

**Id length (v0.3).** There is no length cap. A v0.3 follow-up id is the fixed-length opaque token above (`n_` + 26 chars); it encodes nothing, so it cannot overflow a filename or path. (Legacy v0.2 breadcrumb ids kept a 200-char cap; `tools/path.js` still parses them for old data.)
**Depth is a stored field (v0.3).** `depth` = `parent.depth + 1`, with objective nodes at depth 1. It is stored on the node (section 3) and in the registry (section 4). Engines and runtimes **NEVER** derive depth by counting `/` in the id, and never count PATH entries (PATH may be compressed, MP-03). The registry `parent_id` chain is the source of truth for ancestry and depth.
Repository path of a node: `nodes/<id>/` for `shared` and `pending_review` nodes (every node is a directory; children are subdirectories). `private` nodes live only at `learners/<learner-id>/nodes/<id>/` (section 3).

**What-if-wrong (identifiers)**
| Field | If wrong | Guard |
|---|---|---|
| slug collision ignored | two nodes overwrite each other's directory | engine MUST check sibling ids in REGISTRY; runtime MUST refuse to overwrite |
| slug computed differently by two devices | the same question gets two ids; duplicates go undetected | fixed rule above; runtime MAY recompute; MP-09 `dedupe` catches the rest |
| id not a valid opaque token (nor a legacy breadcrumb) | record unaddressable; dedupe keys collide | schema `nodeId` pattern; the runtime mints ids via `tools/path.js`, never hand-builds them |
| `parent_id` missing from the registry | ancestry and depth become unrecoverable | runtime MUST reject a node whose `parent_id` is not an existing node id (null only for objectives); depth MUST equal `parent.depth + 1` |
| learner id is an email | public course repo leaks identity | schema pattern forbids `@`; curator (MP-09) strips on sight |

---

## 2. `course.json` -- the curriculum (replaces SQL `courses`/`lessons`/`modules` + level-1 `qnas`)

```json
{
  "schema": "metadax.course/0.2",
  "id": "cell-biology-101",
  "title": "Cell Biology 101",
  "summary": "One or two sentences a learner would read on the catalog card.",
  "language": "en",
  "audience": { "intended_bands": ["16-18", "adult"], "notes": "Intro university level; no prior chemistry assumed." },
  "steer": {
    "focus": "What every generation in this course must serve.",
    "include": ["Everyday analogies", "One worked example per section"],
    "exclude": ["Mnemonics as the primary method"],
    "tone": "warm, precise, never condescending",
    "depth": "introductory | intermediate | advanced | expert",
    "source_policy": "source_only | source_first | open",
    "scope_policy": "strict | tangents_allowed",
    "max_depth": 8
  },
  "concepts": [
    {
      "id": "atp-synthesis",
      "name": "ATP synthesis",
      "description": "How cells make ATP from ADP using a proton gradient.",
      "bloom_target": "Analyze",
      "prerequisites": ["cell-membrane"],
      "misconceptions": ["ATP is stored long-term in large amounts"]
    }
  ],
  "lessons": [
    {
      "id": "L01",
      "title": "The Cell Membrane",
      "summary": "Learner-facing, 1-2 sentences.",
      "steer": { "focus": "...", "include": [], "exclude": [] },
      "modules": [
        {
          "id": "L01.M01",
          "title": "Lipid Bilayers",
          "summary": "Learner-facing, 1-2 sentences.",
          "steer": { "focus": "...", "include": [], "exclude": [] },
          "objectives": [
            {
              "id": "L01.M01.O01",
              "title": "Explain why phospholipids form bilayers",
              "statement": "The learner can explain, using polarity, why phospholipids self-assemble into a bilayer in water.",
              "concepts": ["cell-membrane"],
              "bloom_target": "Understand",
              "source_refs": ["src:chapter-2#bilayer"]
            }
          ]
        }
      ]
    }
  ],
  "sources": [ { "id": "src:chapter-2", "title": "Teacher notes, chapter 2", "path": "sources/chapter-2.md" } ],
  "policy": { "learner_nodes": "pending_review | shared", "minor_nodes": "pending_review" },
  "license": "CC-BY-4.0",
  "generated_segments_license": "CC0-1.0",
  "constraint_decl": null,
  "created_at": "runtime",
  "updated_at": "runtime"
}
```

Rules:
- `steer` is an **instruction to the generator**, never a copy of `summary`. (EdDAX: 67 of 89 lessons and 51 of 81 modules had `gpt_instruction` identical to the summary, which made the cascade inert.)
- Audience belongs in the **learner profile**, not the steer. `audience` here is the design intent only; a specific learner's age, name or interests never appear in titles, summaries or steers. A steer MAY name an audience only when the subject itself is audience-bound (for example "for family doctors").
- Narrower focus refines broader focus: the objective `statement` > module steer > lesson steer > course steer, for **content focus**. Objectives have no `steer`; their statement plays that role.
- Summaries (course, lesson, module) are one or two sentences.
- Defaults: `scope_policy` "strict" for exam-prep or compliance courses, otherwise "tangents_allowed"; `max_depth` is optional with no default (absent = no depth limit; v0.3, MP-05); `source_policy` "open" with no sources (MP-02 sets "source_first" or "source_only" when sources exist); `policy.learner_nodes` "pending_review"; `policy.minor_nodes` is always "pending_review".
- An objective title is a **learning objective** (verb-first, <= 80 chars). EdDAX used `qnas.title` as the objective; this keeps that meaning and makes it explicit.
- `license` is an SPDX id string, default `CC-BY-4.0`; `generated_segments_license` is the licence of model-generated segments, default `CC0-1.0`. `constraint_decl` is `null` in Phase 1 (reserved for the Constraint Protocol, never described as live). `created_at` and `updated_at` are RFC 3339 UTC strings written `"runtime"` by the model (law 8 / K-15).

**What-if-wrong (course.json)**
| Field | If wrong | Guard |
|---|---|---|
| `steer` == `summary` | cascade adds nothing; every generation drifts to generic | MP-02 MUST write steers in the include/exclude/focus shape; MP-09 flags equality |
| audience in steer AND in profile, conflicting | 11-year-old gets university text (or the reverse) | precedence rule: profile wins for presentation; engines emit `audience_conflict` warning |
| `concepts` missing | tutor falls back to generic questions (EdDAX hardcoded arithmetic) | MP-06 MUST refuse to run with an empty CONCEPTS block and return `missing` |
| `bloom_target` too low (Remember) for a university course | quizzes stop at that level and mastery is claimed too early (competency is measured up to `bloom_target`, section 6) | MP-02 SHOULD align targets with `steer.depth`; MP-09 `audit_course` flags it |
| `source_policy` = `open` on a policy/legal course | invented rules taught as fact | MP-02 SHOULD default to `source_first` when sources exist |
| `max_depth` absent | (v0.3) no hard depth limit -- the engine keeps answering at any depth | optional field, no default; when a course sets it, depth > max_depth is a soft limit (warn + zoom-out seed), never a hard stop (MP-05) |

---

## 3. Node record -- `nodes/<id>/node.json` (replaces `qnas` row + Cosmos QnA document + `sub_qnas`)

```json
{
  "schema": "metadax.node/0.3",
  "id": "n_3qr5v8x2k0ydh7m1p4w6t9b2c",
  "parent_id": "L03.M02.O01",
  "slug": "proteins-essential-atp-synthesis",
  "kind": "followup",
  "depth": 2,
  "anchor": { "section_id": "s3", "quote": "ATP synthase uses the proton gradient..." },
  "path": [ { "id": "L03.M02.O01", "title": "Explain how the mitochondrion makes ATP", "summary": "Cellular respiration converts nutrients into ATP; most ATP is made in the mitochondrion." } ],
  "title": "Proteins essential for ATP synthesis",
  "question": "what proteins are needed for this??",
  "canonical_question": "Which proteins are essential for ATP synthesis in the mitochondrion?",
  "intent": "deepen",
  "summary": ["ATP synthase (Complex V) has a rotor (F0) and a catalytic head (F1).", "Complexes I-IV build the proton gradient that drives it."],
  "concepts": ["atp-synthesis", "electron-transport-chain"],
  "new_concepts": [],
  "bloom_level": "Understand",
  "scope": "in_scope",
  "reuse": { "decision": "new", "of": null, "confidence": 0.0, "rationale": "No sibling or course-wide node covers the protein inventory." },
  "links": [],
  "core": {
    "sections": [
      { "id": "s1", "heading": "The machine: ATP synthase", "body_md": "..." },
      { "id": "s2", "heading": "The power supply: Complexes I-IV", "body_md": "..." }
    ],
    "key_points": ["...", "..."],
    "bridge_to_parent": "One sentence tying this answer back to the parent node.",
    "bridge_to_objective": "",
    "source_refs": []
  },
  "seeds": ["How does the F0 rotor actually turn?", "Why is oxygen the final electron acceptor?", "What happens to ATP production if the membrane leaks protons?"],
  "created_by": "lrn-7qk2x9",
  "visibility": "pending_review",
  "created_at": "runtime",
  "updated_at": "runtime",
  "content_sha256": "runtime",
  "superseded_by": null,
  "model": "runtime",
  "stats": { "views": 0, "reuse_count": 0 }
}
```

Where a node is stored: `shared` and `pending_review` nodes at `nodes/<id>/node.json` in the course repo, with a registry entry (section 4). `private` nodes only at `learners/<learner-id>/nodes/<id>/node.json`, never in the course registry, and their `question` text never appears in any course-repo file. A child of a `private` node is `private`. The directory per node is unchanged; beside `node.json` the client writes `nodes/<id>/provenance.json` (section 3b), never the model.

`path` makes a node self-describing: a client can rebuild the PATH block from the node file alone. New nodes carry `path`, `created_at`, `updated_at`, `content_sha256` and `superseded_by`; v0.1 nodes without them stay valid.

Renderings (never in `node.json`):
- Personal rendering: `learners/<learner-id>/renderings/<h>.md`, where `<h>` is the first 12 hex characters of `sha1(node id)`, and the node id is stored in the file's front matter (`node_id: ...`). The runtime computes the hash, never the model.
- Shared cache: `nodes/<id>/renderings/<audience-key>.md`, where `audience-key` = `<age_band>_<reading_level>_<language>` (no value contains `_`, so the key splits back into its parts). Only a rendering whose `personalized_with` does not contain `"interests"` may be cached here.

**Field contract and what-if-wrong (node)**
| Field | Constraint | If wrong | Guard |
|---|---|---|---|
| `id` | per section 1; opaque `n_` + 26-char token (or a legacy breadcrumb); no length cap | record unaddressable | schema `nodeId` pattern; the runtime mints it, never the model |
| `slug` | display-only kebab slug (<= 32 chars) from the title; not part of identity | broken breadcrumb/URL label | MP-05 computes it; a runtime MAY recompute |
| `parent_id` | existing node id, or null only for objectives | orphan branch (EdDAX: parent resolved from a second store with no FK in code) | engine MUST take it from PATH (the last entry), never invent; never `"trail"` |
| `kind` | `objective` iff depth 1, else `followup` | objectives mistaken for learner content | derived from depth |
| `depth` | stored integer = `parent.depth + 1`; objectives are depth 1 | wrong depth governor / zoom-out behaviour | never derived from the id or by counting PATH entries |
| `anchor` | object `{section_id, quote}` (section id exists in the parent's `core.sections`; quote <= 200 chars), or `null` when the question is about the whole parent; always `null` for objectives | follow-up loses what it was about (EdDAX dropped the anchor) | engine copies from ANCHOR block; runtime truncates the quote to 200 chars before assembly (MP-03) |
| `title` | <= 80 chars, plain text, no markdown, no trailing period | UI breadcrumbs become paragraphs (EdDAX defect) | schema maxLength; MP-09 rewrites |
| `question` | learner's words, verbatim, <= 500 chars; `""` for objectives | lost provenance of what was actually asked | copy, never paraphrase; runtime truncates INPUT to 500 chars before assembly (MP-03) |
| `canonical_question` | self-contained, <= 25 words: every word or phrase whose meaning depends on earlier context (this, that, it, they, them, these, those, ones, there, "the other one") is replaced by what it refers to; relative "that" ("a poison that blocks") is fine | reuse matching fails on pronouns | engine MUST resolve references using PATH and ANCHOR; if unclear, `low_confidence` |
| `intent` | enum: clarify, deepen, example, apply, connect, contrast, challenge, tangent; `null` for objective nodes | wrong content shape | enum |
| `summary` | 1-3 bullets, <= 60 words total, plain text | EdDAX stored model refusals ("Please provide the content you would like summarized") as data | MUST summarize `core`, never the request; empty core -> error, not summary |
| summary in PATH and REGISTRY | a string: the node's `summary` bullets joined with `" "` | two shapes for one field | runtime converts when it builds PATH and the registry |
| `concepts` | ids from OBJECTIVE.concepts or CONCEPTS only | broken competency joins | unknown concepts go to `new_concepts` |
| `new_concepts` | `[{"id": kebab slug not already in CONCEPTS, "name", "description": one sentence}]` | branch quiz (MP-06) cannot name the concept | MP-09 `review` checks the slug |
| `bloom_level` | one of six | tutor mis-targets | enum |
| `scope` | in_scope, adjacent, out_of_scope (MP-05 STEP 2) | off-topic assets pollute course | `scope_policy` decides whether out_of_scope nodes may exist |
| `reuse` | `{decision in new, extend; of; confidence 0-1 (equals the MP-05 output confidence); rationale}`; `of` = the covering id for extend, else null; `null` for objective nodes | duplicate assets, or pointer to nothing | `of` MUST be copied from REGISTRY or PATH |
| `links` | array of `{id, relation}` objects; `id` from REGISTRY or PATH, never `trail`; `relation` one of extend, reuse, redirect | dangling edges | same |
| `core` | audience-neutral; suitable for the youngest band in `COURSE.audience.intended_bands` (13-15 if absent) | personalization or mature detail leaks into a shared asset | engine writes core at a neutral register; interests only in rendering |
| `core.sections[]` | `{id: s1..sn, heading, body_md, check?}`; optional `check` = `{question, answer}` (MP-04) | UI cannot anchor follow-ups | ids immutable once shared |
| `core.bridge_to_objective` | string, always present; required and concrete at depth >= 4, else may be `""` | deep branches drift away from the course | MP-05 STEP 4 |
| `seeds` | exactly 3 questions, <= 20 words each, not already answered in PATH, in this node, or in a REGISTRY summary | infinite loops of the same question | engine checks PATH |
| `created_by` | a learner pseudonym (`lrn-...`), CONFIG.author_id, `"author"` or `"anonymous"`; never an email or real name | identity leak | pattern |
| `visibility` | private, pending_review, shared | minors' content published unreviewed; private questions published | engine sets per policy + learner age band (MP-05 STEP 4); storage location above |
| `path` | array of `{id, title, summary}` for every ancestor root to parent, in order, copied from the PATH block the engine received (a `trail` entry copied as is); empty for depth-1 nodes | node is not self-describing; a client cannot rebuild PATH from the node file | MP-05 copies it from PATH; it MUST equal the PATH received (MP-05 contract 12) |
| `created_at`, `updated_at` | RFC 3339 UTC strings; the model writes `"runtime"` (law 8, K-15) | model-invented timestamps drift and cannot order records | `tools/stamp.js` fills them |
| `content_sha256` | hex sha256 of the JSON Canonicalization Scheme (RFC 8785) serialisation of the `core` object; the model writes `"runtime"` | no stable version key for dedup or the companion | `tools/stamp.js` computes it |
| `superseded_by` | node id or null | edits delete history; lineage is lost | MP-09 `dedupe` sets it instead of deleting |
| `alias_of` (optional, set only by MP-09) | id of the canonical node this one duplicates | duplicates compete for reuse; learners land on the weaker copy | readers redirect to `alias_of`; the node's directory and children stay (ids are paths, never re-parent) |

---

## 3b. Provenance -- `nodes/<id>/provenance.json` (additive, companion- and Constraint-Protocol-compatible)

Written only by `tools/stamp.js`, never by the model. One file per node, beside `node.json`.

```json
{
  "schema": "metadax.provenance/0.2",
  "node_id": "L03.M02.O01/proteins-essential-atp-synthesis",
  "content_hash": "runtime",
  "created_by": { "id": "lrn-7qk2x9", "key_id": null, "chain_role": "learner" },
  "lineage": [ { "node_id": "L03.M02.O01", "relation": "parent" } ],
  "constraints": { "constraint_decl_ref": null },
  "spec_version": "0.2",
  "ts": "runtime"
}
```

- `content_hash` is the same value as `node.content_sha256` (section 3), computed by `tools/stamp.js`.
- `created_by.chain_role` is one of `author, learner, curator, client`. `key_id` is `null` in Phase 1.
- `lineage[]` entries have `node_id` and `relation` (one of `parent, reuse, extend, redirect`); the `parent` entry is always present for a non-objective node.
- `constraints.constraint_decl_ref` is `null` in Phase 1. `key_id` and `constraint_decl_ref` are reserved for the Constraint Protocol and are never described as live.
- `ts` is written `"runtime"` (law 8).

---

## 4. Registry -- `registry/index.json` + `registry/<module-id>.json` (replaces the single `nodes/index.json`; EdDAX never used its Azure AI Search `qna-index` for reuse)

The single `nodes/index.json` is replaced by an index plus one file per module.

`registry/index.json`:
```json
{
  "schema": "metadax.registry-index/0.2",
  "course_id": "cell-biology-101",
  "updated_at": "runtime",
  "modules": [
    { "id": "L03.M02", "file": "registry/L03.M02.json", "node_count": 12, "updated_at": "runtime" }
  ]
}
```

`registry/<module-id>.json` (the v0.1 registry shape, now per module):
```json
{
  "schema": "metadax.registry/0.2",
  "course_id": "cell-biology-101",
  "module_id": "L03.M02",
  "updated_at": "runtime",
  "nodes": [
    {
      "id": "L03.M02.O01/proteins-essential-atp-synthesis",
      "parent_id": "L03.M02.O01",
      "title": "Proteins essential for ATP synthesis",
      "canonical_question": "Which proteins are essential for ATP synthesis in the mitochondrion?",
      "intent": "deepen",
      "summary": "ATP synthase (Complex V) has a rotor (F0) and a catalytic head (F1). Complexes I-IV build the proton gradient that drives it.",
      "concepts": ["atp-synthesis", "electron-transport-chain"],
      "depth": 2,
      "visibility": "shared",
      "created_by": "lrn-7qk2x9",
      "superseded_by": null,
      "reuse_count": 4
    }
  ]
}
```

Each `nodes[]` entry: `id`, `parent_id`, `title`, `canonical_question`, `intent`, `summary` (the node's bullets joined with `" "`), `concepts`, `depth`, `visibility`, `created_by`, `superseded_by`, `reuse_count`. A registry file lists only `shared` and `pending_review` nodes; `private` nodes are never in it. Objective nodes are registry entries too (`parent_id` null, `intent` null, `canonical_question` may be empty).

Rule: a node belongs to the registry file of the module its id starts with (`L03.M02.O01/...` -> `registry/L03.M02.json`). Reason: two learners committing follow-ups in different modules never touch the same file, so git merges cleanly. MP-05 and MP-09 receive the REGISTRY block exactly as before (children of parent + course-wide candidates); how the client builds that block from the per-module files is the client's job (MP-03 describes it: read the parent's module file fully, then the index, then up to 12 candidates from other modules by lexical overlap with INPUT).

The REGISTRY block handed to MP-05 contains (a) **all children of the parent** and (b) **top-k course-wide candidates** (k <= 12), each with the fields above except `reuse_count`. In pure-prompt mode on a small course, (b) MAY be the whole registry. A runtime SHOULD pre-select (b) by lexical or embedding similarity to the learner's question; the engine makes the decision, the retriever only narrows the field. A runtime MAY add the requesting learner's own `private` nodes (from `learners/<learner-id>/nodes/`) to that learner's REGISTRY block. MP-05 reuses only entries that are `shared` or were created by the requesting learner.

---

## 5. Learner profile -- `learners/<learner-id>/profile.json` (NEW; EdDAX had no learner model)

```json
{
  "schema": "metadax.learner/0.2",
  "learner_id": "lrn-7qk2x9",
  "display_name": "Sam",
  "age_band": "10-12",
  "reading_level": "grade-5",
  "languages": ["en"],
  "goals": ["Pass the unit test", "Understand fractions for baseball stats"],
  "interests": ["baseball"],
  "prior_knowledge": { "fractions-basics": "some", "multiplying-fractions": "none" },
  "supports": ["short_chunks", "frequent_checks", "visual_structure"],
  "avoid": ["mnemonic-only explanations"],
  "session": { "minutes": 20, "output_mode": "markdown" },
  "tone": "encouraging, playful",
  "consent": { "share_my_questions": false, "guardian_managed": true, "share_progress_with_mentor": false },
  "created_at": "runtime",
  "updated_at": "runtime"
}
```

Rules:
- MUST NOT contain email, full name, school, address, diagnosis, or health data. `supports` holds accommodations only.
- `learner_id`: created by MP-01 (`lrn-` + 8 random lowercase letters or digits) unless CONFIG.learner_id supplies one; never derived from a name, email or school.
- `age_band` is one of `4-6, 7-9, 10-12, 13-15, 16-18, adult, unknown`. **Minor bands: 4-6, 7-9, 10-12, 13-15, 16-18.** For visibility decisions, `unknown` and a missing LEARNER (`"none"`) are treated as minor.
- `reading_level` is one of `plain-language` (default), `grade-1` ... `grade-12`, `adult`.
- `languages` are BCP 47 tags (`en`, `pt-BR`).
- `consent`: `share_my_questions` (default false), `guardian_managed`, `share_progress_with_mentor` (default false). When `guardian_managed` is true, only the guardian may change consent fields (MP-01 `update`).
- `supports` uses the vocabulary below. Other snake_case values MAY be added; engines ignore values they do not know. Each value has one defined behaviour (MP-04 `render`, MP-05 STEP 6):

| Support | Behaviour in learner-facing text |
|---|---|
| `short_chunks` | paragraphs of 3 sentences or fewer, one idea each |
| `frequent_checks` | a quick check question (after each section in MP-04; one per rendering in MP-05) |
| `visual_structure` | headings, lists, and a small table where it clarifies |
| `read_aloud_friendly` | no symbol without its spoken form; no tables |
| `extra_examples` | one extra worked example per section |
| `step_by_step` | numbered steps for every procedure |
| `minimal_text` | at most 120 words per section; keep facts as bullets |
| `larger_steps_ok` | sections may be merged |
| `low_distraction` | no emoji or decorative emphasis; at most one bold term per paragraph |
| `plain_language` | sentences of 15 words or fewer; define every term |
| `extended_time` | no change to the text |

**What-if-wrong (profile)**
| Field | If wrong | Guard |
|---|---|---|
| `age_band` too high | unsafe or unreadable content for a child | `unknown` defaults to minor rules |
| `interests` copied into shared `core` | one learner's life becomes public course text | interests are used only in renderings |
| `supports` contains a diagnosis | sensitive data in a git repo | MP-01 converts conditions into accommodations and discards the label |
| `consent.share_my_questions` ignored | learner's words published | visibility = private when false |

---

## 6. Progress snapshots, sessions, turns, manifests (the learner repo's append-only records; replaces the dummy xAPI path)

A learner repo holds one learner; its root is the learner directory, so `learners/<learner-id>/` in this document means the repo root.

The learner repo keeps four families of records. Nothing here is edited in place: a new state is always a new file.

**Progress snapshots** -- `learners/<learner-id>/progress/<course-id>/<device-id>/<YYYY-MM-DD>.json`: one file per device per day, the full progress object below plus `device_id` and `snapshot_date`. The latest date across devices is the current state; MP-08 merges when two devices disagree (max competency per concept, union of levels with the better status winning, union of `followups_asked`), and its output is a new snapshot, never an edit of an old one. A device id is `dev-` + 6 lowercase letters or digits, chosen by the client once and kept in `metadax.config.json`.

```json
{
  "schema": "metadax.progress/0.2",
  "learner_id": "lrn-7qk2x9",
  "course_id": "cell-biology-101",
  "device_id": "dev-a1b2c3",
  "snapshot_date": "2026-09-27",
  "updated_at": "runtime",
  "concepts": {
    "atp-synthesis": {
      "competency": 58,
      "levels": {
        "Remember":   "passed_first_try",
        "Understand": "passed_after_help",
        "Apply":      "passed_first_try",
        "Analyze":    "not_started",
        "Evaluate":   "not_started",
        "Create":     "not_started"
      },
      "misconceptions_seen": ["ATP is stored long-term"],
      "last_seen": "runtime"
    }
  },
  "objectives": { "L03.M02.O01": "in_progress" },
  "followups_asked": ["L03.M02.O01/proteins-essential-atp-synthesis"],
  "next_steps": [ { "type": "continue", "id": "atp-synthesis", "level": "Analyze", "node_id": "L03.M02.O01", "why": "Apply passed; Analyze (the bloom_target) untested." } ]
}
```

Level status enum: `not_started, passed_first_try, passed_after_help, failed, skipped`. Levels are flat strings here and in the tutor state (section 7).
Objective status enum: `not_started, in_progress, mastered` (mastered = every concept of the objective is mastered; in_progress = any evidence or view).
`next_steps[]`: `{type, id, level?, node_id?, section_ids?, why}`; `type` in `review, continue, advance, consolidate, explore` (MP-08).

**Competency formula (normative; fixes the EdDAX prompt, whose +20 per level over six levels summed to 120%).**
- Level weights: Remember 10, Understand 15, Apply 20, Analyze 20, Evaluate 15, Create 20 (sum = 100).
- `passed_first_try` = full weight; `passed_after_help` = half weight (a hint, "why", the 2nd or 3rd attempt, or a remedial question); `failed`, `skipped` and `not_started` = 0. Half weights are kept exact (7.5).
- T = the sum of the weights of the levels from Remember up to the concept's `bloom_target`: Remember 10, Understand 25, Apply 45, Analyze 65, Evaluate 80, Create 100.
- Competency = round-half-up(100 x earned / T), capped at 100, where earned counts only levels up to `bloom_target`. Round once, at the end.
- Levels above `bloom_target` are **stretch levels**: they are recorded but not counted, and never block progress.
- **Mastery** = every level up to `bloom_target` passed (first try or after help) **and** competency >= 70.
- A **prerequisite is satisfied** at competency >= 50.

Worked:
- The example above: `bloom_target` Analyze, T = 65; earned 10 + 7.5 + 20 = 37.5; 100 x 37.5 / 65 = 57.7 -> **58**. Not mastered (Analyze untested).
- `bloom_target` Understand, T = 25: Remember first try + Understand after help = 17.5 -> **70**, mastered. Both after help = 12.5 -> **50**: not mastered, but it satisfies a prerequisite.
- Round half up: `bloom_target` Evaluate, T = 80, only Remember passed first try: 100 x 10 / 80 = 12.5 -> **13**.

**Session events** -- `learners/<learner-id>/sessions/<session-id>/event-<seq:04d>.json`, one file per event, never edited. `session-id` is `ses-` + `<YYYYMMDD>` + `-` + 4 lowercase letters or digits. These are the input to MP-08 SESSION; `seq` orders events ("after" means a higher `seq`).

```json
{
  "schema": "metadax.event/0.2",
  "session_id": "ses-20260927-9xk2",
  "seq": 12,
  "ts": "runtime",
  "type": "follow_up",
  "course_id": "cell-biology-101",
  "node_id": "L03.M02.O01/proteins-essential-atp-synthesis",
  "concept": "atp-synthesis",
  "bloom_level": "Understand",
  "result": null,
  "data": {}
}
```

`type` is one of `follow_up, answer, hint, skip, summary, handoff, return, note, view, practice`. `view` logs that a learner opened a node; `practice` logs one graded quiz item. `data` carries type-specific fields the client chooses to keep.

**Tutor turns** -- `learners/<learner-id>/sessions/<session-id>/turn-<seq:04d>.json`: the full MP-06 turn envelope (section 7), one file per turn, never edited.

**Weekly manifest** -- `learners/<learner-id>/manifests/<YYYY>-W<WW>.json`:

```json
{
  "schema": "metadax.manifest/0.2",
  "learner_id": "lrn-7qk2x9",
  "week": "2026-W39",
  "device_id": "dev-a1b2c3",
  "files": [ { "path": "sessions/ses-20260927-9xk2/turn-0001.json", "sha256": "runtime", "bytes": 0 } ],
  "bytes_total": 0,
  "ts": "runtime"
}
```

Written by `tools/stamp.js manifest`; soft cap 600 KB per week (warn, do not refuse).

MP-08 reads PROGRESS as the latest snapshot per device and SESSION as the event files; its output is a new snapshot object, never an edit of an old one. MP-11 RECORDS (a records/export operation) is deferred to v0.3; do not write it.

---

## 7. Tutor turn envelope (MP-06 output, every turn)

```json
{
  "schema": "metadax.tutor-turn/0.2",
  "type": "intro | question | feedback | handoff | summary | error",
  "display": {
    "message": "markdown shown to the learner",
    "instructions": "markdown (question turns)",
    "example": "markdown (question turns; unrelated to the real question)",
    "question": "markdown (question turns)",
    "options": ["A ...", "B ..."]
  },
  "meta": { "concept": "atp-synthesis", "bloom_level": "Apply", "question_type": "Numeric/Calculation", "attempt": 1 },
  "feedback": { "result": "correct | partial | incorrect | null", "hint": "", "correct_answer": "", "explanation": "", "misconception": "" },
  "handoff": { "to": "MP-05", "node_id": "L03.M02.O01", "section_id": "s3", "anchor_quote": "", "learner_question": "" },
  "summary": { "concepts": [], "strengths": [], "areas_for_improvement": [], "misconceptions": [], "recommendations": [], "encouragement": "" },
  "state": {
    "concept_order": ["atp-synthesis", "electron-transport-chain"],
    "concept": "atp-synthesis",
    "level": "Apply",
    "attempt": 1,
    "help_used": false,
    "hints_given": 0,
    "phase": "main",
    "levels": { "atp-synthesis": { "Remember": "passed_first_try", "Understand": "passed_after_help" } },
    "competency": { "atp-synthesis": 27, "electron-transport-chain": 0 }
  },
  "next_action": "awaiting_answer | awaiting_command | done",
  "warnings": []
}
```

Rules:
- `state` is emitted on **every** turn, including error turns, so any runtime, or a human copying the last JSON, can persist or resume. It is the checkpoint EdDAX never had (its competency lived only inside a rendered chat stream).
- `meta` describes the question on screen; `meta.attempt` and `state.attempt` are the attempt the learner is about to make. A feedback turn that asks the next question uses `meta` for the NEW question.
- `feedback.result` is `null` on turns that answer a `hint` or `why` command (type `feedback`). An intro that also asks the first question has type `intro`.
- `state.help_used` (bool), `state.hints_given` (0, 1 or 2) and `state.phase` (`main` or `remedial`) make a resume exact: a level with `help_used` true earns at most half weight; in phase `remedial` the next answer decides `passed_after_help` or `failed`.
- `handoff`: `node_id` and `section_id` name the CONTENT section the question was built from; `anchor_quote` is at most 200 characters copied from that section (never the personalized question text); `learner_question` is INPUT exactly as typed, without the leading `ask:`.
- The example's competency: `bloom_target` Analyze (T = 65), earned 10 + 7.5 = 17.5 -> 26.9 -> 27 (section 6).

**`question_type` enum** (the exact spellings MP-06 uses; the runtime and MP-07 branch on `grading`, never on the type name):
`True/False`, `Multiple Choice`, `Matching`, `Fill-in-the-Blanks`, `Binary Choice`, `Short Answer (explain in own words)`, `Categorization`, `Cloze`, `Numeric/Calculation`, `Short Answer (practical use)`, `Completion`, `Short Problem-Solving`, `Ordering/Sequencing`, `Assertion-Reason`, `Ranking`, `Short Answer (analytical)`, `Short Answer (critical judgement)`, `Short Essay (1 paragraph)`, `Ranking with justification`, `Essay or Design`, `Open-Ended Completion`.

**Practice item** (MP-06 `practice_set`; the CONTENT of MP-07):
```json
{
  "id": "L03.M02.O01#p01",
  "concept": "atp-synthesis",
  "bloom_level": "Remember",
  "question_type": "Multiple Choice",
  "grading": "exact | rubric",
  "question": "markdown",
  "options": ["A) ...", "B) ..."],
  "answer": "the exact answer (exact) or a model answer (rubric)",
  "accept": ["equivalent answers (exact only)"],
  "rubric": ["criteria (rubric only)"],
  "hints": ["subtle", "moderate", "direct"],
  "bonus": ["1 or 2 deeper insights beyond the answer"],
  "explanation": "markdown"
}
```
`grading` is `exact` when a single correct answer (plus `accept` variants) exists; otherwise `rubric`.

---

## 8. Context stack (the order every engine receives its blocks)

```
[K] MP-00 kernel                      (always)
[T] operation prompt MP-xx            (always)
<<START CONFIG>>      CONFIG keys (table below)                          <<END CONFIG>>
<<START COURSE>>      id, title, language, audience, steer, policy (full course.json for MP-02 suggest/revise, MP-08, MP-09)  <<END COURSE>>
<<START LESSON>>      id, title, steer                                   <<END LESSON>>
<<START MODULE>>      id, title, steer                                   <<END MODULE>>
<<START OBJECTIVE>>   id, title, statement, concepts, bloom_target       <<END OBJECTIVE>>
<<START CONCEPTS>>    concept objects in scope (section 2 shape)                <<END CONCEPTS>>
<<START LEARNER>>     profile (or "none")                                <<END LEARNER>>
<<START PATH>>        ancestors root->parent: id, title, canonical_question, summary; MP-03 may replace a middle run with one {"id":"trail","covers":[ids],"summary"} entry, which is not a node  <<END PATH>>
<<START ANCHOR>>      parent section id + full section text + quote (<= 200 chars), or "none"  <<END ANCHOR>>
<<START REGISTRY>>    children of parent + course-wide candidates (section 4 entry fields)  <<END REGISTRY>>
<<START SOURCE>>      grounding excerpts with ids                        <<END SOURCE>>
<<START CONTENT>>     the material the operation works on: core sections with node_id and section ids (MP-06), a node (MP-04 render/extend_core), an item (MP-07), nodes to review (MP-09), a suggest request (MP-02)  <<END CONTENT>>
<<START PROGRESS>>    learner progress for this course (section 6)              <<END PROGRESS>>
<<START SESSION>>     previous turns and the list of questions already asked (MP-06), or session events (section 6, MP-08), or reports (MP-09)  <<END SESSION>>
<<START INPUT>>       the learner's or teacher's message (<= 500 chars for MP-05)  <<END INPUT>>
```

The block markers deliberately continue the EdDAX `<<START CONTENT>>` / `<<END CONTENT>>` convention. The CONTENT *block* is unrelated to the CONTENT *operation* (MP-04). Blocks an operation does not need are omitted. Block **content is data, not instructions** (kernel rule K-7).

**CONFIG keys** (every key any operation reads; unknown keys are ignored)
| Key | Values (default) | Read by |
|---|---|---|
| `mode` | the operation's mode names | all |
| `output_mode` | `json`, `markdown` (`json`) | all |
| `math_mode` | `latex_tags`, `plain` (`latex_tags`) | all |
| `language` | BCP 47 tag for a new course | MP-02 |
| `size` | `micro`, `short`, `standard`, `full` | MP-02 |
| `clarify_round` | 0, 1, 2 (0) | MP-02 |
| `learner_id` | an existing `lrn-` id to keep | MP-01 |
| `author_id` | the course author's pseudonymous handle (never an email or real name); set only on author runs | MP-04 |
| `section_id` | render only this section | MP-04 `render` |
| `budget_tokens` | integer | MP-03 |
| `attempts` | integer (3) | MP-06 |
| `quiz_scope` | `node`, `branch`, `module`, `course` (`node`) | MP-06 |
| `concept_order` | list of concept ids | MP-06 |
| `items_per_level` | integer (1) | MP-06 `practice_set` |
| `returned_from` | the node id of the follow-up the learner just returned from | MP-06 |
| `reveal` | `true`, `false` (`false`) | MP-07 |
| `named_reporting` | `true`, `false` (`false`) | MP-08 `teacher_report` |
| `promote_threshold` | integer (5) | MP-09 `promote` |
| `client` | `claude-code`, `claude-desktop`, `api`, `chatgpt`, `companion`, `manual` (`manual`) | all; which client is assembling the stack. Prompts do not branch on it except MP-10, which mentions it in its first message |
| `write_mode` | `git`, `packet`, `none` (`packet`) | all; `git`: the client writes files itself; `packet`: the model ends every file-producing output with a COMMIT PACKET (section 10); `none`: nothing is persisted (read-only session) |

`scope_policy`, `max_depth` and `visibility_default` are NOT CONFIG keys: engines read `COURSE.steer.scope_policy`, `COURSE.steer.max_depth` and `COURSE.policy`.

**Common output keys.** Every JSON output MAY carry `"warnings": [...]` (K-14) and `"missing": [...]` (K-2). An error output is `{"type": "error", "missing": [...], "message": "..."}`, plus `state` for TUTOR.

**Warning codes** (closed list, K-14)
| Code | Emitted when |
|---|---|
| `steer_conflict` | a narrower steer contradicts a broader one (K-4) |
| `audience_conflict` | the learner profile contradicts audience wording in a steer (K-5) |
| `out_of_scope` | the question is outside `COURSE.steer.focus` (MP-05) |
| `depth_limit` | a new node is deeper than `max_depth` (MP-05) |
| `low_confidence` | the engine had to guess (for example an unclear referent, MP-05) |
| `source_gap` | SOURCE does not support what was asked (K-8) |
| `wellbeing_flag` | a learner disclosed distress, danger or self-harm (K-12) |
| `missing_input` | a required block or id is missing (K-2, K-3) |
| `orphans_followups` | a revise op removes a lesson or module that has follow-up nodes (MP-02) |
| `budget_unmet` | compression could not reach `budget_tokens` without dropping a protected item (MP-03) |

---

## 9. Operation outputs and enums (index)

Every response `type` and enum value used in MP-00 to MP-10, in one place. The operation prompt gives the full shape.

| Operation / mode | Response `type` | Top-level keys |
|---|---|---|
| any | `error` | `missing`, `message` (+ `state` for TUTOR) |
| MP-01 `interview`, `diagnostic` | `profile_question` | `display.message`, `draft` |
| MP-01 `interview`, `from_description`, `update` | `profile` | `profile` (section 5); `discarded`, `assumptions`, `missing`, `warnings` (from_description); `applied`, `declined` (update) |
| MP-01 `diagnostic` (end) | `profile_patch` | `prior_knowledge` |
| MP-02 `design` | `clarify` | `questions`, `draft` |
| MP-02 `design`, `quick` | `course` | `course` (section 2), `assumptions`, `warnings` |
| MP-02 `suggest` | `suggestions` | `level`, `parent_id`, `items`, `new_concepts` (full section 2 concept objects) |
| MP-02 `revise` | `patch` | `ops[]` = `{op: add \| update \| remove \| move, id, field?, value?, after?}`, `warnings` |
| MP-03 `compress` | `compiled` | `blocks`, `dropped`, `warnings` |
| MP-04 `generate` | `node` | `node` (section 3), `rendering_md`, `audience_key`, `personalized_with`, `warnings` |
| MP-04 `render` | `rendering` | `node_id`, `audience_key`, `rendering_md`, `personalized_with`, `warnings` |
| MP-04 `extend_core` | `core_patch` | `node_id`, `add_section`, `summary?`, `key_points?`, `warnings` |
| MP-05 `ask` | `followup` | `decision`, `target_id`, `confidence`, `resolved`, `node`, `seeds`, `rendering_md`, `options`, `warnings` |
| MP-05 `zoom_out` | `zoom_out` | `rendering_md`, `options[]` = `{label, action, target_id, question}` |
| MP-06 `quiz` | `intro`, `question`, `feedback`, `handoff`, `summary` | section 7 envelope |
| MP-06 `practice_set` | `practice_set` | `items` (section 7 practice item), `warnings` |
| MP-07 | `evaluation` | `score`, `result`, `criteria`, `bonus_points`, `misconception`, `feedback_md`, `next_hint`, `warnings` |
| MP-08 `next_step` | `progress_update` | `progress` (section 6, including `next_steps`), `profile_suggestions` (strings starting "observed:"), `mentor_note`, `warnings` |
| MP-08 `teacher_report` | `teacher_report` | `concepts`, `misconceptions`, `gap_signals`, `interventions` |
| MP-09 `review`, `dedupe`, `promote`, `audit_course` | `curation` | `ops[]` = `{op, id, target?, field?, value?, reason}`, `warnings` |
| MP-09 `verify_rendering` | `verification` | `ok`, `issues` |

Persisted file objects (not operation outputs; written by the client or `tools/stamp.js`): `metadax.course/0.2` (section 2), `metadax.node/0.2` (section 3), `metadax.provenance/0.2` (section 3b), `metadax.registry-index/0.2` and `metadax.registry/0.2` (section 4), `metadax.learner/0.2` (section 5), `metadax.progress/0.2`, `metadax.event/0.2`, `metadax.manifest/0.2` (section 6), `metadax.tutor-turn/0.2` (section 7), `metadax.packet/0.2` (section 10). When `CONFIG.write_mode` = `packet`, any file-producing operation also emits a COMMIT PACKET (section 10) after its normal output.

| Enum | Values |
|---|---|
| Bloom level | Remember, Understand, Apply, Analyze, Evaluate, Create |
| node `kind` | objective, followup |
| `intent` | clarify, deepen, example, apply, connect, contrast, challenge, tangent (null for objectives) |
| `scope` | in_scope, adjacent, out_of_scope |
| `visibility` | private, pending_review, shared |
| MP-05 `decision` | new, extend, reuse, ancestor, redirect (null for zoom_out and error) |
| MP-05 option `action` | open, ask, quiz_branch |
| `steer.depth` | introductory, intermediate, advanced, expert |
| `source_policy` | source_only, source_first, open |
| `scope_policy` | strict, tangents_allowed |
| `policy.learner_nodes` | pending_review (default), shared |
| `policy.minor_nodes` | pending_review |
| `age_band` | 4-6, 7-9, 10-12, 13-15, 16-18, adult, unknown (section 5) |
| `reading_level` | plain-language, grade-1 ... grade-12, adult (section 5) |
| `supports` | section 5 vocabulary |
| level status | not_started, passed_first_try, passed_after_help, failed, skipped |
| objective status | not_started, in_progress, mastered |
| `next_steps[].type` | review, continue, advance, consolidate, explore |
| session event `type` | follow_up, answer, hint, skip, summary, handoff, return, note, view, practice (section 6) |
| `write_mode` | git, packet, none (section 8) |
| `client` | claude-code, claude-desktop, api, chatgpt, companion, manual (section 8) |
| packet `op` | create, update, append (section 10) |
| packet `repo` | course, learner (section 10) |
| provenance `chain_role` | author, learner, curator, client (section 3b) |
| provenance `lineage.relation` | parent, reuse, extend, redirect (section 3b) |
| `question_type` | section 7 enum |
| `personalized_with` | interests, reading_level, supports, language, tone |
| tutor `next_action` | awaiting_answer, awaiting_command, done |
| tutor `state.phase` | main, remedial |
| `feedback.result` (MP-06) | correct, partial, incorrect, null |
| `grading` | exact, rubric |
| MP-07 `result` | correct, partial, incorrect |
| MP-07 criterion `status` | met, partly, not_met |
| `prior_knowledge` value | none, some, solid |
| MP-09 `op` | accept, merge_into, relink, edit_field, set_visibility, reject, add_core_section, promote_objective, course_patch (value = one MP-02 revise op) |

---

## 10. Commit packet -- `write_mode = packet`

When `CONFIG.write_mode` is `packet`, every operation output that produces files ends with a fenced block after its normal output:

```text
<<START COMMIT PACKET>>
{ "schema":"metadax.packet/0.2", "repo": "course | learner", "message": "<one line>", "files": [ { "path": "nodes/L01.M01.O01/proteins-essential-atp-synthesis/node.json", "op": "create | update | append", "content": <the JSON object> } ] }
<<END COMMIT PACKET>>
```

- `repo` is `course` or `learner`. `message` is one line.
- Each `files[]` entry: `path` (repo-relative), `op` (`create`, `update` or `append`), `content` (the JSON object being written).
- `op: "create"` MUST fail if the path already exists (no overwrite; MP-05 contract 8).
- The client (Claude Code skill, a human in Claude Desktop, or `tools/apply_packet.js`) applies the packet, then stamps (law 8). In `git` mode the model outputs the same objects but the skill writes them directly; MP-xx bodies describe outputs as "the record" and never assume one write mode.
