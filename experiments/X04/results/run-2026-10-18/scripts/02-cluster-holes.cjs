#!/usr/bin/env node
'use strict';
// 02-cluster-holes.cjs -- run-2. FIX B11: the cluster key is (node_id, depth) --
// the physical spot -- NOT (concept + signature). So every stall at the same
// canonical node and depth lands in ONE hole; the stuck signatures become a
// LABEL on the hole (a distribution), never a key that splits it. The hole's
// headline signature is the modal one (ties broken by the canonical vocab
// order, deterministically). This is the fix for mass@L02.M01 fragmenting into
// three holes in run 1.
// Usage: node 02-cluster-holes.cjs <shapes.json> <snapshot.json> <out.json>
const fs = require('fs');
const SIG_ORDER = ['answer_too_abstract', 'prerequisite_gap', 'patience_exhausted',
  'lost_the_thread', 'depth_without_payoff', 'ambiguous_next', 'other'];
const HINT = {
  answer_too_abstract: 'a plainer intermediate step before the abstract explanation',
  prerequisite_gap: 'a short prerequisite recap the branch assumes',
  patience_exhausted: 'a shorter path or an earlier payoff',
  lost_the_thread: 'a breadcrumb back to the objective statement',
  depth_without_payoff: 'a zoom-out that reconnects the branch to the objective',
  ambiguous_next: 'clearer next-step seeds',
  other: 'a re-teaching aid',
};
const shapes = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).shapes;
const snap = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const nodeById = new Map(snap.nodes.map((n) => [n.id, n]));
const outPath = process.argv[4];

const byKey = new Map();
for (const s of shapes) {
  const key = `${s.node_id}@${s.depth}`;                    // (node_id, depth) -- B11
  if (!byKey.has(key)) byKey.set(key, { node_id: s.node_id, depth: s.depth, sessions: new Set(), hits: 0, sigs: {}, kinds: { lost: 0, abandon: 0 } });
  const h = byKey.get(key);
  h.sessions.add(s.session_id); h.hits += 1;
  h.sigs[s.stuck_signature] = (h.sigs[s.stuck_signature] || 0) + 1;
  if (h.kinds[s.kind] != null) h.kinds[s.kind] += 1;
}

function modalSig(sigs) {
  let best = null, bestN = -1;
  for (const sig of SIG_ORDER) {                            // deterministic tie-break
    const n = sigs[sig] || 0;
    if (n > bestN) { best = sig; bestN = n; }
  }
  return best;
}

const holes = Array.from(byKey.values()).map((h) => {
  const node = nodeById.get(h.node_id);
  const sig = modalSig(h.sigs);
  return {
    node_id: h.node_id,
    node_legacy: node ? node.legacy_id : null,
    module_id: node ? node.module_id : null,
    concepts: node ? node.concepts : [],
    depth: h.depth,
    distinct_sessions: h.sessions.size,
    hits: h.hits,
    kinds: h.kinds,
    signature_label: sig,                                   // LABEL only (B11)
    signature_distribution: h.sigs,
    proposed_reteach_spot: node
      ? `Add a bridge at ${node.legacy_id} ("${node.title}") depth ~${h.depth}: ${HINT[sig]}`
      : null,
  };
}).sort((a, b) => b.distinct_sessions - a.distinct_sessions || b.hits - a.hits || String(a.node_id).localeCompare(b.node_id));

fs.writeFileSync(outPath, JSON.stringify({ schema: 'x04.holes/0.3-sim', count: holes.length, cluster_key: '(node_id, depth)', holes }, null, 2) + '\n');
process.stderr.write(`clustered ${shapes.length} shapes into ${holes.length} holes (key = node_id,depth) -> ${outPath}\n`);
