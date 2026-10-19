#!/usr/bin/env node
'use strict';
// 00-build-snapshot-v03.cjs -- run-2 fix for B09/B10/B12.
// Transforms the v0.2 snapshot into a v0.3 registry where EVERY objective node
// carries a STABLE opaque id (so the same canonical spot has the same id for
// every learner) and a slot for atlas state:
//   - id_v03 : opaque n_... derived deterministically from the legacy id
//              (sha256 -> Crockford base32, 26 chars). Reproducible, stable,
//              content-free -- not minted per learner (that was the run-1 bug:
//              each learner minted its own follow-up id, so "the same spot"
//              never shared an id and never clustered -- X04 card dead-end).
//   - status : "active" | "has_abandonments"   (B10)
//   - abandoned_count / lost_count : integers on the node record (B10)
//   - markers : [] attachment slot on the node (B09)
// Deterministic (hash, no randomness) -> reproduces byte-for-byte.
//   node 00-build-snapshot-v03.cjs <in-v02.json> <out-v03.json> <out-idmap.json>
const fs = require('fs');
const crypto = require('crypto');
const ALPHABET = '0123456789abcdefghjkmnpqrstvwxyz'; // Crockford lowercase

function opaqueOf(legacyId) {
  const h = crypto.createHash('sha256').update('metadax:v0.3:' + legacyId).digest();
  let s = 'n_';
  for (let i = 0; i < 26; i++) s += ALPHABET[h[i] % 32];
  return s;
}

const snap = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const idmap = {};          // legacy id -> opaque id (both objective and sub-node)
for (const n of snap.nodes) idmap[n.id] = opaqueOf(n.id);

// canonical registry node = the objective node a learner is "standing under".
// For a sub-node id like "L01.M01.O01/friction-as-a-force" the canonical root
// is the objective prefix "L01.M01.O01". Shapes resolve to the canonical root
// so co-located stalls share one node_id (B11/B12).
function canonicalRoot(legacyId) {
  if (typeof legacyId !== 'string') return null;
  const m = legacyId.match(/^(L\d\d\.M\d\d\.O\d\d)/);
  return m ? m[1] : null;
}

const nodes = snap.nodes.map((n) => ({
  schema: 'metadax.node/0.3-sim',
  id: idmap[n.id],
  legacy_id: n.id,
  parent_id: n.parent_id ? (idmap[n.parent_id] || opaqueOf(n.parent_id)) : null,
  module_id: n.module_id,
  kind: n.id.includes('/') ? 'followup' : 'objective',
  depth: n.depth,
  title: n.title,
  canonical_question: n.canonical_question,
  concepts: n.concepts || [],
  seeds: n.seeds || [],
  // --- B10: the registry can now represent "abandoned" without the logs ---
  status: 'active',
  abandoned_count: 0,
  lost_count: 0,
  // --- B09: a slot to hang markers/shape-refs off the node itself ---
  markers: [],
}));

const out = {
  schema: 'metadax.course-snapshot/0.3-sim',
  course_id: snap.course_id,
  built_at: 'runtime',
  node_count: nodes.length,
  concepts: snap.concepts,
  concept_count: snap.concept_count,
  seed_count: snap.seed_count,
  nodes,
  seeds: snap.seeds.map((s) => ({ node_id: idmap[s.node_id], legacy_node_id: s.node_id, seed: s.seed })),
};
fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 2) + '\n');

// id map also records the canonical root (opaque) for every legacy id, so the
// extractor can resolve any stall to its stable objective node id.
const fullMap = {};
for (const n of snap.nodes) {
  const root = canonicalRoot(n.id);
  fullMap[n.id] = { opaque: idmap[n.id], canonical_root: root ? opaqueOf(root) : idmap[n.id], canonical_root_legacy: root };
}
fs.writeFileSync(process.argv[4], JSON.stringify({ schema: 'x04.idmap/sim', map: fullMap, opaque: opaqueOf('__self_test__') ? undefined : undefined }, null, 2) + '\n');
process.stderr.write(`v0.3 snapshot: ${nodes.length} nodes (stable opaque ids) -> ${process.argv[3]}\n`);
