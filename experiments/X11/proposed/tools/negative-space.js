#!/usr/bin/env node
'use strict';
// 03-negative-space.cjs -- run-2. Compute negative space (concepts/seeds never
// entered) AND, crucially, FIX B14: track EXPOSURE. The raw "unfollowed share"
// is meaningless because a seed counts unfollowed even if no one ever saw it.
// This run splits the inventory three ways:
//   followed  : a learner pulled it
//   declined  : it was OFFERED to a learner and they said no   (the real signal)
//   unseen    : never surfaced to anyone                       (not a choice)
// and reports the EXPOSURE-NORMALISED decline rate = declined / (followed + declined),
// i.e. of the seeds learners actually saw, what share did they pass on.
// Exposure comes from the wave-2 offer log (offers_shown with a response).
// Usage: node 03-negative-space.cjs <snapshot.json> <sessions-dir> <out.json>
const fs = require('fs');
const path = require('path');
const snap = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const sessionsDir = process.argv[3];
const outPath = process.argv[4];
function norm(s) { return String(s).toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9 ?]/g, '').trim(); }

const reachedConcepts = new Set();
const followedSeeds = new Set();
const offeredSeeds = new Map();   // norm -> {offered, declined, taken}
const offeredConcepts = new Map();

for (const sid of fs.readdirSync(sessionsDir).sort()) {
  const sf = path.join(sessionsDir, sid, 'session.json');
  if (!fs.existsSync(sf)) continue;
  const s = JSON.parse(fs.readFileSync(sf, 'utf8'));
  for (const c of (s.concepts_touched || [])) reachedConcepts.add(c);
  for (const t of (s.followed_seeds || [])) followedSeeds.add(norm(t));
  for (const o of (s.offer_responses || [])) {
    if (o.seed) {
      const k = norm(o.seed);
      const r = offeredSeeds.get(k) || { offered: 0, declined: 0, taken: 0 };
      r.offered += 1; if (o.response === 'took_up') { r.taken += 1; followedSeeds.add(k); } else { r.declined += 1; }
      offeredSeeds.set(k, r);
    }
    if (o.concept) {
      const r = offeredConcepts.get(o.concept) || { offered: 0, declined: 0, taken: 0 };
      r.offered += 1; if (o.response === 'took_up') { r.taken += 1; reachedConcepts.add(o.concept); } else { r.declined += 1; }
      offeredConcepts.set(o.concept, r);
    }
  }
}

const unreachedConcepts = snap.concepts.filter((c) => !reachedConcepts.has(c));
const seen = new Set(); const allSeeds = [];
for (const s of snap.seeds) { const n = norm(s.seed); if (seen.has(n)) continue; seen.add(n); allSeeds.push({ node_id: s.node_id, seed: s.seed, norm: n }); }

let followed = 0, declined = 0, unseen = 0;
for (const s of allSeeds) {
  const off = offeredSeeds.get(s.norm);
  if (followedSeeds.has(s.norm)) followed += 1;
  else if (off && off.declined > 0) declined += 1;
  else unseen += 1;
}
const exposed = followed + declined;
const out = {
  schema: 'x11.negative-space/0.3-sim',
  concepts_total: snap.concepts.length,
  concepts_unreached: unreachedConcepts,
  seeds_total_distinct: allSeeds.length,
  // --- run-1 metric, kept for comparison, flagged as exposure-blind (B14) ---
  raw_unfollowed_share: +(((allSeeds.length - followed) / allSeeds.length)).toFixed(3),
  // --- B14 fix: exposure-split ---
  exposure: { followed, declined, unseen },
  exposure_normalised_decline_rate: exposed ? +(declined / exposed).toFixed(3) : null,
  note: 'raw_unfollowed_share is dominated by `unseen` (never offered); the exposure_normalised_decline_rate is the only choice-bearing figure.',
  unfollowed_seed_sample: allSeeds.filter((s) => !followedSeeds.has(s.norm)).slice(0, 12).map((s) => ({ node_id: s.node_id, seed: s.seed })),
};
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
process.stderr.write(`negative space: raw unfollowed ${out.raw_unfollowed_share}, exposure-normalised decline ${out.exposure_normalised_decline_rate} (followed ${followed}/declined ${declined}/unseen ${unseen}) -> ${outPath}\n`);
