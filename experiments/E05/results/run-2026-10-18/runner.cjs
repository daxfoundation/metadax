#!/usr/bin/env node
'use strict';
// runner.cjs  -- runs all 60 E05 queries through MP-05 via `claude -p`.
// One call per query. Outputs raw JSON to raw/<ID>.json.
// Usage: node runner.cjs [--model sonnet|haiku] [--only Q01,Q02,...]
// Zero deps; Node >= 18.

const fs  = require('fs');
const path = require('path');
const cp   = require('child_process');

const FIXTURE_DIR = path.resolve(__dirname, '../proposed/fixtures/e05-registry-50');
const STACKS_DIR  = path.join(FIXTURE_DIR, 'stacks');

const argv  = process.argv.slice(2);
function getArg(name, dflt) {
  const i = argv.indexOf(name);
  return (i >= 0 && i + 1 < argv.length) ? argv[i + 1] : dflt;
}
const MODEL   = getArg('--model', 'sonnet');
const ONLY    = getArg('--only', null);
const TIMEOUT = 180 * 1000;

const RAW_DIR = path.join(__dirname, 'raw-' + MODEL);
fs.mkdirSync(RAW_DIR, { recursive: true });

const queries = JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, 'queries.json'), 'utf8'));
const toRun   = ONLY
  ? queries.filter(q => ONLY.split(',').includes(q.id))
  : queries;

let done = 0, ok = 0, fail = 0;
console.log(`Running ${toRun.length} queries with model ${MODEL} ...`);

for (const q of toRun) {
  const stackFile = path.join(STACKS_DIR, q.id + '.txt');
  const outFile   = path.join(RAW_DIR, q.id + '.json');
  if (!fs.existsSync(stackFile)) { console.error('missing stack:', q.id); fail++; continue; }

  const stack = fs.readFileSync(stackFile, 'utf8');
  const args  = ['-p', '--output-format', 'text', '--model', MODEL];
  const t0    = Date.now();
  const res   = cp.spawnSync('claude', args, {
    input: stack, encoding: 'utf-8', timeout: TIMEOUT, maxBuffer: 16 * 1024 * 1024,
  });
  const ms = Date.now() - t0;

  let record;
  if (res.error || res.status !== 0) {
    const err = res.error ? String(res.error.message) : ('exit ' + res.status + ': ' + (res.stderr || '').trim());
    console.error(`[${q.id}] FAIL (${ms}ms): ${err.slice(0, 100)}`);
    record = { id: q.id, ok: false, error: err, raw: res.stdout || '', ms };
    fail++;
  } else {
    const raw = (res.stdout || '').trim();
    let parsed = null, parseErr = null;
    try { parsed = JSON.parse(raw); } catch(e) { parseErr = e.message; }
    if (parseErr) {
      console.error(`[${q.id}] BAD-JSON (${ms}ms): ${parseErr.slice(0,80)}`);
      record = { id: q.id, ok: false, error: 'json-parse: ' + parseErr, raw, ms };
      fail++;
    } else {
      console.log(`[${q.id}] OK decision=${parsed.decision} target=${parsed.target_id || 'null'} conf=${parsed.confidence} (${ms}ms)`);
      record = { id: q.id, ok: true, raw, parsed, ms };
      ok++;
    }
  }
  fs.writeFileSync(outFile, JSON.stringify(record, null, 2));
  done++;
}

console.log(`\nDone: ${done} total, ${ok} ok, ${fail} fail`);
console.log(`Raw outputs in: ${RAW_DIR}`);
