# E06 -- Does the weekly git-bundle loop close at 50 kbps?

## Question

Does a week's round-trip of learner output and next-week content fit through a 50 kbps link
using `git bundle`, with no merge conflicts under the append-only layout?

## Why it matters

The offline five-minutes-a-day client is a later phase, but Phase 1 schemas are shaped so it
is not precluded (decision D11). This experiment checks the two claims that make the client
possible: that a week packs small enough for a slow link, and that the append-only,
per-device layout produces no textual conflicts. Models never travel the link; only data
does.

The bundle is expected to grow as it carries pre-generated follow-ups, misconceptions and scenarios for the small on-device model (see E10); how that growth fits the link is part of what this experiment measures.

## Method

Simulate a week of learner output (roughly 20 nodes, 7 progress snapshots, 50 tutor turns).
Create a `git bundle` against a basis, throttle the link (for example with `tc`), transfer,
verify and unbundle. Measure the round-trip and check for conflicts.

## Metrics

- bytes transferred
- seconds for the round-trip
- textual conflicts under the append-only layout (target: zero)

## Stop rule

Kill if the round-trip exceeds 300 seconds, or if any textual conflict occurs.

## Owner

M (an automated run by the maintainers).

## Estimated effort

2 days.

## Dependencies

The learner repo layout (`docs/SPEC-v0.2.md` S-6): append-only per-device progress, immutable
tutor turns, and the weekly manifest.

## Status

not started

## Results

none yet -- see `results/`.
