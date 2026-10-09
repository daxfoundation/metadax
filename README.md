# Meta DAX

**Open infrastructure for universal learning. Every human being. Any subject. Any domain. Any bandwidth. Free, forever.**

> **New here?** **[See it](https://daxfoundation.org/metadax/showcase/)**: six sample pages of what Meta DAX hands a guide and a learner, three steps in (a mom and her eleven-year-old on fractions, a teacher and a newcomer, a grandson and his grandmother, a new manager, a first on-call shift, a teacher of teachers). **Homeschooling?** [Start here](#homeschooling-start-here) -- below, in three steps. Then **[Meta DAX: An Introduction](https://jeyanandan.com/blog/meta-dax/)** -- why this exists and what it is trying to do, in plain language -- and **[Human delta value](https://daxfoundation.org/writing/human-delta-value/)** -- the measure under every experiment here, and close to the point of all of them.
>
> **Where we are:** [What has run](#where-we-are-starting) -- [The legwork](#the-legwork) -- [Where we want to get to](#where-we-want-to-get-to) -- [The map](#the-challenge-map). This repository is where the work is read; [daxfoundation.org/metadax/](https://daxfoundation.org/metadax/) is where it is told. The full account -- how it works, the sixteen concepts, every run with its numbers, where it came from -- is in [docs/HISTORY.md](docs/HISTORY.md).

## Homeschooling? Start here

If you teach your own child, you can build them a lesson package yourself in about ten minutes, on the AI subscription you already pay for, at no cost to this project. It is a way in for one child today -- a way, never the way.

**1. Get it, by whichever route suits you -- pick one:**

- **The skill folder**, for any assistant that reads a `SKILL.md` (Claude Code, Codex and the like): copy [`skills/metadax-homeschool`](skills/metadax-homeschool/) into your assistant's skills folder.
- **The plain prompt**: paste [`skills/metadax-homeschool/prompt.md`](skills/metadax-homeschool/prompt.md) into whatever capable assistant you already pay for.
- **The web questionnaire** at [daxfoundation.org/metadax/homeschool/start/](https://daxfoundation.org/metadax/homeschool/start/), if you'd rather someone build it for you.

**2. Run it.** It interviews you in plain words -- no names, nothing identifying -- then builds a two-page package: a guide page for you and a learner page for your child, with an adaptive game built through whatever they love. It describes behaviour and never names a diagnosis, says plainly when to consider seeking an evaluation, and offers a generic sample, with nothing identifying, that you can share.

**3. After the session**, run session two straight from the next-time note it leaves. Save a learning record on your own machine -- nothing leaves it unless you choose to share. Browse the [sample library](https://daxfoundation.org/metadax/samples/), and if you like, share a generic sample through the ["Share a sample" issue template](.github/ISSUE_TEMPLATE/share-a-sample.yml); a person reviews each one before it appears.

The child's side is a game and a set of answered questions, used with the parent beside them -- there is no AI on the child's side, and it names no tool or vendor. It is free, and it stays free.

## What exists today

Everything a homeschooling guide needs is in this repository, each piece small and readable.

| Piece | Where | What it is |
|---|---|---|
| The skill | [`skills/metadax-homeschool/SKILL.md`](skills/metadax-homeschool/SKILL.md) | Interviews a guide and builds the two-page package; runs on your own assistant. |
| The plain prompt | [`skills/metadax-homeschool/prompt.md`](skills/metadax-homeschool/prompt.md) | The same job as one prompt for any capable model, with no skill support. |
| The package format | [`skills/metadax-homeschool/templates/PACKAGE-FORMAT.md`](skills/metadax-homeschool/templates/PACKAGE-FORMAT.md) | The shared contract both pages are built to -- reused, not a new format. |
| The checker | [`skills/metadax-homeschool/tools/check-package.mjs`](skills/metadax-homeschool/tools/check-package.mjs) | The same validation the player runs, in Node, with zero dependencies. |
| The sample library | [`samples/`](samples/) ([live](https://daxfoundation.org/metadax/samples/)) | Three generic samples, each reviewed by a person before it appears. |
| The learning record | [`skills/metadax-homeschool/templates/RECORD-FORMAT.md`](skills/metadax-homeschool/templates/RECORD-FORMAT.md) | One dated, append-only entry per session, kept locally and readable by a person or a program. |
| The companion sidecar | [`companion/companion.schema.json`](companion/companion.schema.json) | An always-on sidecar schema (experimental). |

## The benchmark

Every decision in Meta DAX is measured against one internal benchmark:

> **Take a person who can communicate, and get them to the equivalent of a master's degree from an Ivy League university -- on five minutes of connectivity a day.**

It is audacious on purpose. It is not a roadmap, and nobody is claiming it is achievable. It only has to work in theory -- a chance of working that is greater than zero -- and that is the point: holding it throws out every design that quietly assumes bandwidth, money, or a teacher in the room.

**We are developing this for all bandwidths!** Five minutes a day is simply where we have chosen to start.

Five minutes a day means the learning cannot live on the network, so it does not. A bundle is generated, customised to the particular learner and to what they have already done, and it comes down whole. They work through it interactively, offline, for as long as they like. What they did goes back up on their next five minutes, and the next bundle comes down shaped by it.

It will be open source and it will be free. Not freemium, not free-for-some, not free-until-funded.

Any domain means any domain: a child meeting fractions, a nurse training the next nurse, a company teaching ten thousand of its own people. Meta DAX is being designed from the start to be enterprise grade.

## Guides and learners

Everyone is a learner. Whoever is a step ahead, right now, on this, is the **guide**: a parent, a teacher, a mentor, a manager, a grandson with a phone, a nurse training the next nurse. The gap is small, it is temporary, and it moves; in every sample on the site there is a moment where the learner is a step ahead of the guide on something and leads (we call that swinging leads, after climbing partners who swap the lead). Learning happens within reach, just past what a person can do alone, and Meta DAX exists to put the next step within reach for both of them and then get out of the way. "Teacher" and "tutor" below name a person's job or an operation in the prompt suite; the person in that chair is a guide.

## A way, never the way

Education does an enormous amount of good, and at scale it has no choice but to standardise: one pace, one sequence, one way of demonstrating that you have understood. Learning is the thing underneath it, and learning does not standardise -- it happens at the pace of the person doing it. Meta DAX is about the second one.

There is never *the* way. There is always *a* way. With respect to the Mandalorian creed, nothing in this repository will ever say "This is the way."

Knowing an answer is not a reason to hand it over as *the* answer, so the system is built not to lead. If you ever feel it steering you, say so -- to us, or to the system while you are using it.

Picture learning as the tree of life drawn upside down: every branch anyone has ever taken, from the first question outward, all of them related to one another. Every path is worth keeping. So are the dead ends, recorded as carefully as the arrivals, because finding where people fail matters as much as finding how they got from A to B. And so is the negative space: the parts of a subject nobody has explored yet.

![Learning, drawn as the tree of life upside down: every path from the first question is kept, the dead ends are kept and marked, one learner's question answers another's, and the negative space nobody has explored yet is marked. There is never the way. There is always a way.](docs/figures/tree-of-learning.svg)

## The measure: human delta value

Under every experiment here sits one measure, and it is close to being the point.

[Human delta value](https://daxfoundation.org/definitions/#human-delta-value) is what a human being brings: what only a human can currently do, and what a person and their cognitive companion reach together that neither would alone. The first Meta DAX run showed it uninvited: the teacher's plan arrived defaulted, the outcomes rubric came from a catalogue that grows with every teacher who publishes one, and every decision became a micro-adjustment to something already there. A great deal of cognitive labour had been taken off the teacher. The question that matters is what the teacher does with the cognition they got back. Every time the system takes cognitive labour off a guide, one question is left, and it is the whole point: **what is it that only you can do here, and how do we help you do it as well as you can?**

Meta DAX is built to **invert the ratio of students to teachers**: behind each learner, every tutor's move ever captured, every misconception ever mapped, every dead end anyone found first, offered as one way among many. A learner gets more teaching than any teacher could give. And the teacher is handed their cognition back, on purpose, for the problems they could previously only dream about. We call that **reclaimed cognition**, and it is reported by the person in their own words and recorded as expressed, never inferred and never measured in minutes. A person and their companion are one unit, and the unit is only as strong as the human's best in the moment. The reasoning, the failure modes and the kill line are in [Human delta value: the measure](https://daxfoundation.org/writing/human-delta-value/); where it came from is [on Jason's site](https://jeyanandan.com/blog/human-delta-value/).

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

**See the Newton run end to end:** the [interactive run report](https://claude.ai/artifact/Nv4j2tpPh9PidXvLiAaP31) shows the course map, every page, the follow-up tree in 3D, the quiz turn by turn, and three interactive labs. The labs were built afterwards for the report, as a proposal; the v0.2 prompts do not produce them. The report is hosted as a shared artifact on claude.ai. The full account of each run, including what it does not show, is in [What has actually run](docs/HISTORY.md#what-has-actually-run).

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

**The long form.** How the machinery works, the sixteen concepts it explores, every run with its numbers, where it came from (EdDAX, 2024-2025) and how it was built, are kept in full in **[docs/HISTORY.md](docs/HISTORY.md)**. Meta DAX is a research project of the DAX Foundation: a set of experiments before it is a product. Nothing in it is production, and no element of the architecture is set in stone.

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

## Support this work

Meta DAX is built by directing a fleet of AI agents, and the agents run on paid compute. When the credits run out, the work stops. If you want it to keep going:

- **[Sponsor on GitHub](https://github.com/sponsors/ObsidianDelta)**: $5, $25 or $100 a month, or a one-time amount. Sponsors are listed here.
- **[Ko-fi](https://ko-fi.com/jeyanandan)**: a one-off coffee or a monthly one, no GitHub account needed.

Everything built with it is published in this repository. Nothing is paywalled, and nothing will be.

### Sponsors

No sponsors yet. Be the first.

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
