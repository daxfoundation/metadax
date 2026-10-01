# Meta DAX

**Open infrastructure for universal learning. Every human being. Any subject. Any domain. Any bandwidth. Free, forever.**

> **New here?** Start with **[Meta DAX: An Introduction](https://jeyanandan.com/blog/meta-dax/)** -- why this exists and what it is trying to do, in plain language. Then **[Human delta value](https://daxfoundation.org/writing/human-delta-value/)** -- the measure under every experiment here, and close to the point of all of them.
>
> **Where we are:** [What has run](#where-we-are-starting) -- [The legwork](#the-legwork) -- [Where we want to get to](#where-we-want-to-get-to) -- [The map](#the-challenge-map). This repository is where everything about Meta DAX is read; [daxfoundation.org](https://daxfoundation.org/#learning) points here.

## The benchmark

Every decision in Meta DAX is measured against one internal benchmark:

> **Take a person who can communicate, and get them to the equivalent of a master's degree from an Ivy League university -- on five minutes of connectivity a day.**

It is audacious on purpose. It is not a roadmap, and nobody is claiming it is achievable. It only has to work in theory -- a chance of working that is greater than zero -- and that is the point: holding it throws out every design that quietly assumes bandwidth, money, or a teacher in the room.

**We are developing this for all bandwidths!** Five minutes a day is simply where we have chosen to start.

Five minutes a day means the learning cannot live on the network, so it does not. A bundle is generated, customised to the particular learner and to what they have already done, and it comes down whole. They work through it interactively, offline, for as long as they like. What they did goes back up on their next five minutes, and the next bundle comes down shaped by it.

It will be open source and it will be free. Not freemium, not free-for-some, not free-until-funded.

Any domain means any domain: a child meeting fractions, a nurse training the next nurse, a company teaching ten thousand of its own people. Meta DAX is being designed from the start to be enterprise grade.

## In plain words

Anyone who knows a subject can describe a course in one sentence, and Meta DAX writes it: the lessons, the pages, the ideas each page depends on, and the mistakes learners are likely to make, written down before a single page exists. Every page can be shaped to the person reading it -- the same physics told through baking for a baker, or through cycling for a cyclist -- without cloning the course. The learner can ask "why?" as many times as they like, and each answer knows the questions that led to it. They are quizzed in steps that climb from remembering to applying, walked out of wrong ideas without being handed the answer, and they keep their own private record of what they learned.

It compounds. A course a teacher chooses to publish is open for anyone to teach from, fork and improve. A question a learner chooses to share can, once a teacher reviews it, become part of the course for the next learner. And a move a tutor makes once, for one learner in one language, can be captured as a technique and offered to a stranger on the other side of the world who shares nothing with the first learner but a hobby -- that is the first of the experiments we want to reach, [X01](#where-we-want-to-get-to), and it is what compounding looks like when it is a person's move that compounds. The long-term aim is universal learning -- every human being, any subject, any domain, free -- designed first for someone with about five minutes of connectivity a day, and for every bandwidth above that. That offline client does not exist yet. This repository is where the experiments towards it are run, in the open, with every result dated and every gap written down.

## The measure: human delta value

Under every experiment here sits one measure, and it is close to being the point.

[Human delta value](https://daxfoundation.org/definitions/#human-delta-value) is what a human being brings: what only a human can currently do, and what a person and their cognitive companion reach together that neither would alone. The first Meta DAX run showed it uninvited: the teacher's plan arrived defaulted, the outcomes rubric came from a catalogue that grows with every teacher who publishes one, and every decision became a micro-adjustment to something already there. A great deal of cognitive labour had been taken off the teacher. The question that matters is what the teacher does with the cognition they got back.

That is deliberate. Meta DAX is built to **invert the ratio of students to teachers**: behind each learner, every tutor's move ever captured, every misconception ever mapped, every dead end anyone found first, offered as one way among many. A learner gets more teaching than any teacher could give. And the teacher is handed their cognition back, on purpose, for the problems they could previously only dream about -- the learner who was going to be lost, the subject nobody has taught yet, the move that works once and then, through the record, for everyone after. We call that **reclaimed cognition**, and it is reported by the person in their own words and recorded as expressed, never inferred and never measured in minutes.

It is not a one-off. It is the thread through every experiment below, and it comes with a demand: a person and their companion are one unit, and the unit is only as strong as the human's best in the moment. The better the companion, the more that best is worth. Everybody needs to step up. The reasoning, the failure modes and the kill line are in [Human delta value: the measure](https://daxfoundation.org/writing/human-delta-value/); where it came from is [on Jason's site](https://jeyanandan.com/blog/human-delta-value/).

## A way, never the way

Education does an enormous amount of good, and at scale it has no choice but to standardise: one pace, one sequence, one way of demonstrating that you have understood. Learning is the thing underneath it, and learning does not standardise -- it happens at the pace of the person doing it. Meta DAX is about the second one.

There is never *the* way. There is always *a* way. With respect to the Mandalorian creed, nothing in this repository will ever say "This is the way."

Knowing an answer is not a reason to hand it over as *the* answer, so the system is built not to lead. If you ever feel it steering you, say so -- to us, or to the system while you are using it.

Picture learning as the tree of life drawn upside down: every branch anyone has ever taken, from the first question outward, all of them related to one another. Every path is worth keeping. So are the dead ends, recorded as carefully as the arrivals, because finding where people fail matters as much as finding how they got from A to B. And so is the negative space: the parts of a subject nobody has explored yet.

![Learning, drawn as the tree of life upside down: every path from the first question is kept, the dead ends are kept and marked, one learner's question answers another's, and the negative space nobody has explored yet is marked. There is never the way. There is always a way.](docs/figures/tree-of-learning.svg)

## Where we are, and where we are going

Three tiers. The first fourteen experiments are where we are starting, and they are deliberately small. Between them and the big ones sits the legwork nobody writes a post about. And then the twelve we can already picture. The small ones earn the big ones: nothing in the third tier can run honestly until the first two have.

![From one run to twelve scenes: on the left, what has run, one teacher run and one learner run with a model in both chairs; across the span, the legwork, identifiers and schemas at scale, a registry at scale, reuse across languages, the five-minute bundle, certification, the constraint fields made live, privacy at scale; on the right, the twelve experiments we can already picture, ending at five minutes to master's.](docs/figures/bridge.svg)

### Where we are starting

Fourteen questions, each with a method, metrics and a kill line (`docs/EXPERIMENTS.md`; cards in `experiments/`). A result appears in a card's `results/` folder only when an actual run produced it. *Last updated 2026-10-01, by hand for now.* All runs so far are automated: a model played the client and, in the learner runs, a simulated learner. None of them is a pilot with a person.

| Id | Question | Status |
|---|---|---|
| [E01](experiments/E01/) | Can an adult create a course into a repo with the Claude Code client? (E01b: Claude Desktop) | **done, first cut.** [Run 1](experiments/E01/results/2026-09-27-teacher-run-newtons-laws.md): an empty repository to a 7-objective course, first page at about 8 minutes. [Run 2](experiments/E01/results/2026-09-27-newton-course-run.md): *Newton's Laws of Motion*, 3 lessons, 7 modules, 21 objectives, every page validated. |
| E02 | The same on ChatGPT, with the commit packet | not started |
| [E03](experiments/E03/) | A learner session: read, three follow-up levels, quiz, save | **done, first cut.** [Run 1](experiments/E03/results/2026-09-27-learner-run-cell-biology.md): the fixture course, four follow-ups, competency 70. [Run 2](experiments/E03/results/2026-09-27-newton-learner-run.md): the Newton course, six follow-ups to depth 4, competency 83, three bugs found, two fixed with regression tests. |
| [E04](experiments/E04/) | Do the v0.2 prompts pass on both vendors? (schema-valid rate, rubric) | harness built; [not yet run](experiments/E04/results/2026-09-27-first-run.md) |
| [E05](experiments/E05/) | Does the follow-up engine reuse correctly from a registry? | cases and a 50-node planted registry built; [not yet run](experiments/E05/results/2026-09-27-first-run.md) |
| E06 | Does the weekly git-bundle loop close at 50 kbps? | not started |
| E07 | Can the architect ground a unit on Oak via MCP with real citations? | not started |
| E08 | Generated interactive assets: pass rate against oracle tests | not started |
| E09 | Records a homeschooling parent would file | not started |
| E10 | A 2-4B on-device model running the quiz with a grammar | not started |
| E11 | Learner repo ingested by a companion's memory (isolated copy) | not started |
| E12 | Provenance plus signed commits verified later as a chain | not started |
| E13 | Prompt Forge: a teaching-method variant, generated and certified | not started |
| E14 | Does the age wall bite in practice? (observe only) | not started |

**See the Newton run end to end:** the [interactive run report](https://claude.ai/artifact/Nv4j2tpPh9PidXvLiAaP31) shows the course map, every page, the follow-up tree in 3D, the quiz turn by turn, and three interactive labs. The labs were built afterwards for the report, as a proposal; the v0.2 prompts do not produce them. The report is hosted as a shared artifact on claude.ai. The full account of each run, including what it does not show, is in [What has actually run](#what-has-actually-run).

### The legwork

What has to exist before any of the big ones can run honestly. None of it is glamorous, and all of it is where the scalability lives.

- **Identifiers and schemas that hold at a million nodes.** Today's ids encode ancestry and are capped at 200 characters; the registries are per module. Both have to be shown to hold, or be redesigned, at a scale no fixture reaches.
- **A registry at scale.** Reuse decisions against fifty planted nodes (E05) are one thing; against every course in a language, with duplicates arriving from many teachers at once, is another.
- **Reuse across languages, without copying.** A core rendered into a second language is a shared asset; a hobby rendering stays personal. The rule exists; the machinery does not.
- **The five-minute bundle.** The weekly loop at 50 kbps (E06), then the bundle that carries enough teaching for a week offline, with nothing in it the learner did not need.
- **Certification.** A prompt is certified for a named model set by evals, not by reputation (E04). No certification exists yet; the harness does.
- **The constraint fields, null today, made live.** Every node has a provenance file with fields reserved for a constraint and signing layer. They are null. E12 is the first step; a live [Constraint Protocol](https://github.com/daxfoundation/constraint-protocol) record under every contribution is the destination.
- **The learner's privacy, at scale and across years.** Pseudonyms and a private repo work for one learner and one course; eleven courses and six years is a different problem.
- **Reclaimed cognition, recorded.** A place in the session record for the person's own account of what was taken off them and what they spent it on, written as they gave it. No experiment with a person runs without it.

### Where we want to get to

Twelve experiments we can already picture, each written as a scene first, because an experiment that cannot be pictured as one person on one day cannot be designed. The people are fictional; the places, languages and subjects are real. Planned, not run. The full scenes, with the machinery each needs, the question, the measure, the kill line and what compounds, are in **[docs/NEXT-EXPERIMENTS.md](docs/NEXT-EXPERIMENTS.md)**.

- **X01 One thread, two worlds.** A tutor's move, made once in Indonesian for a kite flyer stuck on the third law, captured as a technique and offered in Spanish to a kite flyer in Guatemala who shares nothing else with him. The floor rises for everyone after.
- **X02 Many hands, one course.** A beekeeping course forked across four languages, learners asking at once, until its curriculum is mostly promoted follow-ups.
- **X03 The nurse's walkthrough.** A walkthrough that first asks what a teacher brings, and gives a charge nurse only the stages she cannot do herself.
- **X04 The dead-end atlas.** Where learners get lost, shared as shapes and never as records, mapped per module and re-taught at the spot.
- **X05 Flagged by the learner.** Steering measured two ways: by learners who flag it, and by an evaluator blind to them.
- **X06 Same course, every bandwidth.** One Newton course for a five-minute-a-day learner, a patchy commuter and an always-on companion, and what the bundle must carry.
- **X07 The pocket model.** A small model on a phone holding the conversation while the bundle holds the teaching.
- **X08 Behind the company wall.** The same infrastructure on a company's own git, learner records still the learner's, one technique sent back out through a gate.
- **X09 Nothing quietly edited.** Every contribution on a live Constraint Protocol record, and whether knowledge and intelligence compound when nothing can be erased.
- **X10 One record, many years.** One learner's private repo across eleven courses and six years, carried into her cognitive companion, with every carry-over hers to refuse.
- **X11 The negative space.** The unexplored parts of a subject shaded on the tree and offered, not pushed, with the regions nobody takes recorded too.
- **X12 Five minutes to master's.** The long one. A phone, five minutes a day, a blind-graded external yardstick agreed in advance, and the result published either way.

Every one of them records human delta value, both halves, and reclaimed cognition in the person's own words. None of this is production. The clients, the limits they run under, and the architecture itself are experiments, and no element of any of them is set in stone; several of these will change it, and some will kill parts of it, which is what they are for.

### The challenge map

Every problem on the table, by where it stands.

![The challenge map: five columns. Run, first cut: a teacher makes a course; a learner reads, follows up, is quizzed and saves. Built, not run: the prompts certified on two vendors; reuse against a registry. Not started: the other ten of the first fourteen. The legwork: identifiers and schemas at scale, a registry at scale, reuse across languages, the five-minute bundle, certification, the constraint fields made live, privacy at scale, reclaimed cognition recorded. Where we want to get to: the twelve scenes, ending at five minutes to master's.](docs/figures/challenge-map.svg)

---

## The machinery

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
> `experiments/` is not started. 2026-10-01: the twelve scenes and the legwork are
> written down above; none has run.

### The idea in one example

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

### What is in this repository

| Path | What it holds |
|---|---|
| `prompts/` | Prompt Suite v0.2: a kernel (MP-00) and ten operations (profile, architect, compiler, content, follow-up engine, Bloom tutor, evaluator, steward, curator, session runner) plus `SCHEMAS.md`, the normative data model. CC0. |
| `schemas/` | JSON Schema 2020-12 for every record (course, node, provenance, registries, profile, progress snapshot, event, tutor turn, manifest, commit packet, config). |
| `tools/` | Eight Node.js tools, zero dependencies: canonical hashing, stamping, id/slug rules, context-stack assembly, packet application, validation, tests. |
| `skills/` | The first client: two Agent Skills that make Claude Code a git-native Meta DAX client (teacher and learner). Mirrored in `.claude/skills/` and `.agents/skills/`. |
| `adapters/` | Headers for clients that cannot write files (Claude Desktop, ChatGPT): they emit a commit packet instead. |
| `docs/` | `INTERFACE.md` (the operation contract every client implements), `CONCEPTS.md` (sixteen concepts, one at a time), `ARCHITECTURE.md`, `WALKTHROUGH-CLAUDE-CODE.md`, `EXPERIMENTS.md`, `NEXT-EXPERIMENTS.md` (the twelve scenes), `DECISIONS.md`, `GLOSSARY.md`, `PRIVACY.md`, `LICENSING.md`, `ACCURACY.md`, and the frozen `SPEC-v0.2.md`. |
| `fixtures/` | The reference course (the mitochondria chain) and a fixture learner, fully stamped. |
| `templates/` | Skeletons for a course repo and a learner repo. |
| `evals/` | Eval cases built from the fixture, a 50-node planted registry for E05, a grader and two runners. |
| `experiments/` | One card per experiment, E01..E14, each with a `results/` folder that only ever holds real runs. |

---

### How it works

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

### The concepts we are exploring

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

There has been a working prototype since 2024: [a rough early version, building a fractions course for an eleven-year-old and running every example through baseball](https://youtu.be/pMVwtGqUSh4), which is the idea in one frame -- the fractions are the same for everybody and the baseball is not. It broke a subject into chapters, lessons and parts, wrote each one against instructions aimed at that particular student, generated interactive tests from the material it had just produced, and scored them against Bloom's taxonomy rather than against recall. Why it took until now to open it up is in [a note from the founder](#a-note-from-the-founder), below.

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

## A note from the founder

I have been at this since I was 23. I am now 49.

"This" has only ever been one thing: [the right information, to the right person, at the right time](https://jeyanandan.com/blog/meta-dax/#what-i-am-fighting-for). I found it the day I left university for the last time, and everything I have built since has been a draft of it. Meta DAX is the current one: the latest expansion of the same purpose, and the first where the information is the kind that lets a person go and get all the rest.

It has taken a tremendous amount of personal sacrifice, on every level, and it still does. All of it has come out of my own pocket.

If you want to know why it means this much to me, [it is here](https://jeyanandan.com/blog/meta-dax/#what-meta-dax-means-to-me). I was [the kid it did not exist for](https://jeyanandan.com/blog/meta-dax/#the-kid-it-did-not-exist-for).

On the way to getting Meta DAX out, while working out how knowledge and intelligence could be made to compound, it became clear that I needed something else first: an accountability framework. A flight recorder, the black box the aviation industry keeps, for the thing I could see coming. I set that out in [The Constraint](https://jeyanandan.com/blog/the-constraint/). They are not two separate fights. The rubbish on the beach is a real problem, and so is the thousand-foot wave coming towards it, and you do not get to pick one. But while that work was in front of me I did not have the cognitive capacity to give Meta DAX what it needed, and I put it off from the beginning of this year. It is my purpose, and as of 28 September [it is in the open](https://jeyanandan.com/blog/meta-dax/): the experiments, every result, and what comes next.

So, being completely transparent: if you would like to [buy me a coffee](https://ko-fi.com/jeyanandan), it would mean a great deal to me, from the bottom of my heart. Thank you. It goes to me personally, not the Foundation and not the company.

-- [Jason Jeyanandan](https://jeyanandan.com)

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

---

*Like everything on these surfaces, this README is a versioned thought record, published by Jason Jeyanandan through his cognitive companion, one unit: [how it is published](https://jeyanandan.com/blog/how-i-publish/). Its history is this repository's.*
