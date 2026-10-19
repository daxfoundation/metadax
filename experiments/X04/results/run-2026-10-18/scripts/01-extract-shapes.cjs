#!/usr/bin/env node
'use strict';
// 01-extract-shapes.cjs -- run-2. Extract the content-free SHAPE of every
// stall. FIX B12: a shape now resolves to the STABLE opaque objective node id
// (the canonical spot), carried on the learner's stall record, not a per-learner
// minted id. FIX B11: the stuck_signature is validated against a small canonical
// vocabulary (SIG_VOCAB); anything outside it is coerced to "other" rather than
// forking a new hole. A shape carries NO content: node_id, depth, signature,
// concept-set only. Consent-gated: a stall without consent.share_abandoned_shape
// yields NO shape (and is counted as withheld, for the B15 k-anon sketch).
// Deterministic. Usage: node 01-extract-shapes.cjs <sessions-dir> <out.json>
const fs = require('fs');
const path = require('path');

const SIG_VOCAB = new Set([
  'answer_too_abstract', 'prerequisite_gap', 'patience_exhausted',
  'lost_the_thread', 'depth_without_payoff', 'ambiguous_next',
]);

const sessionsDir = process.argv[2];
const outPath = process.argv[3];

const shapes = [];
let withheld = 0;
for (const sid of fs.readdirSync(sessionsDir).sort()) {
  const sf = path.join(sessionsDir, sid, 'session.json');
  if (!fs.existsSync(sf)) continue;
  const s = JSON.parse(fs.readFileSync(sf, 'utf8'));
  const consent = s.consent && s.consent.share_abandoned_shape === true;
  for (const st of (s.stalls || [])) {
    if (!consent) { withheld += 1; continue; }
    shapes.push({
      session_id: s.session_id,
      node_id: st.node_id,                                   // STABLE opaque objective id (B12)
      depth: typeof st.depth === 'number' ? st.depth : null,
      kind: st.kind === 'abandon' ? 'abandon' : 'lost',
      stuck_signature: SIG_VOCAB.has(st.stuck_signature) ? st.stuck_signature : 'other', // B11 vocab
      concept_set: Array.isArray(st.concepts) ? st.concepts.slice().sort() : [],
    });
  }
}
fs.writeFileSync(outPath, JSON.stringify({
  schema: 'x04.shapes/0.3-sim', count: shapes.length, shapes_withheld_no_consent: withheld, shapes,
}, null, 2) + '\n');
process.stderr.write(`extracted ${shapes.length} shapes (${withheld} withheld, no consent) -> ${outPath}\n`);
