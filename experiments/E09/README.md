# E09 -- Can MP-11 produce records a parent would file?

## Question

Can the records operation (MP-11 RECORDS, reserved for a later spec version) turn a learner
repo into the documents a homeschooling parent must actually file with their jurisdiction?

## Why it matters

Because every lesson, work sample and quiz already lands in the learner repo, a parent's
required records could be a generated view rather than extra work. This experiment checks that
premise against a real jurisdiction's requirements. Note that MP-11 RECORDS is deferred to a
later spec version and is not written in Phase 1; E09 is the experiment that would justify
building it.

## Method

Build a synthetic 12-week learner repo, generate records against one provincial homeschool reporting template
(subject plan, materials log, dated work-sample index, narrative progress report, coverage
against required areas, and a transcript), and have a real homeschooling parent review the
output. Reports use narrative form, never letter grades or percentiles by default.

## Metrics

- the parent's verdict (would they file it as-is)
- artefacts missing from what the jurisdiction requires

## Stop rule

Kill if the parent would not file it.

## Owner

U plus one homeschooling parent.

## Estimated effort

3 days.

## Dependencies

An MP-11 RECORDS draft and jurisdiction templates (one Canadian province first). Depends on a synthetic
learner repo in the v0.2 layout.

## Status

not started

## Results

none yet -- see `results/`.
