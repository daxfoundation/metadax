#!/usr/bin/env node
'use strict';
// run_factory.js -- tests for the curriculum factory (MP-11/MP-12) additions:
// the two new schemas (metadax.curriculum/0.3, metadax.context-profile/0.3),
// the 10 context profiles + modifiers, and the two worked dry runs under
// samples/factory/. Validates each shipped artifact against its schema with
// tools/jsonschema-lite.js, and checks a known-bad object is rejected.
// Zero dependencies beyond the repo's own tools. Exit 0 only when all pass.

const fs = require('fs');
const path = require('path');

const TOOLS = path.resolve(__dirname, '..');
const REPO = path.resolve(TOOLS, '..');
const jsl = require(path.join(TOOLS, 'jsonschema-lite.js'));

let failures = 0;
function ok(cond, msg) {
  if (cond) process.stdout.write('ok   - ' + msg + '\n');
  else { failures++; process.stdout.write('FAIL - ' + msg + '\n'); }
}
function load(rel) { return JSON.parse(fs.readFileSync(path.join(REPO, rel), 'utf8')); }
function valid(obj, schema) { return jsl.validate(obj, schema).length === 0; }

const curriculumSchema = load('schemas/curriculum.schema.json');
const profileSchema = load('schemas/context-profile.schema.json');

// ---- 1. schema ids are the v0.3 names SCHEMAS/index.json maps ----
const index = load('schemas/index.json');
ok(index['metadax.curriculum/0.3'] === 'curriculum.schema.json',
  'schemas/index.json maps metadax.curriculum/0.3');
ok(index['metadax.context-profile/0.3'] === 'context-profile.schema.json',
  'schemas/index.json maps metadax.context-profile/0.3');
ok(curriculumSchema.properties.schema.const === 'metadax.curriculum/0.3',
  'curriculum schema const is metadax.curriculum/0.3');
ok(profileSchema.properties.schema.const === 'metadax.context-profile/0.3',
  'context-profile schema const is metadax.context-profile/0.3');

// ---- 2. all 10 context profiles validate ----
const profileDir = path.join(REPO, 'profiles/contexts');
const profileFiles = fs.readdirSync(profileDir)
  .filter(function (n) { return n.endsWith('.json') && n !== 'modifiers.json'; });
ok(profileFiles.length === 10, 'exactly 10 context profiles present (got ' + profileFiles.length + ')');
for (const name of profileFiles) {
  const prof = JSON.parse(fs.readFileSync(path.join(profileDir, name), 'utf8'));
  ok(valid(prof, profileSchema), 'profile validates: ' + name);
  ok(prof.id === name.replace(/\.json$/, ''), 'profile id matches filename: ' + name);
  ok(prof.what_if_wrong && Object.keys(prof.what_if_wrong).length > 0,
    'profile has what_if_wrong notes: ' + name);
}

// ---- 3. modifiers are cross-cutting, named by action, never by condition ----
const modifiers = JSON.parse(fs.readFileSync(path.join(profileDir, 'modifiers.json'), 'utf8')).modifiers;
ok(Array.isArray(modifiers) && modifiers.length >= 6, 'at least 6 cross-cutting modifiers');
for (const m of modifiers) {
  ok(typeof m.what_if_wrong === 'string' && m.what_if_wrong.length > 0,
    'modifier has what_if_wrong: ' + m.id);
  // a modifier must not be written as a population/condition label
  ok(!/\bfor (dyslexic|blind|deaf|disabled)\b/i.test(JSON.stringify(m)),
    'modifier is not phrased as a condition label: ' + m.id);
}

// ---- 4. the two dry-run curricula validate and chain cleanly ----
for (const dir of ['biology-101-university', 'hr-onboarding-module']) {
  const cur = load('samples/factory/' + dir + '/curriculum.json');
  ok(valid(cur, curriculumSchema), 'dry-run curriculum validates: ' + dir);
  ok(cur._note && /unreviewed/.test(cur._note), 'dry-run curriculum labelled illustrative: ' + dir);

  const byId = {};
  for (const n of cur.nodes) byId[n.id] = n;
  const program = cur.nodes.filter(function (n) { return n.level === 'program'; });
  ok(program.length === 1 && program[0].parent_id === null && program[0].depth === 0,
    'exactly one program node, parent_id null, depth 0: ' + dir);

  // parent_id chain resolves and depth == parent.depth + 1 (v0.3)
  let chainOk = true;
  for (const n of cur.nodes) {
    if (n.parent_id === null) { if (n.depth !== 0) chainOk = false; continue; }
    const parent = byId[n.parent_id];
    if (!parent || n.depth !== parent.depth + 1) chainOk = false;
  }
  ok(chainOk, 'every node resolves its parent_id and depth == parent.depth + 1: ' + dir);

  // every course node carries a hand-off MP-02 can consume
  const courses = cur.nodes.filter(function (n) { return n.level === 'course'; });
  ok(courses.length >= 1, 'at least one course node: ' + dir);
  for (const c of courses) {
    ok(c.handoff && c.handoff.to === 'MP-02' && typeof c.handoff.input === 'string'
      && c.handoff.input.length > 0, 'course has a self-contained MP-02 hand-off: ' + c.id);
    // hand-off input must not lean on the program (contract 2)
    ok(!/\bthe program\b/i.test(c.handoff.input),
      'hand-off input is self-contained (no "the program" reference): ' + c.id);
  }

  // id continuity: a lesson id under a course strips to a valid MP-02 lesson id
  const lessons = cur.nodes.filter(function (n) { return n.level === 'lesson'; });
  for (const l of lessons) {
    const tail = l.id.split('/')[1] || '';
    ok(/^L\d\d$/.test(tail), 'lesson id tail is a valid MP-02 id (' + l.id + ')');
  }

  // prerequisites are acyclic across the whole tree
  const seen = {}, stack = {};
  function acyclic(id) {
    if (stack[id]) return false;
    if (seen[id]) return true;
    seen[id] = stack[id] = true;
    const n = byId[id];
    if (n) for (const p of n.prerequisites || []) if (byId[p] && !acyclic(p)) return false;
    stack[id] = false;
    return true;
  }
  let acyclicAll = true;
  for (const n of cur.nodes) if (!acyclic(n.id)) acyclicAll = false;
  ok(acyclicAll, 'prerequisites graph is acyclic: ' + dir);
}

// ---- 5. a known-bad object is rejected (depth-0 program with a non-null parent would
//          pass the schema, so test a shape the schema itself forbids) ----
const bad = { schema: 'metadax.curriculum/0.3', id: 'x', title: 't', language: 'en',
  brief: { audience: { intended_bands: ['adult'] }, duration: { value: 1, unit: 'weeks' }, outcomes: [] },
  nodes: [ { id: 'x', parent_id: null, level: 'planet', depth: 0, slug: 'x', title: 'x',
    summary: 's', sequence: 1, prerequisites: [], time_budget: { value: 1, unit: 'weeks' } } ] };
ok(!valid(bad, curriculumSchema), 'curriculum schema rejects an unknown node level');

process.stdout.write((failures === 0 ? '\nPASS' : '\nFAIL (' + failures + ')') + '\n');
process.exit(failures === 0 ? 0 : 1);
