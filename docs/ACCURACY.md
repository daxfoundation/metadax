# Meta DAX accuracy commitments

Meta DAX is a set of experiments, and this repository is public. These are the commitments
every public document here keeps. They are not style preferences: they are statements the
project does not make because they would be untrue or unverified. A reviewer checks every
public document against this list before it ships.

## The commitments

1. **Reserved fields are described as reserved.** Provenance carries fields reserved for a
   future constraint and signing layer (`key_id`, `constraint_decl_ref`, `constraint_decl`).
   They are null placeholders. Nothing in Meta DAX verifies them yet, and no document says
   otherwise.

2. **No affiliation is implied.** Meta DAX is an independent project. It is not affiliated
   with or endorsed by Anthropic, OpenAI, GitHub or Oak National Academy; their names
   describe clients, platforms or sources the project uses or plans to use.

3. **No result is presented that was not produced by a recorded run.** An experiment stays
   "not started" until a dated file lands in its `results/` folder from an actual run.
   Targets and kill lines in the cards are not results. Where an outcome has not been
   produced, the docs say "not yet run". Automated runs (a model playing the client, or
   playing a simulated learner) are labelled as such and are never presented as a pilot
   with a person.

4. **No unsourced market or usage percentages.** Any percentage traces to a named source or
   is not stated.

5. **Later-phase capabilities are not written in the present tense.** The companion, the
   offline client, a reuse-by-meaning index and any service for learners under 18 are
   future work.

6. **No personal data.** Learner examples use pseudonyms only (`lrn-` plus 8 lowercase
   letters or digits); no real name, email or school appears anywhere in this repository.

7. **Token counts are estimates.** Stack sizes are measured in bytes by `tools/assemble.js`
   and reported as tokens at about four bytes per token. They are always called estimates,
   never billing figures.

8. **Models are named by vendor, not by version, outside eval results.** Run write-ups say
   the model was Claude (Anthropic). Exact model ids appear only in an eval result that
   actually ran them, as the run reports them. Naming a model elsewhere would imply it was
   tested or certified.

## Reviewer checklist

Before a public document ships, confirm each of these:

- [ ] Reserved fields are described as reserved, never as live.
- [ ] No affiliation or endorsement is implied.
- [ ] Every stated result points to a dated file in an experiment's `results/` folder; nothing
      unrun is presented as a finding; automated runs are labelled as automated.
- [ ] Every percentage or statistic has a source attached.
- [ ] No claim of a capability that only a later phase provides is written in the present
      tense.
- [ ] Learner examples use pseudonyms only; no real name, email or school appears.
- [ ] Token counts are labelled estimates.
- [ ] No specific model version is named outside an eval result that ran it.
