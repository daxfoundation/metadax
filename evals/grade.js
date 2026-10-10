#!/usr/bin/env node
'use strict';
// grade.js -- grade one MetaDAX model output against a case.
// Zero dependencies, Node >= 18. Reuses tools/jsonschema-lite.js for schema
// validation and schemas/index.json for the schema id -> file map.
//
//   node evals/grade.js --case evals/cases/MP-05/depth2-new-question --out <file>
//   node evals/grade.js --case <dir> < model-output.txt
//   node evals/grade.js --case <dir> --out <file> --markdown
//   node evals/grade.js --selftest
//
// It prints one JSON line: {"case":..., "pass":bool, "reasons":[...]}.
//
// Grading has three layers, in order:
//   1. PARSE  -- exactly one JSON object (a trailing newline is tolerated; in
//                --markdown mode the LAST ```json fenced block is extracted).
//   2. SCHEMA -- validate against schemas/ when the object's "schema" is in
//                schemas/index.json, or when expect.schema names an index key
//                or a schema file. The MP-05 envelope has no self-id, so its
//                cases set expect.schema = "followup-output.schema.json".
//   3. GATES  -- the docs/INTERFACE.md CHECK gates (ids only from REGISTRY/PATH,
//                the prefix rule, id <= 200, title <= 80, no invented ids,
//                path[] equals PATH), read from the case's committed stack.txt.
//   4. EXPECT -- the case's expect.json (type, decision, allowed warnings, ids
//                that must / must not appear, max lengths, whether state is
//                present).

const fs = require('fs');
const path = require('path');
const jsl = require('../tools/jsonschema-lite.js');

const SCHEMAS_DIR = path.resolve(__dirname, '..', 'schemas');

// ---------- PARSE ----------

function parseOutput(text, markdown) {
  const reasons = [];
  let raw = text;
  if (markdown) {
    const blocks = [];
    const re = /```json\s*\n([\s\S]*?)```/g;
    let m;
    while ((m = re.exec(text)) !== null) blocks.push(m[1]);
    if (!blocks.length) {
      return { obj: null, reasons: ['parse: no ```json block found in markdown output'] };
    }
    raw = blocks[blocks.length - 1];
  }
  const trimmed = raw.replace(/\n+$/, '').trim();
  if (!trimmed) return { obj: null, reasons: ['parse: empty output'] };
  if (trimmed[0] !== '{') {
    return { obj: null, reasons: ['parse: output does not start with a single JSON object'] };
  }
  let obj;
  try {
    obj = JSON.parse(trimmed);
  } catch (e) {
    return { obj: null, reasons: ['parse: not valid JSON (' + e.message + ')'] };
  }
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return { obj: null, reasons: ['parse: top-level value is not a JSON object'] };
  }
  return { obj: obj, reasons: reasons };
}

// ---------- SCHEMA ----------

let SCHEMA_INDEX = null;
function schemaIndex() {
  if (SCHEMA_INDEX === null) {
    SCHEMA_INDEX = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'index.json'), 'utf-8'));
  }
  return SCHEMA_INDEX;
}

