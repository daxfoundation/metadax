# E14 -- Does the age wall bite in practice? (observe only)

## Question

In real sessions, does the age wall actually hold -- or does a child's typing trigger an
age-verification prompt on the adult's account, or a child's name drift into memory or files?

## Why it matters

Phase 1 clients are for adults only (decision D1), and the child path is parent-mediated: the
adult is the user, the child is "the learner", and no child credential is entered. Whether that
is comfortable in practice is a policy-grey area the exploration report flags. E14 observes it
early so a problem is seen before it becomes a pattern. It is observe-only: it never provokes
the wall, it watches for it.

## Method

During E01, E02 and E03, log any age-verification prompt that appears, and any instance of a
child's name (or other identifying detail) drifting into memory, a rendering, or a saved file.

## Metrics

- any age-verification prompt triggered
- any drift of a child's name or identifying detail into memory or files

## Stop rule

Any hit means the parent-mediated path needs a stricter guard, or waits for a later phase.

## Owner

U (a real adult user).

## Estimated effort

continuous (runs alongside E01-E03).

## Dependencies

Runs during E01, E02 and E03; needs the age-wall guard in the skills and the privacy rules in
`docs/PRIVACY.md`.

## Status

not started

## Results

none yet -- see `results/`.
