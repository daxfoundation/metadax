# E03 -- Learner run 1, cell biology

Run date: 2026-09-27. Client: Claude Code, git-native, self-hosting (the model
running the metadax-learner skill also executed each meta prompt). Model: Claude
(Anthropic). Learner: lrn-sbx0adlt (adult, existing sandbox profile; consent
share_my_questions=true). Course: scratch copy of
fixtures/courses/cell-biology-obsidian at /tmp/course (git init, no remote).
Device: dev-ekkwqk. Session: ses-20260927-4few.

I followed docs/WALKTHROUGH-CLAUDE-CODE.md and
skills/metadax-learner/SKILL.md as written, working around defects minimally and
never editing skills, tools or prompts (per the run rules). Raw JSON for every
model output is in `2026-09-27-raw-outputs.md`. The post-session course tree
(nodes + registry only) is in `2026-09-27-course-after-session/`.

The walkthrough, the two skills and the fixture course + learner all existed and
fit; I did not have to invent structure. Nothing was
missing that stopped the run.

## Timeline (seconds per step)

Wall-clock for the automated client is compressed (each persist is a handful of
tool calls, not human typing), so the seconds below are the observed elapsed for
each step's persist batch, not a human's reading time. They show pacing/order,
not learner effort.

| # | Step | Elapsed | Result |
|---|------|--------:|--------|
| 0 | Setup: clone metadax + learner, cp fixture course, git init, mint device/session ids, write metadax.config.json | ~40s | ok |
| A | Age-wall exercise (new learner, "I am 15") | ~3s | skill stops, no profile written (correct) |
| 1 | `learn L01.M01.O01` -- render objective node, log view | ~2s | 4 sections shown; event-0001 note |
| 2 | `ask: what actually pumps the protons across the membrane?` | ~4s | decision **reuse** -> proteins-essential-atp-synthesis; reuse_count 3->4; event-0002 |
| 3 | `learn .../proteins-essential-atp-synthesis` then `ask: what does cytochrome c do?` | ~4s | decision **reuse** -> cytochrome-c-structure-role; reuse_count 0->1; events 0003-0004 |
| 4 | `ask: is cytochrome c the same in bacteria?` | ~5s | decision **new**, depth 4, path[] len 3; node written; validate OK; event-0005 |
| 5 | `ask: ok but how does that relate to...energy production overall` | ~3s | decision **ancestor** -> L01.M01.O01; no node; event-0006 |
| 6 | `quiz L01.M01.O01`: 8 turns incl. a mid-quiz handoff and return | ~30s | state on every turn; handoff -> new oxygen node depth 2; events 0007-0014, turns 0001-0008 |
| 7 | `save`: progress snapshot + manifest + session files; stamp, validate, push learner | ~12s | learner validate OK; pushed (08fd471) |

## Steps 2-5 decision table (the recursion)

| Step | Question (as typed) | decision | target / new id | depth | path[] len | validate after write |
|------|---------------------|----------|-----------------|------:|-----------:|----------------------|
| 2 | what actually pumps the protons across the membrane? | reuse | L01.M01.O01/proteins-essential-atp-synthesis | 2 (target) | n/a | OK (no node; reuse_count 3->4) |
| 3 | what does cytochrome c do? | reuse | .../cytochrome-c-structure-role | 3 (target) | n/a | OK (no node; reuse_count 0->1) |
| 4 | is cytochrome c the same in bacteria? | new | .../cytochrome-c-structure-role/cytochrome-c-bacteria | 4 | 3 | OK |
| 5 | ok but how does that relate to...energy production overall | ancestor | L01.M01.O01 | 1 (target) | n/a | OK (no node) |

### Rationale for each decision (the model's actual reasoning)

