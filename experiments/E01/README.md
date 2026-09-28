# E01 -- Course creation on the Claude Code client

## Question

Can a non-technical adult create a course into a repository using the **Claude Code**
client (the first client) and the teacher skill, following the walkthrough as written?

**E01b (variant, same card).** Can the same adult do it on **Claude Desktop**, and does
the Claude Desktop GitHub connector write files to a repository at all? Whether that
connector can commit files is not yet verified here; E01b settles it.

## Why it matters

Claude Code with the user's own GitHub credential is the first client (decision D12 area).
If a non-technical adult cannot get from an empty repository to a first saved lesson
without hitting a wall, the zero-code premise fails for teachers. E01b tells us whether
Claude Desktop is a viable second client or whether it is limited to the commit-packet
path.

## Method

Follow the teacher walkthrough (`docs/WALKTHROUGH-CLAUDE-CODE.md`) exactly as written, from
an empty course repository to a first saved lesson, using the teacher skill. Run it first
as an automated run with a model acting as the client, then with up to three pilot adults.
For E01b, repeat on Claude Desktop with the Claude header, paying attention to whether the
connector writes files or only reads.

## Metrics

- steps completed and steps that needed off-script help
- minutes to the first saved lesson
- number of approval dialogs, and seconds before the first screen
- HTTP errors seen (403 / 404 / 422), especially a commit into an empty repository
- whether file writes work (E01b: does the Desktop connector commit at all)
- content quality, scored against a published curriculum-quality rubric

## Stop rule

Kill if the first lesson takes over 15 minutes, or if any pilot fails setup before saving
a first course.

## Owner

U (a real adult user), then 2-3 pilots.

## Estimated effort

4 days.

## Dependencies

The teacher skill and adapters (skills build), the teacher walkthrough
(`docs/WALKTHROUGH-CLAUDE-CODE.md`), and the tools (`tools/`) for stamping and validation.
Ideally after E04 has certified the prompts.

## Status

done (first cut, 2026-09-27; automated runs with Claude, not yet a human pilot)

## Results

- `results/2026-09-27-teacher-run-newtons-laws.md` -- run 1: the Claude Code client in
  this repository generated a seven-objective Newton's laws course into a private sandbox
  course repository; validate OK throughout. Two verbatim sample nodes are in
  `results/2026-09-27-sample-nodes.md`.
- `results/2026-09-27-newton-course-run.md` -- run 2: the full "Newton's Laws of Motion:
  An Everyday Introduction" course, 21 objectives in 3 lessons, generated in the Claude
  desktop app; validate OK after every node. The learner half of the same run is in
  `experiments/E03/results/2026-09-27-newton-learner-run.md`.
