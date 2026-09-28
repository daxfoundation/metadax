#!/usr/bin/env node
'use strict';
// run_c.js -- Part C tests for the B13 fix wave: stamp.js dir args + index +
// reuse (1a), apply_packet turn-vs-event stamping (1b), assemble.js numeric
// CONFIG + MP-04 generate CONTENT rule (1c), validate.js schema-skip WARN (1d).
// Required at the end of run.js. Exit 0 only when all pass.

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
const PROMPTS = path.join(REPO, 'prompts');

if (!fs.existsSync(FCOURSE)) {
  process.stdout.write('# fixtures not present, skipping Part C fixture checks\n');
  process.stdout.write('\nALL PASS (run_c)\n');
  process.exit(0);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'metadax-runc-'));
const course = path.join(tmp, 'course');
fs.cpSync(FCOURSE, course, { recursive: true });
const readJson = function (p) { return JSON.parse(fs.readFileSync(p, 'utf-8')); };

// ---- 1a. stamp.js course/node accept a DIRECTORY, not just the file ----
const sc = run([path.join(TOOLS, 'stamp.js'), 'course', course]);
ok(sc.status === 0, 'stamp.js course accepts a course directory');
const REUSE_ID = 'L01.M01.O01/proteins-essential-atp-synthesis';
const nodeDir = path.join(course, 'nodes', REUSE_ID.split('/').join(path.sep));
const sn = run([path.join(TOOLS, 'stamp.js'), 'node', nodeDir, '--by', 'author-test', '--role', 'author']);
ok(sn.status === 0, 'stamp.js node accepts a node directory');

// ---- 1a. stamp.js index creates/recounts and fills course_id ----
const idxPath = path.join(course, 'registry', 'index.json');
const courseId = readJson(path.join(course, 'course.json')).id;
// Blank the course_id and drop a module's node_count so index must recompute.
const idxBlank = readJson(idxPath);
idxBlank.course_id = 'my-course';
if (idxBlank.modules && idxBlank.modules[0]) idxBlank.modules[0].node_count = 999;
fs.writeFileSync(idxPath, JSON.stringify(idxBlank, null, 2) + '\n');
const si = run([path.join(TOOLS, 'stamp.js'), 'index', course]);
ok(si.status === 0, 'stamp.js index exits 0');
const idxAfter = readJson(idxPath);
ok(idxAfter.course_id === courseId,
  'stamp.js index fills course_id from course.json (' + idxAfter.course_id + ')');
const m0 = idxAfter.modules[0];
const m0file = path.join(course, m0.file || ('registry/' + m0.id + '.json'));
ok(m0.node_count === (readJson(m0file).nodes || []).length,
  'stamp.js index recomputes node_count (' + m0.node_count + ')');
ok(idxAfter.updated_at !== 'runtime', 'stamp.js index stamps updated_at');
// Missing index is created.
const idxTmp = path.join(tmp, 'noindex');
fs.mkdirSync(path.join(idxTmp, 'registry'), { recursive: true });
fs.writeFileSync(path.join(idxTmp, 'course.json'),
  JSON.stringify({ schema: 'metadax.course/0.2', id: 'made-fresh', title: 'x', lessons: [] }) + '\n');
run([path.join(TOOLS, 'stamp.js'), 'index', idxTmp]);
ok(fs.existsSync(path.join(idxTmp, 'registry', 'index.json'))
  && readJson(path.join(idxTmp, 'registry', 'index.json')).course_id === 'made-fresh',
  'stamp.js index creates a missing index with course_id');

// ---- 1a. stamp.js reuse bumps both counters, keeps content_sha256 ----
const modPath = path.join(course, 'registry', 'L01.M01.json');
function regEntry() { return (readJson(modPath).nodes || []).find(function (n) { return n.id === REUSE_ID; }); }
const npath = path.join(nodeDir, 'node.json');
const beforeReg = (regEntry() || {}).reuse_count || 0;
const beforeNode = (readJson(npath).stats || {}).reuse_count || 0;
const beforeSha = readJson(npath).content_sha256;
const sr = run([path.join(TOOLS, 'stamp.js'), 'reuse', course, REUSE_ID]);
ok(sr.status === 0, 'stamp.js reuse exits 0');
ok(((regEntry() || {}).reuse_count || 0) === beforeReg + 1,
  'stamp.js reuse increments the registry entry reuse_count');
ok(((readJson(npath).stats || {}).reuse_count || 0) === beforeNode + 1,
  'stamp.js reuse increments node.stats.reuse_count');
ok(readJson(npath).content_sha256 === beforeSha,
  'stamp.js reuse never touches content_sha256');

// ---- 1a-bis. reuse on a node written WITHOUT stats (as MP-04/MP-05 nodes are)
// must create a schema-valid stats object {views, reuse_count}. Found by the
// 2026-09-28 Newton E03 run (finding F-L2): stats was created as {reuse_count}
// only and validate.js --schemas failed on "stats: missing required property views".
{
  const n0 = readJson(npath); delete n0.stats; fs.writeFileSync(npath, JSON.stringify(n0, null, 2) + '\n');
  const sr2 = run([path.join(TOOLS, 'stamp.js'), 'reuse', course, REUSE_ID]);
  const st = readJson(npath).stats || {};
  ok(sr2.status === 0 && st.views === 0 && st.reuse_count === 1,
    'stamp.js reuse on a node without stats creates {views: 0, reuse_count: 1}');
}

