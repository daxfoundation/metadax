# E01 — guide run 3 (2026-10-18)

**SIMULATED** — model-played guide (sonnet). Adult learner never present.

## Question

Can a guide following the Claude Code walkthrough and the teacher skill build a short
course into a local git repo end to end, with zero unrecovered tool errors and validate
OK after every node? (PASS counts only unrecovered errors; recovered errors are noted
but do not fail the run.)

## What ran

- Model: Claude (Anthropic), sonnet.
- Subject: "Probability for adults returning to maths".
- Size: short (2 lessons, 5 objectives).
- Course repo: /tmp/run (local git, no remote — stands in for the GitHub course repo).
- Operations: MP-02 ARCHITECT (design) × 1; MP-04 CONTENT (generate) × 5.
- validate.js called after every MP-04 node commit.
- Tools: assemble.js, stamp.js, validate.js, path.js from /tmp/metadax.
- Schemas: node/0.3 (v0.3 opaque ids + stored depth), course/0.2.
- Run 3 (regression after run 2: v0.3 ids, stamp + assemble fixes now in place).

## Numbers

| Metric | Value |
|---|---|
| Tool errors (non-zero exit) | 0 unrecovered; 1 recovered (stamp.js registry, see Notes) |
| Validation failures (validate.js) | 0 |
| validate calls | 6 (1 post-MP-02 + 5 post-MP-04) |
| All validate results | OK |
| Time to first node (L01.M01.O01 committed) | ~126 s |
| Time for full course | ~323 s |
| MP-02 stack | 13 503 bytes / ~3 375 tokens |
| MP-04 stacks | 14 600–15 341 bytes / ~3 650–3 835 tokens |
| Lessons | 2 (L01, L02) |
| Objectives | 5 (L01.M01: O01–O03; L02.M01: O01–O02) |
| Concepts | 5 (random-event, sample-space, classical-probability, expected-value, conditional-probability) |
| Node schema | metadax.node/0.3 ✓ |
| Commits | 7 (skeleton + MP-02 + 5 × MP-04) |

## Verdict

**PASS.** Zero unrecovered tool errors; validate.js OK after every node. Timing within
run-2 range (run 2: 15 min = 900 s for 21 objectives; run 3: 323 s for 5 objectives,
~65 s/objective vs ~43 s/objective in run 2 — consistent with shorter context stacks
and fewer objectives). v0.3 schema and IDs accepted by validate.js without error.

## What compounds

v0.3 ids and the stamp/assemble fixes from run 2 compound here: no id-length errors,
no reuse-stats crash, no --content flag miss. The guide run is the unblocked path.

## Dead ends kept

No dead ends. The one recovered error (stamp.js registry created after the file existed)
is the same class as B05 (file-creation order) and was fixed inline by the client.

## Bottlenecks

None new from E01 run 3. Existing B01 (depth cap) confirmed fixed by v0.3.

## Reproduce commands

```sh
cd /tmp/metadax
node tools/assemble.js --op MP-02 --course /tmp/run \
  --input "Probability for adults returning to maths" \
  --config mode=design --config size=short --config output_mode=json \
  --config language=en --config clarify_round=1 \
  --config client=claude-code --config write_mode=git \
  --prompts prompts --out /tmp/e01-workspace/stack-1.txt
# (guide reads stack-1.txt, writes out-1.json)
node tools/stamp.js course /tmp/run/course.json
node tools/validate.js course /tmp/run --schemas schemas
git -C /tmp/run add . && git -C /tmp/run commit -m "metadax: MP-02 probability-adults"

# For each objective OID in L01.M01.O01 L01.M01.O02 L01.M01.O03 L02.M01.O01 L02.M01.O02:
node tools/assemble.js --op MP-04 --course /tmp/run --node OID \
  --config mode=generate --config output_mode=json --config math_mode=plain \
  --config author_id=guide-e01 --config client=claude-code --config write_mode=git \
  --prompts prompts --out /tmp/e01-workspace/stack-N.txt
# (guide reads stack-N.txt, writes out-N.json)
node tools/stamp.js node /tmp/run/nodes/OID/node.json --by guide-e01 --role author
node tools/stamp.js registry /tmp/run --module MODULE_ID
node tools/validate.js course /tmp/run --schemas schemas
git -C /tmp/run add . && git -C /tmp/run commit -m "metadax: MP-04 OID"
```

## Notes

One recovered tool error: `stamp.js registry` expects the module registry file to already
exist; it was not created on the first call. The guide wrote the file, then re-ran stamp.
This pattern needs documenting in the walkthrough (see proposed/CHANGES.md).

## Comparison vs run 2

| Metric | Run 2 (2026-09-27) | Run 3 (2026-10-18) |
|---|---|---|
| Subject | Newton's laws | Probability for adults |
| Objectives | 21 | 5 |
| Tool errors | 1 (stamp.js reuse, F-L2) | 0 unrecovered |
| Validate failures | 0 | 0 |
| Node schema | 0.2 | 0.3 ✓ |
| Opaque follow-up ids | n/a (no follow-ups in E01) | n/a |
| First node | ~8 min | ~2.1 min |
| Total course | ~15 min | ~5.4 min |

Run 2 stamp.js reuse bug (F-L2) fixed; not triggered in run 3 (E01 is an author run with no reuse).
