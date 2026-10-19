#!/usr/bin/env node
'use strict';
// check-variant-behavior.js -- verify retrieval-first variant behaviour
// beyond what grade.js checks.
//
// Usage: node check-variant-behavior.js --case <dir> --out <file>
// Prints one JSON line: { case, pass, reasons, checks }
//
// Checks per variant case name:
//   fresh-no-progress:       message mentions retrieval/recall; type question or intro
//   fresh-with-progress:     message mentions retrieval/recall; type question or intro
//   probe-answered-correctly: type feedback|question; state present
//   resume-established:      no retrieval re-probe language; state present

const fs = require('fs');
const path = require('path');

const RETRIEVAL_WORDS = ['retrieval', 'recall', 'already know', 'prior knowledge',
  'what you know', 'what do you know', 'before we begin', 'probe'];

function containsRetrievalLanguage(text) {
  const lower = text.toLowerCase();
  return RETRIEVAL_WORDS.some(w => lower.includes(w));
}

const ANTI_REPROBE_CASES = new Set(['resume-established']);

function checkVariantCase(caseName, obj) {
  const reasons = [];
  const checks = {};

  if (!obj || typeof obj !== 'object') {
    return { pass: false, reasons: ['no parsed object'], checks: {} };
  }

  const msg = (obj.display && obj.display.message) || '';
  const type = obj.type;
  const statePresent = obj.state != null;

  if (caseName === 'fresh-no-progress' || caseName === 'fresh-with-progress') {
    checks.retrieval_language = containsRetrievalLanguage(msg);
    if (!checks.retrieval_language) {
      reasons.push('variant-behaviour: intro/first question should mention retrieval/recall; not found in message');
    }
    checks.type_ok = ['intro', 'question'].includes(type);
    if (!checks.type_ok) {
      reasons.push('variant-behaviour: expected type intro or question, got ' + type);
    }
  }

  if (caseName === 'probe-answered-correctly') {
    checks.type_ok = ['feedback', 'question', 'intro'].includes(type);
    if (!checks.type_ok) {
      reasons.push('variant-behaviour: expected type feedback or question after probe, got ' + type);
    }
    checks.state_present = statePresent;
    if (!statePresent) reasons.push('variant-behaviour: state must be present');
  }

  if (caseName === 'resume-established') {
    checks.no_reprobe = !containsRetrievalLanguage(msg);
    if (!checks.no_reprobe) {
      reasons.push('variant-behaviour: resume should NOT re-probe with retrieval language');
    }
    checks.state_present = statePresent;
    if (!statePresent) reasons.push('variant-behaviour: state must be present');
    checks.type_ok = ['feedback', 'question'].includes(type);
    if (!checks.type_ok) {
      reasons.push('variant-behaviour: resume expected type feedback or question, got ' + type);
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
  if (!caseDir) { process.stderr.write('usage: node check-variant-behavior.js --case <dir> --out <file>\n'); return 2; }

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

  const result = checkVariantCase(caseName, obj);
  result.case = caseName;
  process.stdout.write(JSON.stringify(result) + '\n');
  return result.pass ? 0 : 1;
}

if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}
module.exports = { checkVariantCase, containsRetrievalLanguage };
