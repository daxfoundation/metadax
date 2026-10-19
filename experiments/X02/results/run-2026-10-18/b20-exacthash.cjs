#!/usr/bin/env node
// B20 probe — deterministic half. Runs the exact content-hash dedup (what the
// federated index does today) over the 40 pairs and scores it against ground
// truth. The model judge half is a separate sonnet subagent; its verdicts are
// merged in by the writeup. SIMULATED.
'use strict';
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function normalize(s) { return s.trim().toLowerCase().replace(/[\s¿?¡!.,;:]+/g, ' ').trim(); }
function hash(s) { return crypto.createHash('sha256').update(normalize(s)).digest('hex'); }

const { pairs } = JSON.parse(fs.readFileSync(path.join(__dirname, 'b20-pairs.json'), 'utf8'));
let tp = 0, tn = 0, fp = 0, fn = 0;
const rows = [];
for (const p of pairs) {
  const call = hash(p.a) === hash(p.b) ? 'same' : 'different';
  const correct = call === p.truth;
  if (p.truth === 'same' && call === 'same') tp++;
  if (p.truth === 'different' && call === 'different') tn++;
  if (p.truth === 'different' && call === 'same') fp++;
  if (p.truth === 'same' && call === 'different') fn++;
  rows.push({ id: p.id, truth: p.truth, kind: p.kind, exact_hash: call, correct });
}
const nSame = pairs.filter(p => p.truth === 'same').length;
const nDiff = pairs.filter(p => p.truth === 'different').length;
const out = {
  method: 'exact content-hash (sha256 of normalized text)',
  n: pairs.length, n_same: nSame, n_different: nDiff,
  caught_same: tp, missed_same: fn, correct_different: tn, false_same: fp,
  recall_on_same: tp / nSame, accuracy: (tp + tn) / pairs.length,
  rows,
};
fs.writeFileSync(path.join(__dirname, 'b20-exacthash-result.json'), JSON.stringify(out, null, 2));
console.log(`exact-hash: caught ${tp}/${nSame} same-meaning pairs (recall ${(100 * tp / nSame).toFixed(0)}%), ${tn}/${nDiff} different correct, accuracy ${(100 * out.accuracy).toFixed(0)}%`);
