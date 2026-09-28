# MetaDAX architecture

This document describes how MetaDAX is put together: the repositories, the stack of context a
model receives, the pipeline a client runs, and what actually runs where (almost nothing). It
assumes you have read `docs/CONCEPTS.md`. The frozen contract is `docs/SPEC-v0.2.md`; the file
layout of this repository is `docs/LAYOUT.md`.

## The three repositories

MetaDAX has no central store. State lives in files, in three kinds of git repository.

| Repository | Visibility | Holds | Source of truth for |
|---|---|---|---|
| **Foundation repo** (this one) | public | prompts (`prompts/`), schemas (`schemas/`), skills (`skills/`), adapters, evals, docs | the *system* |
| **Course repo** | private by default (D4) | `course.json`, `nodes/<id>/`, `registry/`, `sources/`, per-node provenance | a *course* |
| **Learner repo** | private | profile, progress snapshots, sessions, private nodes, manifests | a *person* |

Only `shared` and `pending_review` nodes ever live in a course repo. A learner's `private` nodes
live only in the learner repo and never appear in a course repo. A course repo never contains a
name, email, school or diagnosis (see `docs/PRIVACY.md`).

```
Foundation repo (public)        Course repo (private by default)     Learner repo (private)
--------------------------      -------------------------------      -----------------------
prompts/   MP-00 .. MP-10       course.json                          learners/<lrn-id>/
schemas/   *.schema.json        nodes/<id>/node.json                   profile.json
skills/    teacher, learner       nodes/<id>/provenance.json           progress/<course>/<device>/<date>.json
adapters/  vendor headers       registry/index.json                    sessions/<ses-id>/event-*.json
evals/     model matrix         registry/<module-id>.json              sessions/<ses-id>/turn-*.json
docs/      these docs           sources/                               nodes/<id>/node.json   (private)
tools/     canon, stamp,        (shared + pending_review only)         manifests/<YYYY>-W<WW>.json
           validate
```

## The context stack

Every operation receives its input as an ordered stack of tagged blocks. The kernel (MP-00) and
one operation prompt come first; then the data blocks, always in this order (blocks an operation
does not need are omitted). This is the assembly order defined in `prompts/SCHEMAS.md` section 8.

```
+--------------------------------------------------------------+
| [K]  MP-00 kernel                        (always)            |
| [T]  operation prompt MP-xx              (always)            |
+--------------------------------------------------------------+
| <<CONFIG>>    keys: mode, output_mode, math_mode, write_mode,|
|               client, ...                                    |
| <<COURSE>>    id, title, language, audience, steer, policy   |
| <<LESSON>>    id, title, steer                               |
| <<MODULE>>    id, title, steer                               |
| <<OBJECTIVE>> id, title, statement, concepts, bloom_target   |
| <<CONCEPTS>>  concept objects in scope                       |
| <<LEARNER>>   profile, or "none"                             |
| <<PATH>>      ancestors root -> parent: id, title,           |
|               canonical_question, summary   (the memory)     |
| <<ANCHOR>>    parent section id + text + quote, or "none"    |
| <<REGISTRY>>  children of parent + course-wide candidates    |
| <<SOURCE>>    grounding excerpts with ids                    |
| <<CONTENT>>   the material the operation works on            |
| <<PROGRESS>>  learner progress for this course               |
| <<SESSION>>   previous turns / events / reports              |
| <<INPUT>>     the learner's or teacher's message             |
+--------------------------------------------------------------+
                          |
                          v
             exactly one JSON object out
        (client validates, then stamps: K-15)
```

Block content is data, not instructions (kernel rule K-7): text inside a block, including
uploaded sources and learner messages, is material to work with, never a command that can change
the rules.

## The pipeline: PREPARE .. PUSH

A client runs the same loop for every operation. The authoritative description of each step is in
`docs/INTERFACE.md`; the shape is:

