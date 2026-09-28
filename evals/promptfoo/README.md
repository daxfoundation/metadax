# promptfoo certification config

The same eval cases as `evals/cases/`, wired as promptfoo tests against two
vendors. This is the CI/certification path for experiment E04.

**Dispatch-only. Not installed, not run in this repo.** promptfoo is configured
here but never invoked from `push` or `pull_request`. It runs only from
`.github/workflows/certify.yml`, which is `workflow_dispatch` only (decision D8:
no certify/steward Actions in Milestone 1). There is no lockfile and no
`node_modules`; nothing here installs a package.

## Files

- `promptfooconfig.yaml` -- two providers (Anthropic Messages, OpenAI Responses),
  the prompt is the assembled stack passed straight through, tests generated from
  `tests.js`.
- `tests.js` -- builds one test per case under `evals/cases/`, carrying the
  committed `stack.txt` as the `stack` var, and asserts by calling
  `evals/grade.js` (the same grader the local runner uses, so promptfoo and the
  local runner agree on pass/fail).

## Secrets and environment (names only)

Set as **repository secrets**; never write a key into any file:

- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`

Model ids come from the environment so no model is named in the repo unless a run
actually used it (docs/ACCURACY.md item 8):

- `ANTHROPIC_MODEL` -- the Anthropic primary (decision D3)
- `OPENAI_MODEL` -- the OpenAI primary (decision D3)
- `FLOOR_MODEL` -- the smaller floor model, run as a third tier

## Running it (only where promptfoo is installed)

```
ANTHROPIC_MODEL=<id> OPENAI_MODEL=<id> \
  npx promptfoo@latest eval -c evals/promptfoo/promptfooconfig.yaml
```

The certification set is two primary models (one per vendor) plus the floor model
(D3). A model may be recorded as certified only once a recorded run has passed it,
with the exact id the run reports.
