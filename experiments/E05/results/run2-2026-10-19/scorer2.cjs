#!/usr/bin/env node
'use strict';
// scorer2.cjs -- scores a run2 model arm against the answer key.
// Usage:
//   node scorer2.cjs --dir raw-haiku-orig              (all 60)
//   node scorer2.cjs --dir raw-haiku-clean --ids Q21-Q30  (traps only, clean fixture)
// Reads answer-key from ../proposed/fixtures/e05-registry-50/answer-key.json

const fs   = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
function getArg(name, dflt) {
  const i = argv.indexOf(name);
  return (i >= 0 && i + 1 < argv.length) ? argv[i + 1] : dflt;
}

const RAW_SUBDIR = getArg('--dir', 'raw-haiku-orig');
const IDS_FILTER = getArg('--ids', null); // e.g. "Q21-Q30"
const RAW_DIR  = path.join(__dirname, RAW_SUBDIR);
const KEY_PATH = path.resolve(__dirname, '../proposed/fixtures/e05-registry-50/answer-key.json');

const answerKey = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));

// Parse ID range filter
let idSet = null;
if (IDS_FILTER) {
  const m = IDS_FILTER.match(/^Q(\d+)-Q(\d+)$/);
  if (m) {
    idSet = new Set();
    for (let i = parseInt(m[1]); i <= parseInt(m[2]); i++) {
      idSet.add('Q' + String(i).padStart(2, '0'));
    }
  }
}

const keyFiltered = idSet
  ? answerKey.filter(r => idSet.has(r.id))
  : answerKey;

const results = [];
for (const item of keyFiltered) {
  const outFile = path.join(RAW_DIR, item.id + '.json');
  if (!fs.existsSync(outFile)) {
    results.push({ ...item, actual_decision: null, actual_target: null, valid_json: false, missing: true });
    continue;
  }
  let rec;
  try {
    rec = JSON.parse(fs.readFileSync(outFile, 'utf8'));
  } catch (e) {
    results.push({ ...item, actual_decision: null, actual_target: null, valid_json: false, missing: false, error: e.message });
    continue;
  }
  if (!rec.ok || !rec.parsed) {
    results.push({ ...item, actual_decision: null, actual_target: null, valid_json: false, missing: false, error: rec.error });
    continue;
  }
  const p = rec.parsed;
  results.push({
    ...item,
    actual_decision: p.decision,
    actual_target:   p.target_id,
    actual_confidence: p.confidence,
    valid_json: true,
    missing: false,
  });
}

const shouldReuse   = results.filter(r => r.expected_decision === 'reuse');
const shouldNotReuse = results.filter(r => r.expected_decision === 'new');
const traps         = results.filter(r => r.category === 'trap');

const truePos  = shouldReuse.filter(r => r.actual_decision === 'reuse' && r.actual_target);
const falsePos = shouldNotReuse.filter(r => r.actual_decision === 'reuse');
const falseNeg = shouldReuse.filter(r => r.actual_decision !== 'reuse');

const allReuse = results.filter(r => r.actual_decision === 'reuse' && r.actual_target);
const precision  = allReuse.length > 0 ? truePos.length / allReuse.length : 0;
const recall     = shouldReuse.length > 0 ? truePos.length / shouldReuse.length : 0;

const trapFP     = traps.filter(r => r.actual_decision === 'reuse');
const trapFPRate = traps.length > 0 ? trapFP.length / traps.length : 0;

const validJson  = results.filter(r => r.valid_json);
const jsonRate   = results.length > 0 ? validJson.length / results.length : 0;

const confPresent = results.filter(r => r.actual_confidence !== undefined && r.actual_confidence !== null);
const confNumeric = confPresent.filter(r => typeof r.actual_confidence === 'number');

const cats = ['near-dup-light','near-dup-heavy','trap','ordinary-reuse','ordinary-new'];
const catStats = {};
for (const cat of cats) {
  const grp = results.filter(r => r.category === cat);
  if (!grp.length) continue;
  const correct = grp.filter(r => {
    if (r.expected_decision === 'reuse') return r.actual_decision === 'reuse' && r.actual_target;
    else return r.actual_decision !== 'reuse';
  });
  catStats[cat] = { n: grp.length, correct: correct.length, pct: (correct.length / grp.length * 100).toFixed(0) + '%' };
}

console.log('\n=== E05 Scores — dir:', RAW_SUBDIR, IDS_FILTER ? '('+IDS_FILTER+')' : '(all)', '===');
console.log('n queries          :', results.length);
console.log('Reuse precision    :', precision.toFixed(3), ' (kill < 0.80)');
console.log('Reuse recall       :', recall.toFixed(3),    ' (kill < 0.70)');
console.log('Trap false-reuse   :', trapFPRate.toFixed(3), '(', trapFP.length, '/', traps.length, 'traps)');
console.log('Valid-JSON rate    :', jsonRate.toFixed(3));
console.log('Confidence present :', confPresent.length, '/', results.length);
console.log('Confidence numeric :', confNumeric.length, '/', results.length);
console.log('');
console.log('Category breakdown:');
for (const [cat, s] of Object.entries(catStats)) {
  console.log(`  ${cat.padEnd(22)} ${s.correct}/${s.n} correct (${s.pct})`);
}
console.log('');
const pass = shouldReuse.length === 0 || (precision >= 0.80 && recall >= 0.70);
console.log('Verdict vs stop rule (precision >= 0.80 AND recall >= 0.70):');
console.log(' ', pass ? 'PASS' : 'FAIL', `precision=${precision.toFixed(3)} recall=${recall.toFixed(3)}`);

const outLabel = RAW_SUBDIR + (IDS_FILTER ? '-' + IDS_FILTER : '');
const scores = {
  dir: RAW_SUBDIR,
  ids_filter: IDS_FILTER,
  n_queries: results.length,
  n_valid_json: validJson.length,
  json_rate: jsonRate,
  precision,
  recall,
  trap_fp_rate: trapFPRate,
  true_pos: truePos.length,
  false_pos: falsePos.length,
  false_neg: falseNeg.length,
  category_stats: catStats,
  verdict: pass ? 'PASS' : 'FAIL',
  per_query: results.map(r => ({
    id: r.id,
    category: r.category,
    expected: r.expected_decision,
    actual: r.actual_decision,
    target: r.actual_target,
    conf_absent: r.actual_confidence === undefined,
    correct: r.expected_decision === 'reuse'
      ? (r.actual_decision === 'reuse' && !!r.actual_target)
      : (r.actual_decision !== 'reuse'),
  })),
};
const outPath = path.join(__dirname, 'scores-' + outLabel.replace(/\//g, '-') + '.json');
fs.writeFileSync(outPath, JSON.stringify(scores, null, 2));
console.log('\nScores written to:', outPath);
