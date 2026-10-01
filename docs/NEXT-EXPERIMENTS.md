# Where we want to get to: twelve experiments, written as scenes

*Planned, not run. X01 to X12. First published 1 October 2026; this file is versioned in this repository's history like everything else here. The short list is in the [README](../README.md#where-we-want-to-get-to); the legwork that comes first is there too.*

These are planned experiments. None has run. The fourteen that exist, E01 to E14, remain the first; only E01 and E03 have produced results, first cut, with a model playing the teacher and a simulated adult as the learner. Between those and these sits the legwork, listed in the README: identifiers and schemas that hold at a million nodes, a registry at scale, reuse across languages, the five-minute bundle, certification, the constraint fields made live, privacy at scale. The small ones earn the big ones. What follows is where the work is going, written precisely enough to be argued with.

Each is a scene first, because an experiment that cannot be pictured as one person on one day cannot be designed. The people are fictional, first names only; places, languages and subjects are real. Then the machinery: the meta prompts and records involved, and what would have to exist. Then the science: question, measure, kill line, what compounds, and how a failure is kept.

All twelve serve one sentence: take a person who can communicate, and get them to the equivalent of a master's degree from an Ivy League university, on five minutes of connectivity a day. We are developing this for all bandwidths; five minutes a day is where it starts.

## The measure under every experiment

Human delta value is the most important thing in Meta DAX; it is close to the point. The Foundation's [definition](https://daxfoundation.org/definitions/#human-delta-value) has two halves: what only a human being can currently do, and what a human and their cognitive companion reach together that neither would alone. Both are recorded in every experiment with a person. Meta DAX is built to invert the ratio of students to teachers, and to hand teachers back the cognition the busywork took, on purpose, so that they can put it on the problems they could previously only dream about. The reasoning is in [Human delta value: the measure](https://daxfoundation.org/writing/human-delta-value/).

The first run report showed it: the teacher picks an outcomes rubric from a catalogue that grows with every teacher who publishes one, the lesson plan arrives defaulted, and judgement becomes micro-adjustment. The system takes manual cognitive labour off a person; the point is what they do next. We call that reclaimed cognition: what was taken off the person, and what they then chose to spend their attention on, reported by the person at the end of the session, never inferred and never reduced to minutes. It goes on what intelligence, in the Foundation's narrow sense, navigating a constrained possibility space, is not: noticing one learner has gone quiet and deciding what to do, the dynamic of a group, bringing out the best in someone.

The claim under all twelve: a person and their companion are one unit, only as strong as the human's best in the moment; however good the companion becomes, if the person cannot bring their best, the unit is weaker. It is held as a hypothesis with a kill line, not as a comfort, and it means everybody needs to step up. The DAX constraint names humanity; every human being is part of it.

---

### X01. One thread, two worlds

**The scene.** Yogyakarta, Java. Ayu teaches physics by day and tutors adults by night, in Indonesian with Javanese slipping in. She has forked the published Newton course from the real run and rendered its shared cores into Indonesian without touching them. Tonight's learner is Bagus, a motorbike courier who flies kites at Parangtritis on Sundays. He is on the third law, and stuck. "If the kite pulls the line exactly as hard as the line pulls the kite, they cancel. So nothing can ever move. So the law is wrong, or the kite is." Two attempts; the tutor's hints name the misconception and do not land.

Ayu tries two things that fail. She swaps the kite for a boat pushing off a jetty; he nods and makes the same error. She says the forces act on different objects; he hears the words and cannot use them. Then she takes two delivery receipts from his bag, writes KITE on one and AIR on the other, and says: every force goes on the receipt of the thing it acts on, and a pair is never on the same receipt. Now add up the kite's receipt only. He writes the wind's push and the line's pull on the kite's receipt, adds them, and sees a net force. The kite's push on the air is on the other receipt and cannot cancel anything on this one. He is through. The session records the move as hers. Asked whether he will share the exchange, Bagus says yes; Ayu reviews it, names it "one body, one receipt", and it becomes a technique in the course.

Eleven weeks later, in Sumpango, Guatemala, where giant kites are flown over the cemetery on 1 November, Marisol, who speaks Kaqchikel and Spanish and shares nothing with Bagus except kites, hits the same wall in her Spanish rendering. The tutor recognises the shape of her two attempts, finds the technique in the registry, and offers it as one way among those on record, never required: a barrilete, the wind over the hill, two slips of paper. She takes it. Through.

**What has to exist.**
- A technique record, `techniques/<slug>.json` in the course repo: concept and misconception, the stuck signature (what the failed attempts look like), the move in audience-neutral form, provenance, `pending_review` until a teacher accepts in MP-09; attached to the concept, never a rendering; never the answer to a quiz item.
- A language dimension on renderings: a cached rendering per language is a shared asset; a hobby rendering stays personal.
- A `<<START TECHNIQUES>>` block for MP-06 and MP-05: candidate techniques matching the current concept and misconception; the rule: offer, never impose; label as one way.
- A human-tutor turn type, `chain_role: tutor`, so a person's move is recorded as theirs, distinct from the model's hints.
- MP-08 STEWARD: a turning-point detector (failed attempts, then a pass) that proposes a technique candidate, with the learner's consent.

**How it runs.**
1. Ayu forks the course; MP-04 renders the cores into Indonesian as cached language renderings; the cores' hashes are unchanged.
2. Bagus's MP-01 profile stores a hobby and what helps; MP-04 renders his pages through kites.
3. MP-06 runs the third-law quiz; MP-07 grades two attempts and names the misconception.
4. Ayu's two failed moves and the receipt move are written as tutor turns, `chain_role: tutor`; MP-07 grades the pass.
5. On sync, MP-08 finds the turning point, asks consent, and emits a technique candidate; the client writes it `pending_review` to the course repo.
6. In MP-09 Ayu accepts and names it and marks her two failed moves as dead ends for that signature; the module registry gains a technique entry.
7. Marisol's MP-06 session hits the same signature; the assembler fills TECHNIQUES; the tutor offers it; the rendering is regenerated in Spanish through kites; everything else is reused by hash.
8. The result file records both sessions turn by turn, every asset reused or regenerated by hash, the technique record, both consents, and the floor before and after: what a learner with no tutor is offered on that signature, then and now.