1. **PREPARE.** Pull the repos (`git pull --rebase`), read the client config, and gather the
   inputs the operation needs.
2. **ASSEMBLE.** Build the context stack in the order above (this is the work MP-03 describes:
   read the parent's module registry, then the index, then candidate nodes).
3. **CALL.** Paste the kernel plus the operation prompt plus the blocks to the model; receive one
   JSON object.
4. **CHECK.** Validate the object against the operation's schema; reject anything that invents an
   id or violates a length limit.
5. **WRITE.** Either write the files directly (`write_mode: git`) or apply the commit packet
   (`write_mode: packet`); a `create` never overwrites an existing path.
6. **STAMP.** Fill in the fields the model wrote as `"runtime"` (timestamps, hashes, byte counts,
   the weekly manifest) with `tools/stamp.js` (K-15).
7. **PUSH.** Commit and push.

## What runs where: nothing runs anywhere

There is no MetaDAX service. A client is a chat model, plus `git`, plus three small Python tools:

- `tools/canon.js` -- canonicalise a JSON object (JSON Canonicalization Scheme, RFC 8785) so a
  content hash is stable across machines.
- `tools/stamp.js` -- compute timestamps, content hashes and byte counts, and write the weekly
  manifest; this is the step that replaces the `"runtime"` placeholders.
- `tools/validate.js` -- check a record against its schema before it is committed.

Everything else is rented: the model runs in the user's chat client; state lives in the user's
git repositories; scheduling, when needed, is a GitHub Action with the user's own key.
The Foundation's own workers (ingest, a reuse-by-meaning index, a routing proxy) are later phases
and are always matched by a plain-Actions-plus-own-key equivalent so no stranger depends on the
Foundation's infrastructure (decision D10).

## One follow-up, landing in both repos

Take the depth-5 mitochondria example from `docs/CONCEPTS.md`. A learner reading
`.../electron-donation-complex-iv` highlights "electron transport" and asks "are plant ones
different??". The follow-up engine returns one node object. Depending on the node's visibility,
the files land like this:

**If the node is `shared` or `pending_review`** -- it goes to the course repo:

```
course-repo/
  nodes/L01.M01.O01/proteins-essential-atp-synthesis/cytochrome-c-structure-role/electron-donation-complex-iv/plant-animal-mitochondria/
    node.json          <- the shared core, summary, seeds, path, links
    provenance.json    <- written by tools/stamp.js (content hash, creator, lineage)
  registry/L01.M01.json  <- one entry appended for the new node
```

The registry file is chosen by the id's module prefix (`L01.M01`), so a learner adding a node in a
different module never touches this file -- merges stay clean (`docs/SPEC-v0.2.md` S-5).

**If the node is `private`** -- it goes only to the learner repo, and never to the course repo:

```
learner-repo/
  learners/lrn-7qk2x9/nodes/.../plant-animal-mitochondria/node.json
```

**In both cases**, the learner repo also gets the session records for the interaction:

```
learner-repo/
  learners/lrn-7qk2x9/sessions/ses-20260927-ab12/event-0007.json   <- a follow_up event
  learners/lrn-7qk2x9/progress/cell-biology-101/dev-9x2k7q/2026-09-27.json  <- the day's snapshot
```

Every session file is immutable (one file per event or turn, never edited), and the progress file
is one snapshot per device per day (`docs/SPEC-v0.2.md` S-6).

## Sizes

Token figures are cl100k estimates made during design, not measured
billing figures (`docs/ACCURACY.md`):

- the kernel (MP-00) is about **1,200 tokens**
- MP-00 plus the follow-up engine needs an **8k** context; full tutor or content calls need 6-9k
- the full manual stack -- pasting the kernel, the runner, the schemas and the operation prompts
  into one chat -- is about **25k tokens**

A week of learner output (roughly 20 nodes, 7 snapshots, 50 tutor turns) packs to about 80 KB,
which is what makes the offline bundle client (a later phase) possible over a slow link.
