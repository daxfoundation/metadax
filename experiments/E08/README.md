# E08 -- Tier-1 assets: what pass rate with oracle tests?

## Question

When the system generates Tier-1 interactive assets (small JSXGraph or p5.js sketches) from
a spec, what share are functionally correct, and what share are correct in the underlying
science?

## Why it matters

Generated interactive simulations are the weakest link in the evidence: an external benchmark
reports about 41 percent functional pass at best for LLM-generated science interactives, and
more than half of the failures are wrong science behind a working interface. Phase 1
therefore promises only Tier-0 (Mermaid, SVG) and Tier-3 (curated PhET, H5P) assets
(decision D6). E08 decides whether Tier-1 can be admitted at all, gated on oracle tests.

## Method

Write 20 specs (JSXGraph and p5.js) each with a closed-form oracle test, and run the
generated sketches through a Playwright harness that checks both that the sketch works and
that its output matches the oracle.

## Metrics

- functional pass rate (the sketch runs and responds)
- physics-correct pass rate (the sketch's output matches the oracle)

## Stop rule

If the physics-correct pass rate is at or above 60 percent, Tier-1 may be admitted into
Phase 1 with oracle tests; below 60 percent, the default stands (Tier-0 and Tier-3 only).

## Owner

M (an automated run by the maintainers).

## Estimated effort

3 days.

## Dependencies

An asset-generation spec, a set of oracle tests, and a Playwright harness. Independent of the
core prompt certification.

## Status

not started

## Results

none yet -- see `results/`.
