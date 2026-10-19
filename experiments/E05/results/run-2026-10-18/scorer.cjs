#!/usr/bin/env node
'use strict';
// scorer.cjs  -- scores a model run against the answer key.
// Usage: node scorer.cjs --model sonnet
// Reads: raw-<model>/<Q*.json>, ../proposed/fixtures/e05-registry-50/answer-key.json
// Prints a summary table and key metrics.

const fs   = require('fs');
const path = require('path');

const argv  = process.argv.slice(2);
function getArg(name, dflt) {
  const i = argv.indexOf(name);
  return (i >= 0 && i + 1 < argv.length) ? argv[i + 1] : dflt;
}
const MODEL = getArg('--model', 'sonnet');
const RAW_DIR = path.join(__dirname, 'raw-' + MODEL);
const KEY_PATH = path.resolve(__dirname, '../proposed/fixtures/e05-registry-50/answer-key.json');

const answerKey = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));

// Load all raw outputs
const results = [];
for (const item of answerKey) {
  const outFile = path.join(RAW_DIR, item.id + '.json');
  if (!fs.existsSync(outFile)) {
    results.push({ ...item, actual_decision: null, actual_target: null, valid_json: false, missing: true });
    continue;
  }
  const rec = JSON.parse(fs.readFileSync(outFile, 'utf8'));
  if (!rec.ok || !rec.parsed) {
    results.push({ ...item, actual_decision: null, actual_target: null, valid_json: false, missing: false, error: rec.error });
    continue;
  }
  const p = rec.parsed;
  results.push({
    ...item,
    actual_decision: p.decision,
    actual_target: p.target_id,
    actual_confidence: p.confidence,
    valid_json: true,
    missing: false,
  });
}

// ── Scoring ──────────────────────────────────────────────────────────────────
// "should_reuse" = expected_decision === 'reuse'
// "correct reuse" = actual_decision === 'reuse' AND actual_target is non-null
// We are lenient on target: any reuse with a valid target counts as a true positive
// For traps: any reuse decision is a false positive

const shouldReuse = results.filter(r => r.expected_decision === 'reuse');
const shouldNotReuse = results.filter(r => r.expected_decision === 'new');
const traps = results.filter(r => r.category === 'trap');

// True positives: expected reuse, got reuse (with any non-null target)
const truePos = shouldReuse.filter(r => r.actual_decision === 'reuse' && r.actual_target);
// False positives: expected new, got reuse
const falsePos = shouldNotReuse.filter(r => r.actual_decision === 'reuse');
// False negatives: expected reuse, got new/extend/other
const falseNeg = shouldReuse.filter(r => r.actual_decision !== 'reuse');

// Precision = TP / (TP + FP)
const allReuse = results.filter(r => r.actual_decision === 'reuse' && r.actual_target);
const precision = allReuse.length > 0 ? truePos.length / allReuse.length : 0;
// Recall = TP / (TP + FN)
const recall = shouldReuse.length > 0 ? truePos.length / shouldReuse.length : 0;
// Trap false-reuse rate
const trapFP = traps.filter(r => r.actual_decision === 'reuse');
const trapFPRate = traps.length > 0 ? trapFP.length / traps.length : 0;
// JSON validity rate
const validJson = results.filter(r => r.valid_json);
const jsonRate = results.length > 0 ? validJson.length / results.length : 0;

// ── Category breakdown ───────────────────────────────────────────────────────
const cats = ['near-dup-light','near-dup-heavy','trap','ordinary-reuse','ordinary-new'];
const catStats = {};
for (const cat of cats) {
  const grp = results.filter(r => r.category === cat);
  const correct = grp.filter(r => {
    if (r.expected_decision === 'reuse') return r.actual_decision === 'reuse' && r.actual_target;
    else return r.actual_decision !== 'reuse';
  });
  catStats[cat] = { n: grp.length, correct: correct.length, pct: grp.length ? (correct.length / grp.length * 100).toFixed(0) + '%' : 'n/a' };
}

// ── Print ────────────────────────────────────────────────────────────────────
console.log('\n=== E05 Scores — model:', MODEL, '===');
console.log('Reuse precision  :', precision.toFixed(3), ' (kill < 0.80)');
console.log('Reuse recall     :', recall.toFixed(3),    ' (kill < 0.70)');
console.log('Trap false-reuse :', trapFPRate.toFixed(3));
console.log('Valid-JSON rate  :', jsonRate.toFixed(3));
console.log('');
console.log('Category breakdown:');
for (const [cat, s] of Object.entries(catStats)) {
  console.log(`  ${cat.padEnd(22)} ${s.correct}/${s.n} correct (${s.pct})`);
}
console.log('');
console.log('Verdict vs stop rule (precision >= 0.80 AND recall >= 0.70):');
const pass = precision >= 0.80 && recall >= 0.70;
console.log(' ', pass ? 'PASS' : 'FAIL', `precision=${precision.toFixed(3)} recall=${recall.toFixed(3)}`);

// ── Write scores JSON ────────────────────────────────────────────────────────
const scores = {
  model: MODEL,
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
    correct: r.expected_decision === 'reuse'
      ? (r.actual_decision === 'reuse' && !!r.actual_target)
      : (r.actual_decision !== 'reuse'),
  })),
};
const outPath = path.join(__dirname, 'scores-' + MODEL + '.json');
fs.writeFileSync(outPath, JSON.stringify(scores, null, 2));
console.log('\nScores written to:', outPath);
