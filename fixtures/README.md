# Meta DAX fixtures

This folder holds the reference fixtures every later test, eval and walkthrough builds on. Everything here is synthetic and safe to publish. There is no real person's data.

## What is here

- `courses/cell-biology-obsidian/` -- a small, complete, valid course repo in the v0.2 layout (`docs/SPEC-v0.2.md`). It rebuilds the one real recursion recovered from EdDAX: the depth-5 mitochondria follow-up chain. See that folder's `README.md` for the full story.
- `learners/lrn-fixture01/` -- a fixture learner repo: a pseudonymous adult profile, one private node, one progress snapshot, one saved session (events and tutor turns) and a weekly manifest.


## Provenance of the chain

The chain (objective -> `proteins-essential-atp-synthesis` -> `cytochrome-c-structure-role` -> `electron-donation-complex-iv` -> `plant-mitochondria-different`) is the real depth-5 follow-up chain from the EdDAX prototype course "Cell Biology Obsidian", asked by the project's author (see `prompts/MP-05-followup-engine.md`, "The PATH is the memory"). Only the questions and titles come from the prototype; the ids were converted to the Meta DAX scheme and all prose was rewritten fresh for a curious adult. No learner names or personal data are reproduced.

## How evals use it

- A known-good course repo to validate `tools/validate.py`, `tools/assemble.py` and the JSON Schemas.
- A worked PATH for the follow-up engine: the depth-5 call in `MP-05` receives exactly the `path[]` stored on the deepest node.
- A learner repo to exercise the progress steward (MP-08) snapshot merge, the session runner (MP-10) and the tutor (MP-06) turn envelope.
- The cross-branch reuse case: the depth-5 node carries a `links[]` entry (relation `extend`) to `L01.M02.O01`.

## Hashing note (the tools and evals must reproduce these hashes)

`content_sha256` on every node, and `content_hash` in every `provenance.json`, is the hex SHA-256 of the canonical JSON of that node's `core` object, where canonical JSON is

```
json.dumps(core, sort_keys=True, separators=(",",":"), ensure_ascii=False).encode("utf-8")
```

These fixtures are fully stamped: real RFC 3339 UTC timestamps (the time they were written) and real SHA-256 values, not the literal string `"runtime"` a model would emit. `tools/stamp.py` must reproduce these exact hashes with the same canonicalization. All content is plain ASCII with no floats in `core`, so this scheme and RFC 8785 (JCS) coincide byte-for-byte here.

Note on tooling: `tools/stamp.py` did not exist when these fixtures were built (it was being written concurrently). The hashes were computed with an inline script whose canonicaliser reproduces the Python `json.dumps(..., sort_keys=True, separators=(",",":"), ensure_ascii=False)` byte sequence exactly for ASCII-only, float-free objects.

## Licence

Prose in `core` sections and READMEs is CC BY 4.0. The JSON structure (schemas, ids, layout) is CC0 1.0. `course.json` records `license: CC-BY-4.0` and `generated_segments_license: CC0-1.0`.
