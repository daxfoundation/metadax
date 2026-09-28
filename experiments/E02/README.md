# E02 -- Course creation on ChatGPT

## Question

Can a non-technical adult create a course into a repository on ChatGPT -- on Plus via
Codex cloud, and on Free via the commit packet?

## Why it matters

Dual-vendor is a founding constraint (the first client is generic and works across
Anthropic and OpenAI). On ChatGPT the connector is read-only on Plus and absent on Free,
so writes go through Codex cloud or through a commit packet that a person applies. E02
tells us whether the packet path is reliable enough to call ChatGPT a supported client.

## Method

Follow the same teacher walkthrough as E01, using the ChatGPT header. On Plus, save through
Codex cloud; on Free, save by producing a COMMIT PACKET (`docs/SPEC-v0.2.md` S-9) and
applying it with the ingest path.

## Metrics

- the same metrics as E01 (steps, minutes to first lesson, approval dialogs, HTTP errors,
  content quality on Oak's rubric)
- commit-packet success rate: the share of packets that apply cleanly and land the intended
  files without manual repair

## Stop rule

Kill if commit-packet ingest lands cleanly under 90 percent of the time.

## Owner

U (a real adult user).

## Estimated effort

1 week.

## Dependencies

The ChatGPT adapter header, the commit-packet application path (`tools/apply_packet.py`),
the teacher skill, and the walkthrough. Best run after E04.

## Status

not started

## Results

none yet -- see `results/`.
