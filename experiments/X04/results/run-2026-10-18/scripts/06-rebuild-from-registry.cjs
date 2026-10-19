#!/usr/bin/env node
'use strict';
// 06-rebuild-from-registry.cjs -- PROOF for B10. Rebuild the atlas (nodes with
// abandonments + their markers) reading ONLY the annotated registry -- no
// sessions dir, no event logs. In run 1 the atlas had to be reconstructed from
// the logs every time (B10); here the registry carries it. The output is
// compared byte-for-byte against the log-built markers (see run.sh diff).
// Usage: node 06-rebuild-from-registry.cjs <annotated-registry.json> <out-markers.json>
const fs = require('fs');
const reg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const outPath = process.argv[3];

const markers = [];
for (const n of reg.nodes) {
  if (n.status !== 'has_abandonments') continue;      // read straight off the node record
  for (const m of n.markers) {
    markers.push({ marker_id: m.marker_id, node_id: n.id, module_id: n.module_id, concept: (n.concepts || [])[0] || null, at_depth: m.at_depth, signature_label: m.signature_label, text: m.text });
  }
}
markers.sort((a, b) => a.marker_id.localeCompare(b.marker_id));
fs.writeFileSync(outPath, JSON.stringify({ schema: 'x04x11.markers/0.3-sim', source: 'registry-only (no logs)', marker_count: markers.length, markers }, null, 2) + '\n');
process.stderr.write(`rebuilt ${markers.length} markers from the registry ALONE (no logs) -> ${outPath}\n`);