**The question.** Can a human tutor's move, made once in one language for one learner, be captured as a shared asset and offered to a learner in another language and culture, raising the floor without leading either of them?

**The measure.** Reuse by content hash (cores, concept, misconception, technique reused; renderings and quiz items regenerated). For later learners who hit the signature: attempts to pass with the technique offered versus the model's hints alone, in matched sessions. Human delta value, both halves: alone, the receipt move, which no hint produced, and what Ayu noticed in Bagus's hands; together, the technique as a shared asset, which neither could have made alone. Reclaimed cognition, in Ayu's report: the sequencing, the quiz and the record were off her; she spent the evening watching Bagus, not the page. In Marisol's: nothing to translate, so she spent it on the kite.

**The kill line.** If learners offered the technique pass no faster than learners given the model's hints alone, the record is noise; if learners flag the offer as steering, it is a defect.

**What compounds, and for whom.** Every learner who reaches that misconception after Marisol, in any language, is offered a move made by a person who was in the room. Ayu's failed moves compound too: the next tutor is told what did not land for that signature.

**Dead ends.** The boat example and the "different objects" sentence are kept as marked paths under the same signature; a technique that fails for several later learners is demoted to a dead end, never deleted.

**Links back.** README, "In plain words": "A question a learner chooses to share can, once a teacher reviews it, become part of the course for the next learner", extended from a question to a move. "One thread, two worlds" in "Where we want to get to".

---

### X02. Many hands, one course

**The scene.** Ljubljana. Tjaša keeps bees in AŽ hives, the Slovenian kind, and publishes "A first year with bees": seven objectives in Slovene, misconceptions written first. The Foundation forks it. Within a season it is forked again: by Kwame in Kumasi, who teaches top-bar hives in Twi and English and rewrites the hive modules; by Hélène in Lyon, with Dadant hives; by a cooperative in Mérida, Yucatán, where the bees are stingless meliponas and half the cores do not apply.

One Tuesday in March, learners in four languages are in the same module. "Why did my colony swarm in May?" is asked in Twi, Slovene, French and Spanish within a week. The follow-up engine, reading a federated registry, points three of them at the node the first created and renders it for each. The curator proposes promoting the swarming family into every fork's curriculum; three teachers apply it, one does not. With dedupe, merges and the promotion queue off them, Kwame spends his review hour on the learner in his Kumasi class whose questions stopped in April, and Tjaša on two who keep asking the same thing in different words.

Kwame and Tjaša disagree on how to teach swarm prevention. Both cores are kept, side by side, marked contested. No one is overruled. By the eighteenth month the stewarded copy's curriculum is mostly nodes that began as learners' questions; Tjaša's seven objectives are still there among forty. A module exists that nobody wrote: a family of follow-ups until it was promoted; the first question came from a pseudonym in Mérida.

**What has to exist.**
- A federated registry: the stewarded copy indexes public forks' registries, read-only, so MP-05 can reuse across forks as a `links[]` edge.
- MP-09 CURATE at scale: proposals ranked by family size and clarify-heavy signals; per-teacher queues; disagreement kept as parallel cores marked `contested`.
- A client merge policy for concurrent commits to per-module registries, conflicts counted.

**How it runs.**
1. Tjaša publishes; the Foundation forks; three teachers fork, run MP-02 ARCHITECT in revise mode on the hive modules, and MP-04 regenerates those cores only.
2. Learners run MP-05; the assembler fills REGISTRY from the fork's module file and the federated index; cross-fork reuse becomes a link.
3. MP-08 writes pseudonymous teacher reports per fork; MP-09 proposes promotions; each teacher applies or declines.
4. Monthly, MP-09 `audit_course` checks each fork for unbroken prerequisite chains; the client counts merge conflicts per hundred commits.
5. The result file holds the fork map, the learner-origin share per month, the families promoted, the contested pairs, conflicts and audit outcomes.

**The question.** When many teachers and many learners work one course at once, does it grow more coherent or more fragmented, and does its curriculum end up mostly written from learners' questions?

**The measure.** Learner-origin share of curriculum nodes over time; cross-fork links versus near-duplicates; merge conflicts per hundred commits; prerequisite chains unbroken on audit. Human delta value, both halves: alone, the promotions a teacher rewrote and the disagreement held open as two cores; together, forty objectives no one of them could have written. Reclaimed cognition, in each teacher's report: dedupe, merges and the promotion queue were off them; Kwame spent it on the learner who went quiet.

**The kill line.** If near-duplicates outgrow links as learners grow, the registry does not scale and the tree silts; if promoted follow-ups break prerequisite chains that teachers must hand-repair, growth is bought with teacher time.

**What compounds, and for whom.** A teacher ends up with a course mostly written by the people who learnt from it. A question in Mérida becomes a page in Kumasi.

**Dead ends.** A declined promotion is kept with the reason; a contested core no learner takes in a year is marked dormant and stays.

**Links back.** README, "In plain words": "A course a teacher chooses to publish is open for anyone to teach from, fork and improve." "Where we want to get to", "Many teachers, many learners."

---

### X03. The nurse's walkthrough

**The scene.** Enugu. Ngozi has been a charge nurse for fourteen years and has forty minutes. She wants a course for the newly qualified nurses who rotate through, on fluid balance charts and drip-rate calculation, in English with the ward's Igbo. The walkthrough does not begin by asking what she wants. It asks what she brings. She says what no textbook says: new nurses fill the chart in correctly and do not look at it. The error is not arithmetic. It is not reading the trend at six in the morning.

