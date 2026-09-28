# Meta DAX course repo

A course repo is the public, shareable half of Meta DAX: the curriculum
(`course.json`), the shared knowledge tree (`nodes/`), and the reuse registry
(`registry/`). It contains no learner identities and no private questions.

## Layout

```
course.json              the curriculum: lessons -> modules -> objectives,
                         concepts, Bloom targets, steers (metadax.course/0.2)
nodes/<id>/node.json     one shared or pending-review node per directory; a
                         child node is a subdirectory (ids are paths)
nodes/<id>/provenance.json   written by tools/stamp.js, never by the model
registry/index.json      lists every module registry file with its node_count;
                         its course_id starts empty and `tools/stamp.js index`
                         (also run by `stamp.js course`) fills it from course.json
registry/<module>.json   the reuse registry for one module (metadax.registry/0.2)
```

## How the teacher skill fills it

1. The teacher describes a subject and audience; MP-02 (ARCHITECT) writes
   `course.json` with lessons, modules, objectives, concepts and steers.
2. MP-04 (CONTENT) generates each objective node's shared `core`.
3. Learners ask follow-ups; MP-05 (FOLLOWUP) creates deeper nodes under the
   objective they attach to. The client stamps every write with
   `tools/stamp.js` (timestamps, `content_sha256`, `provenance.json`) and
   appends a registry entry, then commits and pushes.
4. `tools/validate.js course .` checks the structure before every push, and the
   included GitHub Action re-runs it on every push and pull request.

The model never computes a timestamp, hash, byte count or random id: it writes
the literal string `"runtime"` and the client's stamping step fills it in
(SPEC S-2 / MP-00 K-15).

## Licence

Pick a licence for the human-authored course material in `LICENSE-NOTE.md`:
CC BY 4.0 (default) or CC BY-SA 4.0. Model-generated segments are CC0 1.0.
Record the choice in `course.json` (`license`, `generated_segments_license`).

## Get the tools

The tools live in the `daxfoundation/metadax` repo (`tools/`). The GitHub Action
checks that repo out alongside this one. Locally, point the client at your
checkout of `metadax` and run `node <metadax>/tools/validate.js course .`.
