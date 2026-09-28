# E12 -- Can provenance plus signed commits be verified later as a chain?

## Question

Can a node's `provenance.json` plus signed git commits be reconstructed later into a verifiable
chain -- lineage rebuilt and content hashes matching after canonicalisation -- from the
repository alone?

## Why it matters

Provenance is what makes each node self-describing and later-phase-ready ("Provenance and
constraints" in `docs/CONCEPTS.md`). The reserved fields are placeholders for a future
Constraint Protocol, which Meta DAX does not run. E12 checks the load-bearing property: that
everything needed to verify a node can be rebuilt from the repo, so nothing has to be trusted
out of band.

## Method

Build 20 nodes with signed commits and a `provenance.json` each, then write a verifier that
reconstructs each node's lineage and recomputes its content hash after canonicalisation
(JSON Canonicalization Scheme), comparing against the stored value.

## Metrics

- whether each chain is reconstructable from the repo alone
- whether the recomputed hash matches the stored hash after canonicalisation

## Stop rule

Kill if any field cannot be reconstructed from the repository alone.

## Owner

M (an automated run by the maintainers).

## Estimated effort

2 days.

## Dependencies

The provenance shape (`docs/SPEC-v0.2.md` S-7), the canonicalisation and stamping tools
(`tools/canon.py`, `tools/stamp.py`), and signed commits.

## Status

not started

## Results

none yet -- see `results/`.
