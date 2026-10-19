#!/usr/bin/env node
// 03-validate.js -- validate the assembled companion record against the PROPOSED
// companion.schema.json, using metadax's own jsonschema-lite validator. Honesty check
// that the proposed schema actually accepts the record the harness produced.
'use strict';
const fs = require('fs');
const path = require('path');
const { validate } = require('/tmp/metadax/tools/jsonschema-lite.js');

const OUT = path.join(__dirname, '..', 'out');
const scenario = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'scenario.json'), 'utf8'));
const log = fs.readFileSync(path.join(OUT, 'companion-log.jsonl'), 'utf8').trim().split('\n').map(l => JSON.parse(l));
const view = JSON.parse(fs.readFileSync(path.join(OUT, 'compacted-view.json'), 'utf8'));
const companionSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'proposed', 'schemas', 'companion.schema.json'), 'utf8'));
const refusalSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'proposed', 'schemas', 'refusal.schema.json'), 'utf8'));

const companion = {
  schema: 'metadax.companion/0.2',
  learner_id: scenario.learner_id,
  device_id: scenario.device_id,
  log,
  view
};

function run(name, instance, schema) {
  const errors = [];
  validate(instance, schema, schema, '$', errors);
  const ok = errors.length === 0;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}` + (ok ? '' : '\n  ' + errors.slice(0, 8).join('\n  ')));
  return { name, ok, errors };
}

const results = [];
results.push(run('companion record (log + view) vs companion.schema.json', companion, companionSchema));

// The durable refusal set as its own file.
const refusalSet = {
  schema: 'metadax.refusals/0.2',
  learner_id: scenario.learner_id,
  refusals: view.refusals.map(r => ({ refusal_id: r.refusal_id, directive: r.directive, scope: r.scope, target: r.target, status: r.status, issued_at: r.at, said: r.said }))
};
fs.writeFileSync(path.join(OUT, 'refusal-set.json'), JSON.stringify(refusalSet, null, 2) + '\n');
results.push(run('durable refusal set vs refusal.schema.json', refusalSet, refusalSchema));

fs.writeFileSync(path.join(OUT, 'validation.json'), JSON.stringify(results, null, 2) + '\n');
const allOk = results.every(r => r.ok);
console.log(allOk ? '\nALL SCHEMA CHECKS PASS' : '\nSCHEMA CHECKS FAILED');
process.exit(allOk ? 0 : 1);
