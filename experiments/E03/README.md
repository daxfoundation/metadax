# E03 -- Parent-mediated learner session

## Question

Can a parent-mediated learner session run end to end: read a node, follow up three levels
deep, take a quiz, and save the result -- with the tutor's JSON state kept out of the
child's view?

## Why it matters

The learner journey is the other half of the system, and the parent-mediated path is how a
child would participate in a later phase (the adult is the user; the child is "the
learner" in the prompts). If quiz state leaks into what the learner sees, or the tutor
breaks its own rules early, or a normal session hits a plan limit, the learner path is not
usable.

## Method

One adult plays both parent and child on a single account. Read an objective node, ask three
levels of follow-up, then run a Bloom quiz with the tutor state carried on a single minified
fenced line. Save progress and sessions to the learner repo.

Phase 1 clients are adults-only, so the first runs exercise the same path with an adult
learner; the parent-mediated variant waits for a later phase.

## Metrics

- share of turns where JSON state leaks into the learner-facing view (target: at most 5
  percent)
- approval dialogs per session
- tokens per turn
- the turn number of the first rule break, if any
- saves lost

## Stop rule

Kill if a rule break happens before turn 40, or if a 20-minute session hits a plan limit.

## Owner

U (a real adult user).

## Estimated effort

3 days.

## Dependencies

The learner skill, MP-05 (follow-up) and MP-06 (tutor) as certified by E04, and the learner
repo template. Runs alongside E14 (age-wall observation).

## Status

done (first cut, 2026-09-27; adult path only; automated runs with Claude)

## Results

- `results/2026-09-27-learner-run-cell-biology.md` -- run 1 (the Claude Code client in this
  repository, on the fixture course): timeline, decision table for the follow-ups, quiz
  turn and state table, handoff object, learner files, validate outputs, stack sizes, age
  wall, six defects, and the E03 metrics.
- `results/2026-09-27-raw-outputs.md` -- every raw model JSON object from run 1.
- `results/2026-09-27-course-after-session/` -- post-session course nodes and registry from
  run 1 (for diffing against the fixture).
- `results/2026-09-27-newton-learner-run.md` -- run 2 (the Claude desktop app, on the Newton
  course from E01 run 2): age wall, profile, private rendering, six follow-ups to depth 4
  (new x3, reuse, ancestor, extend from a quiz handoff), an 8-turn quiz with EVALUATE
  grading, and the save; findings F-L1 to F-L8, two of them tool bugs fixed with regression
  tests (`tools/stamp.js` reuse, `tools/assemble.js` MP-07).