// Resolve a schema reference to a loaded schema object, or null.
// A reference is either a schema id present in index.json (e.g.
// "metadax.node/0.2") or a schema filename in schemas/ (e.g.
// "followup-output.schema.json").
function loadSchema(ref) {
  if (!ref) return null;
  const idx = schemaIndex();
  let file = null;
  if (Object.prototype.hasOwnProperty.call(idx, ref)) file = idx[ref];
  else if (ref.endsWith('.json')) file = ref;
  if (!file) return null;
  const p = path.join(SCHEMAS_DIR, file);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

// Operation outputs wrap their persisted file object in an envelope, e.g.
// {"type":"profile","profile":{…metadax.learner/0.2…}} (SCHEMAS.md section 9).
// The flat metadax.* schema validates the PERSISTED INNER object, not the
// envelope; metadax.learner/course/node are listed there as "Persisted file
// objects (not operation outputs)". Map each operation type to the key that
// holds its persisted object so we validate the inner object, not the wrapper.
const ENVELOPE_KEYS = { profile: 'profile', course: 'course', node: 'node' };

function schemaValidate(obj, expect, reasons) {
  // Error-object path: an output with "type":"error" is validated against the
  // error shape (SCHEMAS.md: {"type":"error","missing":[…],"message":"…"}) and
  // passes when the case's expect allows an error response. If the case does
  // not allow error, leave schema unjudged here and let expectCheck flag the
  // type mismatch (don't validate an error object against a non-error schema).
  if (obj && obj.type === 'error') {
    const allowsError = expect.type !== undefined && asArray(expect.type).includes('error');
    if (!allowsError) return null;
    const errSchema = loadSchema('error.schema.json');
    if (!errSchema) { reasons.push('schema: no schema found for "error.schema.json"'); return false; }
    const errErrs = jsl.validate(obj, errSchema);
    if (errErrs.length) {
      for (const e of errErrs.slice(0, 6)) reasons.push('schema: ' + e);
      return false;
    }
    return true;
  }

  // Unwrap the operation-output envelope to the persisted inner object when the
  // type names a known envelope key whose value is an object.
  let target = obj;
  const key = obj && typeof obj.type === 'string' ? ENVELOPE_KEYS[obj.type] : null;
  if (key && obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
    target = obj[key];
  }

  // Prefer the (inner) object's own schema id, else the case's expected schema.
  const ref = (target && typeof target.schema === 'string' && loadSchema(target.schema))
    ? target.schema : (expect.schema || null);
  if (!ref) return null; // nothing to validate against
  const schema = loadSchema(ref);
  if (!schema) {
    reasons.push('schema: no schema found for "' + ref + '"');
    return false;
  }
  const errs = jsl.validate(target, schema);
  if (errs.length) {
    for (const e of errs.slice(0, 6)) reasons.push('schema: ' + e);
    if (errs.length > 6) reasons.push('schema: (' + (errs.length - 6) + ' more)');
    return false;
  }
  return true;
}

// ---------- read REGISTRY / PATH from the stack ----------

function extractBlock(stack, name) {
  const start = '<<START ' + name + '>>';
  const end = '<<END ' + name + '>>';
  const i = stack.indexOf(start);
  if (i < 0) return null;
  const j = stack.indexOf(end, i);
  if (j < 0) return null;
  return stack.slice(i + start.length, j).trim();
}

function extractJsonBlock(stack, name) {
  const body = extractBlock(stack, name);
  if (body === null) return null;
  if (body === 'none') return 'none';
  try { return JSON.parse(body); } catch (e) { return null; }
}

// The set of ids a model may legally reference: REGISTRY ids + PATH ids,
// excluding the "trail" sentinel.
function allowedIds(stack) {
  const ids = new Set();
  const reg = extractJsonBlock(stack, 'REGISTRY');
  if (Array.isArray(reg)) for (const e of reg) if (e && e.id) ids.add(e.id);
  const p = extractJsonBlock(stack, 'PATH');
  if (Array.isArray(p)) for (const e of p) if (e && e.id && e.id !== 'trail') ids.add(e.id);
  return ids;
}

function pathArray(stack) {
  const p = extractJsonBlock(stack, 'PATH');
  return Array.isArray(p) ? p : null;
}

// ---------- GATES (docs/INTERFACE.md CHECK) ----------

function gateCheck(obj, stack, reasons) {
  const ids = allowedIds(stack);
  const pth = pathArray(stack);
  const parent = pth && pth.length ? pth[pth.length - 1].id : null;

  // Reference gates: any id the model points at must resolve, and never be "trail".
  const refs = [];
  if (typeof obj.target_id === 'string') refs.push(['target_id', obj.target_id]);
  const node = obj.node && typeof obj.node === 'object' ? obj.node : null;
  const linkArr = node ? node.links : obj.links;
  if (Array.isArray(linkArr)) {
    linkArr.forEach(function (l, i) {
      if (l && typeof l.id === 'string') refs.push(['links[' + i + '].id', l.id]);
    });
  }
  const reuse = (node && node.reuse) || obj.reuse;
  if (reuse && typeof reuse.of === 'string') refs.push(['reuse.of', reuse.of]);
  for (const [where, id] of refs) {
    if (id === 'trail') reasons.push('gate: ' + where + ' is the "trail" sentinel');
    else if (ids.size && !ids.has(id)) reasons.push('gate: ' + where + ' "' + id + '" not in REGISTRY or PATH');
  }

  // New-node gates (v0.3). ids are opaque ("n_" + 26 Crockford base32) or an
  // objective id (L..M..O..); they no longer encode ancestry, so ancestry is
  // judged by parent_id, not by an id prefix. PATH is root..parent inclusive and
  // root is depth 1, so the parent's depth == pth.length and a follow-up's depth
  // must be parent.depth + 1 == pth.length + 1.
  if (node && typeof node.id === 'string') {
    if (!/^n_[0-9abcdefghjkmnpqrstvwxyz]{26}$/.test(node.id) && !/^L\d\d\.M\d\d\.O\d\d$/.test(node.id)) {
      reasons.push('gate: node.id "' + node.id + '" is not a v0.3 opaque id ("n_" + 26 Crockford) or objective id');
    }
    if (parent && node.parent_id !== parent) {
      reasons.push('gate: node.parent_id "' + node.parent_id + '" != PATH parent "' + parent + '"');
    }
    if (pth && typeof node.depth === 'number' && node.depth !== pth.length + 1) {
      reasons.push('gate: node.depth ' + node.depth + ' != parent.depth + 1 (' + (pth.length + 1) + ')');
    }
  }
  if (node && typeof node.title === 'string' && node.title.length > 80) {
    reasons.push('gate: node.title longer than 80 chars');
  }

  // path[] MUST equal the PATH block received.
  if (node && Array.isArray(node.path) && pth) {
    if (node.path.length !== pth.length) {
      reasons.push('gate: node.path length ' + node.path.length + ' != PATH length ' + pth.length);
    } else {
      for (let i = 0; i < pth.length; i++) {
        if ((node.path[i] || {}).id !== pth[i].id) {
          reasons.push('gate: node.path[' + i + '].id != PATH[' + i + '].id');
          break;
        }
      }
    }
  }
}

// ---------- EXPECT (expect.json) ----------

function asArray(v) { return Array.isArray(v) ? v : [v]; }

function deepGet(obj, dotted) {
  let cur = obj;
  for (const k of dotted.split('.')) {
    if (cur == null) return undefined;
    cur = cur[k];
  }
  return cur;
}

function expectCheck(obj, expect, serialized, reasons) {
  if (expect.type !== undefined) {
    const want = asArray(expect.type);
    if (!want.includes(obj.type)) reasons.push('expect: type "' + obj.type + '" not in [' + want.join(', ') + ']');
  }
  if (expect.decision !== undefined) {
    const want = asArray(expect.decision);
    if (!want.includes(obj.decision)) reasons.push('expect: decision "' + obj.decision + '" not in [' + want.join(', ') + ']');
  }
  if (expect.allowed_warnings !== undefined) {
    const allowed = new Set(expect.allowed_warnings);
    for (const w of (obj.warnings || [])) {
      if (!allowed.has(w)) reasons.push('expect: warning "' + w + '" not in allowed set');
    }
  }
  if (expect.resolved_scope !== undefined) {
    const got = deepGet(obj, 'resolved.scope');
    if (got !== expect.resolved_scope) reasons.push('expect: resolved.scope "' + got + '" != "' + expect.resolved_scope + '"');
  }
  if (expect.node_present !== undefined) {
    const has = obj.node !== null && obj.node !== undefined;
    if (has !== expect.node_present) reasons.push('expect: node_present ' + has + ' != ' + expect.node_present);
  }
  if (expect.state_present !== undefined) {
    const has = obj.state !== null && obj.state !== undefined;
    if (has !== expect.state_present) reasons.push('expect: state_present ' + has + ' != ' + expect.state_present);
  }
  const node = obj.node && typeof obj.node === 'object' ? obj.node : null;
  if (expect.node_id_prefix !== undefined) {
    if (!node || typeof node.id !== 'string' || node.id.indexOf(expect.node_id_prefix) !== 0) {
      reasons.push('expect: node.id does not start with "' + expect.node_id_prefix + '"');
    }
  }
  if (expect.node_depth !== undefined) {
    if (!node || node.depth !== expect.node_depth) reasons.push('expect: node.depth != ' + expect.node_depth);
  }
  if (expect.node_visibility !== undefined) {
    const want = asArray(expect.node_visibility);
    if (!node || !want.includes(node.visibility)) reasons.push('expect: node.visibility "' + (node && node.visibility) + '" not in [' + want.join(', ') + ']');
  }
  if (expect.age_band !== undefined) {
    // MP-01 profile may nest the band; check a few common shapes.
    const band = obj.age_band || deepGet(obj, 'profile.age_band') || deepGet(obj, 'node.age_band');
    if (band !== expect.age_band) reasons.push('expect: age_band "' + band + '" != "' + expect.age_band + '"');
  }
  for (const needle of (expect.must_appear || [])) {
    if (serialized.indexOf(needle) < 0) reasons.push('expect: "' + needle + '" must appear but does not');
  }
  for (const needle of (expect.must_not_appear || [])) {
    if (serialized.indexOf(needle) >= 0) reasons.push('expect: "' + needle + '" must NOT appear but does');
  }
  for (const bad of (expect.must_not_be_node_id || [])) {
    if (node && node.id === bad) reasons.push('expect: node.id must not equal "' + bad + '"');
  }
  const ml = expect.max_lengths || {};
  if (ml.title !== undefined && node && typeof node.title === 'string' && node.title.length > ml.title) {
    reasons.push('expect: title longer than ' + ml.title);
  }
  if (ml.resolved_question !== undefined) {
    const q = deepGet(obj, 'resolved.question');
    if (typeof q === 'string' && q.length > ml.resolved_question) {
      reasons.push('expect: resolved.question longer than ' + ml.resolved_question);
    }
  }
}

// ---------- top-level grade ----------

function gradeOne(caseName, outputText, expect, stack, markdown) {
  const reasons = [];
  const parsed = parseOutput(outputText, markdown);
  if (!parsed.obj) {
    return { case: caseName, pass: false, reasons: parsed.reasons };
  }
  const obj = parsed.obj;
  const serialized = JSON.stringify(obj);

  const sv = schemaValidate(obj, expect, reasons);
  if (stack) gateCheck(obj, stack, reasons);
  expectCheck(obj, expect, serialized, reasons);

  return {
    case: caseName,
    pass: reasons.length === 0,
    schema_valid: sv,
    reasons: reasons,
  };
}

// ---------- selftest ----------

const GOOD_MP05 = JSON.stringify({
  type: 'followup',
  decision: 'new',
  target_id: null,
  confidence: 0.2,
  resolved: { question: 'How is ATP spent to power work in the cell?', canonical_question: 'How is ATP used to power cellular work?', intent: 'deepen', scope: 'in_scope' },
  node: {
    schema: 'metadax.node/0.3',
    id: 'n_kzhhgkv6p9s4p3n52rsy61z4tm',
    parent_id: 'L01.M01.O01',
    slug: 'atp-powers-cellular-work',
    legacy_id: 'L01.M01.O01/atp-powers-cellular-work',
    kind: 'followup', depth: 2, anchor: null,
    path: [{ id: 'L01.M01.O01', title: 'Introduction to energy production in the mitochondria', summary: 'x' }],
    title: 'How ATP powers cellular work',
    question: 'How is ATP spent to power work in the cell?',
    canonical_question: 'How is ATP used to power cellular work?',
    intent: 'deepen', summary: ['ATP releases energy when a phosphate bond breaks.'],
    concepts: ['atp-synthesis'], new_concepts: [], bloom_level: 'Understand', scope: 'in_scope',
    reuse: { decision: 'new', of: null, confidence: 0.2, rationale: 'nothing matched' },
    links: [],
    core: { sections: [{ id: 's1', heading: 'Spending ATP', body_md: 'ATP powers work by losing a phosphate.' }], key_points: ['ATP is energy currency'], bridge_to_parent: 'This is how the ATP made in the mitochondrion is spent.', bridge_to_objective: '', source_refs: [] },
    seeds: ['a', 'b', 'c'],
    created_by: 'lrn-fixture01', visibility: 'shared',
    created_at: 'runtime', updated_at: 'runtime', content_sha256: 'runtime', superseded_by: null,
  },
  seeds: ['a', 'b', 'c'],
  rendering_md: 'ATP powers work...',
  options: [],
  warnings: [],
});

// Bad: invents an id not in PATH/REGISTRY, wrong depth, title too long, and a
// "trail" reference. Graded against a minimal synthetic stack below.
const BAD_MP05 = JSON.stringify({
  type: 'followup',
  decision: 'reuse',
  target_id: 'L09.M09.O09/made-up',
  confidence: 0.9,
  resolved: { question: 'q' },
  node: {
    schema: 'metadax.node/0.2',
    id: 'L01.M01.O01/electron-donation-complex-iv/way-too/deep',
    parent_id: 'L01.M01.O01',
    kind: 'followup', depth: 2,
    path: [],
    title: 'x'.repeat(90),
    links: [{ id: 'trail', relation: 'extend' }],
    reuse: { of: 'trail' },
    core: { sections: [] }, seeds: [], summary: [],
  },
  seeds: [],
  rendering_md: '',
  options: [],
  warnings: ['not_a_real_warning'],
});

const SELFTEST_STACK = [
  '<<START PATH>>',
  JSON.stringify([{ id: 'L01.M01.O01', title: 'Introduction to energy production in the mitochondria', canonical_question: 'q', summary: 'x' }]),
  '<<END PATH>>',
  '<<START REGISTRY>>',
  JSON.stringify([{ id: 'L01.M01.O01' }, { id: 'L01.M01.O01/proteins-essential-atp-synthesis' }]),
  '<<END REGISTRY>>',
].join('\n');

const SELFTEST_EXPECT_GOOD = {
  schema: 'followup-output.schema.json', type: 'followup', decision: ['new', 'extend'],
  node_present: true, node_depth: 2,
  allowed_warnings: ['low_confidence'], must_not_appear: ['"trail"'], max_lengths: { title: 80 },
};
const SELFTEST_EXPECT_BAD = SELFTEST_EXPECT_GOOD;

function selftest() {
  const good = gradeOne('selftest-good', GOOD_MP05, SELFTEST_EXPECT_GOOD, SELFTEST_STACK, false);
  const bad = gradeOne('selftest-bad', BAD_MP05, SELFTEST_EXPECT_BAD, SELFTEST_STACK, false);
  process.stdout.write(JSON.stringify(good) + '\n');
  process.stdout.write(JSON.stringify(bad) + '\n');
  const ok = good.pass === true && bad.pass === false && bad.reasons.length >= 4;
  process.stdout.write('selftest: ' + (ok ? 'PASS' : 'FAIL')
    + ' (good.pass=' + good.pass + ', bad.pass=' + bad.pass
    + ', bad.reasons=' + bad.reasons.length + ')\n');
  return ok ? 0 : 1;
}

// ---------- CLI ----------

function getOpt(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : undefined;
}

function main(argv) {
  if (argv.indexOf('--selftest') >= 0) return selftest();
  const caseDir = getOpt(argv, '--case');
  if (!caseDir) {
    process.stderr.write('usage: node evals/grade.js --case <dir> [--out <file>] [--markdown] | --selftest\n');
    return 2;
  }
  const markdown = argv.indexOf('--markdown') >= 0;
  const outFile = getOpt(argv, '--out');
  const outputText = outFile
    ? fs.readFileSync(outFile, 'utf-8')
    : fs.readFileSync(0, 'utf-8');
  const expect = JSON.parse(fs.readFileSync(path.join(caseDir, 'expect.json'), 'utf-8'));
  const stackPath = path.join(caseDir, 'stack.txt');
  const stack = fs.existsSync(stackPath) ? fs.readFileSync(stackPath, 'utf-8') : null;
  const caseName = path.basename(path.dirname(caseDir)) + '/' + path.basename(caseDir);
  const result = gradeOne(caseName, outputText, expect, stack, markdown);
  process.stdout.write(JSON.stringify(result) + '\n');
  return result.pass ? 0 : 1;
}

module.exports = { gradeOne, parseOutput, allowedIds, loadSchema };

if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}
