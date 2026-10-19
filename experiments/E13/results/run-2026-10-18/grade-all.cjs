#!/usr/bin/env node
'use strict';
// grade-all.cjs -- grade all E13 eval runs.
// Reads raw/*.txt (one raw MetaDAX JSON output per file, filename = <slug>.txt),
// derives case/stackType from the filename slug (e.g. MP-06_intro__base.txt),
// grades with metadax grade.js, and for MP-06-variant cases with variant stack
// also runs check-variant-behavior.cjs.
// Writes raw/grade-results.jsonl and prints a summary table.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCRIPT_DIR  = path.resolve(__dirname);
const RAW_DIR     = path.join(SCRIPT_DIR, 'raw');
const METADAX     = '/tmp/metadax';
const EVAL_CASES  = path.resolve(SCRIPT_DIR, 'evals', 'cases');
const CHECK_VAR   = path.join(SCRIPT_DIR, 'check-variant-behavior.cjs');
const GRADE_JS    = path.join(METADAX, 'evals', 'grade.js');
const OUT_JSONL   = path.join(RAW_DIR, 'grade-results.jsonl');

// Derive case id and stackType from slug filename.
// Filename pattern: <group>_<casename>__<stackType>.txt
// e.g. MP-06_intro__base.txt → case = "MP-06/intro", stackType = "base"
//      MP-06-variant_fresh-no-progress__variant.txt → case = "MP-06-variant/fresh-no-progress"
function parseSlugg(slug) {
  const m = slug.match(/^(MP-06(?:-variant)?)_(.+)__(base|variant)$/);
  if (!m) return null;
  return { caseId: m[1] + '/' + m[2], stackType: m[3] };
}

function gradeOne(slug, txtPath) {
  const parsed = parseSlugg(slug);
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
    // grade.js exits 1 on fail -- stdout still has the JSON
    try {
      gradeResult = Object.assign({ stackType, slug }, JSON.parse((e.stdout || '').trim()));
      gradeResult.case = caseId;
    } catch (_) {
      gradeResult.reasons = ['grade.js error: ' + (e.stderr || '').trim().slice(0, 300)];
    }
  }

  // Variant behaviour check for MP-06-variant cases with variant stack
  let variantBehaviour = null;
  if (caseId.startsWith('MP-06-variant') && stackType === 'variant') {
    try {
      const vOut = execSync(
        `node "${CHECK_VAR}" --case "${caseDir}" --out "${txtPath}"`,
        { cwd: SCRIPT_DIR, encoding: 'utf8', timeout: 30000 }
      );
      variantBehaviour = JSON.parse(vOut.trim());
    } catch (e) {
      try { variantBehaviour = JSON.parse((e.stdout || '').trim()); }
      catch (_) { variantBehaviour = { pass: false, reasons: ['error: ' + (e.stderr||'').slice(0,100)] }; }
    }
  }

  return { ...gradeResult, variantBehaviour };
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
    const vb = r.variantBehaviour;
    const vbStr = vb ? (vb.pass ? ' vb:PASS' : ' vb:FAIL(' + (vb.reasons||[]).join(';').slice(0,80) + ')') : '';
    const reasonStr = r.reasons && r.reasons.length ? '  -- ' + r.reasons.slice(0,2).join('; ') : '';
    console.log((r.pass ? 'PASS' : 'FAIL') + vbStr + '  ' + slug + reasonStr);
  }

  fs.writeFileSync(OUT_JSONL, results.map(r => JSON.stringify(r)).join('\n') + '\n', 'utf8');
  console.log('\nWrote', OUT_JSONL);

  // Summary stats
  function pct(arr, key) {
    if (!arr.length) return 'n/a';
    return arr.filter(r => r[key]).length + '/' + arr.length;
  }

  const baseAll     = results.filter(r => r.stackType === 'base');
  const varAll      = results.filter(r => r.stackType === 'variant');
  const mp06Base    = baseAll.filter(r => r.case && r.case.startsWith('MP-06/'));
  const mp06Var     = varAll.filter(r => r.case && r.case.startsWith('MP-06/'));
  const newBase     = baseAll.filter(r => r.case && r.case.startsWith('MP-06-variant/'));
  const newVar      = varAll.filter(r => r.case && r.case.startsWith('MP-06-variant/'));
  const vbChecks    = newVar.map(r => r.variantBehaviour).filter(Boolean);
  const schemaValid = results.filter(r => r.schema_valid === true).length;

  console.log('\n--- Summary (' + results.length + ' runs) ---');
  console.log('schema-valid overall:             ', schemaValid + '/' + results.length);
  console.log('MP-06 base cases,  base stack:    ', pct(mp06Base, 'pass'), 'pass');
  console.log('MP-06 base cases,  variant stack: ', pct(mp06Var,  'pass'), 'pass  (regression check)');
  console.log('New cases,         base stack:    ', pct(newBase,  'pass'), 'pass');
  console.log('New cases,         variant stack: ', pct(newVar,   'pass'), 'pass');
  console.log('Variant-behaviour checks:         ', vbChecks.filter(v => v.pass).length + '/' + vbChecks.length, 'pass');
}

main();
