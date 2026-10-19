#!/usr/bin/env node
'use strict';
// 07-kanon.cjs -- SKETCH for B15. Consent-gating blinds the atlas where privacy
// matters most. The alternative sketched here is a k-ANONYMITY aggregate (k=5):
// publish a hole only when at least k DISTINCT sessions contributed to it, so no
// individual's stall can be singled out. Below k the cell is SUPPRESSED (shown
// as "<k"), never dropped silently -- the count of suppressed holes is reported
// so the blind spot is visible. This lets hole PATTERNS surface at aggregate
// scale without needing each stuck learner's per-shape consent.
// Usage: node 07-kanon.cjs <holes.json> <out.json> [k]
const fs = require('fs');
const holes = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).holes;
const outPath = process.argv[3];
const K = parseInt(process.argv[4] || '5', 10);

const published = [];
let suppressed = 0;
for (const h of holes) {
  if (h.distinct_sessions >= K) {
    published.push({ node_id: h.node_id, module_id: h.module_id, depth: h.depth, signature_label: h.signature_label, distinct_sessions: h.distinct_sessions });
  } else { suppressed += 1; }
}
fs.writeFileSync(outPath, JSON.stringify({
  schema: 'x04.kanon-aggregate/sim', k: K,
  holes_total: holes.length, holes_published: published.length, holes_suppressed_below_k: suppressed,
  published,
  note: `k=${K}: a hole is published only if >= ${K} distinct sessions contributed; ${suppressed} holes suppressed (reported, never silently dropped). At this cohort size (n<=12) the k-anon view is almost entirely suppressed -- the aggregate only becomes useful at population scale. This is the sketch, not a deployable DP mechanism.`,
}, null, 2) + '\n');
process.stderr.write(`k-anon (k=${K}): ${published.length} published, ${suppressed} suppressed -> ${outPath}\n`);