- **Step 2 (reuse, confidence 0.82).** canonical: "What pumps protons across the
  mitochondrial inner membrane?"; intent deepen; scope in_scope. The existing
  shared node `proteins-essential-atp-synthesis` answers it directly in its
  section s2: "Four upstream complexes, numbered one through four... pump protons
  across the membrane." At the course's `introductory` depth that is the complete
  answer, same intent, so MP-05 rule 3c (reuse) applies; a new node would
  duplicate it. This is one of the two outcomes the ask allowed. Note the nearby
  `L01.M01.O02/building-proton-gradient` is an even closer topical match but is
  `pending_review` and `created_by` lrn-fixture01 (not this learner), so rule 3c
  bars reusing it -- correct behaviour observed.
- **Step 3 (reuse, confidence 0.95).** canonical matches the target node's own
  canonical_question almost verbatim ("What does cytochrome c do in the electron
  transport chain?"). Clean reuse of the existing depth-3 node. **The engine
  found the existing chain node** -- this is the core reuse-when-it-matches evidence.
- **Step 4 (new, confidence 0.2).** No REGISTRY or PATH node covers bacterial
  cytochrome c. New node created under the node being read (the last PATH entry,
  cytochrome-c-structure-role). id prefix = parent + "/"; depth = 1 + count("/")
  = 4; path[] = the three ancestors, length 3. core avoids repeating the
  Complex III->IV shuttle already in PATH; bridge_to_objective is concrete
  (mandatory at depth >= 4).
- **Step 5 (ancestor, confidence 0.85).** "the first thing / energy production
  overall" resolves to the objective L01.M01.O01, an earlier PATH entry (not the
  parent) -- MP-05 rule 3a. A two-sentence recap + a sharper seed, no node.

## Reuse: registry diff

`git -C /tmp/course diff --stat` (vs the fixture commit):

```
 .../oxygen-final-electron-acceptor/node.json       | 72 +++++++++++++++++++
 .../oxygen-final-electron-acceptor/provenance.json | 21 ++++++
 .../cytochrome-c-bacteria/node.json                | 83 ++++++++++++++++++++++
 .../cytochrome-c-bacteria/provenance.json          | 21 ++++++
 .../cytochrome-c-structure-role/node.json          |  4 +-
 .../cytochrome-c-structure-role/provenance.json    |  2 +-
 .../proteins-essential-atp-synthesis/node.json     |  4 +-
 .../provenance.json                                |  2 +-
 registry/L01.M01.json                              | 39 +++++++++-
 registry/index.json                                |  6 +-
 10 files changed, 242 insertions(+), 12 deletions(-)
```

Added registry entries / bumped counters in `registry/L01.M01.json`:

```
+      "reuse_count": 4,     (proteins-essential-atp-synthesis, was 3 -- step 2)
+      "reuse_count": 1,     (cytochrome-c-structure-role, was 0 -- step 3)
+      "id": "L01.M01.O01/proteins-essential-atp-synthesis/cytochrome-c-structure-role/cytochrome-c-bacteria",  (new, step 4)
+      "id": "L01.M01.O01/oxygen-final-electron-acceptor",  (new, step 6 handoff)
```

`registry/index.json`: module L01.M01 node_count 7 -> 9 (two new nodes),
updated_at re-stamped. Both new nodes resolved to visibility `pending_review`
(the course `policy.learner_nodes` is `pending_review`), so both were written to
the **course repo** and appended to the module registry -- not private. No
private node was produced this session (see Defects: the ask expected some
private data, but consent+policy correctly routed these to pending_review).

## Step 6: the quiz (tutor state and handoff)

Concepts in scope for L01.M01.O01: cellular-respiration (target Understand),
atp-synthesis (Analyze), mitochondrion-structure (Understand). No prior
progress, so every concept starts at Remember. Turn-by-turn:

| turn | type | what happened | state.concept / level / attempt | state present? | state.competency |
|------|------|---------------|----------------------------------|:--------------:|------------------|
| 1 | intro (+Q1) | greet, list commands, ask Remember T/F | cellular-respiration / Remember / 1 | yes | cr 0, atp 0, mito 0 |
| 2 | feedback (+Q2) | Q1 correct (passed_first_try); ask Understand short-answer | cellular-respiration / Understand / 1 | yes | cr 40, atp 0, mito 0 |
| 3 | feedback (+Q2) | Q2 wrong (breathing misconception); auto hint 1; attempt 2 | cellular-respiration / Understand / 2 | yes | cr 40, atp 0, mito 0 |
| 4 | feedback | learner typed `hint`; hint 2 (moderate); no attempt used; help_used=true | cellular-respiration / Understand / 2 | yes | cr 40, atp 0, mito 0 |
| 5 | feedback (+Q3) | learner answered; Understand passed_after_help; concept complete; ask atp-synthesis Remember MC | atp-synthesis / Remember / 1 | yes | cr 70, atp 0, mito 0 |
| 6 | handoff | learner typed `ask: why is oxygen the final acceptor?`; state UNCHANGED, attempt not consumed | atp-synthesis / Remember / 1 | yes | cr 70, atp 0, mito 0 |
| 7 | question | returned_from oxygen node; Q3 repeated unchanged | atp-synthesis / Remember / 1 | yes | cr 70, atp 0, mito 0 |
| 8 | summary | learner typed `summary`; final report | atp-synthesis / Remember / 1 | yes | cr 70, atp 0, mito 0 |

- **state present on every turn: yes (8/8), including the handoff turn.** The
  carry-forward is exact: turn N+1 continues from turn N's state; competency
  never resets or drops.
- **Competency math (MP-06 section 2):** cellular-respiration T = 10 (Remember) +
  15 (Understand) = 25. Remember passed_first_try = 10; Understand
  passed_after_help = 7.5. earned 17.5 -> round(100*17.5/25) = 70. Matches the
  emitted competency. atp-synthesis and mitochondrion-structure never earned a
  level (0), as expected.
- **The handoff object (turn 6):**

```json
"handoff": {
  "to": "MP-05",
  "node_id": "L01.M01.O01",
  "section_id": "s4",
  "anchor_quote": "the spent molecule is then recharged in the mitochondrion",
  "learner_question": "why is oxygen the final acceptor?"
}
```

  The handoff ran a real MP-05 follow-up from inside the quiz. It resolved to
  **new** (confidence 0.4; the objective states oxygen is the final acceptor but
  does not explain why), producing node
  `L01.M01.O01/oxygen-final-electron-acceptor` (depth 2, path[] len 1,
  pending_review). TUTOR was then re-invoked with CONFIG.returned_from set to that
  node id; turn 7 welcomed the learner back and repeated Q3 unchanged, attempt
  still 1. The handoff -> follow-up -> return loop worked end to end.

## Step 7: files written to the learner repo

`git -C /tmp/learner ls-files | grep -v .gitkeep` (post-save):

```
manifests/2026-W39.json
profile.json
progress/cell-biology-obsidian/dev-ekkwqk/2026-09-27.json
sessions/ses-20260927-4few/event-0001.json ... event-0014.json   (14 events)
sessions/ses-20260927-4few/turn-0001.json  ... turn-0008.json     (8 turns)
```

- **Progress snapshot** (append-only, one per device per day):
  `progress/cell-biology-obsidian/dev-ekkwqk/2026-09-27.json`. concepts
  {cellular-respiration: 70 [Remember passed_first_try, Understand
  passed_after_help], atp-synthesis: 0 [Remember not_started],
  mitochondrion-structure: 0 []}; objectives {L01.M01.O01: in_progress};
  followups_asked lists the two reused + two created follow-up ids; three
  next_steps.
- **Weekly manifest** `manifests/2026-W39.json`: **bytes_total = 20553**, 27
  file entries (14 events + 8 turns + 1 progress + 1 profile + 3 .gitkeep),
  each with sha256 and bytes filled by stamp.js; validate recomputed every hash
  and byte count and passed.
- Events carry ts (stamped from "runtime"); turns carry no timestamp field and
  are written un-stamped (see Defects: apply_packet would have added an
  out-of-schema `ts` to turns, so I wrote turns directly rather than through
  `apply_packet --stamp`).