She picks an outcomes rubric from the catalogue, one a nurse educator in Manila published last year. The catalogue grows with every teacher who publishes one; the run report's fictional "Everyday Mechanics" was its first entry. The lesson plan arrives defaulted against it: twelve stages, the map drawn, the Bloom targets set, the schemas checked. Her work is micro-adjustment and the things only she can do. Setting the destination and planning the misconceptions are hers, in her own words. Designing the pages is hers with her cognitive companion, which she directs and answers for: it drafts scenario pages from the ward's routines, no patient in them, and she corrects them as she corrects a student.

The architect proposes opening with the formula. She overrides it: open with a chart at 06:00 and "what do you do now?" The override is recorded as hers, with the proposal it replaced. Three nurses take the course. The steward's report comes back pseudonymous: they stumbled where she said, at reading, not calculating. One stumble is not where she said: units. She adds a page.

On the fourth evening she notices something no report shows: Chidinma, the one on night rotation, has gone quiet, on the ward and, she suspects, in the course. She phones her before the shift and finds out why. At the end of the session, asked what the system took off her and what she spent it on, she writes: the plan, the map, the targets, the checking; and she spent it on Chidinma. The system did not infer that. She reported it.

A parent in Bristol, a swimming coach in Durban and a trainer at a bus company in Lima open the same walkthrough that month. The stages are the same. Which stages are theirs is not.

**What has to exist.**
- A teacher-side profile: MP-01 in teacher mode, storing what the teacher brings (years, stumbles seen, voice), never a label, in their own repo.
- The walkthrough as a client flow over MP-02 and MP-04: twelve stages, each assigned from the profile to the teacher, the teacher with their companion, or the system.
- An outcomes-rubric catalogue: every rubric a teacher publishes, with provenance; MP-02 defaults the plan against the one picked.
- An override record: a replaced proposal and its replacement kept together, with provenance.
- Templates per kind of teacher (nurse, parent, coach, company trainer) differing only in which stages default to the person.

**How it runs.**
1. MP-01 in teacher mode writes Ngozi's profile; the client derives a stage plan.
2. MP-02 ARCHITECT defaults the plan against the picked rubric; Ngozi writes the destination and the misconceptions; the architect merges them, marked as hers.
3. MP-04 CONTENT generates cores; her companion drafts ward scenarios as renderings; MP-09 `verify_rendering` checks them against the core.
4. Three learners run MP-01 through MP-08; MP-08 writes the pseudonymous teacher report; the client compares predicted and observed stumbles.
5. The result file records Ngozi's report, who did each stage, every override and its fate, predicted versus observed misconceptions, and the page added afterwards.

**The question.** Does a walkthrough that first asks what a teacher brings give her back attention for what only she can do, and a better course, than one that assumes a generic teacher?

**The measure.** Where Ngozi's attention went, in her own report after each session; then overrides and whether each survives (no learner shows the stumble the architect's version was meant to prevent); predicted misconceptions that appeared and those that did not; minutes per stage, as a secondary fact. Human delta value, both halves: alone, the misconceptions only she predicted and the quiet nurse she noticed; together, a ward-specific course from a one-line pick, which neither she nor her companion could have made alone. Reclaimed cognition, in her words: "the plan, the map, the targets, the checking", spent on Chidinma.

**The kill line.** If her overrides are no better for learners than the architect's defaults and her report says her attention went nowhere new, the walkthrough gave nothing back; if the stage plan skips a stage she needed, it assumed again.

**What compounds, and for whom.** The catalogue gains the rubric she publishes; her predicted stumbles become misconceptions in every fork; the parent, coach and company templates inherit the stage logic, not her content.

**Dead ends.** An override that did not survive stays in the record with the learner evidence, a path a teacher took and would not take again.

**Links back.** "Where we want to get to", "The teacher's walkthrough." The benchmark section: "a nurse training the next nurse." The run report's twelve-stage workflow. [Human delta value](https://daxfoundation.org/definitions/#human-delta-value).

---

### X04. The dead-end atlas

**The scene.** Dhaka, after a shift. Farid supervises a garment-factory line and studies the Newton course in Bangla on his phone. The second law. He follows "why is weight in newtons?" three follow-ups deep, reaches "so on the Moon my mass changes?", and types "hang on, I'm lost". The system takes him back to where the branch began. He tries the quiz and fails; the evaluator names the misconception: mass and weight interchanged. He starts a second branch, because the scales on his factory floor read in kilogram-force, and gives up for the night halfway down it.

Nothing is deleted; the lost signal, the abandoned branch and the failed quiz are kept in his private record, marked. On sync, the steward proposes marking the kilogram-force branch as a dead end and asks whether he will share its shape with the course: which concepts, how deep, what the failed attempts looked like, none of the content. He shares. Over the next month three learners, in Lyon, Lima and Dhaka, leave the same shape.

The curator assembles the module's atlas: the tree of learning, upside down, holes marked. The teacher re-teaches at exactly that spot, a new objective: the kilogram-force on the shop floor. The next learner who turns down that branch sees it marked: others got lost here; this is where the branch began; a page now exists here. Offered. She may still take the branch. Farid comes back a week later and does.

**What has to exist.**
- A dead-end marker on a path in the learner repo, with a shape (concept ids, depth, stuck signature) separable from the content.
- Consent-gated sharing of shapes, pseudonymous, into `atlas/<module>.json` in the course repo.
- MP-09 CURATE `build_atlas`: cluster shapes into holes, rank by recurrence and abandonment, propose re-teaching spots.
- MP-05: when a learner enters a marked path, PATH carries the marker; the engine must present it as information, never redirect.

**How it runs.**
1. MP-05 follow-ups to depth three; "hang on, I'm lost" triggers `zoom_out`.
2. MP-06 quiz; MP-07 names the misconception; the client writes an `abandoned` event on the second branch's last node.
3. On sync, MP-08 proposes dead-end markers and asks consent to share shapes.
4. MP-09 `build_atlas` clusters the shapes and proposes a re-teaching spot; the teacher adds an objective with MP-02 and MP-04.
5. The result file holds the atlas, every hole with its recurrence, the re-teaching proposals and their fate, and what happened to learners who entered a marked path afterwards.

