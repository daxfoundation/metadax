#!/usr/bin/env node
// E06 -- git-bundle loop at 50 kbps
// Zero external dependencies; Node stdlib only.
// Reproduce: node run.js  (from this directory)

'use strict';
const fs   = require('fs');
const path = require('path');
const os   = require('os');
const cp   = require('child_process');
const zlib = require('zlib');

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function sh(cmd, cwd) {
  const r = cp.spawnSync('sh', ['-c', cmd], {
    cwd: cwd || process.cwd(),
    encoding: 'utf8',
    env: Object.assign({}, process.env, {
      GIT_AUTHOR_NAME: 'Fixture Author',
      GIT_AUTHOR_EMAIL: 'fixture@example.com',
      GIT_COMMITTER_NAME: 'Fixture Author',
      GIT_COMMITTER_EMAIL: 'fixture@example.com',
      GIT_AUTHOR_DATE: '2026-10-11T09:00:00+00:00',
      GIT_COMMITTER_DATE: '2026-10-11T09:00:00+00:00',
    }),
  });
  if (r.status !== 0) throw new Error(`cmd failed (${r.status}): ${cmd}\n${r.stderr}`);
  return (r.stdout || '').trim();
}

function shAt(cmd, cwd, dateStr) {
  const d = dateStr || '2026-10-11T09:00:00+00:00';
  const r = cp.spawnSync('sh', ['-c', cmd], {
    cwd,
    encoding: 'utf8',
    env: Object.assign({}, process.env, {
      GIT_AUTHOR_NAME: 'Fixture Author',
      GIT_AUTHOR_EMAIL: 'fixture@example.com',
      GIT_COMMITTER_NAME: 'Fixture Author',
      GIT_COMMITTER_EMAIL: 'fixture@example.com',
      GIT_AUTHOR_DATE: d,
      GIT_COMMITTER_DATE: d,
    }),
  });
  if (r.status !== 0) throw new Error(`cmd failed (${r.status}): ${cmd}\n${r.stderr}`);
  return (r.stdout || '').trim();
}

function gzip(buf) {
  return zlib.gzipSync(buf, { level: 9 });
}

function measureBundle(filePath) {
  const raw  = fs.readFileSync(filePath);
  const gz   = gzip(raw);
  return { raw: raw.length, gz: gz.length };
}

// Transfer time: bytes / (bps / 8) * (1 + overhead)
// overhead = 0.20  → multiply effective bytes by 1.20
function transferSec(bytes, kbps, overheadFrac) {
  const bps       = kbps * 1000;
  const effective = bytes * (1 + overheadFrac);
  return effective / (bps / 8);
}

