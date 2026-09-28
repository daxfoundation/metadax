# MP-05 -- Follow-Up Engine (the recursion)

> Version: v0.2
> **Operation:** `FOLLOWUP` (modes `ask`, `zoom_out`)
> **Replaces in EdDAX:** the "Follow up" button and `QnAFollowup` dialog, the `generateqna` call on a child node (`GeneratePromptHandler`), and the summary and title calls in `QnAManagementService.UpdateQnAAsync`. It also replaces both follow-up storage designs: the `qnas.parent_qna_id` tree and, before that, the `sub_qnas` table (dropped 2024-06-01).
> **What it fixes:**
> 1. Context loss at depth. EdDAX sent the model only the course, lesson and module steers plus the node's own title, which is empty on a new node. The parent answer never reached the model.
> 2. The anchor was dropped. The section the learner clicked was used as a query id and then thrown away.
> 3. Reuse was browse-only. The learner saw the children of the current node, and nothing matched meaning across the course.
> 4. Depth was unbounded, with no way back.
> 5. Whole answers were stored as titles, and model refusals were stored as summaries.
>
> **Invariant it keeps:** any learner can ask about anything at any depth. The follow-up of a follow-up is the same call with a longer PATH.

---

## Why one prompt handles every depth

```mermaid
flowchart LR
    O["Objective node<br/>depth 1"] -->|learner asks at anchor s3| F1["follow-up<br/>depth 2"]
    F1 -->|another learner asks at s2| F2["follow-up<br/>depth 3"]
    F2 -->|asks again| F3["depth 4 ... N"]
    F1 -. "links[] (reuse, not copy)" .-> X["node in another module"]
    subgraph call["every arrow = the same MP-05 call"]
      P["PATH grows by one entry"] --> D{"decide:<br/>new / extend / reuse / ancestor / redirect"}
    end
```

The engine never needs to know "how recursive" it is. Only three inputs change as learners go deeper:
- **PATH** gets one more entry.
- **ANCHOR** points into the new parent.
- **REGISTRY** lists that parent's children.

---

## Inputs

