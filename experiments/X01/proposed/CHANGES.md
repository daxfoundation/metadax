Proposed by the runs of 18-19 Oct 2026; not merged into the canonical files.

# Proposed changes (X01, 2026-10-18) — the B18 fix

| File | New/changed | Why |
|---|---|---|
| `schemas/technique.schema.json` | **new** (`metadax.technique/0.1`) | The missing X01 primitive (B18): a teaching move captured content-free and language-independent. Fields: `id` (opaque `t_`+26 base32, matching v0.3 node ids), `stuck_signature` (canonical retrieval vocabulary, defined below), `chain_position`, a subject-noun-free `core` {intent, trigger, shape, guards}, `rendered_examples[]` (per language+subject, where all subject nouns live), and `provenance` (origin_language, status lifecycle, reuse_count, reused_in). |
| `schemas/tutor-turn.schema.json` | **changed** (0.2 → `metadax.tutor-turn/0.3`) | Adds the three fields B18 names: `stuck_signature`, `chain_position` (distinguishes a human `tutor` move from a model-played `model` hint — identical in 0.2), and `technique_ref` {technique_id, disposition minted|reused, reused_across_language, origin_language}. All 0.2 fields unchanged. |

## The canonical `stuck_signature` vocabulary (defined here)

A deliberately small, selective, subject- and language-independent set of learner-confusion
categories. It is the **retrieval key**: a technique is offered only when its exact signature
recurs — which guards against the over-triggering dead end. Extend by proposal, not ad hoc.

`cancellation-fallacy` · `attribute-to-wrong-owner` · `conflated-entities` ·
`magnitude-over-rule` · `reversed-relation` · `overgeneralized-rule` ·
`missing-intermediate-step` · `symbol-literalism` · `scale-insensitivity` · `boundary-neglect`

## Design decisions worth a reviewer's eye

- **`core` carries no subject nouns; `rendered_examples` carry all of them.** This is the
  load-bearing rule for transfer. In this run both cores survived re-rendering into new
  subjects and languages with 4/4 faithful translation.
- **`chain_position` is honestly `model` here**, because a model played the guide. The `tutor`
  value exists for real human moves; no human took part in this simulated run.
- **`intent` maxLength raised 300→400** after a real validation failure (caught by
  `validate.cjs`) on the multi-clause "separate accounts" core.
- **Not yet addressed:** `stuck_signature` is an exact-match enum, so near-miss signatures
  across languages still need human/semantic matching (ties to B20); and there is no schema
  field for code-switch register (see B53).
## Run 2 (2026-10-18) — control arm added; no schema changes

No schema changes this run. Run 2 added the missing Arm C (no-technique guide) and
re-ran Arm A to measure noise. Findings relevant to the proposed schema:

- **Schemas unchanged.** `technique.schema.json` v0.1 and `tutor-turn.schema.json` v0.3
  remain as proposed in run 1.
- **Run-to-run noise (B88):** at n=6, single-run means are unreliable; scoring
  rubrics should note that n≥18 per arm is needed before reading a directional result.
- **Discoverable-move finding (B89):** the captured move is independently
  rediscovered by a no-technique guide. Technique records are designed for portability
  across guides and contexts, not necessarily for speed lift on same-model reuse.
- **B52 closed:** technique-reuse (B 1.83) vs no-technique (C 1.67) gap = 0.16,
  within run-to-run noise. "Technique records speed learning" remains undemonstrated.
