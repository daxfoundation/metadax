# E09 — What records would a homeschooling parent actually file?

**Date:** 2026-10-18  
**Status:** SIMULATED — no real people took part. All six parents are simulated personas played by claude-sonnet-4-6 subagents. Results are labelled accordingly.

---

## Question

Can the record format (one JSON entry per session) cover what a homeschooling parent would actually write — across different parenting styles, a second language, and a learner who leads their own sessions — and does the privacy filter catch what an over-sharing parent would include?

---

## What ran

- **Model:** claude-sonnet-4-6 (all six parent subagents, one fresh subagent per persona)
- **Package shown:** HS-RDG7 "Sounds That Stick" (Reading, ages 7–9) — 3 sessions, 2026-10-13 / 10-15 / 10-17
- **Session summaries** provided to each parent: game name, answered/right counts, level reached, game-recorded behaviours
- **Schema and validator** from `github.com/daxfoundation/metadax-learner-record` (cloned read-only)
- **n = 6 parent personas, 21 entries total**; validator run on all 21

---

## Numbers

| parent | entries | validator pass | privacy errors | wrong key in mistakes |
|--------|---------|---------------|---------------|----------------------|
| Maëlle (two kids) | 6 | ✓ | 0 | 0 |
| Léa (teen-led) | 3 | ✓ | 0 | 0 |
| Yuna (little time) | 3 | ✓ | 0 | 3 (behaviour≠name) |
| François (detailed) | 3 | ✓ | 0 | 3 (behaviour≠name) |
| Simone (French) | 3 | ✓ | 0 | 3 (behavior≠name) |
| Étienne (over-sharer) | 3 | ✗ | 14 | 0 |
| **Total** | **21** | **18/21 (86%)** | **14** | **9 entries** |

### Privacy catches by type (Étienne only, 3 entries)

| type | count | entries |
|------|-------|---------|
| diagnosis word (dyslexia, ADHD) | 4 | s1 learner_words, s1/s2/s3 guide_note |
| email address | 3 | s1/s2/s3 guide_note |
| @handle | 4 | s1/s2/s3 guide_note, s3 learner_words |
| link in prose | 3 | s1/s2/s3 guide_note |
| **total** | **14** | |

One miss: "neurotypical" in s1 guide_note is not in the DIAGNOSIS blocklist. Comparative neurotypicality framing implies a condition without naming one.

### Fields parents wanted that the schema lacks

| field | who wanted it | typical phrasing |
|-------|--------------|-----------------|
| session duration / pace | Yuna, Maëlle, Étienne | "keeping sessions to 20 minutes", "before making tea" |
| next-session plan | François (all 3 entries) | "for Friday I will…", "I plan to introduce…" |
| cross-session observation | François | "looking across the week as a whole…" |
| learner mood / energy | Léa, Maëlle, Étienne | "seemed tired", "great mood", "getting dysregulated" |
| jurisdiction / curriculum mapping | Simone | "Lou est prête pour la prochaine unité" — but no field to link to a curriculum area |
| multi-child context | Maëlle | "both kids at the table" — no field to relate two learners' entries |

### Effort words used (across all 21 entries)

Observed: *coaxing · pushed through · needed more breaks · no encouragement · quickly · got through it · went fine · genuinely pleased · working SO hard · settled focused · genuine engagement rather than compliance · consolidating · good improvement · best result of the week · prête pour la prochaine unité*

Cluster: effort words fall into three types — **pace** ("quickly", "before making tea"), **persistence** ("pushed through", "coaxing"), and **quality of engagement** ("genuine engagement", "settled focused"). The schema has no field for any of these; they appear only in free text.

---

## Verdict against the E09 kill line

The E09 kill line: **Kill if the parent would not file it.**

**PASS** — five of six simulated parents produced entries they would file as-is. Even Yuna's two-sentence notes constitute a valid, filed record. Étienne's entries cannot be filed as-is (14 privacy errors); that is the privacy filter working correctly.

Note: the 18/21 validator pass includes 9 wrong-key entries (Yuna, François, Simone). These three parents used `behaviour`/`behavior` instead of `name` as the mistakes key. The validator passes them because it does not enforce `additionalProperties`. They are structurally defective.

Caveats:
1. Three parent personas (Yuna, François, Simone) used `behaviour`/`behavior` as the mistakes key instead of `name`. The validator did not catch this (`additionalProperties` is in the JSON schema but not enforced by `validate-record.mjs`). These entries are structurally defective but would appear to pass.
2. Léa set `age_band` to the package's target ("7-9") rather than the learner's actual age ("13-15"). The schema does not distinguish between package target age and learner age — both live in `package.age_band`.
3. The schema has no field for session duration, next-session plan, or jurisdiction. Detailed parents wrote these in `guide_note` (correct) but a structured field would help with downstream reporting.

---

## What compounds

- Privacy filter works as designed; "neurotypical" framing is a gap worth closing.
- The schema's free-text fields are large enough to absorb every parent style, including long French notes and two-sentence notes.
- Multi-child support requires either per-entry learner disambiguation (e.g. a `learner_tag` field) or separate entry sets per child — which is what Maëlle's 6 entries do correctly.
- Teen-led use case surfaces an ambiguity in `package.age_band` (package target vs. learner age). Either rename the field or add a separate `learner_age_band`.

---

## Dead ends kept

- Tried to run all 6 parent agents in a single parallel batch; the run environment's concurrency limit produced only 2 results at first. The remaining 4 were run in separate passes. Transcripts are committed.
- The validator does not enforce `additionalProperties: false` from the JSON schema, so `behaviour`/`behavior` key errors silently pass. This is not fixable by the parent; it is a validator gap.

---

## Bottlenecks

See `bottlenecks-2026-10-18.md` for new rows.

---

## Reproduce

```sh
# Clone read-only sources (never push)
git clone --depth 1 https://github.com/daxfoundation/metadax /tmp/metadax
git clone --depth 1 https://github.com/daxfoundation/metadax-learner-record /tmp/metadax-learner-record

# The simulation script documents what ran; re-running requires Claude subagents
node experiments/E09/results/run-2026-10-18/simulate-parents.js

# Validate committed entries against the official validator
node /tmp/metadax-learner-record/tools/validate-record.mjs \
  experiments/E09/results/run-2026-10-18/records/*.json
```
