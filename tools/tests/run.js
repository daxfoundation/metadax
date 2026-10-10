#!/usr/bin/env node
'use strict';
// run.js -- self-contained test runner for the MetaDAX Node tools.
// Builds a tiny course in a temp dir, stamps it, validates it, corrupts a hash,
// checks slug/childId/canon, and runs validate.js over the shipped fixtures.
// Exit 0 only when everything passes.

const cp = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const TOOLS = path.resolve(__dirname, '..');
const REPO = path.resolve(TOOLS, '..');
const canon = require(path.join(TOOLS, 'canon.js'));
const pathTool = require(path.join(TOOLS, 'path.js'));

let failures = 0;
function ok(cond, msg) {
  if (cond) {
    process.stdout.write('ok   - ' + msg + '\n');
  } else {
    failures++;
    process.stdout.write('FAIL - ' + msg + '\n');
  }
}

function run(args, opts) {
  return cp.spawnSync('node', args, Object.assign({ cwd: REPO, encoding: 'utf-8' }, opts || {}));
}

// ---- 1. canon.js known vectors (computed by hand) ----
ok(canon.canonicalJson({ b: 1, a: 'x' }).toString() === '{"a":"x","b":1}',
  'canon sorts keys: {b,a} -> {"a":"x","b":1}');
ok(canon.canonicalJson({ a: [3, 2, 1], Z: true, '1': null }).toString()
  === '{"1":null,"Z":true,"a":[3,2,1]}',
  'canon UTF-16 key order: "1" < "Z" < "a"');
ok(canon.canonicalJson({ k: 'a\tb\nc"d' }).toString() === '{"k":"a\\tb\\nc\\"d"}',
  'canon escapes tab, newline and quote minimally');

// ---- 2. slug worked examples (SCHEMAS section 1) ----
ok(pathTool.slug('Proteins essential for ATP synthesis') === 'proteins-essential-atp-synthesis',
  'slug: Proteins essential for ATP synthesis');
ok(pathTool.slug('Cytochrome c: structure and role') === 'cytochrome-c-structure-role',
  'slug: Cytochrome c: structure and role');
ok(pathTool.slug('Plant and animal mitochondria compared') === 'plant-animal-mitochondria',
  'slug: Plant and animal mitochondria compared (34 -> 25 char cap)');

// ---- 3. childId (v0.3): opaque id, re-mint on collision, no id growth ----
// v0.3 childId mints "n_" + 26 Crockford base32 from 128 random bits. For
// stable expected values the RNG is seeded with the deterministic v0.3 mapping
// (first 128 bits of sha256(legacy id), as tools/migrate-ids-0.2-to-0.3.js
// opaqueFromLegacy): each expected id below is the v0.3 id of the v0.2 id this
// test expected before the migration.
const crypto = require('crypto');
function seeded(legacyIds, fn) { // mint() returns the v0.3 ids of legacyIds, in order
  const queue = legacyIds.slice();
  const real = crypto.randomBytes;
  crypto.randomBytes = function (n) {
    return crypto.createHash('sha256').update(String(queue.shift())).digest().subarray(0, n);
  };
  try { return fn(); } finally { crypto.randomBytes = real; }
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'metadax-test-'));
const courseDir = path.join(tmp, 'course');
const nodesDir = path.join(courseDir, 'nodes');
// Flat v0.3 layout: nodes/<v0.3 id of L01.M01.O01/foo-bar>
fs.mkdirSync(path.join(nodesDir, 'n_3zq7sqqv4qj68c7k6wdqvyzr4c'), { recursive: true });
ok(seeded(['L01.M01.O01/foo-bar', 'L01.M01.O01/foo-bar-2'], function () {
  return pathTool.childId('L01.M01.O01', 'Foo bar', courseDir);
}) === 'n_052jj3pnsv8ct040eekk7m7xm0',
  'childId re-mints on collision (v0.3 id of L01.M01.O01/foo-bar-2)');
fs.mkdirSync(path.join(nodesDir, 'n_052jj3pnsv8ct040eekk7m7xm0'), { recursive: true });
ok(seeded(['L01.M01.O01/foo-bar', 'L01.M01.O01/foo-bar-2', 'L01.M01.O01/foo-bar-3'], function () {
  return pathTool.childId('L01.M01.O01', 'Foo bar', courseDir);
}) === 'n_cfqvtp33nxz7e3pgy7f30zrny4',
  'childId re-mints on second collision (v0.3 id of L01.M01.O01/foo-bar-3)');