// ---- 1b. apply_packet stamps events with ts but NEVER turns ----
const learner = path.join(tmp, 'learner');
fs.mkdirSync(learner, { recursive: true });
const sess = 'sessions/ses-20260927-test';
const packet = {
  schema: 'metadax.packet/0.2', repo: 'learner', message: 'turn+event',
  files: [
    { path: sess + '/turn-0001.json', op: 'create', content: { schema: 'metadax.tutor-turn/0.2', seq: 1, state: {} } },
    { path: sess + '/event-0001.json', op: 'create', content: { schema: 'metadax.event/0.2', seq: 1, type: 'view' } },
  ],
};
const pFile = path.join(tmp, 'te.json');
fs.writeFileSync(pFile, JSON.stringify(packet));
const ap = run([path.join(TOOLS, 'apply_packet.js'), pFile, '--learner', learner, '--stamp']);
ok(ap.status === 0, 'apply_packet turn+event with --stamp exits 0');
const turnObj = readJson(path.join(learner, sess, 'turn-0001.json'));
const eventObj = readJson(path.join(learner, sess, 'event-0001.json'));
ok(!('ts' in turnObj), 'apply_packet does NOT stamp ts onto a turn');
ok(typeof eventObj.ts === 'string' && /Z$/.test(eventObj.ts), 'apply_packet stamps ts onto an event');

// ---- 1c. numeric/boolean CONFIG serialise as JSON number/bool ----
const cfgStack = assembleMod.assemble({
  op: 'MP-02', prompts: PROMPTS, course: course,
  input: 'a topic', config: ['mode=design', 'clarify_round=1', 'named_reporting=false'],
});
const cfgBody = cfgStack.text.split('<<START CONFIG>>')[1].split('<<END CONFIG>>')[0];
ok(/"clarify_round":\s*1(\D|$)/m.test(cfgBody) && !/"clarify_round":\s*"1"/.test(cfgBody),
  'assemble emits clarify_round as a JSON number');
ok(/"named_reporting":\s*false/.test(cfgBody),
  'assemble emits named_reporting as a JSON boolean');

// ---- 1c. MP-04 generate injects no CONTENT; render does ----
const gen = assembleMod.assemble({
  op: 'MP-04', prompts: PROMPTS, course: course, node: 'L01.M01.O01',
  config: ['mode=generate'],
});
ok(gen.blocks.indexOf('CONTENT') < 0,
  'MP-04 generate produces no CONTENT block: ' + gen.blocks.join(','));
ok(gen.blocks.indexOf('OBJECTIVE') >= 0 && gen.blocks.indexOf('CONCEPTS') >= 0,
  'MP-04 generate still carries OBJECTIVE/CONCEPTS from course.json');
const ren = assembleMod.assemble({
  op: 'MP-04', prompts: PROMPTS, course: course, node: 'L01.M01.O01',
  config: ['mode=render'],
});
ok(ren.blocks.indexOf('CONTENT') >= 0,
  'MP-04 render still injects the existing node as CONTENT');

// ---- 1c-bis. MP-07 takes its item from --content, not from the node ----
{
  const itemFile = path.join(tmp, 'item.json');
  fs.writeFileSync(itemFile, JSON.stringify({ id: 'L01.M01.O01#p01', concept: 'x', bloom_level: 'Remember',
    question_type: 'True/False', grading: 'exact', question: 'q', answer: 'True', explanation: 'e' }));
  const ev7 = assembleMod.assemble({
    op: 'MP-07', prompts: PROMPTS, course: course, node: 'L01.M01.O01',
    input: 'True', content: itemFile,
  });
  const body7 = ev7.text.split('<<START CONTENT>>')[1].split('<<END CONTENT>>')[0];
  ok(/L01\.M01\.O01#p01/.test(body7) && !/"sections"/.test(body7),
    'MP-07 --content puts the practice item (not the node sections) in CONTENT');
}

// ---- 1d. validate.js WARNs when no schemas/ is found; --schemas silences it ----
const vNoSchema = run([path.join(TOOLS, 'validate.js'), 'course', course]);
ok(/WARN: schema validation skipped \(no schemas\/ found; pass --schemas <dir>\)/.test(vNoSchema.stdout),
  'validate.js prints the schema-skipped WARN when no schemas/ is found');
const vWith = run([path.join(TOOLS, 'validate.js'), 'course', course, '--schemas', path.join(REPO, 'schemas')]);
ok(!/schema validation skipped/.test(vWith.stdout),
  'validate.js --schemas <dir> runs schema checks (no skip WARN)');
ok(vWith.status === 0 && /(^|\n)OK\n/.test(vWith.stdout),
  'validate.js --schemas on the fixture copy -> OK');

// ---- cleanup ----
try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* ignore */ }

process.stdout.write('\n' + (failures === 0 ? 'ALL PASS (run_c)' : failures + ' FAILURE(S) (run_c)') + '\n');
if (require.main === module) process.exit(failures === 0 ? 0 : 1);
else if (failures !== 0) process.exit(1);
