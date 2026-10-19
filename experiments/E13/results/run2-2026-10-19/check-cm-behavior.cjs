#!/usr/bin/env node
'use strict';
// check-cm-behavior.cjs -- verify Charlotte Mason variant behaviour
// beyond what grade.js checks.
//
// Usage: node check-cm-behavior.cjs --case <dir> --out <file>
// Prints one JSON line: { case, pass, reasons, checks }
//
// Checks per CM case name:
//   fresh-no-progress:          message mentions narration language; type question or intro
//   fresh-with-progress:        message mentions narration language; type question or intro
//   narration-given-correctly:  type feedback|question; state present
//   resume-established:         no narration language; state present; type feedback or question

const fs = require('fs');
const path = require('path');

const CM_WORDS = [
  'in your own words', 'narrate', 'narration', 'retell', 'tell me', 'tell us',
  'your own words', 'in their own words'
];

function containsCMLanguage(text) {
  const lower = text.toLowerCase();
  return CM_WORDS.some(w => lower.includes(w));
}

function checkCMCase(caseName, obj) {
  const reasons = [];
  const checks = {};

  if (!obj || typeof obj !== 'object') {
    return { pass: false, reasons: ['no parsed object'], checks: {} };
  }

  const msg = (obj.display && obj.display.message) || '';
  const type = obj.type;
  const statePresent = obj.state != null;

  if (caseName === 'fresh-no-progress' || caseName === 'fresh-with-progress') {
    checks.cm_language = containsCMLanguage(msg);
    if (!checks.cm_language) {
      reasons.push('cm-behaviour: first question should use narration language ("in your own words" / "narrate"); not found in message');
    }
    checks.type_ok = ['intro', 'question'].includes(type);
    if (!checks.type_ok) {
      reasons.push('cm-behaviour: expected type intro or question, got ' + type);
    }
  }

  if (caseName === 'narration-given-correctly') {
    checks.type_ok = ['feedback', 'question', 'intro'].includes(type);
    if (!checks.type_ok) {
      reasons.push('cm-behaviour: expected type feedback or question after narration, got ' + type);
    }
    checks.state_present = statePresent;
    if (!statePresent) reasons.push('cm-behaviour: state must be present');
  }

  if (caseName === 'resume-established') {
    checks.no_re_narrate = !containsCMLanguage(msg);
    if (!checks.no_re_narrate) {
      reasons.push('cm-behaviour: resume should NOT re-narrate with narration language');
    }
    checks.state_present = statePresent;
    if (!statePresent) reasons.push('cm-behaviour: state must be present');
    checks.type_ok = ['feedback', 'question'].includes(type);
    if (!checks.type_ok) {
      reasons.push('cm-behaviour: resume expected type feedback or question, got ' + type);
    }
  }

  return { pass: reasons.length === 0, reasons, checks };
}

function getOpt(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : undefined;
}

function main(argv) {
  const caseDir = getOpt(argv, '--case');
  const outFile = getOpt(argv, '--out');
  if (!caseDir) {
    process.stderr.write('usage: node check-cm-behavior.cjs --case <dir> --out <file>\n');
    return 2;
  }

  const caseName = path.basename(caseDir);
  const outputText = outFile ? fs.readFileSync(outFile, 'utf8') : fs.readFileSync(0, 'utf8');

  let obj = null;
  try {
    const trimmed = outputText.replace(/\n+$/, '').trim();
    if (trimmed[0] === '{') obj = JSON.parse(trimmed);
  } catch (e) {
    const result = { case: caseName, pass: false, reasons: ['parse: ' + e.message], checks: {} };
    process.stdout.write(JSON.stringify(result) + '\n');
    return 1;
  }

  const result = checkCMCase(caseName, obj);
  result.case = caseName;
  process.stdout.write(JSON.stringify(result) + '\n');
  return result.pass ? 0 : 1;
}

if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}
module.exports = { checkCMCase, containsCMLanguage };
