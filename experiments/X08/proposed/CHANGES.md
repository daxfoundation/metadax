Proposed by the runs of 18-19 Oct 2026; not merged into the canonical files.

# proposed/CHANGES.md — X08 outward-gate experiment

## Files

### schemas/org-declaration.schema.json (new)

**What:** JSON Schema for an organisational declaration — the document that specifies what stays inside the org's wall and what may leave via the outward gate.

**Why:** The X08 card identified this as missing. Without a machine-readable declaration, any gate logic must hard-code policy, making it impossible for different organisations to operate different walls using the same system.

**Key fields:**
- `private_module_ids` — entire modules that cannot cross the gate
- `private_node_ids` — individual nodes named as private
- `private_terms` — exact substrings; any node containing one is blocked
- `export_requires_review` — human review step before any export, even when the gate allows
- `reviewers` — creator IDs authorised to approve exports

### tools/outward-gate.js (new)

**What:** Node.js module implementing the ancestry-aware outward gate.

**Why:** The X08 card identified this as missing. Per the card's dead-ends section, a gate that inspects only the node being shared — not its ancestry — is insufficient: a public node with a private parent leaks the parent via citation chains.

**Gate logic (5 checks, in order):**
1. Node's own `visibility === 'private'` → block
2. Node's `module_id` in `org_declaration.private_module_ids` → block
3. Node's `id` in `org_declaration.private_node_ids` → block
4. Any ancestor in the `parent_id` chain satisfies 1–3 → block (ancestry check)
5. Any `private_terms` entry appears in node text fields → block (content scan)

Passes → `allow`, with `review_required: true` if `export_requires_review` is set.

**Limitation identified by X08 run:** Check 5 is exact-substring only. Paraphrase of private terms is not caught. See bottleneck B68.
## Run 2 — 2026-10-18

### tools/paraphrase-gate.js (new)

**What:** Node.js module extending `outward-gate.js` with three additional content-scan layers: (1) a synonym/paraphrase table built from the protected source, (2) private-number word-boundary matching (87, 4.2), (3) an optional LLM judge subagent as a second line.

**Why:** Addresses B68: the exact-term scan was blind to paraphrase. 10/10 paraphrase-evasion nodes passed the run-1 gate. Run-2 lexical gate blocks 20/20 paraphrases with 0 false positives on 40 clean candidates.

**Three gate variants shipped:**
- `lexicalGate(node, registry, orgDecl)` — synonym + number check, no API calls
- `judgeGate(node, orgDecl, apiKey)` — baseline + LLM judge via Anthropic API
- `lexicalThenJudgeGate(node, registry, orgDecl, apiKey)` — lexical pre-filters; judge called only for lexical-allowed candidates (reduces calls from 40 to 20 on this test set)

**Synonym table coverage:** 6 private-term groups, 40+ synonym phrases, private-number patterns. Catches initials (V.I., M.P.), numeric-text forms (eighty-seven, mid-eighties, 87th percentile), and functional descriptions (proprietary compliance system, summit review programme, data control specification).

**Limitation (B92):** Synonym table requires manual curation. Novel paraphrase strategies not yet observed evade lexical until a human adds them. The judge gate covers unseen strategies at O(n) call cost.
