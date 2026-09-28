# Meta DAX concepts

This is the document to read first if you have never seen Meta DAX. It explains what
the project is exploring and why, one idea at a time. Nothing here is a product
announcement: Meta DAX is a set of experiments (see `docs/EXPERIMENTS.md`), and where a
claim has not been demonstrated yet, this document says so.

Meta DAX is an open, prompt-defined learning system. A teacher turns any subject into a
course; a learner reads it, asks follow-up questions as deep as they want, is quizzed,
and keeps a record of their progress. The unusual part is what is *not* there: no
server, no database, no application to install. The reasoning behind that choice comes
from the maintainers' analysis of the previous prototype, EdDAX. Every concept below
points to the frozen contract in `docs/SPEC-v0.2.md` or to a file in this repo.

Each concept follows the same shape: the idea in two sentences, why it matters, where
it lives in this repo, what EdDAX did instead, and an open question the experiments
still have to answer.

---

## 1. Meta prompts are the product -- the runtime is rented

**The idea.** Meta DAX has no software of its own that a user runs. The intelligence
lives in a suite of meta prompt files (`prompts/MP-00` through `MP-10`), and everything
those prompts cannot do -- hold state, write files, run on a schedule -- is rented from
tools the user already has: a chat client, `git`, and GitHub.

**Why it matters.** It means a teacher and a learner can get most of the way with a chat
subscription and their own repositories, with no account, no hosting bill, and no vendor
lock-in. The design rests on one finding from the project's early exploration: every job a
custom runtime would do has a rentable equivalent. Phase 1 needs prompt files, JSON schemas,
two YAML workflows and the vendors' products -- not a Meta DAX server.

**Where it lives.** `prompts/` holds the suite. `docs/SPEC-v0.2.md` freezes the contract
the prompts obey. The three small Python tools in `tools/` (canonicalise, stamp,
validate) are the only code, and they run on the user's own machine.

**What EdDAX did instead.** EdDAX (the previous system, 2024-2025) was a Blazor Server
web application with SQL Server, Cosmos DB and an Azure AI Search index around a dozen
prompt strings. A review of the EdDAX code found that it "was already a prompt machine
with a database around it" -- the C# code assembled context, stored rows and rendered
markdown, and the prompts were the part that mattered.

**Open question.** Does the rented runtime actually hold together for a non-technical
adult, end to end, without the missing 10 percent of polish biting? That is E01 and E02.

---

## 2. Recursion lives in the data, not in the prompt

**The idea.** There is one follow-up engine (`prompts/MP-05-followup-engine.md`), and it
is the same call at depth 1 and at depth 50. What changes as a learner goes deeper is not
the prompt but the data handed to it: the PATH block grows by one entry, the ANCHOR
moves, and the REGISTRY lists a different parent's children.

**Why it matters.** The engine never needs to know "how recursive" it is. A follow-up of
a follow-up is the same operation with a longer PATH, so depth is free to the prompt
author and cheap to the runtime. The PATH block is the memory: a node also stores its
ancestors' `{id, title, canonical_question, summary}` on itself (the `path` field,
`docs/SPEC-v0.2.md` S-4), so reaching depth k costs one read, not k reads.

Node ids encode ancestry. Here is the real depth-5 chain from the EdDAX "Cell Biology
Obsidian" course, converted to Meta DAX ids (see MP-05, "The PATH is the memory"):

```
L01.M01.O01
  How do mitochondria produce energy for the cell?
L01.M01.O01/proteins-essential-atp-synthesis
  Which proteins are essential for ATP synthesis?
L01.M01.O01/proteins-essential-atp-synthesis/cytochrome-c-structure-role
  What does cytochrome c do in the electron transport chain?
L01.M01.O01/proteins-essential-atp-synthesis/cytochrome-c-structure-role/electron-donation-complex-iv
  How does cytochrome c donate electrons to Complex IV?
```

