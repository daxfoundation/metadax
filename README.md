# Meta DAX

**Open infrastructure for universal learning. Any subject, any domain, any learner, any bandwidth.**

> **New here?** Start with **[Meta DAX: An Introduction](https://jeyanandan.com/blog/meta-dax/)** -- why this exists and what it is trying to do, in plain language. Further articles will be linked here as they are published.

## In plain words

Anyone who knows a subject can describe a course in one sentence, and Meta DAX writes it: the lessons, the pages, the ideas each page depends on, and the mistakes learners are likely to make, written down before a single page exists. Every page can be shaped to the person reading it -- the same physics told through baking for a baker, or through cycling for a cyclist -- without cloning the course. The learner can ask "why?" as many times as they like, and each answer knows the questions that led to it. They are quizzed in steps that climb from remembering to applying, walked out of wrong ideas without being handed the answer, and they keep their own private record of what they learned.

It compounds. A course a teacher chooses to publish is open for anyone to teach from, fork and improve. A question a learner chooses to share can, once a teacher reviews it, become part of the course for the next learner. The long-term aim is universal learning -- every human being, any subject, any domain, free -- designed first for someone with about five minutes of connectivity a day, and for every bandwidth above that. That offline client does not exist yet. This repository is where the experiments towards it are run, in the open, with every result dated and every gap written down.

## The benchmark

Every decision in Meta DAX is measured against one internal benchmark:

> **Take a person who can communicate, and get them to the equivalent of a master's degree from an Ivy League university -- on five minutes of connectivity a day.**

It is audacious on purpose. It is not a roadmap, and nobody is claiming it is achievable. It only has to work in theory -- a chance of working that is greater than zero -- and that is the point: holding it throws out every design that quietly assumes bandwidth, money, or a teacher in the room.

**We are developing this for all bandwidths!** Five minutes a day is simply where we have chosen to start.

Any domain means any domain: a child meeting fractions, a nurse training the next nurse, a company teaching ten thousand of its own people. Meta DAX is being designed from the start to be enterprise grade.

## A way, never the way

There is never *the* way. There is always *a* way. With respect to the Mandalorian creed, nothing in this repository will ever say "This is the way."

Knowing an answer is not a reason to hand it over as *the* answer, so the system is built not to lead. If you ever feel it steering you, say so -- to us, or to the system while you are using it.

Picture learning as the tree of life drawn upside down: every branch anyone has ever taken, from the first question outward, all of them related to one another. Every path is worth keeping. So are the dead ends, recorded as carefully as the arrivals, because finding where people fail matters as much as finding how they got from A to B. And so is the negative space: the parts of a subject nobody has explored yet.

## Coming next

Planned, not run. There are no specs for these yet; they are questions we intend to put to the system in the open, alongside the fourteen experiments below.

- **One thread, two worlds.** A tutoring exchange in one language and one culture becomes a set of assets that fits a learner on the other side of the world, in another language and another culture, joined only by something they happen to share -- a hobby, say -- with the likely misconceptions already mapped.
- **Many teachers, many learners.** Courses that grow from many teachers and many learners at once, and what compounds when they do.
- **The teacher's walkthrough.** Guidance and templates that adapt to what a particular teacher brings -- their [human delta value](https://daxfoundation.org/#human-delta-value) -- instead of assuming it.
- **Failure, mapped.** Where learners get lost, recorded as carefully as where they arrive.
- **Not leading.** Does the system steer learners toward its own answer? Measured, and flagged by learners themselves.
- **Compounding.** Do knowledge and intelligence, [as the Foundation defines them](https://daxfoundation.org/#definitions), compound across teachers, learners and organisations when every contribution sits on a [Constraint Protocol](https://github.com/daxfoundation/constraint-protocol) record nobody can quietly edit? That is what the protocol is intended to make possible; it has not been shown.
- **Every bandwidth.** The same course, from five minutes a day to always on.
- **Inside organisations.** The same infrastructure, private, behind a company's own walls.
- **The model on the device.** Enough of the teaching packed into each bundle that a small model on a phone only has to hold the conversation.

Nothing here is production. The clients, the limits they run under, and the architecture itself are experiments, and no element of any of them is set in stone.

## Latest results

*Last updated 2026-09-28, by hand for now.* Every result below comes from a dated file in an experiment's `results/` folder. All runs so far are automated: a model played the client and, in the learner runs, a simulated learner. None of them is a pilot with a person.

| Experiment | The question | Latest result |
|---|---|---|
| [E01](experiments/E01/) -- teacher | Can a non-technical adult create a course into a repository with the Claude Code client? | **Done, first cut.** [Run 1](experiments/E01/results/2026-09-27-teacher-run-newtons-laws.md): an empty repository to a 7-objective course, first page at about 8 minutes. [Run 2](experiments/E01/results/2026-09-27-newton-course-run.md): *Newton's Laws of Motion*, 3 lessons, 7 modules, 21 objectives, every page validated. |
| [E03](experiments/E03/) -- learner | Can a learner session run end to end: read, follow up three levels deep, take a quiz, save? | **Done, first cut.** [Run 1](experiments/E03/results/2026-09-27-learner-run-cell-biology.md): the fixture course, four follow-ups, competency 70. [Run 2](experiments/E03/results/2026-09-27-newton-learner-run.md): the Newton course, six follow-ups to depth 4, competency 83, three bugs found, two fixed in the tools with regression tests. |
| [E04](experiments/E04/) -- evals | Do the v0.2 prompts produce valid, on-spec output on both vendors' models? | Harness built, [not yet run](experiments/E04/results/2026-09-27-first-run.md). |
| [E05](experiments/E05/) -- reuse | Does the follow-up engine make the right reuse, extend or new decision against a registry? | Cases built, [not yet run](experiments/E05/results/2026-09-27-first-run.md). |
| E02, E06-E14 | See [experiments/](experiments/) | Not started. |

**See the Newton run end to end:** the [interactive run report](https://claude.ai/artifact/Nv4j2tpPh9PidXvLiAaP31) shows the course map, every page, the follow-up tree in 3D, the quiz turn by turn, and three interactive labs. The labs were built afterwards for the report, as a proposal; the v0.2 prompts do not produce them. The report is hosted as a shared artifact on claude.ai.

The full account of each run, including what it does not show, is in [What has actually run](#what-has-actually-run).

---

A teacher turns any subject into a course. A learner reads it, asks follow-up questions
as deep as they like (a follow-up of a follow-up of a follow-up), gets quizzed through
Bloom's taxonomy, and keeps a private record of what they learned. There is no server,
no database and no app to install: the system is a suite of meta prompts, a set of JSON
schemas, a few small tools, and the things you already have -- a chat model, `git`, and
GitHub.

Meta DAX is a research project of the DAX Foundation. It is a set of experiments before it
is a product, and this README says plainly what has run and what has not. Nothing in it
is production, and no element of the architecture is set in stone.

> Status (2026-09-28): Phase 1 foundation built. Prompt Suite v0.2, the operation
> contract, the Claude Code client, the tools, the schemas and the fixture course are in
> this repository and validate. The first end-to-end runs (E01, the teacher, and E03, the
> learner) are recorded; the numbers are in [What has actually run](#what-has-actually-run).
> The eval harnesses for E04 and E05 are built but not yet run. Everything else in
> `experiments/` is not started.

---

## The idea in one example

In the previous prototype (EdDAX, 2024-2025) the project's author, reading an introductory
cell-biology lesson, asked a chain of questions five levels deep. The real chain, with the
questions in their canonical form and converted to Meta DAX ids:

```
L01.M01.O01
  How do mitochondria produce energy for the cell?
L01.M01.O01/proteins-essential-atp-synthesis
  Which proteins are essential for ATP synthesis in the mitochondrion?
L01.M01.O01/proteins-essential-atp-synthesis/cytochrome-c-structure-role
  What does cytochrome c do in the electron transport chain?
L01.M01.O01/.../cytochrome-c-structure-role/electron-donation-complex-iv
  How does cytochrome c donate electrons to Complex IV?
L01.M01.O01/.../electron-donation-complex-iv/plant-mitochondria-different
  "are plant ones different??"  (as typed)
```

EdDAX stored that chain but never showed a node its ancestors, so at depth four the saved
answer was a refusal: the model thought "donation to Complex IV" was off-topic for an
introductory module. Context loss, saved as course content.

Meta DAX makes three changes:

1. **The recursion lives in the data.** One follow-up engine handles every depth. What
   grows is the PATH block it receives (the ancestors' ids, titles and summaries), and the
   node id itself encodes the whole ancestry, so depth is `1 + count("/")` and any model
   can rebuild the breadcrumb from the id.
2. **Knowledge is shared; presentation is personal.** A node stores one audience-neutral
   `core` and renders it per learner. Another learner with the same question is pointed
   at the existing node (one of five decisions: new, extend, reuse, ancestor, redirect)
   instead of creating a duplicate.
3. **Git is the database.** Courses and learner records are files in the user's own
   repositories, append-only and split per module so concurrent learners rarely touch the
   same file.

The fixture course in `fixtures/courses/cell-biology-obsidian/` is that real chain rebuilt
in the new layout, with fresh content, so every test and eval runs against a recursion that
actually happened.

---

## What is in this repository

| Path | What it holds |
|---|---|
| `prompts/` | Prompt Suite v0.2: a kernel (MP-00) and ten operations (profile, architect, compiler, content, follow-up engine, Bloom tutor, evaluator, steward, curator, session runner) plus `SCHEMAS.md`, the normative data model. CC0. |
| `schemas/` | JSON Schema 2020-12 for every record (course, node, provenance, registries, profile, progress snapshot, event, tutor turn, manifest, commit packet, config). |
| `tools/` | Eight Node.js tools, zero dependencies: canonical hashing, stamping, id/slug rules, context-stack assembly, packet application, validation, tests. |
| `skills/` | The first client: two Agent Skills that make Claude Code a git-native Meta DAX client (teacher and learner). Mirrored in `.claude/skills/` and `.agents/skills/`. |
| `adapters/` | Headers for clients that cannot write files (Claude Desktop, ChatGPT): they emit a commit packet instead. |
| `docs/` | `INTERFACE.md` (the operation contract every client implements), `CONCEPTS.md` (sixteen concepts, one at a time), `ARCHITECTURE.md`, `WALKTHROUGH-CLAUDE-CODE.md`, `EXPERIMENTS.md`, `DECISIONS.md`, `GLOSSARY.md`, `PRIVACY.md`, `LICENSING.md`, `ACCURACY.md`, and the frozen `SPEC-v0.2.md`. |
| `fixtures/` | The reference course (the mitochondria chain) and a fixture learner, fully stamped. |
| `templates/` | Skeletons for a course repo and a learner repo. |
| `evals/` | Eval cases built from the fixture, a 50-node planted registry for E05, a grader and two runners. |
| `experiments/` | One card per experiment, E01..E14, each with a `results/` folder that only ever holds real runs. |

---

## How it works

Every call to the system is one **operation**: the kernel prompt, one operation prompt,
and a stack of tagged input blocks go in; exactly one JSON object comes out.

```
[K] MP-00 kernel            (always)
[T] MP-xx operation prompt  (always)
<<START CONFIG>>    mode, output_mode, client, write_mode ...        <<END CONFIG>>
<<START COURSE>>    id, title, steer, policy                          <<END COURSE>>
<<START OBJECTIVE>> id, statement, concepts, bloom_target             <<END OBJECTIVE>>
<<START LEARNER>>   pseudonymous profile (accommodations, never diagnoses)  <<END LEARNER>>
<<START PATH>>      ancestors root -> parent: id, title, summary      <<END PATH>>
<<START ANCHOR>>    the section the learner was reading, one quote    <<END ANCHOR>>
<<START REGISTRY>>  the parent's children + course-wide candidates    <<END REGISTRY>>
<<START INPUT>>     the learner's question, as typed (<= 500 chars)   <<END INPUT>>
```

The **client** does what the model must never do. It pulls the repos, assembles the stack
(`node tools/assemble.js`), runs the model, checks the reply against structural gates (ids
only from REGISTRY or PATH, prefix rule, 200-character ids, 80-character titles, no
overwrite, private data never in a course repo), writes the records, **stamps** them
(timestamps, content hashes, provenance -- the model writes the literal string `"runtime"`
in those fields; kernel rule K-15), validates, commits and pushes.

Two write modes cover every client: `git` (the client writes files itself; Claude Code)
and `packet` (the model ends its output with a COMMIT PACKET that a person or
`tools/apply_packet.js` applies; Claude Desktop, ChatGPT, an API runner). The full
contract is `docs/INTERFACE.md`.

The first client is **Claude Code**, and it is self-hosting: the model running the skill is
the model that executes the meta prompt. The skill reads the assembled stack file, produces
the one JSON object, and shells out to the tools for everything deterministic. No token is
stored anywhere; authentication is whatever your `git` already has.

```
git clone https://github.com/daxfoundation/metadax
# create a course repo and a private learner repo from templates/
# write metadax.config.json (paths, learner id, device id)
claude            # in the metadax clone
> make me a short course on Newton's laws of motion
> start learning
> ask: why does the ball keep rolling?
```

`docs/WALKTHROUGH-CLAUDE-CODE.md` has every step.

---

## The concepts we are exploring

Each is a section of `docs/CONCEPTS.md`, with the idea, why it matters, where it lives,
what EdDAX did instead, and the open question an experiment must answer.

1. **Meta prompts are the product; the runtime is rented** -- a chat client, git and GitHub do the jobs a server would.
2. **Recursion lives in the data, not in the prompt** -- one engine, any depth; the PATH block is the memory; ids encode ancestry.
3. **Reuse without copying** -- five decisions per question: new, extend, reuse, ancestor, redirect; a tree for writing, a DAG for reading.
4. **Knowledge is shared, presentation is personal** -- one neutral core, many renderings; no more cloning a course per learner.
5. **The Bloom tutor** -- competency relative to each concept's target level, weights 10/15/20/20/15/20, state on every turn, handoff to a follow-up mid-quiz.
6. **Everything an LLM writes is bounded** -- because the old data had answers stored as titles and refusals stored as summaries.
7. **The operation contract** -- any model, any client, one JSON object out; the client checks and stamps.
8. **Git is the database** -- course repo and learner repo; append-only records; per-module registries so merges stay clean.
9. **Two write modes** -- git-native and commit packet.
10. **Certification instead of trust** -- a prompt is certified for a named model set by evals, not by reputation.
11. **The age wall and the companion path** -- adults only in Phase 1 clients; younger learners later, through a companion, with the prompts' minor bands kept intact for it.
12. **Grounding and honesty** -- source_only / source_first, never a fabricated citation; Oak National Academy as the intended first grounding corpus.
13. **Accommodations, not diagnoses** -- a learner profile stores what helps, never a label.
14. **Provenance and constraints** -- every node has a client-written provenance file; fields reserved for a future constraint and signing layer are null and not live.
15. **The offline five-minutes-a-day client** -- deferred, but every schema already honours its checklist.
16. **Open source and forkable** -- CC0 prompts, CC BY docs and content, Apache-2.0 code; publish, fork, and the Foundation may steward a copy with attribution.

---

## The experiments

Fourteen questions, the first of countless more to come, each with a method, metrics and a kill line (`docs/EXPERIMENTS.md`;
cards in `experiments/`). A result appears in a card's `results/` folder only when an
actual run produced it.

| Id | Question | Status |
|---|---|---|
| E01 | Can an adult create a course into a repo with the Claude Code client? (E01b: Claude Desktop) | done, first cut (automated runs with Claude, 2026-09-27) |
| E02 | The same on ChatGPT, with the commit packet | not started |
| E03 | A learner session: read, three follow-up levels, quiz, save | done, first cut (adult path, automated runs with Claude, 2026-09-27) |
| E04 | Do the v0.2 prompts pass on both vendors? (schema-valid rate, rubric) | harness built; not yet run |
| E05 | Does the follow-up engine reuse correctly from a registry? | cases and a 50-node planted registry built; not yet run |
| E06 | Does the weekly git-bundle loop close at 50 kbps? | not started |
| E07 | Can the architect ground a unit on Oak via MCP with real citations? | not started |
| E08 | Generated interactive assets: pass rate against oracle tests | not started |
| E09 | Records a homeschooling parent would file | not started |
| E10 | A 2-4B on-device model running the quiz with a grammar | not started |
| E11 | Learner repo ingested by a companion's memory (isolated copy) | not started |
| E12 | Provenance plus signed commits verified later as a chain | not started |
| E13 | Prompt Forge: a teaching-method variant, generated and certified | not started |
| E14 | Does the age wall bite in practice? (observe only) | not started |

---

## What has actually run

Two rounds of end-to-end runs and one eval build happened on 2026-09-27. All of them were
automated: Claude (Anthropic) acted as the client, following the same self-hosting pattern
as the Claude Code skills in this repository (assemble the stack, answer with one JSON
object, check, write, stamp, validate). Run 1 used the Claude Code client; run 2 ran in the
Claude desktop app and added a simulated adult learner. None of them is a pilot with a
human adult. Every number below comes from the dated files in `experiments/E01/results/`
and `experiments/E03/results/`.

**E01, the teacher path, run 1.** An empty course repository went to a seven-objective course
("Newton's laws of motion, for an adult returning to physics": `course.json`, seven
objective nodes with provenance, four per-module registries, an index) with
`tools/validate.js` printing OK after every node and every commit pushed. First saved
node at 479 seconds (about 8 minutes, under the card's 15-minute kill line); the whole
short course at 908 seconds. One tool error (a stamp command wanted a file path where the
skill said directory), worked around. The reviewer read two nodes: the physics is correct
(net force as a vector sum; inertia is not a force; the weight/normal-force pair is not an
action-reaction pair; 20 N / 4 kg = 5 m/s^2), maths is plain text as configured, and the
seeds are real questions ("If the forces are equal, why does the bullet fly but the gun
barely move?"). Eight defects were recorded: three in the walkthrough (git identity never
set; assumes an empty repo; a placeholder model name), two in the skill, two in the tools,
one Bloom-casing mismatch between a prompt and a schema; all have since been fixed. The
two nodes the reviewer read are reproduced verbatim in the results folder.

**E01, the teacher path, run 2.** The full course, "Newton's Laws of Motion: An Everyday
Introduction": 3 lessons, 7 modules, 21 objectives and 11 concepts with prerequisites and
Bloom targets, about 12,800 words with 79 typeset LaTeX expressions. `tools/validate.js`
printed OK after every one of the 21 nodes.

**E03, the learner path, run 1.** On a scratch copy of the fixture course, learner
`lrn-sbx0adlt` read the objective and asked four follow-ups, then took a quiz and saved:

| Step | Question, as typed | Decision | Where it went |
|---|---|---|---|
| 2 | what actually pumps the protons across the membrane? | **reuse** (0.82) | the existing depth-2 node; `reuse_count` 3 -> 4 |
| 3 | what does cytochrome c do? | **reuse** (0.95) | the existing depth-3 node in the real chain |
| 4 | is cytochrome c the same in bacteria? | **new** (0.2) | a depth-4 node, `path[]` of length 3, validate OK |
| 5 | ok but how does that relate to the first thing, energy production overall | **ancestor** (0.85) | back to the objective; no node created |

The engine also declined to reuse a closer topical match because it was `pending_review`
and belonged to another learner -- the rule the prompt states, observed in practice. The
quiz ran eight turns with `state` present on all eight; competency followed the formula
(Remember first try 10, Understand after help 7.5, over a target of 25: 70); a mid-quiz
`ask:` produced a real handoff to the follow-up engine, a new depth-2 node, and a return
to the same question with the attempt intact. `save` wrote 14 event files, 8 turn files,
a progress snapshot and a weekly manifest (20,553 bytes), validated OK, and pushed to a
private learner repository. The age wall stopped a stated 15-year-old before
any profile was written. Stack sizes: about 7.6k tokens for a follow-up call, 8.7k for a
quiz turn (assembler estimate). Six defects recorded, all worked around without editing a
prompt, skill or tool; none was a rule break by the model. The E03 card's kill line (a
rule break before turn 40) was not hit.

**E03, the learner path, run 2.** A simulated adult learner (an adult beginner who cycles
and bakes, written by the model) took the run-2 Newton course. The age wall passed an adult
and stopped two probes (a stated 15-year-old and "not sure") before anything was written.
The learner asked six follow-ups: three new nodes going four levels deep, one reuse of an
existing objective, one jump back up the path (ancestor), and one extend that came from a
question asked mid-quiz. The quiz ran eight turns with EVALUATE grading the free-text
answers; the predicted misconception ("inertia is a force") appeared on the first attempt
and was fixed with two hints, and competency on the first law ended at 83. The save wrote a
new progress snapshot and sent the learner back to the Module 1 foundations they had
skipped. The run found three bugs the unit tests had missed; two were in the tools and are
fixed with regression tests (`tools/stamp.js` reuse, `tools/assemble.js` for EVALUATE).

**E04 and E05, the evals.** The harness is built: 27 cases assembled from the fixture with
the real assembler (12 follow-up cases including reuse, ancestor, redirect, extend,
over-length input, prompt injection and a slug collision; 6 tutor cases; profile,
architect, content and evaluator cases), a zero-dependency grader with schema, gate and
expectation layers, a runner, a promptfoo configuration and a dispatch-only certification
workflow. **No model has executed these cases yet**: on the first attempt the build
environment's nested `claude -p` was not authenticated. The two result files say "not run" and both cards stay
"not started". Running them, on a second vendor as well, is the next step and the one that
produces the first certification.

**What this does and does not show.** The self-hosting Claude Code client works end to
end for a teacher and for a learner, the recursion produces valid nodes with correct
ancestry, reuse and ancestor decisions fire when they should, and the tutor keeps state
across turns and hand-offs. It does not yet show what a non-technical adult experiences
(minutes, dialogs, confusion), how the prompts behave on a second vendor, or precision and
recall of reuse at scale (the 50-node registry with planted duplicates is built in
`evals/e05/` and waits for a run). The defects from the runs are fixed in this repository,
with the evidence left as recorded.

---

## Where this came from

EdDAX (2024-2025) was a Blazor web application with SQL Server, Cosmos DB and an Azure
AI Search index wrapped around about a dozen prompt strings. Before writing a line of
Meta DAX, the maintainers analysed the old prototype's code and saved data. The findings
shaped every design law above:

- Follow-ups formed an unbounded tree (`qnas.parent_qna_id`, real data five levels deep),
  but the model never saw a node's ancestors and the anchor (what the learner highlighted)
  was dropped on the way to the prompt.
- Reuse existed only by browsing other learners' children; nothing matched by meaning.
- 17 of 25 follow-up titles in the saved data held the whole answer; 13 summaries were
  stored model refusals. Hence: everything an LLM writes is bounded.
- The quiz hardcoded arithmetic, could reach 120 percent competency, and never saved a
  result. Hence: the Bloom tutor with a normative formula and state on every turn.
- Personalisation was author-time only: the same course cloned six times, once per age.
  Hence: shared core, personal renderings.

---

## How this was built

Meta DAX was designed by its maintainers and built with Claude (Anthropic), using Claude
Code and the Claude desktop app. The prompts, tools, schemas, skills and docs were written
against a frozen change spec (`docs/SPEC-v0.2.md`), and every change was checked against
the repository (hashes, tests, validation) before it was accepted. The pattern is itself
one of the things the project is learning from: how far a prompt-defined system can be
built with prompt-driven agents, with people deciding and verifying.

---

## Decisions, licences, privacy, accuracy

- `docs/DECISIONS.md` -- the twelve decisions of 2026-09-27, verbatim, and what is pending.
- `docs/LICENSING.md` and `LICENSES.md` -- prompts and schemas CC0 1.0; docs CC BY 4.0; code Apache-2.0; generated course content at the author's choice (default CC BY 4.0); DCO for contributions.
- `docs/PRIVACY.md` -- pseudonyms only; no email, name, school or diagnosis anywhere; private nodes never leave the learner repo; adults only in Phase 1 clients; no telemetry, no server.
- `docs/ACCURACY.md` -- the accuracy commitments: no result without a recorded run, reserved fields described as reserved, no affiliation implied, models named by vendor outside eval results.

## Contributing

Phase 1 is a build in progress. Course repos are private by default; publish when ready.
Contributions to this repository need a DCO sign-off (`git commit -s`). Prompt changes are
versioned (`prompts/CHANGELOG-v0.2.md`): a change to a prompt is a decision, not a patch.

## Trademarks and affiliation

Meta DAX is an independent project. It is not affiliated with or endorsed by Anthropic,
OpenAI, GitHub or Oak National Academy. Claude, Claude Code, ChatGPT and GitHub are
trademarks of their respective owners and are named only to describe the clients and
platforms Meta DAX works with.
