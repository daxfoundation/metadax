Proposed by the runs of 18-19 Oct 2026; not merged into the canonical files.

# X02 run 2 — proposed changes

Each file below is new or a delta against the staged v0.3. Paths mirror the metadax
repo layout. These are *proposals* produced by a SIMULATED run (X02 run 2,
2026-10-18); they are not merged into the live schemas/tools.

## tools/merge.js (new) — fix for B19

A 3-way (N-way) registry merge over per-module files, with an **append-only** store
for hot modules: each writer appends to its own segment and a module's entries are the
**set-union** (G-set keyed by opaque id) over segments, so concurrent appends commute
and carry no write-conflict. The merge is **origin-preserving** (`created_by`
survives, `origin` map returned), **conflict-detecting** (same id + divergent
`content_sha256` is surfaced with `kept_both: true`, never overwritten),
**contested-aware** (nodes sharing a `contest_id` are kept side by side), and
**never drops** a contribution (`dropped` is always 0). Why: run 1 showed per-module
files are necessary but insufficient under Zipf-hot load (B19); append-only removes
the remaining serialization point. Evidence: conflicts/100 fell 80.8 → 13.6.

## tools/lifecycle.js (new) — fix for B21

The node lifecycle gains an `accepted` state between `pending_review` and `shared`,
with `review(node, reviewer, decision)` stamping `reviewed_by[]` and (on accept)
`accepted_by[]`. `propagatesCrossFork(node)` is the federation gate: **only
`accepted`/`shared` nodes cross a fork boundary** (replaces run 1's indexing of
`pending_review` as reusable, contract point 8). `markContested(a, b, contestId)`
tags two nodes with a shared `contest_id` so a merge keeps both. Why: run 1 propagated
841+ unreviewed nodes cross-fork and had no contested-core record (B21). Evidence:
unreviewed cross-fork propagation → 0; contested core kept, dropped 0.

## tools/inverted-index.js (new) — fix for B22

A stored inverted index over the federated union with two posting maps —
`by_content_hash` and `by_stuck_signature` — so candidate lookup is a map hit
(amortised O(1)) instead of the O(union) scan run 1 did per follow-up. Includes the
reference `unionScan` so the before/after cost is measurable. Why: B22. Evidence:
~155 → ~1.9 comparisons per follow-up; standalone 400 → 4, results identical to scan.

## tools/package.json (new)

Declares `"type": "commonjs"` for the proposed tools, mirroring the metadax
`tools/package.json`, so the `.js` modules load as CommonJS.

## schemas/node.schema.json (delta) — B21

- `visibility` enum gains `"accepted"`.
- New optional fields: `reviewed_by[]`, `accepted_by[]` (createdBy ids), `contested`
  (bool), `contested_with[]` (node ids), `contest_id` (string), `stuck_signature`
  (string, the cross-language retrieval key, also ties to B18/X01).
- `title` const bumped to `metadax.node/0.3-x02-proposed` to mark it unmerged.

## schemas/registry.schema.json (delta) — B19/B21/B22

- Entry `visibility` enum gains `"accepted"`.
- Entry gains optional `accepted_by[]`, `contested`, `contest_id`, `content_sha256`
  (so the inverted index can be built from the registry entry without opening each
  node file), and `stuck_signature`.

## schemas/registry-index.schema.json (delta) — B19/B22

- Module gains optional `storage` (`"file"` | `"append-log"`) and `segments[]` — a
  hot module declares append-log storage and lists its segment files; the module's
  nodes are the union over segments (the B19 fix, expressed in the index).
- New optional top-level `inverted_index` object pointing at the `by_content_hash`
  and `by_stuck_signature` posting maps (the B22 fix, expressed in the index).

## Not proposed here (deferred)

- **Semantic dedup layer** for B20. The probe shows exact hash catches 0/30 paraphrase
  and translation dups while a model judge catches 30/30. The *mechanism* (embedding
  similarity threshold vs model/teacher judge, and where it runs) is a cost/governance
  design, left to a follow-up — see new bottleneck B55.
