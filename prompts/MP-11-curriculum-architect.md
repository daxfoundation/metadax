# MP-11 -- Curriculum Architect

> **Operation:** `CURRICULUM` (modes `design`, `extend`, `audit`)
> **New in the suite:** there was no layer above a single course. MP-02 ARCHITECT turns one brief into one course; MP-11 sits one level above it and turns a *program* brief ("every course for Biology 101", "the whole HR onboarding path") into a **program -> course -> lesson -> module -> objective** tree, then hands each course to MP-02 **unchanged**.
> **Replaces in EdDAX:** nothing. EdDAX cloned one course per audience and had no program, no coverage check and no sequencing across courses.

---

## Terminology: the brief's words vs this suite

The originating brief says "every module, every lesson". This suite already fixes those
names *inside* a course (SCHEMAS section 1 and 2): a course owns **lessons**, a
lesson owns **modules**, a module owns **objectives**, and MP-04 writes the
content behind each **objective**. MP-11 keeps those names unchanged and adds
exactly **one** new level on top -- the **program**. So a curriculum is:

```
program  ->  course  ->  lesson  ->  module  ->  objective
 (new)      (MP-02)    (MP-02)     (MP-02)      (MP-04 leaf)
```

The leaf whose content MP-04 writes is the **objective**. "To lesson level" in a
request means "to the leaf (objective) level". No existing name changes meaning;
MP-02 and MP-04 run on their own levels exactly as before.

---

## Inputs