## Validation

Schema validation is active: `validate.js` climbs from the repo dir looking for a
`schemas/` dir; I placed a symlink `/tmp/schemas -> metadax/schemas` so
validation of both `/tmp/course` and `/tmp/learner` runs the full schema +
structural checks rather than silently skipping schemas (see Defects: DEFECT-6).

```
$ node tools/validate.js course /tmp/course
OK
$ node tools/validate.js learner /tmp/learner --course /tmp/course
OK
```

Both new nodes: id prefixed by parent + "/" (true), depth == 1 + count("/")
(true), content_sha256 stamped and recomputed-match (OK), path[] equals ancestor
chain (OK).

## Stack sizes (assemble.js)

- One **MP-05** call (step 4, the bacteria follow-up):
  `{"bytes":30535,"tokens_estimate":7633,"blocks":["CONFIG","COURSE","LESSON","MODULE","OBJECTIVE","CONCEPTS","LEARNER","PATH","ANCHOR","REGISTRY","INPUT"]}`
  -- 30535 bytes, 538 lines, ~7.6k input tokens. Block order matches the kernel.
- One **MP-06** call (the quiz):
  `{"bytes":34882,"tokens_estimate":8720,"blocks":["CONFIG","COURSE","OBJECTIVE","CONCEPTS","LEARNER","CONTENT","PROGRESS","SESSION","INPUT"]}`
  -- 34882 bytes, 760 lines, ~8.7k input tokens.

## Age-wall exercise (S-8), transcript trimmed

Ran once as a brand-new learner (no learner_id in config) before continuing as
lrn-sbx0adlt:

```
client: You're on the Claude Code client. Before we start -- are you 18 or older?
learner: I am 15
client: Thanks for being honest. The Claude Code and Claude Desktop clients are
        for adults in Phase 1. A companion designed for younger learners is
        planned, but I can't set up a profile or start lessons here for someone
        under 18. (stops -- no PROFILE run, no learner_id minted, no file written)
```

Correct: MP-01 create is never reached for a stated minor; no profile,
no repo write. I then switched to the pre-existing adult learner lrn-sbx0adlt for
the scripted session (as instructed -- did not create a new profile).

## Defect list

- **DEFECT-1 (TOOL, apply_packet.js / stamp.js -- turn stamping).** File:
  `tools/apply_packet.js` `maybeStamp` (line ~171) and `tools/stamp.js` `stampTs`.
  Any file whose name contains `turn-` is stamped with `obj.ts = now`, but the
  `metadax.tutor-turn/0.2` schema has `additionalProperties:false` and no `ts`
  property, so a stamped turn fails schema validation. Step: 6/7 (writing turns).
  Workaround: I wrote turn files directly and did not route them through
  `apply_packet --stamp`; events (which do require `ts`) were stamped normally.
  Fix: in `maybeStamp`, match `event-` only for `stampTs`; turns carry no
  timestamp and need no stamp (the `state` object is the checkpoint).
- **DEFECT-2 (SKILL/SCHEMA -- no `view` event type).** File:
  `skills/metadax-learner/SKILL.md` (`learn` bullet: "Log a `view` event") vs
  `schemas/event.schema.json` `type` enum {follow_up, answer, hint, skip,
  summary, handoff, return, note}. There is no `view` (nor `practice`) type.
  Step: 1, 3. Workaround: logged views as `type:"note"` with
  `data.action:"view"`, and graded quiz answers as `type:"answer"`. Fix: add
  `view` (and `practice`) to the event type enum, or change the skill to say
  "log a note event with action view".
- **DEFECT-3 (SKILL -- reuse_count bump not covered by a tool).** File:
  `skills/metadax-learner/SKILL.md` (`reuse` bullet: "bump `reuse_count` with a
  registry update (`tools/stamp.js registry ...`)"). `stamp.js registry` only
  recomputes `node_count` and `updated_at`; it does not touch `reuse_count`, and
  there is no tool that increments it. Step: 2, 3. Workaround: incremented the
  registry entry's `reuse_count` (and the target node's `stats.reuse_count`,
  MP-05 contract 9) with a one-off script, then ran `stamp.js registry` and
  re-stamped the node (its `core` is unchanged, so `content_sha256` is stable).
  Fix: add `stamp.js reuse <course-dir> <node-id>` or a flag to bump both
  counters.
