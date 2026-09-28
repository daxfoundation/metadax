// tests.js -- generate promptfoo tests from evals/cases/, one per case, so
// promptfoo runs exactly the same inputs as evals/run_claude_p.js. Each test
// carries the assembled stack as the `stack` var and asserts by handing the
// model output to evals/grade.js (the single source of truth for pass/fail).
//
// promptfoo loads this via `tests: file://tests.js`. Zero dependencies.

const fs = require('fs');
const path = require('path');

const CASES_DIR = path.resolve(__dirname, '..', 'cases');

function listCases() {
  const out = [];
  for (const op of fs.readdirSync(CASES_DIR).sort()) {
    const opDir = path.join(CASES_DIR, op);
    if (!fs.statSync(opDir).isDirectory()) continue;
    for (const id of fs.readdirSync(opDir).sort()) {
      const dir = path.join(opDir, id);
      if (fs.existsSync(path.join(dir, 'stack.txt'))) out.push({ op, id, dir });
    }
  }
  return out;
}

module.exports = listCases().map(function (c) {
  const stack = fs.readFileSync(path.join(c.dir, 'stack.txt'), 'utf-8');
  return {
    description: c.op + '/' + c.id,
    vars: { stack: stack, caseDir: c.dir, op: c.op, caseId: c.id },
    assert: [
      {
        type: 'javascript',
        // output is the model's reply; context.vars.caseDir locates the case.
        value: function (output, context) {
          const grade = require('../grade.js');
          const dir = context.vars.caseDir;
          const expect = JSON.parse(fs.readFileSync(path.join(dir, 'expect.json'), 'utf-8'));
          const stackText = fs.readFileSync(path.join(dir, 'stack.txt'), 'utf-8');
          const name = context.vars.op + '/' + context.vars.caseId;
          const r = grade.gradeOne(name, output, expect, stackText, false);
          return { pass: r.pass, score: r.pass ? 1 : 0, reason: r.reasons.join('; ') || 'ok' };
        },
      },
    ],
  };
});
