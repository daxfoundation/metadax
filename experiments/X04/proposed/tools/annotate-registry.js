#!/usr/bin/env node
'use strict';
// 05-annotate-registry.cjs -- FIX B10/B09. Write the atlas back ONTO the node
// records: a node that saw stalls gets status="has_abandonments", an
// abandoned_count / lost_count, and a markers[] array (B09 attachment point).
// After this runs once from the logs, the registry itself carries the atlas --
// so step 06 can rebuild markers with NO access to the session logs.
// Usage: node 05-annotate-registry.cjs <snapshot.json> <holes.json> <markers.json> <out-registry.json>
const fs = require('fs');
const snap = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const holes = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')).holes;
const markers = JSON.parse(fs.readFileSync(process.argv[4], 'utf8')).markers;
const outPath = process.argv[5];

const byId = new Map(snap.nodes.map((n) => [n.id, n]));
for (const h of holes) {
  const n = byId.get(h.node_id);
  if (!n) continue;
  n.status = 'has_abandonments';
  n.abandoned_count += (h.kinds.abandon || 0);
  n.lost_count += (h.kinds.lost || 0);
}
for (const m of markers) {
  const n = byId.get(m.node_id);
  if (!n) continue;
  // B09: the marker hangs off the node by opaque id -- no side-file needed.
  n.markers.push({ marker_id: m.marker_id, at_depth: m.at_depth, signature_label: m.signature_label, text: m.text });
}
fs.writeFileSync(outPath, JSON.stringify(snap, null, 2) + '\n');
const touched = snap.nodes.filter((n) => n.status === 'has_abandonments').length;
process.stderr.write(`annotated registry: ${touched} nodes now carry abandoned status + markers -> ${outPath}\n`);