**The question.** Can where learners get lost be mapped as carefully as where they arrive, and does re-teaching at a mapped hole change what happens to the next learner who enters it?

**The measure.** Lost and abandoned events per node; holes found by the atlas against holes the teacher predicted; for marked paths, entry, exit and arrival at the objective, before and after re-teaching. Human delta value, both halves: alone, Farid's "hang on, I'm lost", which the client could not infer, and the teacher's choice of where to re-teach; together, the atlas, which exists only because people said where they were lost and a curator clustered it. Reclaimed cognition, in Farid's report: keeping the branch was off him; he spent it on the scales on his own floor. In the teacher's: clustering was off her; she spent it reading the holes.

**The kill line.** If learners never mark themselves lost and the client cannot infer it, the atlas is empty; if a marked path turns learners away from a branch they would have learnt from, the marker is leading.

**What compounds, and for whom.** A hole found by one learner is marked for every learner after. A teacher learns where to re-teach from shapes, never records.

**Dead ends.** This experiment is the dead-end mechanism; its own failure, an atlas of holes nobody falls into again, is kept with the shapes that did not recur.

**Links back.** README, "A way, never the way": "So are the dead ends, recorded as carefully as the arrivals." "Where we want to get to", "Failure, mapped."

---

### X05. Flagged by the learner

**The scene.** Kraków, a tram depot canteen. Tomasz drives the number 8 and is taking a Polish course on reading statistics in the news. The page is Simpson's paradox: two hospitals, one with the worse survival rate overall and the better rate in every category of patient. He asks a follow-up and the tutor's hint says: notice that the better hospital takes the sicker patients. That is the interpretation, handed over. He types `flag: you're steering me`. The flag is recorded on the turn, and the tutor must answer the next turn without it.

In the quiz, at the Evaluate level, "which hospital would you choose?" presumes one answer. He flags again.

On sync, with his consent, the flags go up pseudonymous with the turns they sit on. Separately, blind to the flags, the evaluator runs a "leads" rubric over every tutor and follow-up turn of every consenting learner: a hint that contains the answer, a framing that presumes one interpretation, a question with one acceptable answer where the core lists several. The lists are compared; the prompt change that follows is a decision in the changelog, tied to the turns that caused it. On his next sync Tomasz gets one line: your flag changed a prompt.

**What has to exist.**
- A learner command `flag:` in MP-10, MP-06 and MP-05, writing a `steer_flag` event in the learner repo, shareable pseudonymously by consent.
- A "leads" rubric item in MP-07 EVALUATE, applied to tutor and follow-up turns, not to learner answers.
- A blind second pass by a second model, with agreement between passes measured.

**How it runs.**
1. `flag:` writes a `steer_flag` event on an MP-05 or MP-06 turn and constrains the next; on sync, MP-08 packages consented flags with their turns.
2. MP-07 runs the leads rubric over consented turns, blind to flags; a second model repeats it.
3. MP-09 `audit_steering` compares learner flags, evaluator leads and second-pass leads.
4. The teacher reads the steering report; a prompt revision goes into the changelog with the turns attached, and runs on the same cases.
5. The result file holds flags and leads per hundred turns, the agreement table, each revision and its effect, and the turns learners flagged that no evaluator caught.

**The question.** Does the system steer learners toward its own answer, how often, and can learners catch it at least as well as an evaluator can?

**The measure.** Flags and evaluator leads per hundred turns; agreement between learners, evaluator and second pass; the same after each revision. Human delta value, both halves: alone, the flags learners raised that both evaluator passes missed; together, a prompt revised by a learner's flag and an evaluator's rubric, which neither reaches alone. The leads evaluators found that no learner flagged stay the more worrying number. Reclaimed cognition, in Tomasz's report: nothing to compute, so he spent it on whether he was being led.

**The kill line.** If evaluator-detected steering stays above a rate set in advance after two revisions, the prompts lead by design, "built not to lead" is false, and the README says so.

**What compounds, and for whom.** A flag on one course improves a prompt for every learner on every course. The leads rubric becomes a certification gate in E04.

**Dead ends.** A revision that lowers flags but raises evaluator leads has moved the steering to where learners cannot see it; it is kept in the changelog as a marked path, with both numbers.

**Links back.** README, "A way, never the way": "If you ever feel it steering you, say so." "Where we want to get to", "Not leading." Concept 10.

---

### X06. Same course, every bandwidth

**The scene.** The same Newton course, the same week, three people. Amadou is a mechanic's apprentice outside Tambacounda and speaks Wolof and French. On Monday he has five minutes at the market. His bundle comes down whole: the three objectives he has reached, the follow-ups and misconceptions the steward expects, a practice bank gradeable with no model, and his pages in French with Wolof for the engine parts. He works through it all week, offline, in the yard. Friday's five minutes send up what he did and asked, as typed, and the next bundle comes down shaped by it.

Priya commutes across Pune by bus with a signal that comes and goes; her client works from the bundle and goes live when it can. Sven, in Oslo, is always on, through his cognitive companion.

On Wednesday Amadou asks why the flywheel keeps the engine turning between strokes. It was not in his bundle. The question waits, as typed, until Friday; the answer comes down on Monday and becomes a node. The following week the steward packs that node into every bundle at that objective, and Priya reuses it on the bus. Sven's companion had asked a version of it live on Tuesday; the engine had already pointed it at the same node.

We are developing this for all bandwidths. The course is one course. The tree is one tree.

**What has to exist.**
- The offline client, deferred until now, in a first form: bundle down, work offline, delta up.
- MP-08 STEWARD as bundle planner: next steps plus pre-generated follow-ups (MP-05 in batch), misconceptions and hint ladders (MP-06 `practice_set`), per learner, in their language.
- A bandwidth profile in CONFIG: five-minute, patchy, always-on; the same records regardless.
- A deferred-question queue: questions typed offline that the bundle could not answer, answered on the next sync, the wait recorded.