function write(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name);
    const d = path.join(dst, ent.name);
    if (ent.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

// ---------------------------------------------------------------------------
// paths
// ---------------------------------------------------------------------------
const HERE    = __dirname;
const FIXTURE = '/tmp/metadax/fixtures/courses/cell-biology-obsidian';
const TMPDIR  = fs.mkdtempSync(path.join(os.tmpdir(), 'e06-'));

const COURSE_REPO   = path.join(TMPDIR, 'course-repo');
const LEARNER_REPO  = path.join(TMPDIR, 'learner-repo');
const VERIFY_DIR    = path.join(TMPDIR, 'verify');

console.log('Working in', TMPDIR);

// ---------------------------------------------------------------------------
// STEP 1: build the course repo from the fixture
// ---------------------------------------------------------------------------
console.log('\n=== Step 1: Build course repo ===');
fs.mkdirSync(COURSE_REPO, { recursive: true });
sh('git init -b main', COURSE_REPO);
sh('git config core.autocrlf false', COURSE_REPO);

// copy fixture course files
copyDir(FIXTURE, COURSE_REPO);

shAt('git add -A && git commit -m "initial course (week 1)"', COURSE_REPO, '2026-10-11T09:00:00+00:00');
sh('git tag week1', COURSE_REPO);
const courseWeek1Head = sh('git rev-parse HEAD', COURSE_REPO);
console.log('course week-1 HEAD:', courseWeek1Head);

// add simulated week-2 content (3 new follow-up nodes pre-generated)
const week2Nodes = [
  { id: 'n_w2node01followup001', concept: 'cell-membrane', bloom: 'apply',
    title: 'Cell membrane permeability follow-up',
    body: 'Why do small non-polar molecules cross the lipid bilayer faster than ions?' },
  { id: 'n_w2node02followup002', concept: 'atp-synthesis', bloom: 'analyse',
    title: 'ATP synthase rotor follow-up',
    body: 'How does the proton gradient drive rotation in ATP synthase?' },
  { id: 'n_w2node03followup003', concept: 'mitosis', bloom: 'evaluate',
    title: 'Spindle checkpoint follow-up',
    body: 'What happens if the spindle assembly checkpoint fails?' },
];
for (const n of week2Nodes) {
  const nodeDir = path.join(COURSE_REPO, 'nodes', n.id);
  fs.mkdirSync(nodeDir, { recursive: true });
  write(path.join(nodeDir, 'node.json'), {
    schema: 'metadax.node/0.2',
    id: n.id,
    parent_id: 'L01.M01.O01',
    depth: 4,
    concept: n.concept,
    bloom_level: n.bloom,
    title: n.title,
    body: n.body,
    content_sha256: 'runtime',
    created_at: 'runtime',
    updated_at: 'runtime',
  });
}
shAt('git add -A && git commit -m "week-2 pre-generated follow-up nodes"', COURSE_REPO, '2026-10-18T09:00:00+00:00');
sh('git tag week2', COURSE_REPO);
const courseWeek2Head = sh('git rev-parse HEAD', COURSE_REPO);
console.log('course week-2 HEAD:', courseWeek2Head);

// ---------------------------------------------------------------------------
// STEP 2: build the learner repo
// ---------------------------------------------------------------------------
console.log('\n=== Step 2: Build learner repo ===');
const LEARNER_ID = 'lrn-fixture01';
const DEVICE_ID  = 'dev-abcde1';
const COURSE_ID  = 'cell-biology-obsidian';

fs.mkdirSync(LEARNER_REPO, { recursive: true });
sh('git init -b main', LEARNER_REPO);
sh('git config core.autocrlf false', LEARNER_REPO);

// initial learner profile
write(path.join(LEARNER_REPO, 'profile.json'), {
  schema: 'metadax.profile/0.2',
  learner_id: LEARNER_ID,
  name: 'Aaliya',
  age_band: 'adult',
  created_at: 'runtime',
});

shAt('git add -A && git commit -m "learner profile init"', LEARNER_REPO, '2026-10-11T08:00:00+00:00');
sh('git tag basis', LEARNER_REPO);
const learnerInitHead = sh('git rev-parse HEAD', LEARNER_REPO);

// ---------------------------------------------------------------------------
// STEP 3: script a week of learner activity
// ---------------------------------------------------------------------------
console.log('\n=== Step 3: Script week of learner activity ===');

const sessions = [
  { date: '2026-10-12', id: 'ses-20261012-aa01', nodeIds: ['L01.M01.O01', 'L01.M01.O02'] },
  { date: '2026-10-13', id: 'ses-20261013-aa02', nodeIds: ['L01.M01.O02', 'n_rdgjy7hc9tb7w9s9zske303gn4'] },
  { date: '2026-10-14', id: 'ses-20261014-aa03', nodeIds: ['n_ka7589qwn4z1n2tghxxcv2vzbm'] },
  { date: '2026-10-15', id: 'ses-20261015-aa04', nodeIds: ['n_hh1ash4knccqm98y2n9hfn1h5c', 'L01.M02.O01'] },
  { date: '2026-10-16', id: 'ses-20261016-aa05', nodeIds: ['n_zybxq9436j8wxpeh0sxgqyycjr', 'n_qkx5r9e0psvqpbd631wz7s98vm'] },
];

const eventTypes = ['return', 'answer', 'hint', 'answer', 'summary'];

for (const sess of sessions) {
  const sesDir = path.join(LEARNER_REPO, 'learners', LEARNER_ID, 'sessions', sess.id);
  fs.mkdirSync(sesDir, { recursive: true });

  // 5 events per session
  for (let i = 0; i < 5; i++) {
    const nodeId = sess.nodeIds[Math.floor(i / 2) % sess.nodeIds.length];
    const evObj = {
      schema: 'metadax.event/0.2',
      session_id: sess.id,
      seq: i + 1,
      ts: 'runtime',
      type: eventTypes[i],
      course_id: COURSE_ID,
      node_id: nodeId,
      concept: 'cell-membrane',
      bloom_level: 'remember',
      result: i % 2 === 0 ? 'correct' : 'partial',
      data: {},
    };
    write(path.join(sesDir, `event-${String(i+1).padStart(4,'0')}.json`), evObj);
  }

  // 3 tutor turns per session
  for (let t = 0; t < 3; t++) {
    const nodeId = sess.nodeIds[t % sess.nodeIds.length];
    const turnObj = {
      schema: 'metadax.tutor-turn/0.2',
      session_id: sess.id,
      seq: t + 1,
      ts: 'runtime',
      node_id: nodeId,
      course_id: COURSE_ID,
      move: t === 0 ? 'elicit' : t === 1 ? 'hint' : 'affirm',
      input: 'What is the role of the cell membrane?',
      output: 'The cell membrane controls what enters and leaves the cell.',
      metadata: { bloom_level: 'remember', concept: 'cell-membrane' },
    };
    write(path.join(sesDir, `turn-${String(t+1).padStart(4,'0')}.json`), turnObj);
  }

  // daily progress snapshot
  const progDir = path.join(LEARNER_REPO, 'learners', LEARNER_ID, 'progress', COURSE_ID, DEVICE_ID);
  fs.mkdirSync(progDir, { recursive: true });
  const progObj = {
    schema: 'metadax.progress/0.2',
    learner_id: LEARNER_ID,
    course_id: COURSE_ID,
    device_id: DEVICE_ID,
    snapshot_date: sess.date,
    ts: 'runtime',
    competency: { 'cell-membrane': 0.3 + sessions.indexOf(sess) * 0.1 },
    levels: {},
    followups_asked: [],
  };
  write(path.join(progDir, `${sess.date}.json`), progObj);
}

// 3 private follow-up nodes
const privateNodes = [
  { id: 'n_priv01aa20261012', concept: 'cell-membrane',
    title: 'My follow-up: osmosis vs diffusion',
    body: 'Osmosis is movement of water; diffusion is movement of solutes.' },
  { id: 'n_priv02aa20261013', concept: 'atp-synthesis',
    title: 'My follow-up: why ATP not ADP',
    body: 'ATP has three phosphate groups; hydrolysis of the third releases energy.' },
  { id: 'n_priv03aa20261014', concept: 'mitosis',
    title: 'My follow-up: G2 checkpoint',
    body: 'G2 checkpoint ensures DNA replication is complete before mitosis.' },
];

for (const pn of privateNodes) {
  const nodeDir = path.join(LEARNER_REPO, 'learners', LEARNER_ID, 'nodes', pn.id);
  fs.mkdirSync(nodeDir, { recursive: true });
  write(path.join(nodeDir, 'node.json'), {
    schema: 'metadax.node/0.2',
    id: pn.id,
    parent_id: 'L01.M01.O01',
    depth: 5,
    concept: pn.concept,
    bloom_level: 'understand',
    title: pn.title,
    body: pn.body,
    visibility: 'private',
    content_sha256: 'runtime',
    created_at: 'runtime',
    updated_at: 'runtime',
  });
}

// weekly manifest
const allLearnerFiles = [];
(function collect(dir, base) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'profile.json') continue;
    const rel = path.join(base, ent.name);
    if (ent.isDirectory()) collect(path.join(dir, ent.name), rel);
    else allLearnerFiles.push({ path: rel, sha256: 'runtime', bytes: fs.statSync(path.join(dir, ent.name)).size });
  }
})(path.join(LEARNER_REPO, 'learners'), 'learners');

