#!/usr/bin/env node
'use strict';
// run_session.js -- the model-agnostic half of the eval runner.
//
// run_claude_p.js needs a `claude` CLI that can execute the stacks. That is not
// always available (a build container without a login, an API runner, a chat
// session acting as the model). This runner splits the job so ANY model can
// answer the cases:
//
//   node evals/run_session.js --jobs --run-id 2026-10-01-my-model
//       writes evals/runs/<run-id>/jobs.json: one entry per case with the
//       absolute stack path and the .out.txt path the model must fill with
//       exactly one JSON object (the reply to the stack, nothing else).
//
//   node evals/run_session.js --grade --run-id 2026-10-01-my-model --model "<model id>" [--markdown]
//       grades every .out.txt that exists in the run dir with grade.js and
//       writes summary.json + summary.md in the same shape run_claude_p.js
//       produces. Missing outputs are recorded as "not answered".
//
// Zero dependencies, Node >= 18. The raw outputs stay beside the summary so
// every number traces to a file on record (docs/ACCURACY.md item 3).

const fs = require('fs');
const path = require('path');
const grade = require('./grade.js');
const { listCases } = require('./run_claude_p.js');

const ROOT = path.resolve(__dirname, '..');
const RUNS_DIR = path.join(__dirname, 'runs');

function getOpt(argv, name, dflt) {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : dflt;
}
function today() {
  const d = new Date();
  const p = function (n) { return String(n).padStart(2, '0'); };
  return d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate());
}

function jobs(runId, opFilter, caseFilter) {
  const runDir = path.join(RUNS_DIR, runId);
  fs.mkdirSync(runDir, { recursive: true });
  const cases = listCases(opFilter, caseFilter);
  const list = cases.map(function (c) {
    fs.mkdirSync(path.join(runDir, c.op), { recursive: true });
    return {
      op: c.op, case: c.id,
      stack: path.join(c.dir, 'stack.txt'),
      expect: path.join(c.dir, 'expect.json'),
      out: path.join(runDir, c.op, c.id + '.out.txt'),
    };
  });
  const f = path.join(runDir, 'jobs.json');
  fs.writeFileSync(f, JSON.stringify({ run_id: runId, generated: new Date().toISOString(), jobs: list }, null, 2) + '\n');
  process.stdout.write(list.length + ' jobs -> ' + path.relative(ROOT, f) + '\n');
  return 0;
}

function gradeRun(runId, model, markdown, opFilter, caseFilter) {
  const runDir = path.join(RUNS_DIR, runId);
  const cases = listCases(opFilter, caseFilter);
  const perCase = [];
  let anyRan = false;
  for (const c of cases) {
    const stack = fs.readFileSync(path.join(c.dir, 'stack.txt'), 'utf-8');
    const expect = JSON.parse(fs.readFileSync(path.join(c.dir, 'expect.json'), 'utf-8'));
    const outPath = path.join(runDir, c.op, c.id + '.out.txt');
    let graded, output = '', ran = false;
    if (fs.existsSync(outPath)) {
      output = fs.readFileSync(outPath, 'utf-8');
      if (output.trim().length && !output.startsWith('[RUN ERROR]')) {
        ran = true; anyRan = true;
        graded = grade.gradeOne(c.op + '/' + c.id, output, expect, stack, markdown);
      }
    }
    if (!ran) graded = { case: c.op + '/' + c.id, pass: false, schema_valid: false, reasons: ['not answered'] };
    process.stdout.write(JSON.stringify(graded) + '\n');
    perCase.push({
      op: c.op, case: c.id, pass: graded.pass, ran: ran,
      schema_valid: graded.schema_valid === true,
      out_bytes: Buffer.byteLength(output || '', 'utf-8'),
      wall_ms: 0, reasons: graded.reasons,
    });
  }
  const byOp = {};
  for (const pc of perCase) {
    const o = byOp[pc.op] || (byOp[pc.op] = { cases: 0, pass: 0, fail: 0, schema_valid: 0, out_bytes: 0 });
    o.cases++; o[pc.pass ? 'pass' : 'fail']++;
    if (pc.schema_valid) o.schema_valid++;
    o.out_bytes += pc.out_bytes;
  }
  const ops = Object.keys(byOp).sort().map(function (op) {
    const o = byOp[op];
    return {
      op: op, cases: o.cases, pass: o.pass, fail: o.fail,
      schema_valid_rate: o.cases ? +(o.schema_valid / o.cases).toFixed(3) : 0,
      mean_out_bytes: o.cases ? Math.round(o.out_bytes / o.cases) : 0,
      wall_seconds: null,
    };
  });
  const summary = {
    run_id: runId, model: model, date: today(), ran: anyRan, runner: 'run_session.js',
    total_cases: perCase.length,
    total_pass: perCase.filter(function (p) { return p.pass; }).length,
    ops: ops, cases: perCase,
  };
  fs.writeFileSync(path.join(runDir, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
  const md = [];
  md.push('# Eval run ' + runId);
  md.push('');
  md.push('- model: `' + model + '`');
  md.push('- date: ' + today());
  md.push('- runner: run_session.js (outputs written by a session acting as the model; wall time not measured)');
  md.push('- cases run against a model: ' + (anyRan ? 'yes' : 'NO'));
  md.push('- total cases: ' + summary.total_cases + ', pass: ' + summary.total_pass);
  md.push('');
  md.push('| op | cases | pass | fail | schema-valid | mean out bytes |');
  md.push('|---|---|---|---|---|---|');
  for (const o of ops) {
    md.push('| ' + o.op + ' | ' + o.cases + ' | ' + o.pass + ' | ' + o.fail + ' | ' + o.schema_valid_rate + ' | ' + o.mean_out_bytes + ' |');
  }
  md.push('');
  md.push('## Failures');
  md.push('');
  for (const pc of perCase) if (!pc.pass) md.push('- ' + pc.op + '/' + pc.case + ': ' + pc.reasons.join('; '));
  md.push('');
  fs.writeFileSync(path.join(runDir, 'summary.md'), md.join('\n') + '\n');
  process.stdout.write('\nwrote ' + path.relative(ROOT, path.join(runDir, 'summary.json')) + '\n');
  return anyRan ? 0 : 1;
}

function main(argv) {
  const runId = getOpt(argv, '--run-id', null);
  if (!runId) { process.stderr.write('usage: run_session.js (--jobs | --grade) --run-id <id> [--model <id>] [--op MP-05] [--case <id>] [--markdown]\n'); return 2; }
  const opFilter = getOpt(argv, '--op', null);
  const caseFilter = getOpt(argv, '--case', null);
  if (argv.indexOf('--jobs') >= 0) return jobs(runId, opFilter, caseFilter);
  if (argv.indexOf('--grade') >= 0) return gradeRun(runId, getOpt(argv, '--model', 'unknown'), argv.indexOf('--markdown') >= 0, opFilter, caseFilter);
  process.stderr.write('pass --jobs or --grade\n');
  return 2;
}

if (require.main === module) process.exit(main(process.argv.slice(2)));
module.exports = { jobs, gradeRun };