const longParent = 'L01.M01.O01/' + 'x'.repeat(180); // 192 chars
const capped = seeded([longParent + '/alpha'], function () {
  return pathTool.childId(longParent, 'alpha beta gamma delta', courseDir);
});
ok(capped.length <= 200, 'childId respects the 200-char cap (len ' + capped.length + ')');
ok(capped === 'n_5jxc5d3gvkqxgs9d330ge090xg',
  'childId stays a fixed-length opaque id under a long parent (v0.3 id of the capped breadcrumb)');

let refused = false;
let unbounded = null;
try {
  unbounded = seeded(['a'.repeat(200) + '/word'], function () {
    return pathTool.childId('a'.repeat(200), 'word', courseDir);
  });
} catch (e) { refused = true; }
ok(!refused && unbounded === 'n_1mjkdsc55zcb32tbp12ky8nxkc',
  'childId never exceeds the cap in v0.3: a 200-char parent still yields a 28-char opaque id');

// ---- 4. build a tiny course (2 objectives, 3 follow-ups incl. depth 3) ----
function writeNode(id, parentId, depth, pathArr) {
  const dir = path.join(nodesDir, id.split('/').join(path.sep));
  fs.mkdirSync(dir, { recursive: true });
  const node = {
    schema: 'metadax.node/0.2',
    id: id,
    parent_id: parentId,
    kind: parentId ? 'followup' : 'objective',
    depth: depth,
    anchor: null,
    title: 'Title for ' + id,
    question: '',
    canonical_question: 'What about ' + id + '?',
    intent: parentId ? 'deepen' : null,
    summary: ['A summary sentence for ' + id + '.'],
    concepts: ['concept-a'],
    new_concepts: [],
    bloom_level: 'Understand',
    scope: 'in_scope',
    reuse: parentId ? { decision: 'new', of: null, confidence: 0, rationale: 'test' } : null,
    links: [],
    core: {
      sections: [
        { id: 's1', heading: 'One', body_md: 'Body one for ' + id + '.' },
        { id: 's2', heading: 'Two', body_md: 'Body two for ' + id + '.' },
      ],
      key_points: ['Point for ' + id + '.'],
      bridge_to_parent: parentId ? 'Bridge.' : '',
      bridge_to_objective: '',
      source_refs: [],
    },
    seeds: ['A seed?'],
    path: pathArr,
    created_by: 'author-test',
    visibility: 'shared',
    created_at: 'runtime',
    updated_at: 'runtime',
    content_sha256: 'runtime',
    superseded_by: null,
    model: 'author-test',
    stats: { views: 0, reuse_count: 0 },
  };
  fs.writeFileSync(path.join(dir, 'node.json'), JSON.stringify(node, null, 2) + '\n');
  return id;
}

function pe(id) { // a path[] entry stub for an ancestor id
  return { id: id, title: 'Title for ' + id, summary: 'A summary sentence for ' + id + '.' };
}

const O1 = 'L01.M01.O01', O2 = 'L01.M01.O02';
writeNode(O1, null, 1, []);
writeNode(O2, null, 1, []);
writeNode(O1 + '/fa', O1, 2, [pe(O1)]);
writeNode(O1 + '/fa/fb', O1 + '/fa', 3, [pe(O1), pe(O1 + '/fa')]);
writeNode(O2 + '/fc', O2, 2, [pe(O2)]);

const allIds = [O1, O2, O1 + '/fa', O1 + '/fa/fb', O2 + '/fc'];

// course.json
fs.writeFileSync(path.join(courseDir, 'course.json'), JSON.stringify({
  schema: 'metadax.course/0.2', id: 'test-course', title: 'Test Course',
  summary: 'A tiny test course.', lessons: [], created_at: 'runtime', updated_at: 'runtime',
}, null, 2) + '\n');

// registry
const regDir = path.join(courseDir, 'registry');
fs.mkdirSync(regDir, { recursive: true });
fs.writeFileSync(path.join(regDir, 'L01.M01.json'), JSON.stringify({
  schema: 'metadax.registry/0.2', course_id: 'test-course', module_id: 'L01.M01',
  updated_at: 'runtime',
  nodes: allIds.map(function (id) {
    return { id: id, parent_id: id.indexOf('/') >= 0 ? id.slice(0, id.lastIndexOf('/')) : null,
      title: 'Title for ' + id, canonical_question: 'What about ' + id + '?',
      intent: null, summary: 's', concepts: ['concept-a'], visibility: 'shared',
      created_by: 'author-test', reuse_count: 0, depth: 1 + (id.split('/').length - 1),
      superseded_by: null };
  }),
}, null, 2) + '\n');
fs.writeFileSync(path.join(regDir, 'index.json'), JSON.stringify({
  schema: 'metadax.registry-index/0.2', course_id: 'test-course', updated_at: 'runtime',
  modules: [{ id: 'L01.M01', file: 'registry/L01.M01.json', node_count: allIds.length, updated_at: 'runtime' }],
}, null, 2) + '\n');

