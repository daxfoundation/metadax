#!/usr/bin/env node
'use strict';
// grade-all-cm.cjs -- grade all E13 run2 CM eval runs.
// Same structure as run-2026-10-18/grade-all.cjs but for CM variant cases.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCRIPT_DIR  = path.resolve(__dirname);
const RAW_DIR     = path.join(SCRIPT_DIR, 'raw');
const METADAX     = '/tmp/metadax';
const EVAL_CASES  = path.resolve(SCRIPT_DIR, 'evals', 'cases');
const CHECK_CM    = path.join(SCRIPT_DIR, 'check-cm-behavior.cjs');
const GRADE_JS    = path.join(METADAX, 'evals', 'grade.js');
const OUT_JSONL   = path.join(RAW_DIR, 'grade-results.jsonl');

// Filename pattern: <group>_<casename>__<stackType>.txt
// e.g. MP-06_intro__variant.txt → case = "MP-06/intro", stackType = "variant"
//      MP-06-cm_fresh-no-progress__variant.txt → case = "MP-06-cm/fresh-no-progress"
function parseSlug(slug) {
  const m = slug.match(/^(MP-06(?:-cm)?)_(.+)__(base|variant)$/);
  if (!m) return null;
  return { caseId: m[1] + '/' + m[2], stackType: m[3] };
}

function gradeOne(slug, txtPath) {
  const parsed = parseSlug(slug);
  if (!parsed) return { slug, pass: false, reasons: ['could not parse slug: ' + slug] };
  const { caseId, stackType } = parsed;
  const caseDir = path.join(EVAL_CASES, caseId);

  let gradeResult = { case: caseId, stackType, slug, pass: false, schema_valid: null, reasons: ['grade.js not run'] };
  try {
    const out = execSync(
      `node "${GRADE_JS}" --case "${caseDir}" --out "${txtPath}"`,
      { cwd: METADAX, encoding: 'utf8', timeout: 30000 }
    );
    gradeResult = Object.assign({ stackType, slug }, JSON.parse(out.trim()));
    gradeResult.case = caseId;
  } catch (e) {
    try {
      gradeResult = Object.assign({ stackType, slug }, JSON.parse((e.stdout || '').trim()));
      gradeResult.case = caseId;
    } catch (_) {
      gradeResult.reasons = ['grade.js error: ' + (e.stderr || '').trim().slice(0, 300)];
    }
  }

  // CM behaviour check for MP-06-cm cases with variant stack
  let cmBehaviour = null;
  if (caseId.startsWith('MP-06-cm') && stackType === 'variant') {
    try {
      const vOut = execSync(
        `node "${CHECK_CM}" --case "${caseDir}" --out "${txtPath}"`,
        { cwd: SCRIPT_DIR, encoding: 'utf8', timeout: 30000 }
      );
      cmBehaviour = JSON.parse(vOut.trim());
    } catch (e) {
      try { cmBehaviour = JSON.parse((e.stdout || '').trim()); }
      catch (_) { cmBehaviour = { pass: false, reasons: ['error: ' + (e.stderr||'').slice(0,100)] }; }
    }
  }

  return { ...gradeResult, cmBehaviour };
}

function main() {
  const txtFiles = fs.readdirSync(RAW_DIR)
    .filter(f => f.endsWith('.txt') && !f.startsWith('.'))
    .sort();

  if (txtFiles.length === 0) {
    console.error('No .txt files found in ' + RAW_DIR);
    process.exit(1);
  }

  const results = [];
  for (const f of txtFiles) {
    const slug    = f.replace(/\.txt$/, '');
    const txtPath = path.join(RAW_DIR, f);
    const r = gradeOne(slug, txtPath);
    results.push(r);
    const cb = r.cmBehaviour;
    const cbStr = cb ? (cb.pass ? ' cb:PASS' : ' cb:FAIL(' + (cb.reasons||[]).join(';').slice(0,80) + ')') : '';
    const reasonStr = r.reasons && r.reasons.length ? '  -- ' + r.reasons.slice(0,2).join('; ') : '';
    console.log((r.pass ? 'PASS' : 'FAIL') + cbStr + '  ' + slug + reasonStr);
  }

  fs.writeFileSync(OUT_JSONL, results.map(r => JSON.stringify(r)).join('\n') + '\n', 'utf8');
  console.log('\nWrote', OUT_JSONL);

  function pct(arr, key) {
    if (!arr.length) return 'n/a';
    return arr.filter(r => r[key]).length + '/' + arr.length;
  }

  const baseAll    = results.filter(r => r.stackType === 'base');
  const varAll     = results.filter(r => r.stackType === 'variant');
  const mp06Var    = varAll.filter(r => r.case && r.case.startsWith('MP-06/'));
  const cmVar      = varAll.filter(r => r.case && r.case.startsWith('MP-06-cm/'));
  const cbChecks   = cmVar.map(r => r.cmBehaviour).filter(Boolean);
  const schemaValid = results.filter(r => r.schema_valid === true).length;

  console.log('\n--- Summary (' + results.length + ' runs) ---');
  console.log('schema-valid overall:              ', schemaValid + '/' + results.length);
  console.log('MP-06 base cases,  variant stack:  ', pct(mp06Var, 'pass'), 'pass  (regression check)');
  console.log('CM cases,          variant stack:  ', pct(cmVar, 'pass'), 'pass');
  console.log('CM behaviour checks:               ', cbChecks.filter(v => v.pass).length + '/' + cbChecks.length, 'pass');
}

main();