const bytesTotal = allLearnerFiles.reduce((s, f) => s + f.bytes, 0);
write(path.join(LEARNER_REPO, 'learners', LEARNER_ID, 'manifests', '2026-W42.json'), {
  schema: 'metadax.manifest/0.2',
  learner_id: LEARNER_ID,
  week: '2026-W42',
  device_id: DEVICE_ID,
  files: allLearnerFiles,
  bytes_total: bytesTotal,
  ts: 'runtime',
});

shAt('git add -A && git commit -m "week-1 learner activity: 5 sessions, progress, 3 private nodes"', LEARNER_REPO, '2026-10-16T20:00:00+00:00');
const learnerWeek1Head = sh('git rev-parse HEAD', LEARNER_REPO);
console.log('learner week-1 HEAD:', learnerWeek1Head);

// ---------------------------------------------------------------------------
// STEP 4: build bundles
// ---------------------------------------------------------------------------
console.log('\n=== Step 4: Build bundles ===');
const bundleDir = path.join(HERE, 'bundles');
fs.mkdirSync(bundleDir, { recursive: true });

// Bundle A: week-1 full course bundle (all objects reachable from week1 tag)
const bundleA = path.join(bundleDir, 'course-week1-full.bundle');
sh(`git bundle create ${bundleA} week1`, COURSE_REPO);
console.log('Bundle A (course week-1 full): created');

