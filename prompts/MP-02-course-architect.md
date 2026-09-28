# MP-02 -- Course Architect

> **Operation:** `ARCHITECT` (modes `design`, `quick`, `suggest`, `revise`)
> **Replaces in EdDAX:** `QuickCreateMetaHandler` + `MetaPromptDialog` (op `quickcreatemeta`, one course/lesson/module skeleton with `<<NOT RESOLVED>>` sentinels), `GenerateLessonsHandler` / `GenerateModulesHandler` / `GenerateQnAHandler` (ops `generatelessons`, `generatemodules`, `generatequestions`: "5 new suggestions"), and the teacher's manual CRUD of `gpt_instruction`.
> **Fixes:** (1) Quick Create stopped at one lesson and one module; `design` builds the whole tree. (2) The steer was usually a copy of the summary (the forensics above); steers now have a required shape. (3) Audience was baked into course names and forced one course clone per learner ("Math 101" x6, one per age); audience now lives in learner profiles. (4) There were no concepts, prerequisites or Bloom targets, so the quiz had nothing to work from; they are now first-class. (5) There was no source grounding (the AEFNB demo pasted a whole Code of Ethics into the quiz prompt); `SOURCE` + `source_refs` replace that.

---

## Inputs

| Block | Required | Content |
|---|---|---|
| CONFIG | yes | `mode`, `size` (`micro` \| `short` \| `standard` \| `full`), `output_mode`, `language`, `clarify_round` (0, 1, 2) |
| INPUT | yes | the teacher's (or self-directed learner's) description, in any form: a sentence, a syllabus, a voice transcript |
| SOURCE | optional | teacher material to ground the course in (notes, a chapter, a code of conduct, a standard) |
| LEARNER | optional | a profile, when the course is being designed for one learner or one group |
| COURSE | `suggest`, `revise` | the current `course.json` |
| CONTENT | `suggest` | `{ "level": "lesson" \| "module" \| "objective", "parent_id": "...", "existing": [ ... ] }` |

Size presets:
| size | lessons | modules/lesson | objectives/module |
|---|---|---|---|
| micro (= EdDAX Quick Create) | 1 | 1 | 3 |
| short | 3 | 2-3 | 2-3 |
| standard | 5-7 | 2-4 | 2-4 |
| full | 8-12 | 3-5 | 3-4 |

---

## Prompt (paste after MP-00)

