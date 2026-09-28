# MetaDAX experiments

MetaDAX is a set of experiments before it is a product. Each experiment asks one
question, measures one thing, and has a line at which it is killed. None of them produces
product; they exist to elucidate which features matter and where the zero-code approach
breaks.

The table below is the index. Each row links to a card in `experiments/E01/` through
`experiments/E14/`, expanded to a page with the full method, metrics, stop rule, owner,
effort, dependencies and status. **E01 and E03 have first results** (automated runs,
2026-09-27); E04 and E05 have harnesses built but no model run yet; the rest are not
started. Where a card mentions a number outside a results file, it is a target or a kill
line, not a measurement.

## How we run experiments

Each experiment card lives in `experiments/E<nn>/README.md`, and beside it is a
`results/` folder. Runs land in `results/` as dated markdown files (for example
`results/2026-10-05.md`), with personal data stripped. A result is recorded in `results/`
**only when it is produced by an actual run** -- never written from a plan, a guess, or an
expectation. The maintainers review the files in `results/` before any result is
summarised or repeated elsewhere. Until a run lands, the card's Status stays
"not started" and its Results section says "none yet".

The status vocabulary is defined in `experiments/README.md`: **not started, running, done,
abandoned**.

## The catalogue

| Id | Question | Method | Metrics | Stop rule (kill) | Status | Card |
|---|---|---|---|---|---|---|
| E01 | Can a non-technical adult create a course into a repo with the **Claude Code** client? (E01b: the same on **Claude Desktop**, and does the Desktop connector write files at all?) | Follow the walkthrough as written; up to 3 pilot adults | steps, minutes to first lesson, approval dialogs, HTTP errors, whether writes work, quality on Oak's rubric | first lesson over 15 minutes, or any pilot fails setup before the first saved course | done (first cut, 2026-09-27; automated runs with Claude) | [E01](../experiments/E01/README.md) |
| E02 | The same on ChatGPT (Plus with Codex cloud; Free with the commit packet) | Same walkthrough with the ChatGPT header | same, plus packet success rate | packet ingest lands cleanly under 90 percent | not started | [E02](../experiments/E02/README.md) |
| E03 | Parent-mediated learner session: read, three follow-up levels, quiz, save | One adult plays parent and child on one account; tutor state on a minified fenced line | JSON leaks into the child view, approval dialogs per session, tokens per turn, first rule-break turn, saves lost | rule break before turn 40, or a 20-minute session hits a plan limit | done (first cut, 2026-09-27; adult path; automated runs with Claude) | [E03](../experiments/E03/README.md) |
| E04 | Do the v0.2 prompts pass on both vendors? | promptfoo in the Foundation repo: six operations x ten fixtures x the model matrix | schema-valid rate, rubric score, per-model failures | any operation under 90 percent schema-valid on a primary model | not started | [E04](../experiments/E04/README.md) |
| E05 | Does the follow-up engine reuse correctly from a registry? | 50-node registry with 20 planted near-duplicates and 10 different-intent traps | precision and recall of reuse/extend/new decisions | precision under 0.8 or recall under 0.7 | not started | [E05](../experiments/E05/README.md) |
| E06 | Does the weekly git-bundle loop close at 50 kbps? | Simulate a week of output; `git bundle` with a basis; throttle; verify and unbundle | bytes, seconds, conflicts under the append-only layout | round trip over 300 s, or any textual conflict | not started | [E06](../experiments/E06/README.md) |
| E07 | Can the architect ground a unit on Oak via MCP with citations? | source_first design of a Year-5 science unit using Oak's MCP tools | share of objectives with a real source ref; fabricated citations | any fabricated citation | not started | [E07](../experiments/E07/README.md) |
| E08 | Tier-1 assets: what pass rate with oracle tests? | 20 specs (JSXGraph, p5) with closed-form oracle tests, Playwright harness | functional pass, physics-correct pass | physics-correct under 60 percent leaves the Tier-0/Tier-3-only default in place | not started | [E08](../experiments/E08/README.md) |
| E09 | Can MP-11 produce records a parent would file? | Synthetic 12-week learner repo; one provincial template; a homeschooling parent reviews | parent's verdict; missing artefacts | parent would not file it | not started | [E09](../experiments/E09/README.md) |
| E10 | Can a 2-4B on-device model run the quiz from a practice bank with GBNF? | Termux llama.cpp on a mid-range Android phone; 30 items | schema-valid rate, grading agreement, tok/s, battery | schema-valid under 95 percent even with grammar | not started | [E10](../experiments/E10/README.md) |
| E11 | Does a learner repo ingest into the companion's memory sensibly? | Feed a synthetic learner repo through a copied, isolated memory module (never the live product) | card coherence; missing fields | needs a schema change beyond the S-7 additions | not started | [E11](../experiments/E11/README.md) |
| E12 | Can provenance plus signed commits be verified later as a chain? | Build 20 nodes with signed commits and provenance; write a verifier | chain reconstructable; hash matches after canonicalisation | any field that cannot be reconstructed from the repo alone | not started | [E12](../experiments/E12/README.md) |
| E13 | Prompt Forge: can a method variant be generated and certified? | FORGE emits a Charlotte Mason content variant plus fixtures; run E04 on it | passes certification; a method-literate reviewer accepts it | fails certification twice after repair | not started | [E13](../experiments/E13/README.md) |
| E14 | Does the age wall bite in practice? (observe only) | During E01-E03, log any age-verification prompt or any drift of a child's name into files | any hit | any hit means the parent-mediated path needs a stricter guard, or waits for a later phase | not started | [E14](../experiments/E14/README.md) |

E01 and E03 first cuts ran on 2026-09-27 as automated runs with Claude (Anthropic): run 1 through the Claude Code client in this repository, run 2 in the Claude desktop app. In both, a model played the client (and in run 2 also a simulated adult learner); neither is a pilot with a human adult, so the human-facing metrics (minutes for a person, approval dialogs) are not yet measured.

## Sequencing

The plan: E04 first, because it gates everything; then E01, E02 and E03 over two weeks
with a real adult user; E05 through E08 as automated runs in parallel; E09 through E13
after. Roughly six weeks total. E14 runs continuously alongside E01-E03. Owners are
noted per card (U = a real adult user, M = an automated run by the maintainers, CI = this
repo's Actions). Sequencing here is a plan, not a record; the actual order is whatever the runs in
each `results/` folder show.
