# E13 -- Prompt Forge: can a method variant be generated and certified?

## Question

Can a Prompt Forge operation generate a teaching-method variant of a content prompt (for
example a Charlotte Mason variant), together with its certification fixtures, and can that
variant then pass certification?

## Why it matters

Prompt Forge is "meta prompts for creating meta prompts": it would let the suite grow from a
small kernel plus method profiles instead of by hand, so a teacher's method tweaks become
publishable, certifiable prompt variants. It is an experiment only, not a Phase 1 feature
(decision D9). E13 tests whether the idea is viable before it is ever considered for the build.

## Method

Have FORGE emit a Charlotte Mason variant of the content prompt plus its fixtures, then run the
E04 certification over that variant. Have a reviewer literate in the method judge the output.

## Metrics

- whether the generated variant passes certification (via E04)
- whether a method-literate reviewer accepts the output

## Stop rule

Kill if the variant fails certification twice after repair.

## Owner

M plus CI.

## Estimated effort

3 days.

## Dependencies

A FORGE prompt (experimental, not in the Phase 1 suite), the E04 certification harness, and a
reviewer familiar with the target method.

## Status

not started

## Results

none yet -- see `results/`.
