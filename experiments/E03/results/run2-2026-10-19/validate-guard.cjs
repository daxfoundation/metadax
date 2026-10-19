#!/usr/bin/env node
'use strict';
// validate-guard.js -- validate each guard record against the appropriate arm C schema.
// Records guard-01..02,05..06 are turn records; guard-03..04 are event records.
// Expected: every guard record should be REJECTED (have >=1 error).

const fs = require('fs');
const path = require('path');
const { validate } = require('/tmp/metadax/tools/jsonschema-lite.js');

const [, , guardDir, turnSchemaPath, eventSchemaPath] = process.argv;

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

const turnSchema = loadJson(turnSchemaPath);
const eventSchema = loadJson(eventSchemaPath);

const TURN_FILES = ['guard-01-missing-required.json', 'guard-02-wrong-enum.json',
                    'guard-05-extra-field.json', 'guard-06-null-display.json'];
const EVENT_FILES = ['guard-03-wrong-type.json', 'guard-04-unknown-event.json'];

let rejected = 0;
const total = TURN_FILES.length + EVENT_FILES.length;

for (const f of TURN_FILES) {
  const rec = loadJson(path.join(guardDir, f));
  const errs = validate(rec, turnSchema, turnSchema);
  const ok = errs.length > 0;
  if (ok) rejected++;
  process.stdout.write((ok ? 'REJECTED' : 'PASSED (BAD!)') + ' ' + f + '\n');
  if (errs.length > 0) {
    for (const e of errs) process.stdout.write('  ' + e + '\n');
  }
}

for (const f of EVENT_FILES) {
  const rec = loadJson(path.join(guardDir, f));
  const errs = validate(rec, eventSchema, eventSchema);
  const ok = errs.length > 0;
  if (ok) rejected++;
  process.stdout.write((ok ? 'REJECTED' : 'PASSED (BAD!)') + ' ' + f + '\n');
  if (errs.length > 0) {
    for (const e of errs) process.stdout.write('  ' + e + '\n');
  }
}

process.stdout.write('\n--- GUARD SUMMARY ---\n');
process.stdout.write('Rejected: ' + rejected + ' / ' + total + '\n');
process.exit(rejected < total ? 1 : 0);
