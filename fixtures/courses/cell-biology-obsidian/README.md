# Cell Biology (Obsidian fixture)

A small, complete, valid MetaDAX course repo in the v0.2 layout (`docs/SPEC-v0.2.md`). It exists so that later tests, evals and walkthroughs have one real recursion to build on.

## The course

One lesson, `L01` "Energy in the cell", with two modules:

- `L01.M01` "Mitochondria and ATP" -- objectives `O01` "Introduction to energy production in the mitochondria" (bloom_target Analyze) and `O02` "The electron transport chain" (Understand).
- `L01.M02` "Comparing cells" -- objective `O01` "Plant and animal cells compared" (Understand).

Seven course concepts, three objective nodes (depth 1), and the real chain of learner follow-ups under `L01.M01.O01`.

## Where the chain comes from

This is the deepest follow-up chain from the EdDAX prototype course "Cell Biology Obsidian", asked by the project's author (see `prompts/MP-05-followup-engine.md`). In EdDAX the follow-up write path lost the parent context and even stored a model refusal as content at depth 4. Here the same five questions are rebuilt correctly:

```
L01.M01.O01                                            Introduction to energy production in the mitochondria (objective, depth 1)
  proteins-essential-atp-synthesis                     "what proteins are needed for this??"        (depth 2)
    cytochrome-c-structure-role                        "and what about cytochrome c?"               (depth 3)
      electron-donation-complex-iv                     "how does it actually give its electrons..." (depth 4)
        plant-mitochondria-different                   "are plant ones different??"                 (depth 5)
```

Only the questions and titles come from the prototype. The ids were converted to the MetaDAX scheme and every `core` section was written fresh for a curious adult. No learner names or personal data appear.

The depth-5 node `plant-mitochondria-different` is the cross-branch reuse case: it is a new node under its parent, but it carries a `links[]` entry with relation `extend` to `L01.M02.O01` ("Plant and animal cells compared"), and its provenance records the same `extend` edge in its lineage.

## Visibility

`course.policy.learner_nodes` is `pending_review` (the default). The four chain nodes are `shared` (they stand for follow-ups that were reviewed and promoted). One sibling under `L01.M01.O02`, `building-proton-gradient`, is left `pending_review` so the registry carries both visibilities. A private node (`why-is-oxygen-needed`) lives only in the fixture learner repo, never here.

## Layout

```
course.json
nodes/<id>/node.json + provenance.json     (one directory per shared/pending node)
registry/index.json                         (per-module index, S-5)
registry/L01.M01.json, registry/L01.M02.json
```

## Stamping and licence

Fully stamped with real RFC 3339 UTC timestamps and real SHA-256 hashes. `content_sha256` is the SHA-256 of the canonical JSON of each node's `core` (`json.dumps(core, sort_keys=True, separators=(",",":"), ensure_ascii=False)`). See `fixtures/README.md` for the authoritative hashing note that `tools/stamp.py` must reproduce.

Prose is CC BY 4.0; the JSON structure is CC0 1.0.