A learner reading the fourth node highlights "electron transport" and asks "are plant
ones different??". The engine resolves that to a self-contained canonical question,
classifies it, decides it is a new branch, and writes a fifth node whose id simply
extends the parent's with one more slug. The id *is* the breadcrumb: depth equals
`1 + count("/")`, so any model, even a small on-device one, can rebuild the trail from
the id alone (design law 4 in `prompts/SCHEMAS.md`).

**What EdDAX did instead.** EdDAX's follow-ups formed an unbounded tree
(`qnas.parent_qna_id`), but "the model never saw a node's ancestors, so each level
answered as if it were standalone" (EdDAX code review). At depth 4 in the real
data, the stored answer was a refusal: "The topic of Donation to Complex IV is not part
of an introductory mitochondria module." That is context loss saved as course content.

**Open question.** Does storing ancestor summaries on the node actually keep depth cheap
through a chat client's file connector, and does the engine reuse correctly from a
registry (E05)?

---

## 3. Reuse without copying

**The idea.** When one learner's follow-up would answer another learner's question, the
system points to the existing node instead of duplicating it. The follow-up engine makes
exactly one of five decisions per call: **new** (nothing covers it), **extend** (a node
covers the topic but not this angle), **reuse** (a node already answers it), **ancestor**
(an earlier node in the path already answered it -- a loop), or **redirect** (the question
is out of scope under a strict course policy).

**Why it matters.** The knowledge tree grows without silting up with near-duplicates. The
structure is "a tree with a link overlay: a DAG for reading, a tree for writing" (design
law 3): every node has exactly one parent for ownership and breadcrumb, and cross-branch
reuse is a `links[]` edge, never a copied node. Reuse copies nothing -- it re-renders the
shared core for the next learner.

**Where it lives.** MP-05 STEP 3 ("DECIDE") specifies the five decisions and the
confidence bands. The registry the engine consults is `registry/<module-id>.json`
(`docs/SPEC-v0.2.md` S-5).

**What EdDAX did instead.** Reuse existed only "by browsing": the follow-up dialog listed
every learner's children of the current node, and nothing matched by meaning (system
report, finding 2). Meta DAX keeps that browse-level parity and adds the meaning-level
decision EdDAX never had.

**Open question.** Precision and recall of the reuse/extend/new decision against planted
near-duplicates and different-intent traps -- that is E05, with a kill line at precision
0.8 or recall 0.7.

---

## 4. Knowledge is shared; presentation is personal

**The idea.** A node stores an audience-neutral `core` -- the shared course asset,
written with no learner names or interests -- and zero or more `renderings`, which are
personal or cached per audience band. The same fact is taught once and presented many
ways.

**Why it matters.** It removes the reason EdDAX cloned whole courses. A single core can be
rendered for an eleven-year-old with short chunks and a baseball analogy, and for a curious
adult at an advanced level, without changing what is true. This is design law 2 and
kernel rule K-6 (`prompts/MP-00-kernel.md`): anything marked `core` is shared and
neutral; personalisation belongs only in `rendering` fields.

**Where it lives.** The node schema (`prompts/SCHEMAS.md` section 3) separates `core` from
`renderings`. MP-04 generates the core and renders per audience; MP-05 STEP 6 renders a
follow-up for the specific learner.

**What EdDAX did instead.** "Personalization was entirely author-time" (EdDAX code
review). There was no learner model, so authors cloned courses per learner -- "Math
101" existed six times, one per age -- and typed the learner into the prompt ("for a
student that has an interest in baseball").

**Open question.** Does a shared core render well across a wide age range in practice, or
do some subjects need more than a rendering layer? Observed during E01 and E03.

---

## 5. The Bloom tutor

**The idea.** The tutor (`prompts/MP-06-bloom-tutor.md`) quizzes one learner through
Bloom's taxonomy -- Remember, Understand, Apply, Analyze, Evaluate, Create -- measuring
competency relative to each concept's `bloom_target`, not against all six levels. It emits
a full `state` object on every turn so the quiz can be saved and resumed.

