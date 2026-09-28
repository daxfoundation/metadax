# MetaDAX Prompt Suite: CHANGELOG v0.1.1 (2026-09-25)

v0.1.1 applies the two red-team reports on v0.1: **A** = `verify-mp05.md` (MP-00, MP-05, SCHEMAS; defects H1-H8, M1-M15, L1-L13) and **B** = `verify-chain.md` (all files; defects D1-D56 and a 39-row cross-file sweep). The editor's overrides (slug rule, id length, token claims, competency formula) take precedence over the reports; rows affected by them are marked `applied-with-override`. Schema ids stay `metadax.*/0.1`. All changes are text edits to the prompts and schemas. None has been re-run against a model.

## Changes

| Defect | Severity | File(s) | Change made | Status |
|---|---|---|---|---|
| A-H1 | HIGH | MP-05 STEP 1, STEP 6, OUTPUT | K-12 is checked first. A wellbeing flag returns a redirect whose rendering_md holds only the supportive message, with seeds [] and no "Keep exploring:". STEPS 2-6 are skipped. | applied |
| A-H2 | HIGH | SCHEMAS section 5, MP-05 STEP 4, MP-00 K-12 | Minor bands are now listed (4-6, 7-9, 10-12, 13-15, 16-18). "unknown" and LEARNER "none" count as minor for visibility. MP-05 names the bands explicitly. | applied |
| A-H3 | HIGH | MP-05 contract 8, SCHEMAS section 1/section 3/section 4, README section 5, MP-10 /export, MP-09 | Private nodes are stored only at learners/<id>/nodes/<id>/, never in the course repo or registry. A child of a private node is private. MP-09 "private" moves the node out of the course repo. | applied |
| A-H4 | HIGH | MP-05 STEP 3/4 and contracts 2-3, MP-03, SCHEMAS section 1/section 3 | depth = 1 + count("/") in the id and is never counted from PATH. "trail" is never a target_id, link or parent. | applied |
| A-H5 | HIGH | MP-05 OUTPUT/STEP 6, MP-10, SCHEMAS section 6 | Every followup output now carries `resolved` {question, canonical_question, intent, scope} and top-level `seeds`. "Keep exploring:" must be exactly those seeds. MP-10 `/seed` reads SEEDS. | applied |
| A-H6 | HIGH | MP-05 STEP 3a | The ancestor rule matches only EARLIER PATH nodes. A clarify question about the parent becomes `new` with intent clarify. | applied |
| A-H7 | HIGH | MP-05 STEP 6 | For new and extend, a `<!--section:<id>-->` marker goes before each presented core section. | applied |
| A-H8 | HIGH | MP-05 inputs and ZOOM OUT, MP-00 K-3 | In zoom_out, ANCHOR and REGISTRY are not required and INPUT is optional. K-3 now checks REQUIRED blocks "for the current mode". | applied |
| A-M1 | MED | MP-05 STEP 3b | Under tangents_allowed, the classified scope is kept and the flow continues to reuse, extend, new. | applied |
| A-M2 | MED | MP-05 STEP 3c/4 and inputs, MP-00 K-12, SCHEMAS section 3 | Core is written for the youngest intended band (13-15 if absent). Reuse is allowed only for shared nodes or the learner's own. The COURSE row gains audience and policy. | applied |
| A-M3 | MED | MP-05 inputs, SCHEMAS section 4, MP-10 | REGISTRY entries gain intent and visibility, plus created_by, which the A-M2 reuse gate needs. Merged with B-D6. | applied |
| A-M4 | MED | MP-05 STEP 2/3b | Scope is measured against OBJECTIVE and COURSE.steer.focus. strict redirects both out_of_scope and adjacent. | applied |
| A-M5 | MED | MP-05 STEP 6 | The rendering presents every core fact. If that exceeds 350 words, it shows s1 in full and lists the remaining headings under "More in this node:". | applied |
| A-M6 | MED | MP-05 STEP 6 | Rendering order is fixed: body, check question, zoom-out line, then "Keep exploring:" last. | applied |
| A-M7 | MED | MP-05 STEP 4, SCHEMAS section 1/section 3/section 4/section 6, MP-05 worked example | The slug comes from the title: fixed stop-words, first 5 words, cut to 32 chars, -2/-3 on collision. A runtime MAY recompute it. Every example id was regenerated. | applied-with-override (override 1: the model computes the slug, 5 words, 32 chars, extended stop-word list. A proposed a runtime-computed slug of 6 words.) |
| A-M8 | MED | SCHEMAS section 1/section 3, MP-05 STEP 4/contract 3, README section 5 | Node ids are capped at 200 chars by dropping trailing slug words. Personal renderings are named sha1(id)[:12].md, with the id in front matter. | applied-with-override (override 2) |
| A-M9 | MED | MP-03 section A rule 3, MP-05 inputs/contract 11, SCHEMAS section 3 | The runtime truncates INPUT to 500 chars and ANCHOR.quote to 200 chars before assembly. | applied |
| A-M10 | MED | MP-05 STEP 1, SCHEMAS section 3 | The rule now lists context-dependent words (this, that, it, they, them, these, those, ones, there, "the other one"). Relative "that" is allowed. An unclear referent gets low_confidence and the reading is stated. | applied |
| A-M11 | MED | MP-05 ZOOM OUT, MP-06 branch quiz, MP-10 /quiz | Options are {label, action, target_id, question} with fixed targets. MP-06 "branch" is redefined as the node plus its ancestors so the two files agree. | applied |
| A-M12 | MED | MP-05 inputs/STEP 4, SCHEMAS section 8 | CONFIG scope_policy, max_depth and visibility_default are removed. Visibility reads COURSE.policy.learner_nodes, else "shared". | applied |
| A-M13 | MED | SCHEMAS section 3/section 4 | Adds bridge_to_objective, a nullable anchor, links/reuse.of from REGISTRY or PATH, the new_concepts shape, the created_by values and the summary join rule. Merged with B-D27/D33/D37. | applied (bridge_to_objective is a string, "" allowed below depth 4, never null. new_concepts uses B's {id, name, description}.) |
| A-M14 | MED | MP-00 header, README section 4 | The size claim now reads: about 1,000 tokens; MP-00 + MP-05 need 8k; full TUTOR/CONTENT calls need 6-9k; 4k-context models need the v0.2 LITE prompts. Merged with B-D9. | applied-with-override (override 3) |
| A-M15 | MED | MP-05 STEP 5 | The depth-limit third seed is exactly "Zoom out: how does this branch serve the objective?". | applied |
| A-L1 | LOW | MP-05 STEP 3c/6 | The 80-word reuse limit (and, for consistency, the 350-word limit) excludes the "Keep exploring:" list. | applied |
| A-L2 | LOW | MP-05 STEP 3 | confidence is defined as best-match quality, with non-overlapping ranges. redirect and zoom_out use 0. node.reuse.confidence equals confidence. In the A-H6 clarify case the parent is ignored. | applied |
| A-L3 | LOW | MP-05 OUTPUT, README section 4 | The output gains missing/message keys, and the decoding grammar must admit the error shape. | applied |
| A-L4 | LOW | MP-05 STEP 3d/3e | "under the parent (the last entry in PATH)". | applied |
| A-L5 | LOW | MP-00 K-5 | K-5 is scoped to learner-facing text (rendering fields and messages). | applied |
| A-L6 | LOW | MP-05 STEP 4 | Include items are required in core and exclude items never used. Include analogies go in core, without interests. | applied |
| A-L7 | LOW | MP-05 STEP 4, MP-01 update/contract 2, SCHEMAS section 5 | LEARNER "none" gets pending_review. When guardian_managed is true, only the guardian can turn sharing on. | applied (the guardian check is enforced in MP-01 update, where it can be verified; MP-05 cannot see who set the flag) |
| A-L8 | LOW | MP-05 STEP 3c/3d/4 | "Depth" is reworded to "level of detail" where it means detail. Core is written at COURSE.steer.depth. | applied |
| A-L9 | LOW | MP-00 K-11 | "A word is any run of characters between spaces." | applied |
| A-L10 | LOW | MP-00 K-1, MP-06 section 8 | The inline triple-backtick json is replaced by "a JSON code block (three backticks followed by json)". | applied |
| A-L11 | LOW | MP-05 STEP 3 | target_id is stated for every decision. | applied |
| A-L12 | LOW | MP-05 STEP 3d/4, SCHEMAS section 3 | The rule is reworded to "not already stated in a REGISTRY summary". | applied (the reword option was chosen over adding seeds to REGISTRY, to keep the block small) |
| A-L13 | LOW | MP-05 STEP 3b | A redirect says kindly that the question is outside the course and does not answer it. | applied |
| B-D1 | HIGH | SCHEMAS section 6, MP-06 section 2/section 7, MP-08 | Competency = round-half-up(100 x earned / T), where T sums the weights up to bloom_target. Stretch levels are not counted. Mastery = all levels to target passed and >= 70; a prerequisite is met at >= 50. Worked numbers updated (58, 27, 70/50, 13). | applied-with-override (override 4) |
| B-D2 | HIGH | MP-06 section 1/section 4/section 5 | Passing bloom_target completes the concept. A new "more" command offers stretch levels. skip at the target moves to the next concept. | applied |
| B-D3 | HIGH | MP-06 section 5, contract 7 | Commands are recognised only as whole trimmed messages, and the "ask:" prefix wins. | applied |
| B-D4 | HIGH | MP-00 K-9, README section 4 | Backslashes are doubled inside JSON strings and $ delimiters are dropped. Titles, summaries and seeds stay plain text. On-device runtimes default to math_mode plain and reject U+000C/U+0009. | applied |
| B-D5 | HIGH | MP-10, MP-08, MP-01, MP-02, README section 4 | Manual mode pastes SCHEMAS section 1-section 8 first. MP-08 inlines the weights. JSON skeletons are added to MP-01, MP-02 and MP-08. | applied-with-override (override 3: section 1-section 8 and "roughly 16-18k tokens (measured about 16.5k)") |
| B-D6 | HIGH | SCHEMAS section 4, MP-05 inputs | Registry entries gain intent, and the section 4 example has "intent": "deepen". Merged with A-M3. | applied |
| B-D7 | HIGH | MP-01, SCHEMAS section 1/section 5, SCHEMAS section 8 | learner_id is copied from CONFIG.learner_id or created as lrn- plus 8 random characters. | applied |
| B-D8 | HIGH | MP-04 generate/render/contract 5, SCHEMAS section 3 | personalized_with is added to generate. Only renderings without "interests" may be cached. The audience_key is now splittable. | applied (the delimiter is "_", not "\|", because "\|" is illegal in Windows filenames and the key is a filename) |
| B-D9 | MED | MP-00 header, README section 4 | The token claim is replaced. On-device runtimes run CONTENT generate and render as separate calls. | applied-with-override (override 3 replaces B's "below 8k, pass CONTENT one section at a time" with "4k-context models need v0.2 LITE") |
| B-D10 | MED | SCHEMAS section 8, MP-03 rule 1, MP-00 block list, MP-05 inputs | CONCEPTS and CONTENT join the fixed order. The COURSE line drops "concepts subset", and MP-05 reads CONCEPTS instead. | applied |
| B-D11 | MED | MP-06 section 1/section 8, SCHEMAS section 7 | state gains help_used, hints_given and phase, plus a resume rule. | applied |
| B-D12 | MED | MP-06 section 3/section 5/section 6/section 8, SCHEMAS section 7 | Hints form a single ladder. hint and why replies are type feedback with result null. An intro that asks a question keeps type intro. meta describes the new question, and attempt means the attempt about to be made. | applied (null result extended to "why" as well as "hint") |
| B-D13 | MED | MP-06 section 5, MP-10 /ask, SCHEMAS section 7 | handoff = {to, node_id, section_id, anchor_quote of at most 200 chars taken from the section, learner_question}. MP-10 builds ANCHOR and PATH from it. | applied (learner_question drops the leading "ask:") |
| B-D14 | MED | MP-06 practice, MP-07, SCHEMAS section 7 | Items carry grading exact or rubric. One question_type enum uses MP-06's spellings. MP-07 and the runtime branch on grading. | applied |
| B-D15 | MED | MP-07 section 2/section 3, MP-06 section 4 | A rubric answer is correct only if every criterion is met, and partial if any is met or partly met. The runtime recomputes the score. | applied |
| B-D16 | MED | MP-08, MP-06, MP-07, SCHEMAS section 1/section 6 | Practice evaluations become session events. Item ids are <node-id>#pNN. A merge rule maps attempt and hints to a level status. | applied |
| B-D17 | MED | MP-08 MERGE, SCHEMAS section 6 | The status order is not_started < skipped < failed < passed_after_help < passed_first_try. "After" is decided by the seq number. | applied |
| B-D18 | MED | MP-01 | Supports come only from accommodations that are stated or described as behaviour. Suggested ones go to assumptions. | applied |
| B-D19 | MED | MP-04 render, MP-05 STEP 6, SCHEMAS section 5 | All 11 supports now have a defined behaviour. | applied |
| B-D20 | MED | MP-04 render, MP-10 /learn | With short_chunks or minimal_text, each call renders one section (CONFIG.section_id), about 250 words. | applied |
| B-D21 | MED | MP-00 K-5 | With LEARNER "none", write for the youngest intended band, or for a curious adult if none is set. | applied |
| B-D22 | MED | MP-10 | An EVENTS memory is added, and /export writes learners/<id>/sessions/<n>.json. | applied |
| B-D23 | MED | MP-04 generate/contract 6, MP-10 /learn, SCHEMAS section 3/section 8 | created_by is the author_id, else the learner id, else "author". Only author runs produce shared nodes; learner runs get pending_review. | applied (learner runs get pending_review directly instead of a pointer to MP-05 STEP 4, because objective nodes hold no learner words) |
| B-D24 | MED | MP-10 /practice | Items are kept in PRACTICE and shown one at a time, with no answer, rubric or hints before /grade. | applied |
| B-D25 | MED | SCHEMAS section 5, MP-01, MP-08 | New consent.share_progress_with_mentor (default false) gates the mentor note and named teacher reports. | applied |
| B-D26 | MED | MP-08 SESSION, SCHEMAS section 6 | Follow-up events carry question and concepts. | applied |
| B-D27 | MED | SCHEMAS section 3, MP-05 STEP 4/OUTPUT | Adds bridge_to_objective, optional sections[].check and new_concepts {id, name, description}. Merged with A-M13. | applied (bridge_to_objective is a string, "" allowed, not null) |
| B-D28 | MED | MP-06 section 2, SCHEMAS section 6, MP-08 | Half weights stay exact (7.5), and rounding is half up, once, at the end. | applied-with-override (override 4) |
| B-D29 | MED | MP-02 steps 1/4, SCHEMAS section 2 | No learner age, name or interests in titles, summaries or steers. Audience goes only in course.audience. | applied |
| B-D30 | LOW | SCHEMAS section 6 | The next_steps example type is "continue". | applied |
| B-D31 | LOW | SCHEMAS section 2 | The course summary is "One or two sentences". | applied |
| B-D32 | LOW | MP-00 K-14, SCHEMAS section 8 | orphans_followups and budget_unmet join the closed warning list. | applied |
| B-D33 | LOW | SCHEMAS section 3 | created_by = lrn-..., CONFIG.author_id, "author" or "anonymous". | applied |
| B-D34 | LOW | SCHEMAS section 3, MP-04 generate | intent and reuse are null for objective nodes (links and new_concepts are []). | applied |
| B-D35 | LOW | MP-00 K-4, SCHEMAS section 2 | "the OBJECTIVE statement, then the MODULE, LESSON and COURSE steers". | applied |
| B-D36 | LOW | SCHEMAS section 3/section 5, MP-01, MP-04 | reading_level vocabulary: plain-language, grade-1 to grade-12, adult. The audience_key delimiter is changed. | applied ("_" delimiter, see B-D8) |
| B-D37 | LOW | SCHEMAS section 3/section 4, MP-03, MP-05 inputs | The PATH/REGISTRY summary is the node's bullets joined, and the section 4 example matches section 3. | applied (joined with " " per A-M13, not "; ") |
| B-D38 | LOW | SCHEMAS section 6/section 7, MP-08 | Level statuses are flat strings in both progress and tutor state. | applied |
| B-D39 | LOW | SCHEMAS section 6 | The half-weight triggers match MP-06 (hint, "why", 2nd or 3rd attempt, remedial). | applied |
| B-D40 | LOW | SCHEMAS section 7 | The envelope gains summary and warnings. | applied |
| B-D41 | LOW | MP-01 interview/diagnostic | Profile interview turns use type "profile_question". | applied |
| B-D42 | LOW | MP-04 generate | Seeds are 20 words or fewer. | applied |
| B-D43 | LOW | MP-00 K-1 | A pre-output self-check covers limits, include/exclude lists and ids. | applied |
| B-D44 | LOW | MP-02 step 6/suggest, SCHEMAS section 2 | scope_policy falls back to tangents_allowed, learner_nodes defaults to pending_review, and source_policy is "open" with no SOURCE. A concept sits on at most 3 objectives. | applied |
| B-D45 | LOW | SCHEMAS section 1, MP-05 STEP 4 | The stop-word list is now defined. | applied-with-override (override 1 list. The `why-flip-divisor` fixture exists only in the red-team inputs, not in the suite, so there was nothing to rename.) |
| B-D46 | LOW | MP-06 section 5 | next with no concept left emits SUMMARY. After a handoff, next_action is awaiting_answer. | applied |
| B-D47 | LOW | MP-07 | Scores round half up. CONFIG.reveal is a declared input. accept matching is case-insensitive, trimmed, and ignores a trailing ")". | applied |
| B-D48 | LOW | MP-08, SCHEMAS section 6 | next_steps gain section_ids?. Objective status enum is {not_started, in_progress, mastered}. Profile suggestions are strings starting "observed:". The top-level next_steps is dropped. | applied |
| B-D49 | LOW | README section 5 | Learner files live under learners/<learner-id>/. | applied |
| B-D50 | LOW | MP-05 inputs, SCHEMAS section 8 | source_policy is added to the COURSE row, CONFIG duplicates are removed, and a CONFIG keys table is added. | applied |
| B-D51 | LOW | MP-09 audit_course, MP-02 revise | audit_course emits course_patch ops, each wrapping one MP-02 revise op. | applied |
| B-D52 | LOW | MP-06 contract 4/section 1, MP-00 K-3, MP-10 /quiz | CONFIG.returned_from replaces the system note. TUTOR error turns carry state. | applied (also: on return the tutor repeats the current question unchanged) |
| B-D53 | LOW | MP-10 | /quiz accepts course. | applied |
| B-D54 | LOW | MP-04 render, MP-09 verify_rendering | "No new factual claims about the subject; analogies labelled 'Analogy:'". | applied |
| B-D55 | LOW | MP-01 from_description | The output gains missing and warnings. | applied |
| B-D56 | LOW | MP-06 section 1/inputs, MP-03 ladder step 1 | The list of questions already asked is kept in SESSION even when older turns are trimmed. | applied |
| sweep#1 | MISMATCH | SCHEMAS section 8, MP-03, MP-00 | CONCEPTS and CONTENT are in the fixed block order (see B-D10). | applied |
| sweep#2 | MISMATCH | MP-05 inputs, SCHEMAS section 8 | The COURSE row gains source_policy, audience and policy. Concepts come via CONCEPTS. | applied |
| sweep#3 | MISMATCH | MP-06, MP-10 | The "system note" is replaced by CONFIG.returned_from (see B-D52). | applied |
| sweep#4 | UNDEFINED | SCHEMAS section 8 | A CONFIG keys table covers every key used (18). visibility_default is removed. | applied |
| sweep#5 | DUPLICATE | MP-05 inputs | CONFIG scope_policy and max_depth are removed. The engine reads COURSE.steer. | applied |
| sweep#6 | OK | SCHEMAS section 8 | A note separates the CONTENT block from the CONTENT operation. | applied |
| sweep#7 | OK | -- | No mismatch. | not-applied: no change needed |
| sweep#8 | MISMATCH | MP-09, MP-02 | course_patch is defined as wrapping one revise op (see B-D51). | applied |
| sweep#9 | COLLISION | MP-01 | "profile_question" replaces "question" (see B-D41). | applied |
| sweep#10 | MISMATCH | MP-00 K-3, MP-06 section 8 | TUTOR error turns carry state. | applied |
| sweep#11 | MISMATCH | SCHEMAS section 3 | core.bridge_to_objective is defined. | applied |
| sweep#12 | MISMATCH | SCHEMAS section 3 | Optional sections[].check {question, answer} is defined. | applied |
| sweep#13 | MISMATCH | SCHEMAS section 3, MP-05, MP-02 suggest | Node new_concepts are {id, name, description}. MP-02 suggest new_concepts are full concept objects. | applied |
| sweep#14 | MISMATCH | SCHEMAS section 3 | The created_by values are widened (see B-D33, B-D23). | applied |
| sweep#15 | GAP | SCHEMAS section 3, MP-04 | intent and reuse are null for objectives (see B-D34). | applied |
| sweep#16 | MISMATCH | SCHEMAS section 4, MP-05 | Registry intent is added (see A-M3, B-D6). | applied |
| sweep#17 | TYPE MISMATCH | SCHEMAS section 3/section 4 | The summary string = bullets joined with " ". | applied |
| sweep#18 | GAP | MP-01, SCHEMAS section 1 | A learner id creation rule is added (see B-D7). | applied |
| sweep#19 | MISMATCH | SCHEMAS section 5, MP-08 | share_progress_with_mentor is added (see B-D25). | applied |
| sweep#20 | GAP | SCHEMAS section 5, MP-04, MP-05 | The supports vocabulary becomes an enum with one behaviour per value. Unknown values are ignored. | applied |
| sweep#21 | GAP | SCHEMAS section 3/section 5, MP-01 | reading_level vocabulary and the "_" audience_key delimiter (see B-D36). | applied |
| sweep#22 | MISMATCH | SCHEMAS section 6/section 7 | Flat string statuses everywhere (see B-D38). | applied |
| sweep#23 | MISMATCH | SCHEMAS section 6 | The next_steps type enum is MP-08's (see B-D30). | applied |
| sweep#24 | GAP | SCHEMAS section 6, MP-08 | Objective status enum with derivation rules. | applied |
| sweep#25 | MISMATCH | SCHEMAS section 6 | The half-weight triggers are aligned (see B-D39). | applied |
| sweep#26 | GAP | SCHEMAS section 6, MP-06, MP-08 | Round half up, once (see B-D28). | applied-with-override (override 4) |
| sweep#27 | DEFECT | MP-08 | The merge order is fixed (see B-D17). | applied |
| sweep#28 | MISMATCH | SCHEMAS section 7 | summary and warnings are added to the envelope (see B-D40). | applied |
| sweep#29 | MISMATCH | SCHEMAS section 7, MP-06, MP-07 | A single question_type enum. MP-07 prose uses "Numeric/Calculation" and "Ordering/Sequencing". | applied |
| sweep#30 | MISMATCH | MP-06, SCHEMAS section 7 | The handoff anchor_quote is at most 200 chars, taken from the CONTENT section (see B-D13). | applied |
| sweep#31 | MISMATCH | MP-00 K-14 | Closed warning list extended (see B-D32), plus a SCHEMAS section 8 warning-code table. | applied |
| sweep#32 | MISMATCH | MP-00 K-4, SCHEMAS section 2 | The objective statement plays the role of the objective steer (see B-D35). | applied |
| sweep#33 | MISMATCH | SCHEMAS section 2, MP-02 | Summaries are at most 2 sentences in both (see B-D31). | applied |
| sweep#34 | MISMATCH | README section 5 | Learner files live under learners/<learner-id>/ (see B-D49). | applied |
| sweep#35 | SUBSET | MP-10 | /quiz adds course (see B-D53). | applied |
| sweep#36 | CONFLICT | MP-06, MP-10 /ask | Quiz handoffs anchor to handoff.node_id and section_id, not to the question text. | applied |
| sweep#37 | CONFLICT | MP-06 section 5 | "any message that is clearly a curious question" is removed. Only "ask:" hands off, matching MP-10. | applied |
| sweep#38 | GAP | MP-10 | The EVENTS memory feeds /progress (see B-D22). | applied |
| sweep#39 | GAP | MP-10, MP-01, MP-02, MP-08 | SCHEMAS is pasted in manual mode, with inline skeletons and weights (see B-D5). | applied-with-override (override 3) |
| editor-1 | -- | README, SCHEMAS titles/status | Version bumped v0.1 -> v0.1.1. Schema ids unchanged. | applied |
| editor-2 | -- | SCHEMAS section 6/section 7/section 8/section 9 | Added session event shapes, practice item shape, CONFIG keys, warning codes and a section 9 index of every response type and enum, so every field, enum, block, key, code and question_type used in MP files is defined in SCHEMAS. | applied |
| editor-3 | -- | SCHEMAS section 3/section 4 example | The example title changed to "Proteins essential for ATP synthesis", so the regenerated slug avoids the non-stop-word "that". | applied-with-override (override 1) |
| editor-4 | -- | SCHEMAS section 1, MP-05 STEP 4 | The slug rule's unstated edge cases are fixed: a word longer than 32 chars is cut at 32, an empty result becomes "node", and removed characters are deleted, not turned into spaces. | applied |
| editor-5 | -- | MP-03 diagram | The a/b/c placeholder ids became <slug1>/<slug2>/<slug3>. | applied |

## Residual risks

1. **The token figures in the files are v0.1 measurements.** Override 3 fixed the text. Measured on the v0.1.1 prompt blocks with cl100k_base, not a Qwen tokenizer:
   - kernel: about 1,180 tokens (the file says "about 1,000")
   - MP-05: about 3,290
   - MP-06: about 2,740
   - SCHEMAS section 1-section 8: about 8,940
   - full manual paste: about 24.6k (the file says "roughly 16-18k, measured about 16.5k")

   Kernel plus MP-05 plus Test-1-size inputs and output is about 7.1k, so it still fits 8k, but only just. Re-measure and update the numbers, or split out a shorter SCHEMAS excerpt for manual mode.
2. **Nothing was re-run.** The six MP-05 cases and tests A-H have not been executed against v0.1.1 on any model. The fixes are unverified.
3. **Slug rule edge cases.**
   - Removing punctuation merges words ("I-IV" becomes "iiv", "plant-animal" becomes "plantanimal").
   - Non-English titles lose non-ASCII letters or collapse to "node", and then differ only by -2/-3.
   - Because the slug comes from the title, two different titles for the same question produce two ids. Only MP-09 dedupe catches that.
4. **200-character id cap.** Once a parent id reaches 199 characters, no child can be stored, which is reachable from about depth 7 with long slugs. What the learner sees in that case is not specified.
5. **Private-node lifecycle.**
   - When MP-09 moves a node to private, its shared children are orphaned in the course repo.
   - A learner who later opts in to sharing has no way to promote existing private nodes.
   - Other learners' pending_review nodes appear in REGISTRY but can only be linked or extended, never reused.
6. **Runtime-only guarantees.** A model's "random" learner_id, the guardian-only consent change, the slug recomputation, the sha1 rendering names and the seq numbers all need a runtime that does not exist yet.
7. **Stretch levels are thinly specified.** The "more" command runs one level at a time until "next". How PROGRESS resumes stretch levels, and how SUMMARY reports them, is not specified.
8. **Remaining text conflicts.**
   - The 13-15 safety floor for core, used when intended_bands is absent, may under-serve expert courses. Authors should set course.audience.
   - extra_examples can still conflict with the 350-word rendering cap.
   - minimal_text can still conflict with "present every fact".
9. **Ambiguities outside the ranked lists were not addressed.** Examples:
   - no intent-to-Bloom mapping
   - no test for a "genuinely new" concept
   - MP-02 suggest can overflow the size preset
   - bridge_to_parent vs "do not repeat PATH"
   - school grade vs reading level
   - no "taking you back to X" notice on ancestor jumps

## Post-edit note (brain session, 2026-09-25)

Residual risk 1 was resolved after the editor pass. The token claims in MP-00, MP-10 and README section 4 now state the measured cl100k estimates: kernel about 1,200 tokens, and manual-mode paste about 25k. They no longer say "about 1,000" or "16-18k".
