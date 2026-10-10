# MetaDAX

**Open infrastructure for universal learning. Every human being. Any subject. Any domain. Any bandwidth. Free, forever.**

MetaDAX is a bet on one benchmark: take a person who can communicate, and bring them to the equivalent of a master's degree from an Ivy League university — on five minutes of connectivity a day. That is audacious on purpose. It does not have to be guaranteed; it only has to have a chance of working greater than zero. Holding that benchmark throws out every design that quietly assumes bandwidth, money, or a teacher in the room. The learning cannot live on the network, so it does not. A bundle is generated, customised to the particular learner and to what they have already done, and it comes down whole. They work through it offline, for as long as they like. What they did goes back up on their next five minutes. Any domain means any domain: a child meeting fractions, a nurse training the next nurse, a company teaching ten thousand of its own people. MetaDAX is being designed from the start to be enterprise grade, and it will stay free — not freemium, not free-for-some, not free-until-funded.

---

## Pick your chair

Five doors. Each one has a site page and a place in this repo.

| Who you are | Site | Repo |
|---|---|---|
| **Parent / Homeschool** | [daxfoundation.org/metadax/homeschool/](https://daxfoundation.org/metadax/homeschool/) | [`skills/metadax-homeschool`](skills/metadax-homeschool/) |
| **Tutor** | [daxfoundation.org/metadax/tutor/](https://daxfoundation.org/metadax/tutor/) | [`skills/metadax-tutor`](skills/metadax-tutor/) |
| **Teacher** | [daxfoundation.org/metadax/teacher/](https://daxfoundation.org/metadax/teacher/) | [`skills/metadax-teacher`](skills/metadax-teacher/) |
| **Trainer** | [daxfoundation.org/metadax/trainer/](https://daxfoundation.org/metadax/trainer/) | [`prompts/`](prompts/) (MP-11, MP-12, MP-13) |
| **Researcher** | [daxfoundation.org/metadax/research/](https://daxfoundation.org/metadax/research/) | [`docs/`](docs/) and [`experiments/`](experiments/) |

---

## Tutoring? Start here

If you tutor privately, you can debrief a session in about five minutes after you leave, get concrete moves to try next time, and send the parent a ready-to-go report -- on the AI subscription you already pay for, at no cost to this project. A way, never the way.

**1. Get it, by whichever route suits you -- pick one:**

- **The skill folder**, for any assistant that reads a `SKILL.md`: copy [`skills/metadax-tutor`](skills/metadax-tutor/) into your assistant's skills folder.
- **The plain prompt**: paste [`skills/metadax-tutor/prompt.md`](skills/metadax-tutor/prompt.md) into whatever capable assistant you already pay for.

**2. Run it.** It asks you a handful of plain questions after the session -- no names, nothing identifying -- then gives you two things: a set of concrete moves to try next session and a parent report ready to copy and send.

**3. Keep the record.** After each session, copy the learning-record entry it leaves into a plain text file on your own device. Nothing leaves the device unless you copy it. MetaDAX is free.

## Teaching a class? Start here

If you are teaching a class, you can design a term plan for any subject in about twenty minutes, with one week built in full if you want it -- on the AI subscription you already pay for, at no cost to this project. A way, never the way.

**1. Get it, by whichever route suits you -- pick one:**

- **The skill folder**, for any assistant that reads a `SKILL.md`: copy [`skills/metadax-teacher`](skills/metadax-teacher/) into your assistant's skills folder.
- **The plain prompt**: paste [`skills/metadax-teacher/prompt.md`](skills/metadax-teacher/prompt.md) into whatever capable assistant you already pay for.

**2. Run it.** It asks you about your class, your subject and your term, then builds a lesson-by-lesson plan -- each lesson with its objective, the common wrong step (misconception), and a check for whether it landed. Misconceptions first; the plan is designed around what actually goes wrong.

**3. Build a week in full.** Say "build week 1" and it hands you ready-to-run lesson material for your first week. Keep the plan on your own device; nothing is shared unless you choose to share it. MetaDAX is free.

## What exists today

| Piece | Where | Status | What it is |
|---|---|---|---|
| Homeschool skill | [`skills/metadax-homeschool/`](skills/metadax-homeschool/) | built | Interviews a guide and builds the two-page package; runs on your own assistant. |
| Plain prompt | [`skills/metadax-homeschool/prompt.md`](skills/metadax-homeschool/prompt.md) | built | The same job as one prompt for any capable model, with no skill support. |
| Course factory — curriculum architect | [`prompts/MP-11-curriculum-architect.md`](prompts/MP-11-curriculum-architect.md) | built | Takes a topic and a target audience; builds a structured curriculum outline. |
| Course factory — batch builder | [`prompts/MP-12-batch-builder.md`](prompts/MP-12-batch-builder.md) | built | Turns a curriculum into a full batch of course nodes. |
| Guide coach | [`prompts/MP-13-guide-coach.md`](prompts/MP-13-guide-coach.md) | built | Coaches the guide through a session; sits beside, not in front of, the learner. |
| Context profiles (10) | [`profiles/contexts/`](profiles/contexts/) | built | One JSON profile per learning context (primary school, workplace, vocational, and seven more). |
| Package format | [`skills/metadax-homeschool/templates/PACKAGE-FORMAT.md`](skills/metadax-homeschool/templates/PACKAGE-FORMAT.md) | built | The shared contract both guide and learner pages are built to. |
| The checker | [`skills/metadax-homeschool/tools/check-package.mjs`](skills/metadax-homeschool/tools/check-package.mjs) | built | The same validation the player runs, in Node, with zero dependencies. |
| Factory samples (2 deep showcases) | [`samples/factory/`](samples/factory/) ([live](https://daxfoundation.org/metadax/samples/)) | built | Biology 101 university course and HR onboarding module, each with a curriculum, course, and node. |
| Homeschool samples | [`samples/`](samples/) ([live](https://daxfoundation.org/metadax/samples/)) | built | Nine generic sample packages, each reviewed by a person before it appears. |
| Learning record format | [`skills/metadax-homeschool/templates/RECORD-FORMAT.md`](skills/metadax-homeschool/templates/RECORD-FORMAT.md) | built | One dated, append-only entry per session, kept locally and readable by a person or a program. |
| Companion sidecar | [`companion/companion.schema.json`](companion/companion.schema.json) | experimental | An always-on sidecar schema. |
| Printable learner page | [daxfoundation.org/metadax/play/print](https://daxfoundation.org/metadax/play/print) | live | Any package on paper, with a guide key on the last page. |

---

## Support this work

MetaDAX is free. It is built on paid compute. If it helped, a coffee on Ko-fi or a GitHub sponsorship keeps it going. [Ko-fi](https://ko-fi.com/jeyanandan) — [GitHub Sponsors](https://github.com/sponsors/ObsidianDelta)

- **[Sponsor on GitHub](https://github.com/sponsors/ObsidianDelta)**: $5, $25 or $100 a month, or a one-time amount. Sponsors are listed here.
- **[Ko-fi](https://ko-fi.com/jeyanandan)**: a one-off coffee or a monthly one, no GitHub account needed.

Everything built with it is published in this repository. Nothing is paywalled, and nothing will be.

### Sponsors

No sponsors yet. Be the first.

---

## Research

The full experiment design, every run, and what comes next:

- **[docs/EXPERIMENTS.md](docs/EXPERIMENTS.md)** — the fourteen experiments: question, method, metrics, kill line.
- **[docs/NEXT-EXPERIMENTS.md](docs/NEXT-EXPERIMENTS.md)** — the twelve experiments we can already picture, as scenes.
- **[experiments/FINDINGS-20261010.md](experiments/FINDINGS-20261010.md)** — X13 / X14 findings, run 2026-10-10.
- **[docs/HISTORY.md](docs/HISTORY.md)** — the full account: how it works, the sixteen concepts, every run with its numbers, where it came from.

### Experiment status

| Id | Status |
|---|---|
| E01 | done, first cut |
| E03 | done, first cut |
| E04 | built |
| E05 | built |
| [X13 / X14](experiments/FINDINGS-20261010.md) | RUN 2026-10-10 |
| X01–X12 | planned |

---

## A way, never the way

Education does an enormous amount of good, and at scale it has no choice but to standardise: one pace, one sequence, one way of demonstrating that you have understood. Learning is the thing underneath it, and learning does not standardise — it happens at the pace of the person doing it. MetaDAX is about the second one.

There is never *the* way. There is always *a* way. With respect to the Mandalorian creed, nothing in this repository will ever say "This is the way."

Knowing an answer is not a reason to hand it over as *the* answer, so the system is built not to lead. If you ever feel it steering you, say so — to us, or to the system while you are using it.

---

## Guides and learners

Everyone is a learner. Whoever is a step ahead, right now, on this, is the **guide**: a parent, a teacher, a mentor, a manager, a grandson with a phone, a nurse training the next nurse. The gap is small, it is temporary, and it moves; in every sample on the site there is a moment where the learner is a step ahead of the guide on something and leads (we call that swinging leads, after climbing partners who swap the lead). Learning happens within reach, just past what a person can do alone, and MetaDAX exists to put the next step within reach for both of them and then get out of the way. "Teacher" and "tutor" above name a person's job or an operation in the prompt suite; the person in that chair is a guide.

---

## The measure: human delta value

Under every experiment here sits one measure, and it is close to being the point.

[Human delta value](https://daxfoundation.org/definitions/#human-delta-value) is what a human being brings: what only a human can currently do, and what a person and their cognitive companion reach together that neither would alone. The first MetaDAX run showed it uninvited: the teacher's plan arrived defaulted, the outcomes rubric came from a catalogue that grows with every teacher who publishes one, and every decision became a micro-adjustment to something already there. A great deal of cognitive labour had been taken off the teacher. The question that matters is what the teacher does with the cognition they got back. Every time the system takes cognitive labour off a guide, one question is left, and it is the whole point: **what is it that only you can do here, and how do we help you do it as well as you can?**

MetaDAX is built to **invert the ratio of students to teachers**: behind each learner, every tutor's move ever captured, every misconception ever mapped, every dead end anyone found first, offered as one way among many. A learner gets more teaching than any teacher could give. And the teacher is handed their cognition back, on purpose, for the problems they could previously only dream about. We call that **reclaimed cognition**, and it is reported by the person in their own words and recorded as expressed, never inferred and never measured in minutes. A person and their companion are one unit, and the unit is only as strong as the human's best in the moment. The reasoning, the failure modes and the kill line are in [Human delta value: the measure](https://daxfoundation.org/writing/human-delta-value/); where it came from is [on Jason's site](https://jeyanandan.com/blog/human-delta-value/).

---

## A note from the founder

I have been at this since I was 23. I am now 49.

"This" has only ever been one thing: [the right information, to the right person, at the right time](https://jeyanandan.com/blog/meta-dax/#what-i-am-fighting-for). I found it the day I left university for the last time, and everything I have built since has been a draft of it. MetaDAX is the current one: the latest expansion of the same purpose, and the first where the information is the kind that lets a person go and get all the rest.

It has taken a tremendous amount of personal sacrifice, on every level, and it still does. All of it has come out of my own pocket.

If you want to know why it means this much to me, [it is here](https://jeyanandan.com/blog/meta-dax/#what-meta-dax-means-to-me). I was [the kid it did not exist for](https://jeyanandan.com/blog/meta-dax/#the-kid-it-did-not-exist-for).

On the way to getting MetaDAX out, while working out how knowledge and intelligence could be made to compound, it became clear that I needed something else first: an accountability framework. A flight recorder, the black box the aviation industry keeps, for the thing I could see coming. I set that out in [The Constraint](https://jeyanandan.com/blog/the-constraint/). They are not two separate fights. The rubbish on the beach is a real problem, and so is the thousand-foot wave coming towards it, and you do not get to pick one. But while that work was in front of me I did not have the cognitive capacity to give MetaDAX what it needed, and I put it off from the beginning of this year. It is my purpose, and as of 28 September [it is in the open](https://jeyanandan.com/blog/meta-dax/): the experiments, every result, and what comes next.

So, being completely transparent: if you would like to [buy me a coffee](https://ko-fi.com/jeyanandan), it would mean a great deal to me, from the bottom of my heart. Thank you. It goes to me personally, not the Foundation and not the company.

-- [Jason Jeyanandan](https://jeyanandan.com)

---

## Decisions, licences, privacy, accuracy

- `docs/DECISIONS.md` — the twelve decisions of 2026-09-27, verbatim, and what is pending.
- `docs/LICENSING.md` and `LICENSES.md` — prompts/, schemas/, evals/fixtures CC0 1.0; tools/, templates/, .github/, skills/, adapters/ Apache-2.0; docs/, README.md and other prose CC BY 4.0; generated course content the licence the course author chooses (default CC BY 4.0), with raw generated segments marked generated: true and declared CC0; DCO for contributions.
- `docs/PRIVACY.md` — pseudonyms only; no email, name, school or diagnosis anywhere; private nodes never leave the learner repo; adults only in Phase 1 clients; no telemetry, no server.
- `docs/ACCURACY.md` — the accuracy commitments: no result without a recorded run, reserved fields described as reserved, no affiliation implied, models named by vendor outside eval results.

## Contributing

Ways to contribute, with exact steps, are in **[CONTRIBUTING.md](CONTRIBUTING.md)**. In short:
contributions need a DCO sign-off (`git commit -s`), a human must have read and tried anything
AI helped write, and no real learner's name, photo or identifying detail ever appears.

## Trademarks and affiliation

MetaDAX is an independent project. It is not affiliated with or endorsed by Anthropic,
OpenAI, GitHub or Oak National Academy. Claude, Claude Code, ChatGPT and GitHub are
trademarks of their respective owners and are named only to describe the clients and
platforms MetaDAX works with.

---

*Like everything on these surfaces, this README is a versioned thought record, published by Jason Jeyanandan through his cognitive companion, one unit: [how it is published](https://jeyanandan.com/blog/how-i-publish/). Its history is this repository's.*