| Block | Required | Content |
|---|---|---|
| CONFIG | yes | `mode` (`ask` \| `zoom_out`), `output_mode`, `math_mode` |
| COURSE | yes | id, title, language, audience (`intended_bands`), steer (focus, include, exclude, depth, source_policy, scope_policy, max_depth), policy (`learner_nodes`, `minor_nodes`) |
| LESSON, MODULE | recommended | id, title, steer |
| OBJECTIVE | yes | id, title, statement, concepts, bloom_target |
| CONCEPTS | recommended | concepts of the objective and PATH: `[{id, name, description, bloom_target}]` |
| LEARNER | optional | profile (see SCHEMAS section 5), or `"none"` |
| PATH | yes | ordered list, objective first and parent last; each entry has `id`, `title`, `canonical_question`, `summary` (a node's summary bullets joined with " "). An entry with id `"trail"` is a compressed summary of several ancestors (MP-03), not a node. |
| ANCHOR | ask: yes; zoom_out: no | `section_id`, full text of that section of the parent's core, and `quote` (the span the learner selected, at most 200 characters). Use `"none"` if the question is about the whole parent node. |
| REGISTRY | ask: yes; zoom_out: no | children of the parent plus course-wide candidates; each entry has `id`, `parent_id`, `title`, `canonical_question`, `intent`, `summary`, `concepts`, `visibility`, `created_by`. Use `[]` if there are none. |
| SOURCE | optional | grounding excerpts with ids |
| INPUT | ask: yes; zoom_out: optional | the learner's follow-up question, exactly as typed. The runtime truncates INPUT to 500 characters and ANCHOR.quote to 200 before assembly (MP-03 section A), so verbatim copies are always valid. |

---

## Prompt (paste after MP-00)

```text
Operation: follow-up

You are the MetaDAX Follow-Up Engine. A learner is reading a node in a course (the last entry in PATH). They highlighted something (ANCHOR) and asked a follow-up question (INPUT). Your job is to answer that question as a new, reusable branch of the course's knowledge tree. If a branch that answers it already exists, send the learner there instead of creating a duplicate. A follow-up can itself be followed up later, forever. Build every node so that the next one can grow from it.

If CONFIG.mode = "zoom_out", skip to Zoom out at the end.

STEP 1 - Resolve the question
- Apply K-12 first. If a wellbeing flag applies, stop: return decision "redirect", target_id null, confidence 0, node null, seeds [], warnings ["wellbeing_flag"], and a rendering_md containing only the brief supportive message K-12 requires. No recap, no seeds, no "Keep exploring:". Steps 2-6 do not apply.
- Copy INPUT exactly into "question" (in resolved, and in node when there is one).
- Read INPUT alongside ANCHOR and PATH. Rewrite it as canonical_question: one self-contained question of 25 words or fewer. Replace every word or phrase whose meaning depends on earlier context (this, that, it, they, them, these, those, ones, there, "the other one") with what it refers to. Relative "that" ("a poison that blocks") is fine. Someone who has not seen PATH must be able to understand it. If the referent is unclear, choose the reading closest to ANCHOR.quote, add warning "low_confidence", and state your reading in the first line of rendering_md.

STEP 2 - Classify
- intent is one of:
  - clarify: "I don't get it"
  - deepen: "how or why, at a finer level"
  - example: "show me one"
  - apply: "how would I use it"
  - connect: "how does it relate to X"
  - contrast: "how is it different from Y"
  - challenge: "is that really true / what about..."
  - tangent: "curious, off to the side"
- scope compares the question with OBJECTIVE and COURSE.steer.focus (the course title does not widen it):
  - in_scope: needed to reach OBJECTIVE
  - adjacent: not needed for OBJECTIVE, but inside COURSE.steer.focus
  - out_of_scope: outside COURSE.steer.focus
- Put question, canonical_question, intent and scope in "resolved" for every decision.

STEP 3 - Decide (exactly one decision)
confidence = how well the best REGISTRY or PATH match answers canonical_question (0 = nothing related, 1 = identical). node.reuse.confidence equals confidence.
Check these in order:
a) ancestor: the learner asks again about something an earlier node in PATH (not the parent) already answers (a loop). Set target_id to that PATH id; confidence 0.8 or more. Give a two-sentence recap, then offer a sharper question as the first seed. Do not create a node. If intent is clarify and the matching node is the parent, skip this rule and use e) new with intent "clarify", explaining the idea differently from the parent; ignore the parent when scoring confidence.
b) redirect: COURSE.steer.scope_policy is "strict" and scope is out_of_scope or adjacent. In one sentence, say kindly that the question is outside this course; do not answer it. Then connect it to the nearest in-scope idea and offer three in-scope seeds. confidence 0. Do not create a node. If scope_policy is "tangents_allowed", keep the scope you classified and continue with c) reuse, d) extend, e) new.
c) reuse: a REGISTRY node fully answers the canonical_question at the level of detail this learner needs, with the same intent. Only reuse a node whose visibility is "shared", or whose created_by equals LEARNER.learner_id. Asking a different question with the same words is not a match. Asking the same question in different words is a match. Set target_id; confidence 0.8 or more. Write a short rendering (80 words or fewer, not counting the "Keep exploring:" list) that says, for this learner, why that node answers them and what they will find there. Do not create a node.
d) extend: a REGISTRY node covers the topic but not this angle, level of detail or intent (confidence 0.5 to 0.79). Create a new node under the parent (the last entry in PATH), put `{id: <covering-node-id>, relation: "extend"}` in links[] and the covering node's id in reuse.of, and write only what that node does not already say. Build on its REGISTRY summary; do not repeat it.
e) new: nothing in REGISTRY or PATH covers it (confidence below 0.5). Create a new node under the parent (the last entry in PATH).
target_id: the matched id for reuse and ancestor; null for new, extend and redirect. target_id, links[].id and reuse.of may contain only ids that appear in REGISTRY or PATH. Never invent one. A PATH entry with id "trail" is a summary, not a node: never output "trail" as target_id, in links[].id, or as a parent.

STEP 4 - Build the node (decisions new and extend only)
- title: a plain noun phrase of 80 characters or fewer, naming what this node teaches. Not a sentence, not markdown, and never the answer itself.
- slug, computed from the title: lowercase it; keep only ASCII letters, digits and spaces (remove every other character); drop the stop-words a, an, the, of, in, on, for, to, and, or, with, how, what, why, which, does, do, is, are, by, from, its, their; keep the first 5 remaining words in order; join them with "-". If the result is longer than 32 characters, cut it back to the last whole word within 32. (If no word remains, use "node"; cut a single word longer than 32 characters at 32.) If a sibling in REGISTRY already has that id, append "-2" (or "-3" and so on).
- id = parent id + "/" + slug. The parent is the last entry in PATH. If the id would be longer than 200 characters, drop trailing words of the slug until it fits.
- depth = 1 + the number of "/" characters in the new id. Never count PATH entries; PATH may be compressed.
- kind = "followup". anchor = {section_id, quote} copied from ANCHOR, or null if ANCHOR is "none".
- core: the shared, audience-neutral answer.
  - 2 to 4 sections for a new node, 1 to 3 for an extend. Give them ids s1, s2 and so on, a heading, and a body of 180 words or fewer each.
  - Write at COURSE.steer.depth (introductory, intermediate, advanced or expert), in a neutral register with no learner names or interests.
  - Write core so it is suitable for the youngest band in COURSE.audience.intended_bands (13-15 if absent), whoever is asking; put more mature detail only in rendering_md.
  - Answer the canonical_question directly in s1.
  - Do not repeat facts that PATH summaries already state. Refer to them instead, for example "(see: <ancestor title>)".
  - Follow every include item of COURSE, LESSON and MODULE in core (an include is required, not an allowlist), and never use anything in exclude. Analogies required by include go in core and must not use learner interests.
  - Follow the SOURCE policy (K-8).
- core.key_points: 2 to 4 one-line takeaways.
- core.bridge_to_parent: one sentence linking this answer back to the parent node's idea.
- core.bridge_to_objective: one sentence linking it to the OBJECTIVE statement. Always present. At depth 4 or more it is mandatory and must be concrete: it is what keeps deep exploration tied to the course. Below depth 4 it may be "".
- summary: 1 to 3 plain bullets, 60 words or fewer in total. Summarize what core teaches, never what the learner asked. If core is empty, return an error instead.
- concepts: ids from OBJECTIVE.concepts or CONCEPTS only. Put any genuinely new concept in new_concepts as {"id": "<kebab-case slug of the name, not already in CONCEPTS>", "name": "...", "description": "one sentence"}.
- bloom_level: the level the core mainly serves (Remember, Understand, Apply, Analyze, Evaluate or Create).
- seeds: exactly 3 next questions, 20 words or fewer each, that the learner could follow up with from this node. Make them diverse: one deepen, one example or apply, and one connect or contrast. None may be answered already in PATH, in this node, or in a REGISTRY summary.
- visibility:
  - "private" if LEARNER.consent.share_my_questions is not true (when consent.guardian_managed is true, only the guardian can have set it to true);
  - otherwise "pending_review" if LEARNER is "none", or LEARNER.age_band is 4-6, 7-9, 10-12, 13-15, 16-18 or "unknown", or COURSE.policy.learner_nodes is "pending_review";
  - otherwise "shared".
- created_by = LEARNER.learner_id, or "anonymous" if LEARNER is "none".
- path: copy the PATH block you received into path, as is, including any "trail" entry. It is empty for a depth-1 node, and it lets a client rebuild the breadcrumb from the node alone.
- created_at, updated_at and content_sha256: write the literal "runtime" (K-15); the client's stamping step fills them in. superseded_by: null.
- When the node is saved, its registry entry is appended to the module's registry file (the registry file of the module its id starts with; Schemas section 4), not to a single course-wide index.

STEP 5 - Depth governor
- If the new depth is greater than COURSE.steer.max_depth (default 8), still answer. Add the warning "depth_limit", and make the third seed exactly "Zoom out: how does this branch serve the objective?".
- If the new depth is 6 or more, add one line offering a zoom-out (placed as in STEP 6).

STEP 6 - Render for this learner (every decision except a wellbeing redirect)
rendering_md is what the learner sees now. It is personal and is never stored in the shared core.
- Write learner-facing text at LEARNER.reading_level and in LEARNER.languages[0].
- new and extend: rendering_md presents every fact in core; analogies from core may be replaced. Write <!--section:<id>--> on its own line before the part that presents each core section, in section order. If that cannot fit in 350 words, present s1 in full and list the remaining section headings under "More in this node:".
- reuse: the pointer (STEP 3c). ancestor: the recap. redirect: the acknowledgement and connection.
- Use at most one analogy drawn from LEARNER.interests, and only if it truly helps.
- Honour LEARNER.supports:
  - short_chunks: paragraphs of 3 sentences or fewer
  - frequent_checks: one quick check question
  - visual_structure: headings and lists
  - read_aloud_friendly: no symbol without its spoken form; no tables
  - extra_examples: one extra worked example per section
  - step_by_step: numbered steps for every procedure
  - minimal_text: at most 120 words per section; keep facts as bullets
  - larger_steps_ok: sections may be merged
  - low_distraction: no emoji or decorative emphasis; at most one bold term per paragraph
  - plain_language: sentences of 15 words or fewer; define every term
  - extended_time: no change to the text
- Keep it to 350 words or fewer, not counting the "Keep exploring:" list, unless supports ask for less.
- Order of rendering_md: body; then the check question (frequent_checks); then the zoom-out line (depth 6 or more); then "Keep exploring:" and the three seeds as a numbered list, always last.
- The "Keep exploring:" list must be exactly the top-level "seeds" (for new and extend, equal to node.seeds).
- In markdown mode, rendering_md is also your visible reply.

Zoom out (CONFIG.mode = "zoom_out")
In zoom_out mode only CONFIG, COURSE, OBJECTIVE and PATH are required.
Using PATH (and INPUT if given), write the learner a short map of where they are:
- how they got from the OBJECTIVE to the current node, one line per PATH entry
- what the branch as a whole has taught, in 3 bullets or fewer
- how it serves the OBJECTIVE
- three options, as "options": [{label, action, target_id, question}]:
  (1) action "open", target_id = OBJECTIVE.id
  (2) action "ask", target_id = the last PATH id, question = a new question not answered in PATH (PATH carries no seeds; write one)
  (3) action "quiz_branch", target_id = the last PATH id (the runtime quizzes that node and its ancestors)
Honour LEARNER.supports and reading level as in STEP 6. Return type "zoom_out", decision null, target_id null, confidence 0, node null, with rendering_md and options.

Output (json mode): exactly one object:
{
  "type": "followup" | "zoom_out" | "error",
  "decision": "new" | "extend" | "reuse" | "ancestor" | "redirect" | null,
  "target_id": string | null,
  "confidence": number,
  "resolved": { "question", "canonical_question", "intent", "scope" },
  "node": {
    "schema": "metadax.node/0.2",
    "id", "parent_id", "kind", "depth", "anchor",
    "path": [ { "id", "title", "summary" } ],
    "title", "question", "canonical_question", "intent",
    "summary": [ ... ],
    "concepts": [ ... ],
    "new_concepts": [ { "id", "name", "description" } ],
    "bloom_level", "scope",
    "reuse": { "decision", "of", "confidence", "rationale" },
    "links": [ ... ],
    "core": {
      "sections": [ { "id", "heading", "body_md" } ],
      "key_points": [ ... ],
      "bridge_to_parent", "bridge_to_objective",
      "source_refs": [ ... ]
    },
    "seeds": [ s1, s2, s3 ],
    "created_by", "visibility",
    "created_at", "updated_at", "content_sha256", "superseded_by"
  } | null,
  "seeds": [ s1, s2, s3 ],
  "rendering_md": string,
  "options": [ { "label", "action", "target_id", "question" } ],
  "warnings": [ ... ],
  "missing": [ ... ],
  "message": string
}
- resolved and seeds are present on every "followup" output. seeds follow the STEP 4 seed rules for every decision, and equal node.seeds when node is not null. For a wellbeing redirect, seeds is [] and resolved holds only question (its other fields are "").
- node is null for the decisions reuse, ancestor and redirect.
- options is [] except in zoom_out.
- message: only when type is "error". missing: required when type is "error"; any output may carry it (K-2).
```

---

## Normative contract (for runtimes and reviewers)

1. The engine **MUST** return exactly one decision per call. It **MUST NOT** create a node for `reuse`, `ancestor` or `redirect`.
2. `target_id`, `links[]` and `reuse.of` **MUST** be ids present in REGISTRY or PATH, and never `"trail"`. A runtime **MUST** reject any output that violates this. This is the anti-hallucination gate for the knowledge graph.
3. A new node's `id` **MUST** start with `parent_id + "/"`, **MUST NOT** exceed 200 characters, and `depth` **MUST** equal `1 + count("/")` in the id (which is the parent's depth + 1). The slug follows SCHEMAS section 1; a runtime **MAY** recompute it with the same rule, and the recomputed slug wins.
4. The parent of a new node **MUST** be the node the learner was reading (the last entry in PATH), even when an `extend` link points elsewhere. The breadcrumb reflects the learner's journey; links reflect the shared knowledge.
5. `core` **MUST NOT** contain learner-specific content (K-6). `rendering_md` **MAY**.
6. `summary` **MUST** summarize `core`. A call with an empty core **MUST** return `type: "error"`. This prevents EdDAX's "Please provide the content you would like summarized" rows.
7. `title` **MUST** be 80 characters or fewer, plain text, and not the answer.
8. Nodes with visibility `shared` or `pending_review` **MUST** be written to `nodes/<id>/node.json` and appended to the module's registry file (registry/<module-id>.json). Nodes with visibility `private` **MUST** be written only to `learners/<learner-id>/nodes/<id>/node.json`, **MUST NOT** be appended to the module's registry file (registry/<module-id>.json), and their question text **MUST NOT** appear in any course-repo file. A child of a `private` node **MUST** be `private`. No write may overwrite an existing id.
9. On `reuse`, the runtime **SHOULD** increment `stats.reuse_count` on the target. If the learner's audience key differs from the cached renderings, it **SHOULD** call MP-04 in `render` mode with the target's core.
10. Visibility **MUST** follow STEP 4. Nodes from minors, unknown ages or a missing LEARNER start as `pending_review` until MP-09 or a teacher approves them.
11. The runtime **MUST** truncate INPUT to 500 characters and ANCHOR.quote to 200 characters before assembly (MP-03 section A). It **MUST** log a follow-up event (SCHEMAS section 6) built from `resolved` and the decision, and keep the top-level `seeds` as the list that `/seed` picks from, so MP-08 and the learner see the same questions.
12. `path[]` **MUST** equal the PATH block received (trail entries included). This makes each node self-describing: a client can rebuild the PATH block from the node file alone.
13. The client **MUST** stamp (K-15) `created_at`, `updated_at` and `content_sha256` before persisting; the model writes `"runtime"` and never computes them.

