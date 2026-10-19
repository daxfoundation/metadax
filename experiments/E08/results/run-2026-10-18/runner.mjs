#!/usr/bin/env node
// runner.mjs  –  runs all 12 oracle tests against generated implementations
// Usage: node runner.mjs --model sonnet --round 1
// Output: raw/<model>-r<round>.json

import { execFileSync } from 'node:child_process';
import { readdirSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : null;
}

const model = arg('model') ?? 'sonnet';
const round = arg('round') ?? '1';

const oraclesDir = resolve(__dir, 'oracles');
const genDir     = resolve(__dir, 'generated', model);
const rawDir     = resolve(__dir, 'raw');

const IDS = [
  '01-projectile',
  '02-fraction-simplifier',
  '03-unit-converter',
  '04-thin-pool',
  '05-storage-layers',
  '06-compound-interest',
  '07-punnett-square',
  '08-equation-balancer',
  '09-sort-steps',
  '10-probability-tree',
  '11-force-pairs',
  '12-recipe-scaler'
];

function parseTap(output) {
  const tests = [];
  for (const line of output.split('\n')) {
    const okMatch = line.match(/^(ok|not ok)\s+\d+\s+-\s+(.+)/);
    if (okMatch) {
      tests.push({ name: okMatch[2].trim(), pass: okMatch[1] === 'ok', error: null });
    }
  }
  // extract failure messages from YAML blocks
  const diagBlocks = output.split(/^  ---$/m);
  let failIdx = 0;
  for (const block of diagBlocks) {
    const msgMatch = block.match(/message:\s*(.+)/);
    if (msgMatch) {
      // find next failure
      while (failIdx < tests.length && tests[failIdx].pass) failIdx++;
      if (failIdx < tests.length) {
        tests[failIdx].error = msgMatch[1].trim();
        failIdx++;
      }
    }
  }
  return tests;
}

const results = [];

for (const id of IDS) {
  const implPath = resolve(genDir, `${id}.mjs`);
  const testPath = resolve(oraclesDir, `${id}.test.mjs`);

  if (!existsSync(implPath)) {
    results.push({
      id, pass: false, tests: [],
      error: `implementation not found: ${implPath}`
    });
    continue;
  }

  let stdout = '', stderr = '', exitCode = 0;
  try {
    stdout = execFileSync(
      process.execPath,
      ['--test', '--test-reporter=tap', testPath],
      { env: { ...process.env, IMPL_PATH: implPath }, timeout: 15000 }
    ).toString();
  } catch (e) {
    stdout  = e.stdout?.toString() ?? '';
    stderr  = e.stderr?.toString() ?? '';
    exitCode = e.status ?? 1;
  }

  const tests = parseTap(stdout);
  const passed = tests.filter(t => t.pass).length;
  const failed = tests.filter(t => !t.pass).length;

  results.push({
    id,
    passed, failed,
    total: tests.length,
    all_pass: failed === 0 && tests.length > 0,
    tests
  });
}

const summary = {
  model, round,
  assets_all_pass: results.filter(r => r.all_pass).length,
  total_assets: IDS.length,
  pass_rate: results.filter(r => r.all_pass).length / IDS.length,
  total_tests_passed: results.reduce((s, r) => s + (r.passed ?? 0), 0),
  total_tests: results.reduce((s, r) => s + (r.total ?? 0), 0),
  results
};

const outPath = resolve(rawDir, `${model}-r${round}.json`);
writeFileSync(outPath, JSON.stringify(summary, null, 2));
console.log(`\n=== ${model} round ${round} ===`);
console.log(`Assets passing all tests: ${summary.assets_all_pass} / ${IDS.length}`);
console.log(`Asset pass rate: ${(summary.pass_rate * 100).toFixed(1)}%`);
console.log(`Test pass rate: ${summary.total_tests_passed} / ${summary.total_tests}`);
console.log(`Output: ${outPath}`);

for (const r of results) {
  const icon = r.all_pass ? '✓' : (r.error ? '✗' : '✗');
  const detail = r.error ?? `${r.passed}/${r.total} tests`;
  console.log(`  ${icon} ${r.id}: ${detail}`);
  if (!r.all_pass && r.tests) {
    for (const t of r.tests.filter(t => !t.pass)) {
      console.log(`      FAIL: ${t.name}`);
      if (t.error) console.log(`            ${t.error}`);
    }
  }
}