**How it runs.**
1. MP-08 plans each learner's bundle from their snapshot and the registry; MP-05 and MP-06 pre-generate in batch; the client packs a git bundle under the budget.
2. Offline, the client runs the practice bank, pages and follow-ups with no model; unknown questions go to the queue.
3. On the next sync the delta goes up (events, turns, queued questions); MP-05 answers the queue; new nodes are stamped and committed.
4. MP-08 replans; nodes answered for one learner are packed for every learner at that objective.
5. The result file holds, per learner per week, bundle and delta sizes against the budget, the pre-generation hit rate, the queue and its waits, and competency on the same concepts.

**The question.** Does the same course reach the same outcome on the same yardstick for a five-minute-a-day learner as for an always-on learner, and what must the bundle carry to make that true?

**The measure.** Competency on the same concepts across the three; follow-ups asked offline that the bundle had pre-generated, deferred or never answered; bundle and delta sizes per week against the budget. Human delta value, both halves: alone, the questions no pre-generation predicted, Amadou's flywheel first; together, for Sven, the questions his companion put the moment he had them, which he reports he would not have typed. Reclaimed cognition, in each weekly report: for Amadou, the planning and the waiting were off him; he spent it in the yard with the engine.

**The kill line.** If the five-minute learner's competency lags the always-on learner's by more than the gap between two always-on learners, bandwidth is still the variable; if closing the gap needs a bundle over the budget, the budget or the design is wrong.

**What compounds, and for whom.** Every deferred question answered is in next week's bundles for everyone at that objective; the always-on learner's live questions pre-answer the offline learner's.

**Dead ends.** A pre-generated follow-up nobody asks in a season is dropped from bundles and kept in the registry, marked; a deferred question never answered is a marked hole.

**Links back.** README, "The benchmark": "the learning cannot live on the network, so it does not." "Where we want to get to", "Every bandwidth." Concept 15 and E06.

---

### X07. The pocket model

**The scene.** Huancavelica, in the high Andes. Rosa weaves, speaks Quechua first and Spanish second, and has a phone with a small model on it, installed from an SD card at the municipal office. No model ever travels the link. The week's bundle holds the teaching; the small model holds the conversation.

She is on the second law; the quiz runs on the phone. A grammar forces every turn the small model emits into shape, so the state is present whether or not the model would have remembered it. Exact-answer questions are graded with no model at all; open answers against rubrics in the bundle, hint ladders already there. The small model's job is to listen, pick the next pre-written hint, and render the page for her: the loom, the heddle, the weight of a wet blanket.

She asks why a loaded llama sets off more slowly than an empty one; the bundle had pre-generated that follow-up, or one close enough to reuse, and the small model only has to render it. She asks why the loom's beater stops the instant she stops pushing, and the bundle has nothing; the question goes to the queue, as typed. Twice in the week the small model breaks a rule, a hint that contains the answer, a turn at the wrong level, and twice the client's gates catch it, log it, and fall back to the bank. She sees only a quiz that is slightly plainer for one turn.

**What has to exist.**
- A JSON grammar for the tutor turn and follow-up outputs, enforced on the device (E10).
- A reduced kernel for small models: the rules that must hold on the device; the rest moves into the bundle.
- The bundle as teaching: pre-rendered pages, pre-generated follow-up cores, practice banks with exact answers, hint ladders and rubrics.
- Certification of the small model as a floor model under concept 10, on the same evals as E04.

**How it runs.**
1. MP-08 plans the bundle for a small model: more pre-generation, every hint ladder in full.
2. The device runs MP-06 under the reduced kernel and the grammar; exact-answer items are graded by the client; MP-07 rubrics in the bundle grade the open answers.
3. MP-05 on the device decides only reuse against the bundled registry; everything else goes to the queue; gates catch rule breaks and the client falls back to the bank, logging them.
4. On sync, a frontier model answers the queue and the gate log goes up with the delta.
5. The result file holds rule breaks per forty turns by rule, turns served from the bundle versus generated, quiz validity, the queue, and competency on the same bank graded with no model.

**The question.** Can a small model on a phone hold a good session when the bundle carries the teaching, and where exactly does it break?

**The measure.** Rule breaks per forty turns, by rule; turns served from the bundle versus generated; state present on every turn; competency on the same practice bank, graded with no model. Human delta value, both halves: alone, Rosa's questions outside the bundle and the loom's beater, which becomes a node; together, a session neither she nor the small model could run alone. Reclaimed cognition, in her report: grading and hint-picking were off her; she spent it on the loom.

**The kill line.** If the small model breaks a rule the gates cannot catch before turn forty, or sessions on it draw steer flags well above the frontier model's rate on the same bank, it cannot hold the conversation.

**What compounds, and for whom.** Every rule break found becomes a gate or a grammar rule on every device. The learner with the smallest model gets the most carefully pre-written teaching.

**Dead ends.** A turn where the small model failed and the client fell back to the bank is a marked path: exactly what the small model could not do that week.

**Links back.** "Where we want to get to", "The model on the device." Concept 15, "Open research." E10.

---

### X08. Behind the company wall

**The scene.** Esbjerg. A company that services offshore wind turbines has three thousand technicians in Denmark, Scotland and Taiwan, and a blade-inspection reporting procedure taught from a slide deck. Mette has twenty years offshore and knows why the reports come back wrong. She builds the course on the company's own git server, with Danish, English and Mandarin renderings of the same cores. The Foundation sees nothing; there is no server to see it from, no telemetry.

The company is the principal. Before anyone starts, it declares in writing what it will and will not see: pseudonymous reports by team, never a learner's record. Each technician's learner repo is the technician's. A follow-up asked in Taichung, "why does the report want the load case and not just the crack length?", becomes a page in Esbjerg within a fortnight, reviewed by Mette.

