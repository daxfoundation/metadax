#!/usr/bin/env node
'use strict';
// validate-arm.js -- validate all turn and event JSON files in an arm directory
// against the arm-specific schemas using jsonschema-lite.js.
//
// Usage: node validate-arm.js <arm-dir> <turn-schema> <event-schema>
//   arm-dir: directory containing turn-NNNN.json and event-NNN.json files
//   turn-schema: path to tutor-turn schema JSON
//   event-schema: path to event schema JSON
// Prints per-file errors and a summary. Exit 0 = all OK, 1 = failures found.

const fs = require('fs');
const path = require('path');
const { validate } = require('/tmp/metadax/tools/jsonschema-lite.js');

const [, , armDir, turnSchemaPath, eventSchemaPath] = process.argv;
if (!armDir || !turnSchemaPath || !eventSchemaPath) {
  process.stderr.write('Usage: validate-arm.js <arm-dir> <turn-schema> <event-schema>\n');
  process.exit(2);
}

function loadJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); }
  catch (e) { throw new Error('cannot load ' + p + ': ' + e.message); }
}

const turnSchema = loadJson(turnSchemaPath);
const eventSchema = loadJson(eventSchemaPath);

const files = fs.readdirSync(armDir).sort();
let turnErrors = 0, eventErrors = 0, turnFiles = 0, eventFiles = 0;

const errorsByFile = [];

for (const f of files) {
  if (!f.endsWith('.json')) continue;
  const fp = path.join(armDir, f);
  const rec = loadJson(fp);
  let schema, label;
  if (f.startsWith('turn-')) {
    schema = turnSchema; label = 'turn'; turnFiles++;
  } else if (f.startsWith('event-')) {
    schema = eventSchema; label = 'event'; eventFiles++;
  } else {
    continue;
  }
  const errs = validate(rec, schema, schema);
  if (errs.length > 0) {
    errorsByFile.push({ file: f, label, errors: errs });
    if (label === 'turn') turnErrors += errs.length;
    else eventErrors += errs.length;
  }
}

for (const { file, errors } of errorsByFile) {
  process.stdout.write('FILE: ' + file + '\n');
  for (const e of errors) process.stdout.write('  ERROR: ' + e + '\n');
}

process.stdout.write('\n--- SUMMARY ---\n');
process.stdout.write('Turn files: ' + turnFiles + ', errors: ' + turnErrors + '\n');
process.stdout.write('Event files: ' + eventFiles + ', errors: ' + eventErrors + '\n');
process.stdout.write('Total errors: ' + (turnErrors + eventErrors) + '\n');
process.stdout.write((turnErrors + eventErrors === 0 ? 'OK' : 'FAIL') + '\n');
process.exit(turnErrors + eventErrors > 0 ? 1 : 0);
