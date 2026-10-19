# X08 — outward gate — run 2026-10-18

## Question

Can an organisation declare what stays inside its wall and have an ancestry-aware gate that lets selected content flow out while keeping everything else in? Does the gate hold against indirect citation and against paraphrase?

## What ran

- **Models:** sonnet (model-test subagent attempts only)
- **n:** 30 private nodes + 30 derived candidates (deterministic); 10 paraphrase-evasion nodes (DETERMINISTIC harness); 2 model subagent attempts (both refused)
- **Seeds:** deterministic (sha256 of string seeds; no randomness)
- **Sizes:** 30 private nodes (5 root objectives, 25 followups); 30 candidates (10 safe rewrites, 10 near-copies, 10 descendants quoting private facts); 10 paraphrase nodes

All results are **SIMULATED** (no real organisation, no real learners). The fictional company is "Example Freight Co. (fictional)"; the private course module is "meridian-protocol". All private terms, node content, and policy are invented for this test.

## Numbers

### Deterministic gate test (30 candidates)

| category | total | gate_decision=allow | gate_decision=block | leaks | wrongly_blocked |
|---|---|---|---|---|---|
| safe_rewrite | 10 | 10 | 0 | — | 0 |
| near_copy | 10 | 0 | 10 | 0 | — |
| quotes_private_fact | 10 | 0 | 10 | 0 | — |
| **totals** | **30** | **10** | **20** | **0** | **0** |

All 30 decisions explained: **yes**

### Paraphrase-evasion test (10 nodes, DETERMINISTIC)

Exact private terms avoided in all text fields. Nodes use synonyms, initials, and narrative.

| total | blocked | leaked |
|---|---|---|
| 10 | 0 | 10 |

All 10 decisions explained: yes (reason: "No private markers or ancestry found.")

### Model test (intended: 10 leak attempts by sonnet subagent)

| attempt | outcome |
|---|---|
| 1 — standard persona framing | REFUSED — model identified as DLP-bypass request |
| 2 — research reframe | REFUSED — model maintained refusal through academic framing |

Fallback: deterministic paraphrase nodes (above). Model-played result: **not obtained**.

## Verdict vs kill line

**Kill line:** "If any private content crosses the gate against the declaration — even once via an indirect citation — the gate is unsafe."

**Ancestry + term checks:** PASS — 0 leaks in the 30-candidate deterministic test; ancestry detection correctly blocked all 10 near-copies; term scanning correctly blocked all 10 quoting nodes.

**Paraphrase:** FAIL — 10/10 paraphrase-evasion nodes passed the gate. The exact-term check is the only content-scan layer; paraphrase of any private term is invisible to it.

**Overall verdict: FAIL.** The kill line requires zero private content to cross the gate, including via indirect means. Paraphrase is an indirect route, and 10/10 paraphrase-evasion nodes passed. What held: exact-term and ancestry checks blocked all 30 deterministic candidates (0 exact-term leaks); both model-based leak attempts were refused by model safety policy (2/2 refused). What broke: the exact-term content scan has no semantic layer, so paraphrase of every private term in the declaration passes unchecked (10/10 leaked). The gate is unsafe until a semantic or embedding-based check is added (see B68).

## What compounds

- The org-declaration schema (`proposed/schemas/org-declaration.schema.json`) gives organisations a machine-readable policy object. Any gate implementation consumes it; different orgs can have different walls without code changes.
- The ancestry-aware gate (`proposed/tools/outward-gate.js`) correctly walks the `parent_id` chain and blocks on private ancestor — this closes the dead-end identified in the X08 card ("an outward gate that inspects only the node being shared, not its ancestry").
- The `export_requires_review` flag provides a human backstop; even when all automated checks pass, a reviewer sees the node before it leaves the wall.

## Dead ends kept

- **Paraphrase catching via extended private_terms list:** expanding the terms list is not a viable strategy — a sufficiently motivated actor will always find a way around a fixed term list. Semantic similarity is the correct fix (see B68).
- **Model-played adversarial test:** two refusals show that using a standard guide persona to generate DLP-bypass content is blocked by model safety policy. This is not a bug in the gate; it is a bottleneck in the research methodology (see B70).

## Bottlenecks

- **B68 (new):** Exact-term content scan is blind to paraphrase. 0/10 paraphrase nodes blocked. Gate must add a semantic layer.
- **B69 (new):** Re-authoring is self-declared; verifiability is missing. `export_requires_review` is the current backstop.
- **B70 (new):** Model safety policy prevents generating adversarial DLP-evasion content for research gate validation. Red-team testing cannot use a standard sonnet persona.

## Reproduce

```sh
cd state/metadax/public-staging/experiments/X08/run-2026-10-18
node make-fixtures.js        # generates fixtures.json (30 private nodes + 30 candidates)
node run-gate.js             # deterministic gate test → gate-results.json
node make-leak-attempts.js   # 10 paraphrase nodes → leak-attempts.json
node run-leak-gate.js        # paraphrase gate test → leak-results.json
```