**Why it matters.** Competency is meaningful only against the level a concept is meant to
reach. The level weights are Remember 10, Understand 15, Apply 20, Analyze 20, Evaluate
15, Create 20, summing to 100; `T` is the sum of weights up to the concept's
`bloom_target`, and competency is `round(100 * earned / T)`, capped at 100. Levels above
the target are recorded but never counted. When a learner types `ask: <question>` mid-quiz,
the tutor does not answer inline -- it emits a handoff to the follow-up engine (MP-05) and
waits, so curiosity during a quiz becomes a new branch of the tree.

**Where it lives.** MP-06 sections 2 (levels and weights) and 8 (the turn envelope);
`prompts/SCHEMAS.md` section 7 (tutor turn) and section 6 (the competency formula).

**What EdDAX did instead.** "The quiz is broken on master" (EdDAX code review): its
concepts were hardcoded to arithmetic, competency could reach 120 percent (six levels at
+20 each), the JSON was rendered as markdown and never parsed, and no result was ever
saved. MP-06 makes concepts and content required inputs, caps competency at 100, and
persists state.

**Open question.** Does JSON state on a fenced line leak into a child's view, and does the
tutor break its own rules before turn 40? That is E03.

---

## 6. Everything an LLM writes is bounded

**The idea.** Every value the model produces -- titles, summaries, canonical questions,
seeds -- carries a hard length limit checked before output (kernel rule K-11; design law
5). A title is plain text of 80 characters or fewer, never a paragraph and never the
answer.

**Why it matters.** This is a direct fix for a real failure. In the EdDAX prototype's saved data,
"17 of 25 non-empty follow-up titles contain a markdown heading or the whole answer" and
"13 level-1 summaries are stored model refusals" such as "Please provide the content you
would like summarized." Unbounded fields let the model dump the answer into the title
slot; bounded fields do not.

**Where it lives.** K-11 in `prompts/MP-00-kernel.md`; the per-field limits in
`prompts/SCHEMAS.md`; MP-05 STEP 4, which forbids a title that is "the answer itself" and
returns an error rather than a summary of an empty core.

**What EdDAX did instead.** The on-save title prompt ("give it a concise title") was too
weak and had no length gate, so answers landed in titles. The summary prompt had no guard
against summarising empty content, so refusals landed in summaries.

**Open question.** Do the length caps hold under the schema-validity bar of E04 (90
percent schema-valid per operation on a primary model)?

---

## 7. The operation contract -- any model, any client, one JSON object out

**The idea.** Every Meta DAX call is one operation: paste the kernel (MP-00) plus one
operation prompt plus tagged input blocks, and get back exactly one JSON object that
matches that operation's schema. The client, not the model, then checks the object and
stamps the fields the model is forbidden to compute.

**Why it matters.** It makes the system portable across models and clients. The same
prompt runs on two vendors and several clients (Claude Code, Claude Desktop, an API
runner, ChatGPT, and later the companion), because none of them depends on temperature,
prefill, thinking budgets, or vendor-specific features. The model writes the literal
string `"runtime"` wherever a timestamp, hash or byte count belongs, and the client's
stamping step fills it in (kernel rule K-15, `docs/SPEC-v0.2.md` S-2). The full interface
is specified in `docs/INTERFACE.md`.

**Where it lives.** `prompts/MP-00-kernel.md` (output discipline K-1, stamping K-15);
`docs/SPEC-v0.2.md` S-2, S-3, S-9; and the interface document `docs/INTERFACE.md`.

**What EdDAX did instead.** EdDAX called `gpt-4o` behind a C# handler, ran an extra
"optimizer" model call before every generation (doubling cost and latency for no measured
benefit), and rendered the model's JSON as markdown without parsing it.

**Open question.** Do the v0.2 prompts pass on both vendors at the schema-validity and
rubric bars? That is E04, which gates the rest.

---

## 8. Git is the database