The procedure rests on why load matters on a turning blade, so the company forked the public Newton course inward as a prerequisite module. In a session with a new technician Mette makes a move, about load and acceleration at the blade tip, that the public course does not have, and she wants to give it back. It passes an outward gate the company declared in advance (no internal names, no procedure marked internal, no learner data) and arrives in the public course as a technique, `pending_review`, with the company as contributor. The technician who was there is a pseudonym and stays one.

**What has to exist.**
- A private deployment profile: course repos and learner repos on the organisation's own git; the client and prompts unchanged; CONFIG `boundary: private`.
- An organisational principal record: what the organisation declares in advance it will and will not see; a learner's repo stays the learner's.
- An outward gate: a contribution from inside the wall passes the declared checks before it reaches a public course.

**How it runs.**
1. The company deploys the clients against its own git; its declaration is signed before any learner starts.
2. Mette runs the walkthrough (X03); MP-02 and MP-04 build the course; the Newton module is forked inward.
3. Technicians run the learner path; MP-08 writes team-level pseudonymous reports; the client enforces the declaration.
4. MP-09 reviews learner-origin nodes inside the wall; Mette promotes the Taichung question; the outward gate passes her technique to the public course as `pending_review`.
5. The result file records every change needed to run privately (target: none), every gate outcome, every attempt by the organisation to read a learner record (target: none succeed), and the contribution's fate.

**The question.** Does the same infrastructure run unchanged behind an organisation's own walls, keep each learner's record the learner's, and let knowledge flow outward only as declared?

**The measure.** Prompts and tools changed to run privately; leaks caught by the outward gate; learner records readable by the organisation beyond the declared reports; outward contributions accepted into a public course. Human delta value, both halves: alone, what Mette's twenty years put into the course that the architect did not propose, and the technicians' questions that changed the page; together, the blade-tip move, made in a session she could not have run alone. Reclaimed cognition, in Mette's report: the slide deck, the three languages and the tracking were off her; she spent it on the technician in front of her.

**The kill line.** If running privately needs a fork of the prompts or tools, "the same infrastructure" is false; if the organisation can read a learner's record, the privacy design is broken and the experiment stops.

**What compounds, and for whom.** The company's techniques reach the public course by a declared route. The public course's growth reaches the company by fork.

**Dead ends.** A contribution the outward gate refuses is kept inside the wall with the refusal; a question the company declines to answer is a marked hole in its own atlas.

**Links back.** README, "The benchmark": "a company teaching ten thousand of its own people." "Where we want to get to", "Inside organisations." `docs/PRIVACY.md`.

---

### X09. Nothing quietly edited

**The scene.** Nairobi and Edinburgh. Wanjiru teaches rainwater harvesting for smallholdings in Swahili and English. A learner's follow-up on tank sizing has become popular; the curator proposes promoting it; she does. Before she did, she had declared what she would not do: promote a learner node without a review. The curator model had declared what it would not do: rewrite a core. Callum, who stewards the Foundation's copy from Edinburgh, had declared he would accept or reject and never edit. Each declaration is signed; each node's provenance points at the declarations behind it; the fields that are reserved and null today are live.

Fourteen months later a learner in Jaffna, in Tamil, disputes the rule of thumb in the promoted node: wrong for a monsoon climate. Nobody edits anything. The dispute is a record. The correction is a new node, linked, with its own declarations. The old node stays, marked disputed, the chain visible: who asked, who promoted, what the curator did and did not do, who reviewed, when, signed. Anyone can re-judge it.

The Constraint Protocol keeps the record and has been run in full once; it prevents nothing. The question is whether knowledge and intelligence compound, as the Foundation defines them, when nothing can be quietly edited, or whether teachers contribute less once their name is on a signed declaration.

