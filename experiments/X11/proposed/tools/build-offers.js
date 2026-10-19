#!/usr/bin/env node
'use strict';
// 04-build-offers.cjs -- run-2. Build negative-space offers. FIX B16: NEUTRAL
// wording only -- no scarcity ("few have followed"), no novelty ("no one has
// opened yet"). The offer states the fact (the course leaves this open) and a
// symmetric choice, nothing comparative. A frozen BANNED list is asserted
// against every generated string so steering framing cannot ship by accident.
// Usage: node 04-build-offers.cjs <negative-space.json> <snapshot.json> <out.json>
const fs = require('fs');
const neg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const snap = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const outPath = process.argv[4];

// frame words we refuse to ship (scarcity / novelty / evaluative pressure)
const BANNED = [/few have/i, /no one has/i, /only a handful/i, /be one of the/i,
  /rare/i, /exclusive/i, /don'?t miss/i, /last chance/i, /everyone else/i, /popular/i];

const offers = [];
for (const c of neg.concepts_unreached) {
  const node = snap.nodes.find((n) => (n.concepts || []).includes(c));
  offers.push({
    offer_id: `of-c-${c}`, kind: 'unreached_concept', concept: c,
    node_id: node ? node.id : null,
    text: `The course also covers "${c}"${node ? ` (e.g. "${node.title}")` : ''}. You're welcome to open it, or leave it for another time — your call.`,
  });
}
neg.unfollowed_seed_sample.slice(0, 6).forEach((s, i) => {
  offers.push({
    offer_id: `of-s-${String(i + 1).padStart(2, '0')}`, kind: 'open_question',
    from_node: s.node_id, seed: s.seed,
    text: `A question the course leaves open: "${s.seed}". Open it if it draws you, or skip it — no wrong choice.`,
  });
});

for (const o of offers) {
  for (const re of BANNED) {
    if (re.test(o.text)) { process.stderr.write(`REFUSED to ship steering wording in ${o.offer_id}: ${re}\n`); process.exit(3); }
  }
}
fs.writeFileSync(outPath, JSON.stringify({ schema: 'x11.offers/0.3-sim', wording: 'neutral (B16): no scarcity/novelty; banned-phrase gate passed', offer_count: offers.length, offers }, null, 2) + '\n');
process.stderr.write(`built ${offers.length} neutral offers (banned-phrase gate passed) -> ${outPath}\n`);