**The idea.** State lives in files in the user's own repositories, and `git` is the
database. There are two repository kinds beyond the Foundation repo: a **course repo**
(the teacher's curriculum) and a **learner repo** (one person's private record). Records
are append-only and split per module, so concurrent writers rarely touch the same file.

**Why it matters.** Merges stay clean. A node belongs to the registry file of the module
its id starts with (`L03.M02.O01/...` writes to `registry/L03.M02.json`), so two learners
committing follow-ups in different modules never edit the same file (`docs/SPEC-v0.2.md`
S-5). Learner progress is one file per device per day, never one mutable file, which
removes an entire class of merge conflict (S-6). The course repo holds only `shared` and
`pending_review` nodes; a learner's `private` nodes never leave the learner repo.

**Where it lives.** `docs/ARCHITECTURE.md` maps the three repositories; `docs/SPEC-v0.2.md`
S-4, S-5, S-6 define the node record, per-module registry and append-only learner records.

**What EdDAX did instead.** EdDAX kept the tree skeleton in SQL Server and rich documents
in Cosmos DB, writing both with no transaction, and mirrored to an Azure AI Search index
that was never used for reuse. Nothing persisted learner state at all: there was no
progress, answer or score table.

**Open question.** Does the append-only, per-module layout survive real concurrent use,
and does the weekly bundle round-trip stay clean (E06)?

---

## 9. Two write modes: git-native and commit packet

**The idea.** A client either writes files itself (`write_mode: git`) or ends every output
with a COMMIT PACKET -- a fenced JSON block listing the files to create -- that a human or
a small tool applies (`write_mode: packet`). Some clients have a connector that writes to
a repo; others are read-only, and the packet is how they still save.

**Why it matters.** It is why the same prompt package runs on a client with a writing
connector (Claude Code committing directly) and on one without (a read-only chat that
emits a packet a person pastes). The prompt bodies never assume one mode: they describe
their output as "the record", and the client decides how it lands (`docs/SPEC-v0.2.md`
S-9). A `create` op fails if the path already exists, so a packet can never silently
overwrite a node.

**Where it lives.** `docs/SPEC-v0.2.md` S-9 (the packet shape) and S-3 (`write_mode` in
CONFIG); the client behaviour is in `docs/INTERFACE.md`.

**What EdDAX did instead.** EdDAX had one write path: C# handlers writing SQL then Cosmos.
There was no notion of a client without write access, because the application was the only
client.

**Open question.** What is the commit-packet ingest success rate on a read-only client?
E02 measures it, with a kill line under 90 percent.

---

## 10. Certification instead of trust

**The idea.** A teacher does not read evaluations; they read a badge that says which models
the prompts were certified on this month. Certification means the Foundation's continuous
integration ran the prompts across vendors and checked that each operation produced
schema-valid JSON, a present Bloom level, monotonic state, and an acceptable rubric score.

**Why it matters.** "A prompt is certified for a model set", not in the abstract. The same
prompt can pass on one model and fail on another, so certification is always relative to a
named set of models: two primary models, one from each vendor, plus a smaller floor model
(decision D3; the models are named in `evals/` only when the evals exist, never here).
This is the trust surface a non-expert consumes.

**Where it lives.** The eval harness is `evals/` (owned by another build ask); the
experiment that stands it up is E04; the standing rule that model names appear only where
an eval ran them is in `docs/ACCURACY.md`.

**What EdDAX did instead.** EdDAX had no evaluation of its prompts at all. A quiz prompt
could hardcode arithmetic concepts and ship, because nothing checked it.

**Open question.** This has **not yet run.** E04 is the experiment that will produce the
first certification results; until then there is no certified model set to cite.

---

## 11. The age wall and the companion path

**The idea.** In Phase 1, the Claude Code and Claude Desktop clients are for adults (18+)
only (decision D1). Younger learners are served later, through a companion, once the
Foundation is the organisation that can serve minors under the appropriate safeguards.