**What has to exist.**
- The reserved provenance fields `key_id` and `constraint_decl_ref` made live: each node points at a Constraint Protocol declaration by its contributor and its reviewer.
- Declarations for each role (teacher, learner by choice, curator, steward, reviewer) and signed commits (E12).
- A dispute record anyone can raise; re-judgement is a new record, never an edit.
- A verifier that rebuilds every chain from the repositories alone (E12's kill line).

**How it runs.**
1. Each party signs its declaration before the course opens; the client records the references.
2. MP-05 nodes, MP-09 promotions and reviews are stamped with `constraint_decl_ref` and `key_id` by the stamping tool.
3. A matched course runs with the layer off, same teacher, same subject; the Jaffna learner raises a dispute, the client writes it, and MP-09 proposes the correction as a new node.
4. The verifier rebuilds every chain from the repos alone, monthly; reuse (knowledge) and path length to a target (intelligence) are read from the registries for nodes with and without intact chains.
5. The result file holds the verifier's outcome for every node, contributions per teacher per month with the layer on and off, disputes raised and re-judged with times, and the reuse comparison.

**The question.** When every contribution sits on a record nobody can quietly edit, do knowledge and intelligence compound across teachers, learners and organisations, or does the record slow them down?

**The measure.** Chains verifiable from the repos alone, for every node; contributions per teacher per month, layer on against off; disputes raised and re-judged, and time to re-judgement; reuse of nodes with intact chains against without. Human delta value, both halves: alone, the reasons Wanjiru declared that no model could have declared for her, what Callum's review caught that the curator's dedupe did not, and the Jaffna learner's dispute; together, a chain that holds because a person signed what a model stamped. Reclaimed cognition, in Wanjiru's report: dedupe and provenance were off her; she spent it deciding what she would not do.

**The kill line.** If teachers with the layer on contribute measurably less, the record is a tax; if any chain cannot be rebuilt from the repository alone, the layer is decoration and must never be described as live.

**What compounds, and for whom.** A correction never erases, so the Jaffna learner can see who stood behind the figure she read. A declaration found later to have been broken is the most valuable record of all.

**Dead ends.** A disputed node that loses stays, marked, with the dispute on it; nothing on the chain is ever removed.

**Links back.** "Where we want to get to", "Compounding." Concept 14. E12. The [Constraint Protocol](https://github.com/daxfoundation/constraint-protocol) and the Foundation's [definitions](https://daxfoundation.org/definitions/) of knowledge and intelligence.

---

### X10. One record, many years

**The scene.** Taipei. Mei is twenty-six in year one, speaks Mandarin and Taiwanese Hokkien, and starts with the Newton course on her phone. Over six years she takes eleven, ending with a course on fracture mechanics that a professor in Taichung published. Her learner repo is one repository, hers: a profile that says what helps (worked examples before theory, short chunks), a directory per course, snapshots, private nodes, dead ends.

In year four she begins working through a cognitive companion, the part of her that is wired in, which she directs and answers for. It ingests an isolated copy of her learner repo. At the first page of the fracture course it can tell her what she already holds, where she got lost in year two, which accommodations worked. The steward proposes carrying three concepts over as held. She refuses one: she had it in year two and does not have it now. The refusal is recorded. She, not it, decides what she carries.

The companion is not her tutor. It is how she directs the tutor: it asks the follow-up the moment she has it, in the shape she thinks in. The professor in Taichung sees a pseudonymous report. In year six she sits a real external examination; her record shows the whole path, eleven courses, the trees, the holes, and stays in her hands.

**What has to exist.**
- A learner repo spanning courses: one profile, per-course progress, cross-course concept mastery (concepts aligned by id or by the curator).
- A carry-over step in MP-01 PROFILE: at a new course, with consent, read prior snapshots and accommodations; propose, never assume.
- The companion ingest (E11) on an isolated copy with a declared boundary: it reads; it writes only through the client.
- A long-horizon guarantee: records written in year one readable in year six (versioned schemas, append-only).

**How it runs.**
1. MP-01 runs once; the profile is reused across courses, with MP-08's observations consented.
2. At each new course, MP-01 carry-over proposes what is held; the learner accepts or refuses, and both are recorded.
3. The companion ingests an isolated copy under E11 and directs MP-05 and MP-06 calls through the client.
4. MP-08 writes snapshots per course per device; the validator checks every old record against current schemas; the examination result is recorded by the learner, not the system.
5. The result file holds, per course, concepts carried over, accepted and refused; time to competency on prerequisites with and without carry-over; schema readability across years; and the companion's calls.

**The question.** Does a learner's private record, carried across courses and years and into their cognitive companion, shorten the path through the next course without ever leaving the learner's hands?

**The measure.** Concepts marked held against re-taught, per course; time to competency on prerequisites, with carry-over against without; records readable after every schema change. Human delta value, both halves: alone, what Mei chose to carry against the proposal, and the refusal; together, what she and her companion reached that no course offered, recorded as her private nodes. Reclaimed cognition, in her report at each course's end: remembering what she already held was off her; she spent it on the fracture problem she came for.

**The kill line.** If carry-over makes a new course skip what the learner has in fact forgotten, the record is trusted more than the person; if any part of it must live on a server to work, it is not hers.

**What compounds, and for whom.** For Mei, every course makes the next shorter; for the companion, the record is the context she directs it with.

**Dead ends.** A carry-over proposed and refused is kept; a year-two dead end later found to have been the right path is re-marked, with both judgements on it.

**Links back.** Concept 11, "The age wall and the companion path." E11. [Cognitive companion](https://daxfoundation.org/definitions/#cognitive-companion).

---

### X11. The negative space

**The scene.** Reykjavík. Sigrún fished for forty years and is taking the Newton course in Icelandic because her grandson asked her a question about a boat she could not answer. She finishes the first-law module and the client shows her the course's tree, upside down, every path anyone has taken, part of it shaded. The curator computed it that morning: concepts the architect named that no follow-up has reached, seeds nobody has followed, objectives reached by a handful and asked beyond by none. Nobody has been here, the client says. You can, or not.

She chooses it. Her question is why the coffee in her mug slides across the wheelhouse table when the boat turns, though nothing pushed it: frames of reference, in the concept list from the first day and in no one's path. Her branch is the first in that region and is marked so, with her pseudonym. Halfway down she takes a wrong turn, into "so the boat pushes the coffee", and finds her own way back; that dead end is marked as the region's first too. Three weeks later a learner in Lagos enters the region and finds a path already there, and a hole already marked.

Another shaded region on the same tree stays shaded for a year. Nobody chooses it. That is recorded as carefully as her coffee.

**What has to exist.**
- A negative-space computation in MP-09: concepts in `course.json` no node has reached, seeds never followed, objectives with no learner nodes; written to `tree/negative-space.json`.
- The `explore` next step in MP-08 made specific: the region, offered as an invitation and marked as one; declining recorded as an ordinary choice.
- A first-path marker on nodes created inside a region, with the explorer's pseudonym.
- The steer-flag rubric from X05 applied to every offer.

**How it runs.**
1. MP-09 computes the course's negative space monthly and writes the record.
2. At the end of a module, MP-08 offers `explore` with a named region; the client shows the shaded tree; the learner chooses or declines, and both are events.
3. MP-05 creates the first nodes in the region, marked first-path; MP-09 reviews them as any learner-origin node; dead ends there go through the X04 path.
4. MP-07's leads rubric runs over every offer turn; flags are counted.
5. The result file holds the negative-space share of the concept list over time, offers made, taken and declined, flags on offers, first-path nodes and their review outcomes, and the regions that stayed shaded.

**The question.** Can the parts of a subject nobody has explored be made visible and offered without steering, and do learners take them?

**The measure.** Negative-space share of the concept list over time; offers made, taken, declined; steer flags on offers against baseline; first-path nodes accepted on review. Human delta value, both halves: alone, the questions explorers typed in a region no seed predicted, the coffee mug first; together, the map itself, which shows where nobody has been only because people chose where to go. Reclaimed cognition, in Sigrún's report: knowing where the course had already been was off her; she spent it on the boat.

**The kill line.** If offers raise the steer-flag rate above the baseline, the offer is leading and stops; if no learner takes an offer in a year, the negative space is a map, not a path, and the design changes.

**What compounds, and for whom.** Every first path makes a region a place for the next learner. The teacher sees which parts of the subject the course never leads anyone to. Forks inherit the map.

**Dead ends.** Sigrún's wrong turn is the first marked dead end in the region; a region nobody enters in a year is itself a kept record, dated.

**Links back.** README, "A way, never the way": "And so is the negative space: the parts of a subject nobody has explored yet." The tree-of-learning figure.

---

### X12. Five minutes to master's

**The scene.** A town outside Kano. Ibrahim is twenty-four, speaks Hausa and English, keeps the accounts at a kiosk that sells airtime, and has five minutes a day on the kiosk's signal. He can communicate. That is the whole entry condition. He chooses statistics, because the accounts have started asking him questions he cannot answer, and he wants the examination at the end to be one a stranger would respect.

The yardstick is external and agreed in writing before he starts: a master's-level assessment set and graded blind by an institution that is not the Foundation, named in the published pre-registration. The Foundation never grades its own work. The path is years, not months, and it is written down before he takes the first bundle: the courses, in the order the record suggests and he decides; the budget, five minutes a day at 50 kbps, every week, counted; and everything in X01 to X11, as it exists, from the model on his phone to the record nobody can quietly edit.

Some weeks he misses; the record says so. Some bundles are over budget and the week is marked as not the five-minute experiment. In year three a question he asks about sampling in a market with no list of traders becomes a node that learners in three countries reuse. In the final year he sits the assessment; the result is published either way, with the same care. This is the long one, stated honestly: nobody is claiming it is achievable. It only has to have a chance greater than zero, and the record will show whether it does.

**What has to exist.**
- Everything in X01 to X11, run together.
- A pre-registration: the external yardstick and institution, the courses, the budget, the measures and the kill line, published before the first bundle.
- A budget ledger: every week's bundle and delta against five minutes at 50 kbps, over-budget weeks marked, and what the path cost to run.

**How it runs.**
1. The pre-registration is published; the learner's and the Foundation's declarations are signed (X09); MP-01 writes the profile, MP-02 sets the first course, MP-08 plans the first bundle (X06).
2. Weekly, for years: bundle down, work offline on the pocket model (X07), delta up; the client writes the budget ledger.
3. Each course carries over into the next through the record (X10); techniques, atlases and negative space arrive in bundles as they exist (X01, X04, X11); steer flags are collected and acted on throughout (X05).
4. The external assessment is taken and graded blind; the result is written to the record by the learner and published by the institution.
5. The result file holds the ledger, the path as taken against the path as planned, every course's competency on its own yardstick, the external result, and the cost.

**The question.** Can a person who can communicate, on five minutes of connectivity a day, reach a master's-level outcome on a real external yardstick, and what does the path cost?

**The measure.** The external result; years elapsed; weeks within budget against weeks over; cost per learner. Human delta value, both halves, over years: alone, everything Ibrahim brought that the bundles did not contain, the questions no pre-generation predicted, the techniques he made, the dead ends he found first; together, what he and his companion reached that no course offered. Reclaimed cognition, in his weekly report: what the bundle took off him and what he spent it on, and whether the second half grows as the first does.

**The kill line.** If no institution will agree a blind-graded yardstick in advance, the experiment does not start; if the budget cannot be kept in most weeks, it is not the five-minute experiment and is recorded as something else.

**What compounds, and for whom.** The whole path of the first person there becomes a map for the second; the dead ends along it are the more valuable half. A miss is published with the same care as a pass.

**Dead ends.** If the path runs out, where it ran out is the result: the course, the week, the hole, published; the benchmark stays and the next person starts from that mark.

**Links back.** README, "The benchmark": "It only has to work in theory." The introduction post, "It has the nerve to try."

---

## The short list

- **One thread, two worlds:** a tutor's move, made once in Indonesian for a kite flyer, captured as a technique and offered in Spanish to a kite flyer who shares nothing else with him; the floor rises for everyone after.
- **Many hands, one course:** a beekeeping course forked across four languages, learners asking at once, until its curriculum is mostly promoted follow-ups.
- **The nurse's walkthrough:** a walkthrough that first asks what a teacher brings, and gives a charge nurse only the stages she cannot do herself.
- **The dead-end atlas:** where learners get lost, shared as shapes, never records, mapped per module and re-taught at the spot.
- **Flagged by the learner:** steering measured two ways, by learners who flag it and by an evaluator blind to them.
- **Same course, every bandwidth:** one Newton course for a five-minute-a-day learner, a patchy commuter and an always-on companion, and what the bundle must carry.
- **The pocket model:** a small model on a phone holding the conversation while the bundle holds the teaching.
- **Behind the company wall:** the same infrastructure on a company's own git, learner records still the learner's, one technique sent back out through a gate.
- **Nothing quietly edited:** every contribution on a live Constraint Protocol record, and whether knowledge and intelligence compound when nothing can be erased.
- **One record, many years:** one learner's private repo across eleven courses and six years, carried into her cognitive companion, with every carry-over hers to refuse.
- **The negative space:** the unexplored parts of a subject shaded on the tree and offered, not pushed, with the regions nobody takes recorded too.
- **Five minutes to master's:** the long one; a phone, five minutes a day, a blind-graded external yardstick agreed in advance, and the result published either way.

## Honest limits

None of this has run, and none of it can show what it claims until real people run it. What exists is a self-hosting client that works end to end for a teacher and a learner, a model playing both; it does not show what a person experiences or learns, or whether anything compounds between two of them, let alone across languages and years. Every technique, atlas, bundle, gate and declaration above is a design; the measures are what we intend to count, not what we have counted. Reclaimed cognition is self-reported and will be noisy; people report what they notice. And none of this shows that people bring their best, only whether the system got out of their way. The first fourteen experiments remain the first, and E04 and E05, the evals that certify the prompts and the reuse engine, come before any of these. The architecture is not set in stone; several of these will change it, and some will kill parts of it, which is what they are for. When one runs, its result lands in a dated file, whichever way it goes.