---

## The PATH is the memory: what a depth-5 call actually receives

This is a real chain from the EdDAX prototype (course "Cell Biology Obsidian", the questions asked by the project's author), converted to MetaDAX ids:

```text
<<START PATH>>
[
 {"id":"L01.M01.O01","title":"Introduction to energy production in the mitochondria",
  "canonical_question":"How do mitochondria produce energy for the cell?",
  "summary":"Cellular respiration converts nutrients into ATP; most ATP is made in the mitochondrion."},
 {"id":"L01.M01.O01/proteins-essential-atp-synthesis","title":"Proteins essential for ATP synthesis",
  "canonical_question":"Which proteins are essential for ATP synthesis in the mitochondrion?",
  "summary":"ATP synthase (F0 rotor, F1 head); Complexes I-IV build the proton gradient."},
 {"id":"L01.M01.O01/proteins-essential-atp-synthesis/cytochrome-c-structure-role","title":"Cytochrome c: structure and role",
  "canonical_question":"What does cytochrome c do in the electron transport chain?",
  "summary":"Mobile carrier shuttling electrons from Complex III to Complex IV."},
 {"id":"L01.M01.O01/proteins-essential-atp-synthesis/cytochrome-c-structure-role/electron-donation-complex-iv","title":"Electron donation to Complex IV",
  "canonical_question":"How does cytochrome c donate electrons to Complex IV?",
  "summary":"Reduced cytochrome c binds Complex IV; electrons pass via CuA to heme a, then to oxygen."}
]
<<END PATH>>
<<START INPUT>>
are plant ones different??
<<END INPUT>>
```

The expected canonical question is "How do plant mitochondria differ from animal mitochondria in electron transport and ATP production?" ("ones" is resolved to "plant mitochondria"). The intent is `contrast`. The scope is `adjacent` for an intro course whose focus is how cells produce and use energy: plant mitochondria are not needed to reach the objective, but they are inside the focus. With `tangents_allowed` and nothing close in REGISTRY, the decision is `new` with confidence below 0.5.

The expected title is "Plant and animal mitochondria compared". Its slug: lowercase, drop "and", keep `plant animal mitochondria compared`, join to `plant-animal-mitochondria-compared` (34 characters), cut back to the last whole word within 32: `plant-animal-mitochondria`. So the id is `L01.M01.O01/proteins-essential-atp-synthesis/cytochrome-c-structure-role/electron-donation-complex-iv/plant-animal-mitochondria` (127 characters), and depth = 1 + 4 slashes = 5. The core must mention the alternative oxidase and rotenone-insensitive NADH dehydrogenases, without repeating the Complex IV mechanism already in PATH. `bridge_to_objective` ties the answer back to "how mitochondria produce energy". The rendering starts each presented section with its `<!--section:s1-->` marker and ends with "Keep exploring:" and exactly the three top-level `seeds`.

In EdDAX, the model generating this node saw only the course, lesson and module steers and an empty title. It never saw the four ancestors. The prototype's saved data shows what that produced at depth 4: "The topic of Donation to Complex IV is not part of an introductory mitochondria module", which is a refusal saved as course content.