**Why it matters.** The wall follows from platform policy, not preference:
claude.ai is 18+ across consumer plans, while the Anthropic API allows an organisation to
serve minors with age verification, moderation and disclosure. So the compliant route for
children is the Foundation itself, as that organisation, via a companion -- which is a
later phase. This turns the age wall from a blocker into a reason the Foundation exists.
The prompts keep every minor band and rule intact (for the companion to use later); the
wall lives in front of them, in the skills and in `docs/PRIVACY.md`
(`docs/SPEC-v0.2.md` S-8).

**Where it lives.** `docs/PRIVACY.md` (how the skills enforce it); `docs/DECISIONS.md` D1;
`docs/SPEC-v0.2.md` S-8.

**What EdDAX did instead.** EdDAX had no age handling and no review of learner-created
content.

**Open question.** Does the age wall bite in practice -- does a child's typing trigger an
age-verification prompt, or a name drift into a file? That is E14, observe-only.

---

## 12. Grounding and honesty

**The idea.** When sources are supplied, the course steer chooses how strictly to use
them: `source_only` teaches only what the sources support and cites source ids;
`source_first` prefers sources and labels anything beyond them as general knowledge. In
either case the model never fabricates a citation, statistic, quotation or named study.

**Why it matters.** A learning system that invents references is worse than one that says
"I am not sure." Kernel rule K-8 (`prompts/MP-00-kernel.md`) forbids fabricated citations
outright and requires ungrounded facts to be marked for verification. The intended first
grounding corpus is Oak National Academy, via its MCP tools (decision D5, "definitely"),
because it is openly licensed and carries objectives, misconceptions and quizzes.

**Where it lives.** K-8 in the kernel; `source_policy` in the course steer; the ingest
whitelist in `docs/LICENSING.md`; the grounding experiment is E07.

**What EdDAX did instead.** EdDAX had no grounding or source policy; content was generated
from steers alone, and there was no citation mechanism to fabricate or honour.

**Open question.** Can the architect ground a real unit on Oak via MCP with citations that
resolve, and zero fabricated ones? That is E07, with a kill line at any fabricated
citation.

---

## 13. Accommodations, not diagnoses

**The idea.** A learner profile stores what helps -- short chunks, frequent checks,
read-aloud-friendly text, step-by-step procedures -- and never a medical label. This is
design law 6 in `prompts/SCHEMAS.md`.

**Why it matters.** Diagnoses are sensitive data, and a learner repo is a git repo that a
guardian may one day publish or fork. Storing "ADHD" would put a health label in version
control; storing "short chunks, movement breaks" gives the tutor what it needs to adapt
without ever recording a condition. MP-01 converts a stated condition into accommodations
and discards the label.

**Where it lives.** Design law 6 and the `supports` vocabulary in `prompts/SCHEMAS.md`
section 5; the rendering supports in MP-05 STEP 6 and MP-06; `docs/PRIVACY.md`.

**What EdDAX did instead.** EdDAX authors typed conditions straight into the prompt
("Adapt the content for people who have Adhd"), because there was no profile and no
accommodations vocabulary -- the label was the only tool available.

**Open question.** Does the accommodations vocabulary cover what homeschooling parents
actually need (movement breaks, oral responses, visual schedules)? Observed during E03
and E09.

---

## 14. Provenance and constraints

**The idea.** Each node has a `provenance.json` written only by the stamping tool, never
by the model. It records the content hash, who created the node and in what role, the
node's lineage, and reserved fields that a future Constraint Protocol will use.

**Why it matters.** It makes each node self-describing and verifiable, and it makes later
phases a layering exercise instead of a migration. Today `provenance.json` records
`content_hash`, `created_by` (a pseudonym, a `chain_role`, and a null `key_id`),
`lineage`, and a null `constraint_decl_ref` (`docs/SPEC-v0.2.md` S-7). The `key_id` and
`constraint_decl_ref` fields are **reserved**: they are placeholders for the Constraint
Protocol and are never described as live. Meta DAX does not run the Constraint Protocol,
and public copy must never say it does (`docs/ACCURACY.md`).

