Proposed by the runs of 18-19 Oct 2026; not merged into the canonical files.

# X04 proposed changes — 2026-10-18 (run 2)

All changes fix bottlenecks raised by X04/X11 simulation 1. SIMULATED run;
proposals are deterministic data-model + tool changes, not learning claims.

| File | New/changed | Why (bottleneck) |
|---|---|---|
| `schemas/node.schema.additions.json` | changed (adds 4 keys to `node.schema.json`) | **B09** `markers[]` attaches markers to the node by opaque id; **B10** `status`/`abandoned_count`/`lost_count` let the registry represent "abandoned" without replaying logs. |
| `schemas/marker.schema.json` | new | **B09/B12** a marker carries the exact opaque `node_id` (pins to the node, not an approximate `(module,concept,depth)`); **B11** signature is a `signature_label` only. |
| `schemas/dead-end-shape.schema.json` | new | **X04/B12** the content-free shape resolves to a stable opaque objective `node_id`; **B11** `stuck_signature` is a closed canonical vocabulary (out-of-vocab → `other`). |
| `tools/extract-shapes.js` | new (ref impl) | Extracts shapes to the opaque spot; consent-gated; counts withheld shapes for the B15 k-anon sketch. |
| `tools/cluster-holes.js` | new (ref impl) | **B11** cluster key is `(node_id, depth)`; the signature becomes a modal label + distribution, so one physical spot = one hole. |

## Design notes

- **Stable opaque ids (B12 root cause).** In run 1 each learner minted its own
  follow-up id, so "the same spot" never shared an id and never clustered — the
  X04 card's own dead-end. Here every canonical objective node has a stable
  opaque id derived deterministically from its identity; a stall resolves to
  that id. Co-located stalls now share one `node_id`.
- **Log-independence (B10).** `tools/annotate-registry` writes the atlas onto the
  node records; `tools/rebuild-from-registry` reproduces the markers from the
  registry **alone** (verified byte-identical to the log-built set). The atlas no
  longer has to be rebuilt from session logs.
- The reference tools are the committed `run-2026-10-18/scripts/*.cjs`.
