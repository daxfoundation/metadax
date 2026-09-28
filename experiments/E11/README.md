# E11 -- Does a learner repo ingest into the companion's memory sensibly?

## Question

When a learner repo (with the provenance and timestamp additions of `docs/SPEC-v0.2.md` S-7)
is fed into the companion's memory module, does it produce coherent memory cards, or does it
need a schema change beyond what Phase 1 already adds?

## Why it matters

The architecture is designed "as if" a cognitive companion will be the primary interface in
the medium to long term. The additive fields in v0.2 (created_at, updated_at, content hash,
superseded_by, provenance) exist so that the companion phase is a layering exercise, not a
migration. E11 checks that claim before the companion phase begins.

## Method

Feed a synthetic learner repo (with the S-7 additions) through a copied, isolated instance of
the companion's memory-card module -- run in isolation, never against the live product, with
the owner of that module informed. Inspect the resulting cards.

## Metrics

- coherence of the generated memory cards
- fields missing that the module needed

## Stop rule

Kill if ingest needs a schema change beyond the S-7 additions.

## Owner

M (a copied module; the owner of the memory module is informed).

## Estimated effort

2 days.

## Dependencies

A synthetic learner repo with the S-7 provenance and timestamp fields, and a read-only copy of
the companion's memory module. Must never run against the live companion.

## Status

not started

## Results

none yet -- see `results/`.