**Where it lives.** `docs/SPEC-v0.2.md` S-7 (the provenance shape); `docs/GLOSSARY.md`
(the Constraint Protocol, reserved fields only); `docs/ACCURACY.md` (the standing rule).

**What EdDAX did instead.** EdDAX had no provenance record. Authorship was a `creator_id`
column, and there was no content hash, lineage or role separation.

**Open question.** Can `provenance.json` plus signed commits be reconstructed later as a
verifiable chain? That is E12, with a kill line if any field cannot be rebuilt from the
repo alone.

---

## 15. The offline five-minutes-a-day client

**The idea.** A later client is designed for someone with about five minutes of
connectivity a day, who downloads a week's bundle and works offline. It is not the first
client, but every Phase 1 schema is already shaped for it (decision D11).

**Why it matters.** The constraints are cheap to honour now and expensive to retrofit, so
Phase 1 honours them: records are append-only and per-device, content is text-first,
tutor turns are immutable files, and a weekly manifest lists the week's files with sizes
(a twelve-item offline checklist). A
week of output packs to roughly 80 KB and the round-trip fits a 50 kbps link; models never
travel the link -- they arrive by SD card or USB.

Open research. The on-device model is small -- about 4B parameters, not a frontier model -- because nobody on five minutes of connectivity a day is running one. The direction we are researching is to pack more into each week's bundle: likely follow-up questions and their answers, likely misconceptions, and scenarios a particular learner may or may not meet, most of which will go unused. The aim is for the small model to run the mechanics of the interaction rather than generate the teaching cold. How much can be pre-generated well, and whether a small model can drive a good session from it, is not solved; E06 and E10 are where we find out.

**Where it lives.** The checklist is honoured across `docs/SPEC-v0.2.md` S-6 (append-only,
per-device, weekly manifest); the client itself is **deferred** and not built in Phase 1.

**What EdDAX did instead.** EdDAX was an always-online web application; offline use was not
a consideration.

**Open question.** Does the weekly git-bundle loop actually close at 50 kbps (E06), and can
a 2-4B on-device model run the quiz from a practice bank (E10)?

---

## 16. Open source and forkable

**The idea.** Prompts and schemas are CC0; documentation is CC BY 4.0; code is Apache-2.0;
generated course content defaults to CC BY 4.0 at the author's choice (decision D2). A
teacher publishes a course when ready, others may fork it, and the Foundation may fork a
published course with attribution and steward its copy (decision D7).

**Why it matters.** The licensing is chosen so the corpus stays mixable: CC0 prompts
maximise reuse, CC BY content stays compatible with openly licensed sources like Oak
(OGL), and raw generated segments are declared CC0 because a prompt alone may not confer
authorship on the output. Course repos are private by default (decision D4); publishing is
a deliberate, irreversible step, and a fork of a public course is itself public.

**Where it lives.** `docs/LICENSING.md` (the full split and the ingest whitelist), which
mirrors `LICENSES.md` at the repo root; `docs/DECISIONS.md` D2, D4, D7.

**What EdDAX did instead.** EdDAX had a single `is_public` flag on a course and no licence
model.

**Open question.** What does the Foundation's stewardship process look like in practice --
how a published course is forked, attributed and maintained? Listed as a pending decision
in `docs/DECISIONS.md`.

---

## Where to go next

- `docs/ARCHITECTURE.md` -- the repositories, the context stack, and what runs where.
- `docs/EXPERIMENTS.md` -- the fourteen experiments that will answer the open questions.
- `docs/DECISIONS.md` -- the decisions the maintainers took on 2026-09-27.
- `docs/GLOSSARY.md` -- every term above, defined.
- `docs/ACCURACY.md`, `docs/PRIVACY.md`, `docs/LICENSING.md` -- the standing constraints.