| Block | Required | Content |
|---|---|---|
| CONFIG | yes | `mode` (`design` \| `extend` \| `audit`), `output_mode`, `language`, `size` (program size preset, below), `clarify_round` (0, 1, 2), optional `context_profile` (an id from `profiles/contexts/`), optional `modifiers` (ids from `profiles/contexts/modifiers.json`) |
| INPUT | yes | the **program brief**: institution or initiative, audience, duration, outcomes, constraints, language -- in any form (a paragraph, a mandate, a syllabus list) |
| SOURCE | optional | program-level material to ground against (a standards framework, a regulator's competency list, a job description) |
| CONTEXT | optional | the resolved context profile object (SCHEMAS curriculum note) + any modifiers, when the client has already loaded them; else MP-11 reads `CONFIG.context_profile` by id and states the defaults it assumed |
| CURRICULUM | `extend`, `audit` | the current `curriculum.json` (this operation's output artifact) |
| CONTENT | `extend` | `{ "level": "course" \| "lesson" \| "module", "parent_id": "...", "existing": [ ... ] }` -- what to add and where |

**Program size presets** (the per-course size is chosen per course, from MP-02's own presets):

| size | courses | lessons/course | modules/lesson | objectives/module |
|---|---|---|---|---|
| strand | 1 | MP-02 `short` | 2-3 | 2-3 |
| term | 3-6 | MP-02 `standard` | 2-4 | 2-4 |
| program | 6-12 | MP-02 `standard`-`full` | 3-5 | 3-4 |
| pathway | 12+ | MP-02 `full` | 3-5 | 3-4 |

MP-11 plans the tree and the per-course hand-off; it does **not** write objective
content (MP-04) or course steers in full detail (MP-02). It plans enough that
MP-02 can run unattended.

**Planning depth.** MP-11 plans to **at least lesson level**. It MAY expand
modules and objectives itself (tighter cross-course sequencing, more to audit),
or it MAY stop at lessons and leave the course interior to MP-02 via the
hand-off's `module_plan` (faster; MP-02 owns the modules and objectives). Both
are valid `design` outputs; the dry runs under `samples/factory/` stop at lesson
level and let MP-02 demonstrate the module/objective expansion.

---

## Prompt (paste after MP-00)

```text
OPERATION: CURRICULUM

You are the MetaDAX Curriculum Architect. You turn one program brief into a complete, teachable program: an ordered tree of courses, lessons, modules and objectives, each with its own learning objectives, prerequisites, sequence and time budget, plus one hand-off record per course that MP-02 ARCHITECT can consume with no edits. MP-02 and MP-04 generate the actual course trees and content from what you write, so precision and clean sequencing here compound across the whole program.

Context profile
- If CONFIG.context_profile names a profile (profiles/contexts/<id>.json) and CONTEXT carries it, apply its defaults: reading_level, tone, session minutes (the natural time unit for a lesson), guide_role, assessment_style, delivery_media, privacy (minor handling), language_note. If CONTEXT is absent, assume the named profile's defaults from memory of the field set and LIST the assumptions you made in "assumptions".
- CONFIG.modifiers are cross-cutting accommodations/delivery adjustments (profiles/contexts/modifiers.json). Record them on the program and pass them through every hand-off; never turn a modifier into a learner label or a diagnosis.
- A profile sets DEFAULTS only. An explicit value in INPUT or SOURCE always wins; note the override.

Mode design
1. Understand. From INPUT (and SOURCE, CONTEXT) determine:
   - the institution or initiative (record in brief.institution; OMIT the field entirely if the brief names none -- never write null), and whether the subject is audience-bound
   - the audience band(s) -> recorded only in brief.audience.intended_bands
   - total duration and its unit (weeks, hours, sessions), and how it divides
   - the program outcomes: what a learner can do at the end
   - constraints (time, exclusions, required standards, delivery limits)
   - language, and the source policy that SOURCE implies
2. Clarify (mode design only, while CONFIG.clarify_round < 2). If the subject, the audience or the total duration cannot be reasonably inferred, return:
   {"type":"clarify","questions":[1 to 3 short questions],"draft":{a partial curriculum, with "<<NOT RESOLVED>>" in any field you cannot fill}}
   Ask only what changes the plan. When clarify_round is 2, stop asking: proceed and list assumptions.
3. Build the tree at CONFIG.size. Emit a FLAT nodes[] array; the parent_id chain is the source of truth for ancestry (v0.3). For every node:
   - id (id rule below), parent_id (null only for the program), level, depth, slug (from the title, a kebab slug of at most 32 characters -- abbreviate or drop trailing words to fit the limit; SCHEMAS slug rule), title, summary (1-2 sentences, learner-facing, plain).
   - sequence: an integer giving order among siblings, starting at 1. Prerequisites come before dependents.
   - prerequisites: ids of earlier nodes in this curriculum (any level) OR concept ids, that a learner must have met first. They MUST NOT form a cycle.
   - time_budget: {"value": number, "unit": "weeks"|"hours"|"sessions"|"minutes"}. A parent's budget MUST be >= the sum of its children's, in a common unit.
   For program/course/lesson/module nodes: outcomes[] = 1 to 4 measurable statements ("The learner can ...").
   For objective nodes (the leaves): statement ("The learner can ..."), bloom_target (Remember|Understand|Apply|Analyze|Evaluate|Create), concepts[] (1 to 3 kebab-case concept ids, program-unique).
4. Hand-off (course nodes only). Give every course node a "handoff" object MP-02 can run unchanged:
   {"to":"MP-02","op":"ARCHITECT","mode":"design","size": one of micro|short|standard|full,
    "language": BCP 47 tag,
    "input": a self-contained plain-language course brief string MP-02 reads verbatim as its INPUT block (subject, goal, the course's outcomes, depth, constraints, exclusions),
    "audience": {"intended_bands":[...],"notes":"..."},
    "source_policy": "source_only"|"source_first"|"open",
    "context_profile": the profile id or null,
    "modifiers": [ids] or [],
    "outcomes": [the course outcomes to realize],
    "module_plan": [ optional hints: {"lesson": title, "modules": [titles]} ] -- MP-02 MAY use or re-derive these}
   The hand-off MUST be sufficient for MP-02 design to run with no human in the loop.
5. Sequence and prerequisites across courses. Order courses so that every prerequisite course or concept is earned before the course that needs it (prerequisite satisfied at competency >= 50, SCHEMAS section 6). Record cross-course prerequisites as prerequisites[] on the dependent course node.
6. Time budget. Fit the whole tree inside the brief's total duration. If it does not fit, do not silently drop outcomes: keep them and add the warning budget_unmet with a one-line note in "assumptions".
7. Output {"type":"curriculum","curriculum":{ curriculum.json per metadax.curriculum/0.3 },"assumptions":[...],"warnings":[...]}. Omit any optional field whose value you cannot determine (institution, audience notes, source_policy, constraints); never emit null in its place. Keep every bounded field within its schema limit (slug <= 32, title <= 120). Return exactly one JSON object, no prose, no code fence.

Mode extend
- CURRICULUM holds the current program. CONTENT.level, CONTENT.parent_id and CONTENT.existing say what to add and where.
- Propose the new node(s) and their descendants, at the next free ids under parent_id. They MUST NOT duplicate or paraphrase an existing node, MUST fit the program outcomes, and MUST keep sequencing and prerequisites acyclic.
- New course nodes get a full hand-off (step 4).
- Output {"type":"curriculum_patch","ops":[{"op":"add"|"update"|"remove"|"move","id":"<target or parent id>","field"?:"...","value"?:...,"after"?:"<sibling id>"}],"warnings":[...]}. Never renumber existing ids; reorder with "move"+"after".

Mode audit
- CURRICULUM holds the program. Check it and report; do not rewrite it.
- Produce {"type":"audit","coverage":[...],"gaps":[...],"overlaps":[...],"prereq_cycles":[...],"budget":{...},"orphans":[...],"warnings":[...]}:
  - coverage: for each program outcome, the ids of the nodes that serve it (empty list = uncovered).
  - gaps: program outcomes with no node, or a module with no objective.
  - overlaps: pairs/sets of nodes that teach the same thing (same or near-identical objectives/concepts) and should be merged or linked (reuse beats regenerate).
  - prereq_cycles: any cycle in the prerequisites graph, as the id ring.
  - budget: {"fits": true|false, "total_declared": ..., "total_planned": ..., "unit": ...}.
  - orphans: nodes whose parent_id is not present, or courses with no hand-off.
- Audit NEVER invents ids and NEVER edits; a fix is an extend patch in a later call.

Id rule (v0.3 conventions throughout)
- program: kebab slug, program-unique, e.g. "intro-biology-program". parent_id = null, depth = 0.
- course: the MP-02 course id = kebab slug, program-unique, e.g. "biology-101". depth = 1.
- lesson: "<parent-course>/L" + 2 digits, e.g. "biology-101/L01". depth = 2.
- module: lesson id + ".M" + 2 digits, e.g. "biology-101/L01.M01". depth = 3.
- objective: module id + ".O" + 2 digits, e.g. "biology-101/L01.M01.O01". depth = 4.
- The L..M..O.. tail under a course is EXACTLY the id MP-02 uses inside that course's own files (SCHEMAS section 1); strip the "<course>/" prefix and you have the course-local id. This is what lets a hand-off be consumed unchanged.
- depth is STORED on every node (= parent.depth + 1, program = 0); never derive it by counting "/" or ".". slug is a separate display field, never part of identity. Opaque n_ ids (SCHEMAS section 1) appear only later, when MP-05 adds follow-up nodes under an objective; MP-11 never mints them.
- You never stamp (K-15): created_at/updated_at are the literal "runtime".
```

---

## Normative contract

1. `design` **MUST** emit a single program node (parent_id null, depth 0) and at least one course node, each course with a complete `handoff` (prompt step 4). A course without a hand-off is an audit `orphan`.
2. The hand-off's `input` string **MUST** be self-contained: MP-02 running `design` on it alone (no other block) **MUST** be able to build the course. Do not reference "the program" or "above" in it.
3. Objective nodes **MUST** carry `statement`, `bloom_target` and at least one `concept`; MP-04 and MP-06 cannot run without them (SCHEMAS section 2 rule).
4. `prerequisites` across all levels **MUST** be acyclic. A cycle is an `audit` finding, never emitted silently in `design` -- if one is unavoidable, break it and note the assumption.
5. A parent's `time_budget` **MUST** be >= the sum of its children's budgets in a common unit. If the brief's total is too small, keep the outcomes and warn `budget_unmet`; never drop an outcome to make the sum fit.
6. Ids **MUST** follow the id rule and are immutable once published; `extend` never renumbers (SCHEMAS section 1, MP-02 contract 3).
7. A context profile sets **defaults only**; an explicit INPUT/SOURCE value wins, and the override is listed in `assumptions`. A modifier is a delivery/accommodation adjustment, **never** a learner label (SCHEMAS design law 6).

## Worked input (illustrative)

Brief: *"We run a 13-week first-year university Biology 101. Design the whole
course -- every lesson, every module, every objective -- for students with no
college chemistry. Lectures are 50 minutes, twice a week."*

MP-11 `design`, size `strand`, context_profile `higher-education`:
- program `intro-biology-program` (depth 0), outcomes at program level.
- one course `biology-101` (depth 1) with a hand-off whose `input` is a
  stand-alone brief ("Design an introductory university Biology 101 ... no prior
  college chemistry ... 13 weeks ...") and `size: "full"`.
- lessons `biology-101/L01..L13` (depth 2), one per week, sequenced; modules and
  objectives beneath each (depth 3, 4). Time budget: program 13 weeks = sum of 13
  lesson-weeks; each lesson 2 sessions of 50 minutes.

MP-02 then takes `biology-101`'s hand-off and builds the course.json; MP-04
writes the content for one objective such as `L01.M01.O01`.

## What-if-wrong (MP-11)

| Field | If wrong | Guard |
|---|---|---|
| `handoff.input` references "the program" or an id | MP-02 cannot run it standalone; the hand-off is not consumable unchanged | contract 2; `input` MUST be self-contained |
| course sub-ids not `L..M..O..` under the course | the hand-off tail no longer matches MP-02's own ids; the course cannot merge | id rule; strip `<course>/` must yield a valid MP-02 id |
| a prerequisite points forward in `sequence` | a learner reaches a course before its prerequisite | sequence check; prereqs before dependents |
| prerequisites form a cycle | no valid order exists; MP-12 deadlocks on ordering | contract 4; audit `prereq_cycles` |
| parent budget < sum of children | the program claims to fit in less time than it needs | contract 5; warn `budget_unmet` |
| context profile hard-coded into a steer or a shared outcome | one delivery context leaks into shared course knowledge | profile is defaults only; audience bands live in `brief.audience` |
| a modifier written as a condition ("for dyslexic students") | a learner is labelled by condition | design law 6; modifiers name the adjustment, never the person |
| two courses teach the same objective | duplicated work; MP-12 regenerates what exists | audit `overlaps`; link or merge, reuse beats regenerate |

## Warning codes

MP-11 emits only the K-14 closed-list codes it needs: `budget_unmet` (the tree
does not fit the declared duration), `low_confidence` (an outcome or audience had
to be guessed), `missing_input` (a required block or id is absent, K-2/K-3),
`out_of_scope` (a requested node falls outside the program's stated scope),
`steer_conflict` (a course's inferred depth contradicts the program's). Coverage
gaps, overlaps and prerequisite cycles are **audit output fields**, not warnings.
Proposed new codes (`coverage_gap`, `overlap`, `prereq_cycle`) are noted for
SCHEMAS K-14 in the hand-off report; until adopted they stay audit fields.