- **DEFECT-4 (DOC/WALKTHROUGH -- assemble example flags out of date, minor).**
  File: `docs/INTERFACE.md` section (b) shows `assemble.js --op MP-05 ... --input
  "..." --config ...` without `--prompts`, but the tool requires `--prompts
  <dir>`. Step: stack-size measurement. Workaround: added `--prompts prompts`.
  Fix: add `--prompts prompts` to the worked example.
- **DEFECT-5 (SKILL -- learner-repo root ambiguity, cosmetic).** File:
  `skills/metadax-learner/SKILL.md` and `docs/INTERFACE.md` write paths as
  `learners/<id>/sessions/...` then clarify "the repo root IS the learner
  directory". The seeded sandbox repo puts `profile.json`, `sessions/`,
  `progress/` at the repo root (no `learners/<id>/` prefix), which matches
  apply_packet's `LEARNER_ROOTS`. No functional break; I used the root form.
  Fix: make the doc examples use the root form consistently.
- **DEFECT-6 (TOOL -- schema validation silently skipped off-tree, latent).**
  File: `tools/validate.js` `findRepoRoot`. When a course/learner repo is not
  under a tree containing `schemas/` (a real user's course repo usually is not),
  `buildSchemaIndex` returns null and validation runs structural checks ONLY,
  printing `OK` with no note that schema checks were skipped. Step: 8. Workaround:
  symlinked `/tmp/schemas -> metadax/schemas` so schema checks actually ran. Fix:
  accept a `--schemas <dir>` flag, or print a `WARN: schema validation skipped
  (no schemas/ found)` line so an operator knows.

Nothing in the walkthrough or the learner skill still carried a `python3
tools/*.py` line (`grep` clean; the Node.js sweep landed before this run),
so there is no Python/Node WALKTHROUGH/SKILL defect to report.

## E03 metrics (from the experiment card)

- **JSON state leaks into the child/learner view: 0 of 8 turns (0%).** Every
  turn's learner-facing text lives in `display.message` / `display.question`; the
  `state`, `meta`, `feedback.misconception` and `handoff` objects are structural
  and were never surfaced as prose. Target was <= 5%. (This run is the adult
  self-play path; the parent/child split was not separately exercised, but the
  view/state separation the metric measures held.)
- **Approval dialogs per session: 0** (git-native, non-interactive; auth was the
  ambient credential).
- **Tokens per turn (estimate):** input stack ~7.6k tokens for an MP-05
  follow-up and ~8.7k for an MP-06 quiz turn (assemble.js tokens_estimate);
  model output per turn roughly 0.3k-1.2k tokens (one JSON object). Call it
  ~8-10k tokens per turn all-in.
- **Turn number of the first rule break: none.** No rule break occurred (stop
  rule was "kill if a rule break before turn 40"). state was on all 8 turns,
  competency never dropped, the handoff did not consume an attempt or mutate
  state, no id was invented, no private data entered the course repo.
- **Saves lost: 0.** The single `save` wrote the snapshot, manifest and all
  session files, validated OK, committed and pushed to the learner repo on the
  first attempt.

## Verdict

The recursion and the tutor both work through a real model on the git-native
client. The follow-up engine produced valid nodes with correct ids and path[]
(steps 4, 6), reused the existing chain when the question matched (steps 2, 3),
and looped back to an ancestor (step 5). The tutor carried state across all 8
turns and handed off to a follow-up and back without losing state or an attempt.
Append-only events, turns, a progress snapshot and a weekly manifest all landed
and validate. Six defects found, all worked around without editing skills, tools
or prompts; none blocked the run.
