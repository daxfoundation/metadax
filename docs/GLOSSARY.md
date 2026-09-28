# MetaDAX glossary

Every term a reader meets in the MetaDAX docs, in alphabetical order. For the ideas behind
them, see `docs/CONCEPTS.md`; for the data shapes, `prompts/SCHEMAS.md` and
`docs/SPEC-v0.2.md`.

**Accommodations.** What helps a learner (short chunks, frequent checks, read-aloud-friendly
text, step-by-step procedures), stored in a profile's `supports`. MetaDAX stores
accommodations, never diagnoses (design law 6).

**Anchor.** The section of a parent node, plus the short highlighted quote (at most 200
characters), that a learner selected when asking a follow-up. Written into the ANCHOR block.

**Ancestor.** One of the five follow-up decisions: the learner has looped back to a question an
earlier node in the path already answered, so the engine recaps and points there instead of
creating a node.

**Audience key.** The combination of audience attributes (age band, reading level, language,
supports) a rendering is produced for; used to cache and reuse renderings across learners in
the same band.

**Bloom target (`bloom_target`).** The level of Bloom's taxonomy a concept is meant to reach.
Competency is measured relative to this, not against all six levels.

**Client.** The program a user runs to talk to a model: Claude Code (the first client), Claude
Desktop, an API runner, ChatGPT, or later the companion. All are clients of the same interface
(`docs/INTERFACE.md`).

**Companion.** A cognitive, conversational interface planned as the primary way learners
interact in the medium to long term, and the safeguarded route by which the Foundation will
serve minors in a later phase. Not built in Phase 1.

**Competency.** A per-concept score from 0 to 100, computed from the Bloom levels a learner
passed up to the concept's `bloom_target` (weights Remember 10, Understand 15, Apply 20,
Analyze 20, Evaluate 15, Create 20).

**Constraint Protocol.** A future protocol under which interactions between entities would be
recorded and re-judged. In MetaDAX only *reserved fields* exist for it (`key_id`,
`constraint_decl_ref`, and related); MetaDAX does not run the Constraint Protocol and it is
never described as live.

**Core.** The shared, audience-neutral answer stored on a node: no learner names or interests.
The shared course asset (design law 2).

**Course repo.** A teacher's repository holding a course: `course.json`, nodes, per-module
registries, sources and provenance. Private by default (D4); holds only `shared` and
`pending_review` nodes.

**Event.** An immutable record of one thing that happened in a session (a follow-up, an answer,
a hint, a handoff, and so on), stored one file per event, never edited.

**EdDAX.** The previous system (2024-2025), a Blazor web application with SQL Server and Cosmos
DB, which the maintainers analysed before building MetaDAX. MetaDAX rebuilds its behaviour
prompt-first. The EdDAX code is not published.

**Extend.** One of the five follow-up decisions: an existing node covers the topic but not this
angle or level, so a new node is created that adds only what the existing one lacks, with a link
back to it.

**Follow-up.** A learner's question asked from within a node, handled by the follow-up engine
(MP-05), which may create a new node or point to an existing one.

**The Foundation (the DAX Foundation).** The steward of the shared MetaDAX system: the prompts,
schemas, skills and certification.

**Kernel.** MP-00, the shared contract (about 1,200 tokens) pasted before every operation
prompt. Holds the kernel rules K-1 through K-15.

**Learner repo.** A private repository holding one person's record: profile, progress, sessions,
private nodes and manifests. Pseudonyms only; never a name, email, school or diagnosis.

**Manifest.** A weekly file listing a learner repo's files for that week with their sizes and
hashes, written by the stamping tool. Shaped for the offline bundle client.

**Node.** A unit of the knowledge tree: an objective node (depth 1) or a follow-up node (depth
2 or more). Stored as `nodes/<id>/node.json`, with a `core`, renderings, summary, seeds and
metadata.

**Objective node.** A depth-1 node representing a learning objective, with an id like
`L03.M02.O01`. The root of any follow-up chain beneath it.

**Operation.** One MetaDAX call: kernel plus one operation prompt plus tagged input blocks,
producing exactly one JSON object. The operations are PROFILE, ARCHITECT, COMPILE, CONTENT,
FOLLOWUP, TUTOR, EVALUATE, STEWARD, CURATE and RUN.

**Packet (commit packet).** A fenced JSON block a client appends to its output when
`write_mode` is `packet`, listing files to create; a person or a small tool applies it. The save
path for clients without a writing connector.

**PATH.** The ordered list of a node's ancestors, objective first and parent last, each with
id, title, canonical question and summary. Handed to the follow-up engine as the PATH block;
also stored on the node. The PATH is the memory.

**Private (visibility).** A node visible only to its author, stored only in the learner repo and
never written to a course repo. A child of a private node is private.

**Pending_review (visibility).** A node awaiting review before it can be shared, for example one
authored by a minor or under a course policy that requires review.

**Provenance.** The `provenance.json` beside each node, written only by the stamping tool,
recording the content hash, creator, role, lineage and reserved Constraint Protocol fields.

**Registry.** The per-module index of a course's nodes (`registry/<module-id>.json` plus
`registry/index.json`), from which the follow-up engine gets candidate nodes for reuse.

**Rendering.** A personal or per-audience presentation of a node's core: reading level,
interests, supports. Personalisation lives here, never in the core.

**Redirect.** One of the five follow-up decisions: under a strict course scope policy, the
question is out of scope, so the engine declines to answer it and connects it to the nearest
in-scope idea.

**Reuse.** One of the five follow-up decisions: an existing node already answers the question, so
the engine points the learner there and copies nothing (design law 3).

**Seed.** One of exactly three suggested next questions attached to a node, offered to the
learner as follow-ups from that node.

**Shared (visibility).** A node visible in the course repo to everyone, eligible for reuse by
other learners.

**Snapshot.** A dated, per-device progress file (`progress/<course>/<device>/<date>.json`); the
latest across devices is the current state. Progress is append-only, never one mutable file.

**Source policy.** The course steer that governs grounding: `source_only` (teach only what
sources support, cite ids) or `source_first` (prefer sources, label the rest). Citations are
never fabricated (K-8).

**Stamp.** The client step that fills in the values the model is forbidden to compute
(timestamps, hashes, byte counts), which the model wrote as the literal string `"runtime"`
(K-15). Done by `tools/stamp.js`.

**Steer.** A short instruction attached to a course, lesson or module that shapes generation
(focus, include, exclude, depth, source policy, scope policy). A narrower steer refines a
broader one.

**Turn.** One exchange in a tutor session, saved as an immutable file carrying the full tutor
turn envelope, including the `state` object present on every turn.

**Visibility.** A node's sharing state: `private`, `pending_review` or `shared`. Determines where
the node is stored and who can see it.

**Write mode (`write_mode`).** How a client persists output: `git` (the client writes files
itself), `packet` (the model ends output with a commit packet), or `none` (a read-only session).