// ---- 5. stamp every node with stamp.js ----
let stampedOk = true;
for (const id of allIds) {
  const np = path.join(nodesDir, id.split('/').join(path.sep), 'node.json');
  const r = run([path.join(TOOLS, 'stamp.js'), 'node', np, '--by', 'author-test', '--role', 'author']);
  if (r.status !== 0) { stampedOk = false; process.stdout.write(r.stderr || ''); }
}
ok(stampedOk, 'stamp.js stamps every node without error');

// verify provenance was written beside a follow-up and carries the parent lineage
const faProv = JSON.parse(fs.readFileSync(path.join(nodesDir, 'L01.M01.O01', 'fa', 'provenance.json'), 'utf-8'));
ok(faProv.lineage.length === 1 && faProv.lineage[0].node_id === O1 && faProv.lineage[0].relation === 'parent',
  'stamp.js writes parent lineage in provenance.json');

// ---- 6. validate the built course: OK ----
const v1 = run([path.join(TOOLS, 'validate.js'), 'course', courseDir]);
ok(v1.status === 0 && /(^|\n)OK\n/.test(v1.stdout), 'validate.js course on the built course -> OK');
if (v1.status !== 0) process.stdout.write(v1.stdout);

// ---- 7. corrupt a hash -> FAIL ----
const corruptPath = path.join(nodesDir, 'L01.M01.O01', 'node.json');
const corrupt = JSON.parse(fs.readFileSync(corruptPath, 'utf-8'));
corrupt.content_sha256 = '0'.repeat(64);
fs.writeFileSync(corruptPath, JSON.stringify(corrupt, null, 2) + '\n');
const v2 = run([path.join(TOOLS, 'validate.js'), 'course', courseDir]);
ok(v2.status === 1 && /FAIL/.test(v2.stdout) && /content_sha256 mismatch/.test(v2.stdout),
  'validate.js course detects a corrupted content_sha256 -> FAIL');

// ---- 8. run validate.js over the shipped fixtures ----
const FCOURSE = path.join('fixtures', 'courses', 'cell-biology-obsidian');
const FLEARNER = path.join('fixtures', 'learners', 'lrn-fixture01');
if (fs.existsSync(path.join(REPO, FCOURSE))) {
  const vc = run([path.join(TOOLS, 'validate.js'), 'course', FCOURSE]);
  ok(vc.status === 0 && /(^|\n)OK\n/.test(vc.stdout), 'validate.js course on fixture -> OK');
  if (vc.status !== 0) process.stdout.write(vc.stdout);

  const vl = run([path.join(TOOLS, 'validate.js'), 'learner', FLEARNER, '--course', FCOURSE]);
  ok(vl.status === 0 && /(^|\n)OK\n/.test(vl.stdout), 'validate.js learner on fixture -> OK');
  if (vl.status !== 0) process.stdout.write(vl.stdout);

  // FIXTURE HASH MISMATCH check: canon.js must reproduce the stored content_sha256.
  let hashMismatch = null;
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const fp = path.join(dir, e.name);
      if (e.isDirectory()) walk(fp);
      else if (e.name === 'node.json') {
        const n = JSON.parse(fs.readFileSync(fp, 'utf-8'));
        if (n.content_sha256 && n.content_sha256 !== 'runtime') {
          const got = canon.sha256Hex(n.core || {});
          if (got !== n.content_sha256 && !hashMismatch) {
            hashMismatch = fp + ' stored=' + n.content_sha256 + ' recomputed=' + got;
          }
        }
      }
    }
  })(path.join(REPO, FCOURSE, 'nodes'));
  ok(!hashMismatch, 'no FIXTURE HASH MISMATCH' + (hashMismatch ? ': ' + hashMismatch : ''));
} else {
  process.stdout.write('# fixtures not present, skipping fixture checks\n');
}

// ---- cleanup ----
try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* ignore */ }

process.stdout.write('\n' + (failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)') + '\n');
require('./run_b.js'); // Part B tests (assemble.js, apply_packet.js)
require('./run_c.js'); // Part C tests (B13 fix wave: stamp/apply/assemble/validate)
process.exit(failures === 0 ? 0 : 1);
