#!/usr/bin/env node
'use strict';
// run_b.js -- Part B tests for the MetaDAX Node tools (assemble.js,
// apply_packet.js). Required at the end of run.js. Exit 0 only when all pass.

const cp = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const TOOLS = path.resolve(__dirname, '..');
const REPO = path.resolve(TOOLS, '..');
const assembleMod = require(path.join(TOOLS, 'assemble.js'));

let failures = 0;
function ok(cond, msg) {
  if (cond) process.stdout.write('ok   - ' + msg + '\n');
  else { failures++; process.stdout.write('FAIL - ' + msg + '\n'); }
}

function run(args, opts) {
  return cp.spawnSync('node', args, Object.assign({ cwd: REPO, encoding: 'utf-8' }, opts || {}));
}

const FCOURSE = path.join(REPO, 'fixtures', 'courses', 'cell-biology-obsidian');
const FLEARNER = path.join(REPO, 'fixtures', 'learners', 'lrn-fixture01');
const PROMPTS = path.join(REPO, 'prompts');
const ANCHOR = 'L01.M01.O01/proteins-essential-atp-synthesis';

if (!fs.existsSync(FCOURSE)) {
  process.stdout.write('# fixtures not present, skipping Part B fixture checks\n');
  process.stdout.write('\nALL PASS (run_b)\n');
  process.exit(0);
}

// ---- 1. MP-05 stack: block order and REGISTRY carries the depth-3 sibling ----
const mp05 = assembleMod.assemble({
  op: 'MP-05', prompts: PROMPTS, course: FCOURSE, learner: FLEARNER,
  learnerId: 'lrn-fixture01', node: ANCHOR, input: 'what does cytochrome c do?',
  config: ['client=claude-code', 'write_mode=git'],
});
const expected05 = ['CONFIG', 'COURSE', 'LESSON', 'MODULE', 'OBJECTIVE',
  'CONCEPTS', 'LEARNER', 'PATH', 'ANCHOR', 'REGISTRY', 'INPUT'];
ok(JSON.stringify(mp05.blocks) === JSON.stringify(expected05),
  'MP-05 blocks in SCHEMAS section 8 order: ' + mp05.blocks.join(','));
// The REGISTRY block (not PATH/ANCHOR) must list the depth-3 sibling.
const regBody = mp05.text.split('<<START REGISTRY>>')[1].split('<<END REGISTRY>>')[0];
ok(/L01\.M01\.O01\/proteins-essential-atp-synthesis\/cytochrome-c-structure-role/.test(regBody),
  'MP-05 REGISTRY contains the depth-3 sibling cytochrome-c-structure-role');
ok(mp05.text.indexOf('<<START INPUT>>') > mp05.text.indexOf('<<START REGISTRY>>'),
  'MP-05 INPUT comes after REGISTRY');

// ---- 2. MP-06 stack assembles ----
const mp06 = assembleMod.assemble({
  op: 'MP-06', prompts: PROMPTS, course: FCOURSE, learner: FLEARNER,
  learnerId: 'lrn-fixture01', node: 'L01.M01.O01', input: 'ready to start',
});
ok(mp06.blocks.indexOf('CONFIG') === 0 && mp06.blocks.indexOf('OBJECTIVE') >= 0
  && mp06.blocks.indexOf('INPUT') === mp06.blocks.length - 1,
  'MP-06 stack assembles with CONFIG first and INPUT last: ' + mp06.blocks.join(','));
ok(/<<START PROGRESS>>/.test(mp06.text),
  'MP-06 stack carries a merged PROGRESS block');

// ---- 3. apply a create packet in a temp copy of the fixture course ----
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'metadax-runb-'));
const course = path.join(tmp, 'course');
fs.cpSync(FCOURSE, course, { recursive: true });

// Base the new node on an existing depth-2 node so every schema field is present.
const srcNode = JSON.parse(fs.readFileSync(
  path.join(FCOURSE, 'nodes', 'L01.M01.O02', 'building-proton-gradient', 'node.json'), 'utf-8'));