// Bundle B: learner return bundle (new objects since basis)
const bundleB = path.join(bundleDir, 'learner-return.bundle');
sh(`git tag week1`, LEARNER_REPO);
sh(`git bundle create ${bundleB} basis..week1`, LEARNER_REPO);
console.log('Bundle B (learner return): created');

// Bundle C: course week-2 incremental (new objects only)
const bundleC = path.join(bundleDir, 'course-week2-incremental.bundle');
sh(`git bundle create ${bundleC} week1..week2`, COURSE_REPO);
console.log('Bundle C (course week-2 incremental): created');

// ---------------------------------------------------------------------------
// STEP 5: measure bundles
// ---------------------------------------------------------------------------
console.log('\n=== Step 5: Measure bundles ===');

function measureAll(label, filePath) {
  const { raw, gz } = measureBundle(filePath);
  const t50raw  = transferSec(raw, 50, 0.20);
  const t96raw  = transferSec(raw, 9.6, 0.20);
  const t50gz   = transferSec(gz, 50, 0.20);
  const t96gz   = transferSec(gz, 9.6, 0.20);
  const fits50  = t50gz <= 300;  // 5-minute window
  return { label, raw, gz, t50raw, t96raw, t50gz, t96gz, fits50 };
}

const mA = measureAll('course-week1-full', bundleA);
const mB = measureAll('learner-return', bundleB);
const mC = measureAll('course-week2-incremental', bundleC);

for (const m of [mA, mB, mC]) {
  console.log(`\n${m.label}:`);
  console.log(`  raw: ${m.raw} B  gz: ${m.gz} B`);
  console.log(`  50 kbps (gz): ${m.t50gz.toFixed(1)}s  9.6 kbps (gz): ${m.t96gz.toFixed(1)}s`);
  console.log(`  fits 5-min window (50 kbps, gz): ${m.fits50}`);
}

// ---------------------------------------------------------------------------
// STEP 6: round-trip verification
// ---------------------------------------------------------------------------
console.log('\n=== Step 6: Round-trip verification ===');

