#!/usr/bin/env node
'use strict';
// 04-build-markers.cjs -- run-2. Build one atlas marker per hole. FIX B12: the
// marker resolves to (and carries) the exact opaque node_id of the spot, so it
// pins to the node a learner is standing on -- not an approximate
// (module,concept,depth). Wording stays a note, never a detour.
// Usage: node 04-build-markers.cjs <holes.json> <out-markers.json>
const fs = require('fs');
const holes = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).holes;
const outPath = process.argv[3];
const SIG_NOTE = {
  answer_too_abstract: 'some learners found the explanation here climbed to an abstract level quickly',
  prerequisite_gap: 'some learners found this branch assumes an earlier idea',
  patience_exhausted: 'some learners ran out of steam around here',
  lost_the_thread: 'some learners lost sight of the objective around here',
  depth_without_payoff: 'some learners went a long way down here before it paid off',
  ambiguous_next: 'some learners were unsure what to ask next here',
  other: 'some learners paused here',
};
const markers = holes.map((h, i) => ({
  marker_id: `mk-${String(i + 1).padStart(2, '0')}`,
  node_id: h.node_id,                     // B12: exact opaque spot
  module_id: h.module_id,
  concept: (h.concepts || [])[0] || null,
  at_depth: h.depth,
  signature_label: h.signature_label,
  seen_by_sessions: h.distinct_sessions,
  text: `Heads-up: ${SIG_NOTE[h.signature_label] || SIG_NOTE.other} (around "${(h.concepts || [])[0] || 'this idea'}"). There's a plainer way through if you'd like it — and you can keep going exactly as you are. This is a note, not a detour.`,
}));
fs.writeFileSync(outPath, JSON.stringify({ schema: 'x04x11.markers/0.3-sim', source: 'log-built', marker_count: markers.length, markers }, null, 2) + '\n');
process.stderr.write(`built ${markers.length} markers (each pinned to an opaque node_id) -> ${outPath}\n`);