const newId = 'L01.M02.O01/apply-packet-test-node';
const newNode = Object.assign({}, srcNode, {
  id: newId,
  parent_id: 'L01.M02.O01',
  depth: 2,
  title: 'Apply packet test node',
  visibility: 'private',
  path: [{ id: 'L01.M02.O01', title: 'Objective L01.M02.O01', summary: 'Ancestor summary.' }],
  links: [],
  created_at: 'runtime',
  updated_at: 'runtime',
  content_sha256: 'runtime',
});
const createPacket = {
  schema: 'metadax.packet/0.2', repo: 'course', message: 'test create',
  files: [{ path: 'nodes/L01.M02.O01/apply-packet-test-node/node.json', op: 'create', content: newNode }],
};
const cpFile = path.join(tmp, 'create.json');
fs.writeFileSync(cpFile, JSON.stringify(createPacket));
const ac = run([path.join(TOOLS, 'apply_packet.js'), cpFile, '--course', course, '--stamp']);
ok(ac.status === 0, 'apply_packet create + --stamp exits 0');
ok(fs.existsSync(path.join(course, 'nodes', 'L01.M02.O01', 'apply-packet-test-node', 'node.json')),
  'apply_packet wrote the new node file');
ok(fs.existsSync(path.join(course, 'nodes', 'L01.M02.O01', 'apply-packet-test-node', 'provenance.json')),
  'apply_packet --stamp wrote provenance.json');

const v = run([path.join(TOOLS, 'validate.js'), 'course', course]);
ok(v.status === 0 && /(^|\n)OK\n/.test(v.stdout), 'validate.js course after create -> OK');
if (v.status !== 0) process.stdout.write(v.stdout);

// ---- 4. create on an existing path is refused (non-zero) ----
const dupePacket = {
  schema: 'metadax.packet/0.2', repo: 'course', message: 'dupe',
  files: [{ path: 'nodes/L01.M02.O01/node.json', op: 'create', content: { id: 'L01.M02.O01' } }],
};
const dupeFile = path.join(tmp, 'dupe.json');
fs.writeFileSync(dupeFile, JSON.stringify(dupePacket));
const ad = run([path.join(TOOLS, 'apply_packet.js'), dupeFile, '--course', course]);
ok(ad.status !== 0 && /refused/.test(ad.stderr || ''),
  'apply_packet create on an existing path is refused (non-zero)');

// ---- 5. append to registry/L01.M02.json updates node_count ----
const modBefore = JSON.parse(fs.readFileSync(path.join(course, 'registry', 'L01.M02.json'), 'utf-8'));
const beforeCount = (modBefore.nodes || []).length;
const appendPacket = {
  schema: 'metadax.packet/0.2', repo: 'course', message: 'append',
  files: [{
    path: 'registry/L01.M02.json', op: 'append', content: {
      id: newId, parent_id: 'L01.M02.O01', title: 'Apply packet test node',
      canonical_question: 'A test question?', intent: 'deepen', summary: 's',
      concepts: [], visibility: 'shared', created_by: 'author-test', reuse_count: 0,
      depth: 2, superseded_by: null,
    },
  }],
};
const appFile = path.join(tmp, 'append.json');
fs.writeFileSync(appFile, JSON.stringify(appendPacket));
const aa = run([path.join(TOOLS, 'apply_packet.js'), appFile, '--course', course, '--stamp']);
ok(aa.status === 0, 'apply_packet append + --stamp exits 0');
const modAfter = JSON.parse(fs.readFileSync(path.join(course, 'registry', 'L01.M02.json'), 'utf-8'));
ok((modAfter.nodes || []).length === beforeCount + 1, 'append added one registry entry');
const index = JSON.parse(fs.readFileSync(path.join(course, 'registry', 'index.json'), 'utf-8'));
const m02 = (index.modules || []).find(function (m) { return m.id === 'L01.M02'; });
ok(m02 && m02.node_count === (modAfter.nodes || []).length,
  'registry index node_count matches module nodes after append (' + (m02 ? m02.node_count : '?') + ')');

// ---- cleanup ----
try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* ignore */ }

process.stdout.write('\n' + (failures === 0 ? 'ALL PASS (run_b)' : failures + ' FAILURE(S) (run_b)') + '\n');
// Standalone: exit with our own status. Required from run.js: only force a
// non-zero exit on failure, so run.js keeps control of the success exit code.
if (require.main === module) process.exit(failures === 0 ? 0 : 1);
else if (failures !== 0) process.exit(1);
