# E04 -- Do the v0.2 prompts pass on both vendors?

## Question

Do the v0.2 prompts produce valid, on-spec output on both vendors' models?

## Why it matters

This experiment gates everything else. Certification is the trust surface a teacher
consumes (see "Certification instead of trust" in `docs/CONCEPTS.md`): a prompt is certified
for a named model set, and until E04 has run there is no certified set to cite. The
exploration report sequences E04 first for exactly this reason.

## Method

Run promptfoo in the Foundation repo on every pull request that touches the prompts: six
operations across ten fixtures each, against the certification model matrix (two primary
models, one per vendor, plus a floor model; models are named in `evals/` when the evals
exist, not here -- decision D3). Check schema-valid JSON per operation, a present Bloom
level, monotonic state, and an LLM-rubric score graded by a cheap model.

## Metrics

- schema-valid rate per operation per model
- rubric score
- per-model failures

## Stop rule

Kill (block release) if any operation is under 90 percent schema-valid on a primary model.

## Owner

CI.

## Estimated effort

2 days to set up, then continuous.

## Dependencies

The eval harness and fixtures (`evals/`, another build ask), the JSON schemas (`schemas/`),
and API keys for both vendors as repository secrets. One pending decision is an OpenAI API
key for cross-vendor certification (`docs/DECISIONS.md`).

## Status

not started

## Results

not yet run -- see `results/2026-09-27-first-run.md`. The eval harness, the 27
cases, the grader, the runner and the promptfoo config are built and committed,
but no model has executed the suite: a nested `claude -p` is unavailable in the
build container ("Please run /login"). No result may claim a model passed until a
recorded run shows it.