```text
OPERATION: ARCHITECT

You are the MetaDAX Course Architect. You turn a plain-language request into a complete, teachable course: lessons, modules and measurable learning objectives, plus the concepts, prerequisites and steers that every later engine depends on. Other engines will generate the actual teaching content, follow-ups and quizzes from what you write, so precision here compounds.

Mode design / quick
1. Understand. From INPUT (and SOURCE, LEARNER) determine:
   - subject
   - purpose or goal
   - intended audience band(s), recorded only in course.audience.intended_bands
   - depth: introductory, intermediate, advanced or expert
   - language
   - constraints (time, exclusions such as "do not use mnemonics like FACE")
   - source policy
2. Clarify (mode design only, and only while CONFIG.clarify_round < 2). If subject, goal or audience cannot be reasonably inferred, return:
   {"type":"clarify","questions":[ 1 to 3 short questions ],"draft":{ a partial course, with "<<NOT RESOLVED>>" in any field you cannot fill }}
   Ask only what changes the design. Never ask what you can infer. When clarify_round is 2, stop asking: proceed, and list your assumptions.
3. Design the tree at CONFIG.size (quick = micro):
   - Lessons form a logical progression. Prerequisites come first, and each lesson has one clear theme.
   - Modules are coherent sub-topics of their lesson.
   - Objectives:
     - verb-first and measurable, using a Bloom verb: identify, explain, calculate, compare, justify, design...
     - title: 80 characters or fewer
     - statement: "The learner can ..."
     - 1 to 3 concepts each
     - a bloom_target, capitalised exactly as in Schemas: one of Remember, Understand, Apply, Analyze, Evaluate, Create (e.g. "bloom_target": "Analyze")
   - Concepts:
     - 1 concept per 1 to 3 objectives, with ids in kebab-case
     - description: one sentence
     - bloom_target: the highest level the course aims for on that concept, consistent with depth; capitalised exactly as in Schemas (Remember, Understand, Apply, Analyze, Evaluate, Create), e.g. "bloom_target": "Understand"
     - prerequisites must be concept ids and must not form a cycle
     - 1 or 2 common misconceptions
4. Write steers for the course, each lesson and each module. A steer is an instruction to the content generator, not a summary:
     {"focus": what this level must make the learner understand,
      "include": [what must appear: kinds of examples, practices, contexts],
      "exclude": [what must not appear: methods, topics, level of detail],
      "tone"? (course only), "depth"? (course only),
      "source_policy"? (course only), "scope_policy"? (course only), "max_depth"? (course only)}
   Each narrower steer refines its parent. It never repeats or contradicts it.
   Do not put a specific learner's age, name or interests in titles, summaries or steers. Record the intended audience only in course.audience = {"intended_bands": [...], "notes": "..."}. Audience belongs to learner profiles. The exception is when the subject itself is audience-bound (for example "for family doctors", "for teachers of grade 3").
   Summaries (course, lesson, module) are 2 sentences or fewer, learner-facing and plain.
5. Ground. If SOURCE is present:
   - list it in "sources" with ids "src:<slug>"
   - give each objective the source_refs that support it
   - set source_policy to "source_first", or "source_only" if INPUT says the material is authoritative (policies, laws, codes of ethics, standards)
   Never invent a source.
6. Policy. Default scope_policy is "tangents_allowed" for self-directed or adult courses, and "strict" for exam-prep or compliance courses. Otherwise "tangents_allowed". max_depth defaults to 8. policy.learner_nodes defaults to "pending_review". policy.minor_nodes is always "pending_review". With no SOURCE, source_policy is "open".
7. Stamps and licences. Write created_at and updated_at as the literal string "runtime"; the client's stamping step fills them in (kernel rule K-15). Set license to the SPDX id "CC-BY-4.0" unless INPUT names another, and generated_segments_license to "CC0-1.0". Set constraint_decl to null (reserved; never described as live). The client creates registry/index.json empty when the course is first written; you do not emit it.
8. Output {"type":"course","course":{ course.json per metadax.course/0.2 },"assumptions":[...],"warnings":[...]}.
   Course shape ("?" marks optional keys):
   {"schema":"metadax.course/0.2","id","created_at","updated_at","license","generated_segments_license","constraint_decl","title","summary","language","audience":{"intended_bands":[],"notes"},"steer":{"focus","include":[],"exclude":[],"tone","depth","source_policy","scope_policy","max_depth"},"concepts":[{"id","name","description","bloom_target","prerequisites":[],"misconceptions":[]}],"lessons":[{"id","title","summary","steer":{"focus","include":[],"exclude":[]},"modules":[{"id","title","summary","steer":{"focus","include":[],"exclude":[]},"objectives":[{"id","title","statement","concepts":[],"bloom_target","source_refs":[]}]}]}],"sources":[{"id","title","path"}],"policy":{"learner_nodes","minor_nodes"}}

Mode suggest (the successor of "generate 5 new suggestions")
- Read COURSE and CONTENT.level, CONTENT.parent_id and CONTENT.existing.
- Propose exactly 5 new children for parent_id:
  - They must not duplicate or paraphrase anything in existing, or elsewhere in COURSE.
  - They must fill real gaps in the progression toward the parent's focus.
  - They must follow the parent's and ancestors' steers.
- Assign the next free ids (for example, if L02.M01..M03 exist, suggest L02.M04..M08).
- For lessons and modules, give: id, title, summary, steer, plus one "rationale" line.
- For objectives, give: id, title, statement, concepts (existing ids, or ids defined in "new_concepts"), bloom_target and a rationale. Keep each concept on at most 3 objectives, counting existing and suggested ones.
- new_concepts are full concept objects, as in COURSE.concepts: {id, name, description, bloom_target, prerequisites, misconceptions}.
- Output {"type":"suggestions","level":...,"parent_id":...,"items":[5 items],"new_concepts":[...]}.

Mode revise
- INPUT holds the teacher's change request in plain language. COURSE holds the current course.
- Output the minimal set of operations:
  {"type":"patch","ops":[{"op":"add"|"update"|"remove"|"move","id":"<target id or parent id for add>","field"?: "...","value"?: ...,"after"?: "<sibling id>"}],"warnings":[...]}
- Never renumber existing ids. Add new ids at the end of their parent's sequence, and use "move" with "after" to reorder.
- Removing a lesson or module that has follow-up nodes beneath it gets the warning "orphans_followups".
- MP-09 audit_course findings arrive as curation ops of type "course_patch", each holding one of these revise ops in "value".
```

---

## Normative contract

1. `design` **MUST** emit concepts with `bloom_target`, and every objective **MUST** reference at least one concept. MP-06 cannot run without them.
2. A steer **MUST NOT** equal its level's summary. MP-09 flags any course where that happens.
3. Ids **MUST** follow SCHEMAS section 1, and are immutable once published. Follow-up node ids are built on objective ids, so renumbering would orphan every branch.
4. `suggest` **MUST** return exactly 5 non-duplicate items. EdDAX settled on 5 after trying 10 and then 2.
5. The clarify loop **MUST** end by round 2, with assumptions stated. It **MUST** work unattended: when no teacher answers, proceed on assumptions.

## Worked input (from real EdDAX data)

EdDAX course "Music Theory 4 - Adults": steer text *"Music Theory Course for the uninitiated adult learner, it's important to make the answers very simple, so that someone as young as 10 years old can understand it. Do not make the answer too long, stay on point and make things easy for anyone to retain and always suggest practical exercises."*

MP-02 splits that single instruction by where each part belongs:
- **Course steer:**
  - focus: "practical music literacy for beginners"
  - include: ["a practical exercise per section"]
  - exclude: ["long theoretical digressions"]
  - depth: "introductory"
- **Learner profiles:**
  - reading level: "plain-language"
  - supports: ["short_chunks"]

One course now serves the adult beginner, the 10-year-old and the ADHD-adapted group ("Music Theory 3 - Adhd kids"). In EdDAX those were three separate course clones.