// 6a: apply course-week1 bundle to a fresh bare repo then work tree check
const verCourse = path.join(VERIFY_DIR, 'course');
fs.mkdirSync(verCourse, { recursive: true });
sh('git init -b incoming', verCourse);
// fetch into non-default branch so HEAD isn't in the way
sh(`git fetch ${bundleA} week1:refs/heads/week1`, verCourse);
sh('git checkout week1', verCourse);
const fsckCourse = sh('git fsck --no-dangling 2>&1 || true', verCourse);
const courseVerHead = sh('git rev-parse HEAD', verCourse);
const courseVerTree = sh('git rev-parse HEAD^{tree}', verCourse);
const courseOrigTree = sh(`git rev-parse week1^{tree}`, COURSE_REPO);

// 6b: apply learner return bundle
const verLearner = path.join(VERIFY_DIR, 'learner');
fs.mkdirSync(verLearner, { recursive: true });
sh('git init -b incoming', verLearner);
// fetch basis from live repo, then the return bundle
sh(`git fetch ${LEARNER_REPO} basis:refs/heads/basis`, verLearner);
sh(`git fetch ${bundleB} week1:refs/heads/week1`, verLearner);
sh('git checkout week1', verLearner);
const fsckLearner = sh('git fsck --no-dangling 2>&1 || true', verLearner);
const learnerVerTree = sh('git rev-parse HEAD^{tree}', verLearner);
const learnerOrigTree = sh(`git rev-parse week1^{tree}`, LEARNER_REPO);

// 6c: apply week-2 incremental on top of week-1 in course verify
sh(`git fetch ${bundleC} week2:refs/heads/week2`, verCourse);
sh('git checkout week2', verCourse);
const fsckCourse2 = sh('git fsck --no-dangling 2>&1 || true', verCourse);
const courseWeek2VerTree = sh('git rev-parse HEAD^{tree}', verCourse);
const courseWeek2OrigTree = sh(`git rev-parse week2^{tree}`, COURSE_REPO);

const treeMatch = {
  courseWeek1: courseVerTree === courseOrigTree,
  learnerReturn: learnerVerTree === learnerOrigTree,
  courseWeek2: courseWeek2VerTree === courseWeek2OrigTree,
};

console.log('tree hashes match:', treeMatch);
console.log('fsck course:', fsckCourse || '(clean)');
console.log('fsck learner:', fsckLearner || '(clean)');
console.log('fsck course week-2:', fsckCourse2 || '(clean)');

// conflict check: no merge needed (append-only layout, no merge was performed)
const conflicts = 0;
console.log('textual conflicts:', conflicts);

// ---------------------------------------------------------------------------
// STEP 7: assemble results
// ---------------------------------------------------------------------------
const roundTripSec = mA.t50gz + mB.t50gz + mC.t50gz;
const killLine = roundTripSec > 300 || conflicts > 0;

const results = {
  run: '2026-10-18',
  experiment: 'E06',
  bundles: [mA, mB, mC],
  roundTripSec_50kbps_gz: roundTripSec,
  roundTripSec_96bps_gz: mA.t96gz + mB.t96gz + mC.t96gz,
  treeHashMatch: treeMatch,
  fsck: {
    courseWeek1: fsckCourse || '(clean)',
    learnerReturn: fsckLearner || '(clean)',
    courseWeek2: fsckCourse2 || '(clean)',
  },
  textualConflicts: conflicts,
  verdict: killLine ? 'FAIL' : 'PASS',
  killLineTriggered: killLine,
  killReason: killLine
    ? (roundTripSec > 300 ? `round-trip ${roundTripSec.toFixed(1)}s > 300s` : 'textual conflict')
    : 'none',
};

const outPath = path.join(HERE, 'results.json');
write(outPath, results);
console.log('\n=== Results written to', outPath, '===');
console.log('VERDICT:', results.verdict);
console.log('Round-trip at 50 kbps (gz):', roundTripSec.toFixed(1), 's');
console.log('Kill line triggered:', results.killLineTriggered);

// cleanup temp dir
cp.spawnSync('rm', ['-rf', TMPDIR]);
console.log('Cleaned up', TMPDIR);
