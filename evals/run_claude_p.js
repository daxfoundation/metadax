#!/usr/bin/env node
'use strict';
// run_claude_p.js -- execute the eval suite locally with the `claude` CLI.
// Zero dependencies, Node >= 18. For every case it feeds the committed
// stack.txt to `claude -p --output-format text --model <id>`, saves the raw
// output, grades it with grade.js, and writes a per-run summary.
//
//   node evals/run_claude_p.js                 # all cases, default model
//   node evals/run_claude_p.js --op MP-05      # one operation
//   node evals/run_claude_p.js --case depth2-new-question
//   node evals/run_claude_p.js --model sonnet  # pick a model id claude accepts
//   node evals/run_claude_p.js --markdown      # grade markdown-mode replies
//
// The stack is passed to the model on STDIN. Raw outputs are written under
//   evals/runs/<YYYY-MM-DD>-<model>/<op>/<case>.out.txt
// and committed beside the summary, so every number in a result file traces to
// a raw output on record (the honesty rule; docs/ACCURACY.md item 3).
//
// Certification (decision D3) runs two primary models (one per vendor) plus a
// smaller floor model. This local runner drives whatever model ids the `claude`
// binary in the container accepts; the cross-vendor matrix runs via promptfoo
// (evals/promptfoo/) with API keys, never here.

const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const grade = require('./grade.js');

const ROOT = path.resolve(__dirname, '..');
const CASES_DIR = path.join(__dirname, 'cases');
const RUNS_DIR = path.join(__dirname, 'runs');
const TIMEOUT_MS = 240 * 1000;

function getOpt(argv, name, dflt) {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : dflt;
}

function today() {
  const d = new Date();
  const p = function (n) { return String(n).padStart(2, '0'); };
  return d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate());
}

function listCases(opFilter, caseFilter) {
  const out = [];
  if (!fs.existsSync(CASES_DIR)) return out;
  for (const op of fs.readdirSync(CASES_DIR).sort()) {
    if (opFilter && op !== opFilter) continue;
    const opDir = path.join(CASES_DIR, op);
    if (!fs.statSync(opDir).isDirectory()) continue;
    for (const id of fs.readdirSync(opDir).sort()) {
      if (caseFilter && id !== caseFilter) continue;
      const dir = path.join(opDir, id);
      if (fs.existsSync(path.join(dir, 'stack.txt'))) out.push({ op: op, id: id, dir: dir });
    }
  }
  return out;
}

// Run one stack through `claude -p`. Returns {ok, output, error, ms}.
function runClaude(stack, model) {
  const args = ['-p', '--output-format', 'text'];
  if (model) args.push('--model', model);
  const started = Date.now();
  const res = cp.spawnSync('claude', args, {
    input: stack, encoding: 'utf-8', timeout: TIMEOUT_MS, maxBuffer: 64 * 1024 * 1024,
  });
  const ms = Date.now() - started;
  if (res.error) return { ok: false, output: '', error: String(res.error.message || res.error), ms: ms };
  if (res.status !== 0) {
    return { ok: false, output: res.stdout || '', error: 'exit ' + res.status + ': ' + (res.stderr || '').trim(), ms: ms };
  }
  return { ok: true, output: res.stdout || '', error: null, ms: ms };
}

function main(argv) {
  const model = getOpt(argv, '--model', 'default');
  const opFilter = getOpt(argv, '--op', null);
  const caseFilter = getOpt(argv, '--case', null);
  const markdown = argv.indexOf('--markdown') >= 0;

  const cases = listCases(opFilter, caseFilter);
  if (!cases.length) {
    process.stderr.write('no cases match (op=' + opFilter + ', case=' + caseFilter + ')\n');
    return 2;
  }

  const runId = today() + '-' + model;
  const runDir = path.join(RUNS_DIR, runId);
  fs.mkdirSync(runDir, { recursive: true });

  const perCase = [];
  let anyRan = false;
  for (const c of cases) {
    const stack = fs.readFileSync(path.join(c.dir, 'stack.txt'), 'utf-8');
    const expect = JSON.parse(fs.readFileSync(path.join(c.dir, 'expect.json'), 'utf-8'));
    const outDir = path.join(runDir, c.op);
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, c.id + '.out.txt');

    const modelArg = model === 'default' ? null : model;
    const r = runClaude(stack, modelArg);
    fs.writeFileSync(outPath, r.ok ? r.output : ('[RUN ERROR] ' + r.error + '\n' + (r.output || '')));

    let graded;
    if (r.ok) {
      anyRan = true;
      graded = grade.gradeOne(c.op + '/' + c.id, r.output, expect, stack, markdown);
    } else {
      graded = { case: c.op + '/' + c.id, pass: false, schema_valid: false, reasons: ['run: ' + r.error] };
    }
    process.stdout.write(JSON.stringify(graded) + '\n');
    perCase.push({
      op: c.op, case: c.id, pass: graded.pass, ran: r.ok,
      schema_valid: graded.schema_valid === true,
      out_bytes: Buffer.byteLength(r.output || '', 'utf-8'),
      wall_ms: r.ms, reasons: graded.reasons,
    });
  }

  // Aggregate per op.
  const byOp = {};
  for (const pc of perCase) {
    const o = byOp[pc.op] || (byOp[pc.op] = { cases: 0, pass: 0, fail: 0, schema_valid: 0, out_bytes: 0, wall_ms: 0 });
    o.cases++; o[pc.pass ? 'pass' : 'fail']++;
    if (pc.schema_valid) o.schema_valid++;
    o.out_bytes += pc.out_bytes; o.wall_ms += pc.wall_ms;
  }
  const ops = Object.keys(byOp).sort().map(function (op) {
    const o = byOp[op];
    return {
      op: op, cases: o.cases, pass: o.pass, fail: o.fail,
      schema_valid_rate: o.cases ? +(o.schema_valid / o.cases).toFixed(3) : 0,
      mean_out_bytes: o.cases ? Math.round(o.out_bytes / o.cases) : 0,
      wall_seconds: +(o.wall_ms / 1000).toFixed(1),
    };
  });

  const summary = {
    run_id: runId, model: model, date: today(),
    ran: anyRan,
    total_cases: perCase.length,
    total_pass: perCase.filter(function (p) { return p.pass; }).length,
    ops: ops,
    cases: perCase,
  };
  fs.writeFileSync(path.join(runDir, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');

  const md = [];
  md.push('# Eval run ' + runId);
  md.push('');
  md.push('- model: `' + model + '`');
  md.push('- date: ' + today());
  md.push('- cases run against a model: ' + (anyRan ? 'yes' : 'NO -- claude -p did not execute'));
  md.push('- total cases: ' + summary.total_cases + ', pass: ' + summary.total_pass);
  md.push('');
  md.push('| op | cases | pass | fail | schema-valid | mean out bytes | wall s |');
  md.push('|---|---|---|---|---|---|---|');
  for (const o of ops) {
    md.push('| ' + o.op + ' | ' + o.cases + ' | ' + o.pass + ' | ' + o.fail + ' | '
      + o.schema_valid_rate + ' | ' + o.mean_out_bytes + ' | ' + o.wall_seconds + ' |');
  }
  md.push('');
  fs.writeFileSync(path.join(runDir, 'summary.md'), md.join('\n') + '\n');

  process.stdout.write('\nwrote ' + path.relative(ROOT, path.join(runDir, 'summary.json')) + '\n');
  if (!anyRan) {
    process.stderr.write('WARNING: no case reached a model; summary reflects run errors only.\n');
    return 1;
  }
  return 0;
}

if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}
module.exports = { listCases, runClaude };
