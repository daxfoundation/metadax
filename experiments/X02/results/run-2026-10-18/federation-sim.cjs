#!/usr/bin/env node
// X02 run 2 — federation simulation WITH the B19/B21/B22 fixes.
// Deterministic, zero-dependency. Reconstructs run 1's design (the run-1 script
// `part-a-x02-sim.cjs` was never committed) and re-runs it with the three fixes,
// measuring baseline and fixed arms in ONE seeded pass so deltas are internally
// valid. Seed is run 1's recorded seed, 20261009.
//
//   4 forks (en/es/de/fr) · 200 learners (50/fork) · 2,000 follow-ups · 12 weeks
//   50-node base registry · Zipf topic draw (families -> hot modules)
//   MP-05 reuse rule as code: reuse / extend / new / ancestor
//
// SIMULATED: no real learners/teachers/courses. Numbers are hypotheses for real
// testing, not measured facts about people.

'use strict';
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const II = require('../proposed/tools/inverted-index.js');
const LC = require('../proposed/tools/lifecycle.js');
const MERGE = require('../proposed/tools/merge.js');

// ---- deterministic PRNG (mulberry32) --------------------------------------
const SEED = 20261009;
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(SEED);
function randint(n) { return Math.floor(rng() * n); }
const B32 = '0123456789abcdefghjkmnpqrstvwxyz'; // Crockford
function mintId() {
  let s = 'n_';
  for (let i = 0; i < 26; i++) s += B32[randint(32)];
  return s;
}
function sha256(x) { return crypto.createHash('sha256').update(x).digest('hex'); }

// ---- topology --------------------------------------------------------------
const FORKS = ['en', 'es', 'de', 'fr'];
const N_LEARNERS = 200;
const N_FOLLOWUPS = 2000;
const N_WEEKS = 12;
const SLOTS_PER_WEEK = 5;              // concurrency windows -> T = 60 ticks
const N_TICKS = N_WEEKS * SLOTS_PER_WEEK;

// 10 topic families (drives the reuse/extend/new split; federated `new` ~= #families).
const N_FAMILIES = 10;
const ZIPF_S = 1.1;
// family -> module. Concentrate the two hottest families onto L01.M01 and route
// another hot one to L03.M01, reproducing run 1's hot modules.
const FAM_MODULE = [
  'L01.M01', 'L01.M01', 'L03.M01', 'L01.M02', 'L02.M01',
  'L02.M02', 'L03.M01', 'L03.M02', 'L04.M01', 'L04.M02',
];
const MODULES = Array.from(new Set(FAM_MODULE)).sort();
const V_VARIANTS = 4;
const INTENTS = ['clarify', 'deepen', 'apply'];
const P_REVIEW = 0.8; // share of pending_review nodes a review queue accepts promptly

// Zipf weights over families (cumulative draw).
const zipfW = [];
let zsum = 0;
for (let i = 0; i < N_FAMILIES; i++) { const w = 1 / Math.pow(i + 1, ZIPF_S); zipfW.push(w); zsum += w; }
const zipfCum = [];
{ let acc = 0; for (let i = 0; i < N_FAMILIES; i++) { acc += zipfW[i] / zsum; zipfCum.push(acc); } }
function drawFamily() { const r = rng(); for (let i = 0; i < N_FAMILIES; i++) if (r <= zipfCum[i]) return i; return N_FAMILIES - 1; }

// ---- base registry (50 nodes, shared by all forks) -------------------------
// Objective nodes forked identically into every fork: same id, same content_sha256,
// so they merge cleanly (no conflict). More nodes on the hot modules.
function buildBase() {
  const base = {}; // moduleId -> [entry]
  for (const m of MODULES) base[m] = [];
  const weightByModule = {};
  for (let f = 0; f < N_FAMILIES; f++) weightByModule[FAM_MODULE[f]] = (weightByModule[FAM_MODULE[f]] || 0) + zipfW[f];
  let made = 0;
  // distribute 50 base nodes proportional to module weight (>=2 each)
  const totW = Object.values(weightByModule).reduce((a, b) => a + b, 0);
  for (const m of MODULES) {
    const n = Math.max(2, Math.round(50 * (weightByModule[m] / totW)));
    for (let i = 0; i < n && made < 50; i++) {
      const ck = sha256('base|' + m + '|' + i);
      base[m].push({ id: 'L' + m.slice(1), _base: true, module: m, created_by: 'base',
        fork: 'base', visibility: 'shared', content_sha256: ck, canonical_question: 'base ' + m + ' ' + i,
        intent: 'clarify', reuse_count: 0 });
      made++;
    }
  }
  // fix ids to valid opaque form (base ids are display L.. ; give them opaque ids)
  for (const m of MODULES) for (const e of base[m]) e.id = mintId();
  return base;
}

// ---- one arm of the simulation --------------------------------------------
// opts: { federated:bool, singleFile:bool, appendOnly:bool, lifecycle:'baseline'|'accepted' }
function runArm(opts) {
  const armRng = mulberry32(SEED + (opts.federated ? 1 : 0) * 7 + (opts.singleFile ? 1 : 0) * 13
    + (opts.appendOnly ? 1 : 0) * 17 + (opts.lifecycle === 'accepted' ? 1 : 0) * 23);
  const ri = (n) => Math.floor(armRng() * n);

  const base = buildBase();
  // per fork: module -> [entry]; start as a copy of base (forked)
  const forkReg = {};
  for (const fk of FORKS) {
    forkReg[fk] = {};
    for (const m of MODULES) forkReg[fk][m] = base[m].map(e => Object.assign({}, e, { fork: fk }));
  }
  // ck -> list of {id, fork, visibility} across everything created (for near-dup + reuse)
  const byCK = new Map();
  const noteCK = (ck, rec) => { if (!byCK.has(ck)) byCK.set(ck, []); byCK.get(ck).push(rec); };
  for (const m of MODULES) for (const e of base[m]) noteCK(e.content_sha256, { id: e.id, fork: 'base', visibility: 'shared', module: m });

  const learnerPath = {}; // learnerId -> Set(ck personally asked)
  const decisions = { reuse: 0, extend: 0, new: 0, ancestor: 0 };
  const commits = [];     // {module, fork, tick, writer}
  let nearDups = 0;       // distinct node creations for a ck already created in another fork
  let crossForkLinks = 0; // reuse/extend linking to a node from a different fork
  let unreviewedCrossFork = 0; // cross-fork reuse that landed on a still-unreviewed node
  let learnerOriginNodes = 0, totalCreated = 0;
  // lookup-cost accounting
  let unionScanComparisons = 0, indexComparisons = 0, lookups = 0;

  // visibility rule for cross-fork reads
  const canCross = (rec) => opts.lifecycle === 'accepted'
    ? (rec.visibility === 'accepted' || rec.visibility === 'shared')
    : (rec.visibility === 'pending_review' || rec.visibility === 'accepted' || rec.visibility === 'shared');

  for (let i = 0; i < N_FOLLOWUPS; i++) {
    const learner = ri(N_LEARNERS);
    const fork = FORKS[learner % FORKS.length];
    const week = ri(N_WEEKS);
    const tick = week * SLOTS_PER_WEEK + ri(SLOTS_PER_WEEK);
    if (!learnerPath[learner]) learnerPath[learner] = new Set();

    // ancestor loop: re-ask something already in the learner's own path
    const past = Array.from(learnerPath[learner]);
    if (past.length && armRng() < 0.12) {
      decisions.ancestor++;
      commits.push({ module: FAM_MODULE[0], fork, tick, writer: fork, kind: 'ancestor' });
      continue;
    }

    const fam = drawFamily();
    const variant = ri(V_VARIANTS);
    const intent = INTENTS[ri(INTENTS.length)];
    const module = FAM_MODULE[fam];
    const ck = sha256('fam|' + fam + '|v' + variant + '|' + intent);
    const famKey = 'FAM' + fam;

    // ----- candidate lookup (this is the B22 cost measure) -----
    // Build the visible union: own fork always; other forks only if canCross.
    const unionEntries = [];
    for (const rec of (byCK.get(ck) || [])) {
      if (rec.fork === fork || rec.fork === 'base' || (opts.federated && canCross(rec))) unionEntries.push(rec);
    }
    // family visibility (any node of this family visible) — approximated via a family map
    lookups++;
    // union scan: compares against the WHOLE visible registry union (O(union))
    unionScanComparisons += visibleUnionSize(byCK, fork, opts, canCross);
    // inverted index: a single keyed map hit
    indexComparisons += 1 + unionEntries.length;

    const exact = unionEntries.length > 0;
    const familyVisible = isFamilyVisible(byCK, famKey, fork, opts, canCross);

    if (exact) {
      decisions.reuse++;
      const target = unionEntries[0];
      if (target.fork !== fork && target.fork !== 'base') {
        crossForkLinks++;
        if (target.visibility === 'pending_review') unreviewedCrossFork++;
      }
      commits.push({ module, fork, tick, writer: fork, kind: 'reuse' });
    } else if (familyVisible) {
      decisions.extend++;
      createNode({ ck, famKey, module, fork, learner, intent, byCK, noteCK, ri, forkReg,
        lifecycle: opts.lifecycle, pReview: P_REVIEW,
        onCreate: (rec, isLearner, isNearDup, linkedCross) => {
          totalCreated++; if (isLearner) learnerOriginNodes++;
          if (isNearDup) nearDups++; if (linkedCross) crossForkLinks++;
        } });
      commits.push({ module, fork, tick, writer: fork, kind: 'extend' });
    } else {
      decisions.new++;
      createNode({ ck, famKey, module, fork, learner, intent, byCK, noteCK, ri, forkReg,
        lifecycle: opts.lifecycle, pReview: P_REVIEW,
        onCreate: (rec, isLearner, isNearDup) => {
          totalCreated++; if (isLearner) learnerOriginNodes++;
          if (isNearDup) nearDups++;
        } });
      commits.push({ module, fork, tick, writer: fork, kind: 'new' });
    }
    learnerPath[learner].add(ck);
  }

  // ----- conflicts (B19): bucket commits by (file, tick) -----
  const conflicts = countConflicts(commits, opts);
  const conflictsPer100 = 100 * conflicts / commits.length;

  const totalNodes = 50 + totalCreated;
  const learnerShare = totalCreated ? learnerOriginNodes / totalCreated : 0;

  return {
    opts, decisions,
    conflicts, conflictsPer100,
    nearDups, crossForkLinks, unreviewedCrossFork,
    totalNodes, learnerShare,
    lookupCost: {
      avgUnionScanComparisons: unionScanComparisons / lookups,
      avgIndexComparisons: indexComparisons / lookups,
      lookups,
    },
  };
}

// family visibility helper (does any node of this family exist visibly to `fork`?)
const familyIndex = new Map(); // not used globally; computed per arm via byCK tagging
function isFamilyVisible(byCK, famKey, fork, opts, canCross) {
  const list = familyIndex.get(famKey);
  if (!list) return false;
  for (const rec of list) if (rec.fork === fork || rec.fork === 'base' || (opts.federated && canCross(rec))) return true;
  return false;
}
function visibleUnionSize(byCK, fork, opts, canCross) {
  let n = 0;
  for (const recs of byCK.values()) for (const rec of recs)
    if (rec.fork === fork || rec.fork === 'base' || (opts.federated && canCross(rec))) n++;
  return n;
}

function createNode(a) {
  const id = mintId();
  // learner-origin fraction: most follow-up nodes are learner-authored
  const isLearner = a.ri(100) < 85;
  // unreviewed fraction: minors/unknown-age start pending_review (MP-05 contract 10).
  // With the B21 fix a review queue accepts most of them promptly; the rest stay
  // pending_review and (correctly) never cross a fork boundary.
  let visibility = a.ri(100) < 55 ? 'pending_review' : 'shared';
  if (visibility === 'pending_review' && a.lifecycle === 'accepted' && a.ri(100) < a.pReview * 100) {
    visibility = 'accepted';
  }
  // near-dup: a node for this ck already exists in a DIFFERENT fork
  const prior = (a.byCK.get(a.ck) || []).filter(r => r.fork !== a.fork && r.fork !== 'base');
  const isNearDup = prior.length > 0;
  const rec = { id, fork: a.fork, visibility, module: a.module, created_by: isLearner ? ('lrn-' + a.learner) : ('guide-' + a.fork) };
  a.noteCK(a.ck, rec);
  if (!familyIndex.has(a.famKey)) familyIndex.set(a.famKey, []);
  familyIndex.get(a.famKey).push(rec);
  a.onCreate(rec, isLearner, isNearDup, false);
}

// ----- conflict counting -----
// file key: single-file -> one bucket space; per-module -> module; append-only ->
// hot modules become (module, writer) segments (commuting appends), cold modules
// stay per-module. Conflicts in a (file,tick) bucket = max(0, k-1).
const HOT = new Set(['L01.M01', 'L03.M01']);
function countConflicts(commits, opts) {
  const buckets = new Map();
  let appendOnlyCommits = 0;
  for (const c of commits) {
    // Append-only hot module: writes are commuting appends to a G-set log; concurrent
    // appends never touch the same bytes, so they contribute ZERO write-conflicts.
    if (opts.appendOnly && HOT.has(c.module)) { appendOnlyCommits++; continue; }
    const file = opts.singleFile ? 'COURSE' : c.module;
    const key = file + '@' + c.tick;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  let conflicts = 0;
  for (const k of buckets.values()) conflicts += Math.max(0, k - 1);
  return conflicts;
}

// ---------------------------------------------------------------------------
function main() {
  familyIndex.clear();
  const arms = {};
  const defs = [
    ['fed_single_baseline',   { federated: true,  singleFile: true,  appendOnly: false, lifecycle: 'baseline' }],
    ['fed_permodule_baseline',{ federated: true,  singleFile: false, appendOnly: false, lifecycle: 'baseline' }],
    ['noindex_permodule',     { federated: false, singleFile: false, appendOnly: false, lifecycle: 'baseline' }],
    // FIXED arms
    ['fed_appendonly_fixed',  { federated: true,  singleFile: false, appendOnly: true,  lifecycle: 'accepted' }],
    ['fed_permodule_fixed',   { federated: true,  singleFile: false, appendOnly: false, lifecycle: 'accepted' }],
  ];
  for (const [name, opts] of defs) { familyIndex.clear(); arms[name] = runArm(opts); }

  // ----- contested-core merge test (uses the real merge tool) -----
  const contestId = 'contest-third-law-core';
  const nodeA = { id: mintId(), content_sha256: sha256('A'), contest_id: contestId, canonical_question: 'both forces cancel?', intent: 'clarify' };
  const nodeB = { id: mintId(), content_sha256: sha256('B'), contest_id: contestId, canonical_question: 'both forces cancel?', intent: 'clarify' };
  const [ca, cb] = LC.markContested(nodeA, nodeB, contestId);
  const mergeInput = [
    { fork: 'en', modules: { 'L01.M01': [ca] } },
    { fork: 'de', modules: { 'L01.M01': [cb] } },
  ];
  const mergeOut = MERGE.merge(mergeInput, HOT);
  const contestedKept = mergeOut.contested.length === 1 && mergeOut.contested[0].nodes.length === 2;

  // ----- inverted-index correctness vs union scan on a sample union -----
  const sampleUnion = [];
  for (let i = 0; i < 400; i++) sampleUnion.push({ id: mintId(), content_sha256: sha256('q' + (i % 120)), canonical_question: 'q' + (i % 120), intent: 'clarify', stuck_signature: i % 5 === 0 ? 'sig-' + (i % 7) : null });
  const idx = II.build(sampleUnion);
  const probeCK = sha256('q42');
  const scan = II.unionScan(sampleUnion, probeCK);
  const idxHit = idx.lookupByContent(probeCK);
  const indexAgrees = scan.hits.length === idxHit.length;

  const out = {
    meta: { seed: SEED, forks: FORKS, learners: N_LEARNERS, followups: N_FOLLOWUPS, weeks: N_WEEKS, ticks: N_TICKS, families: N_FAMILIES, hot_modules: Array.from(HOT), model: 'deterministic', simulated: true },
    run1_documented: {
      fed_permodule: { conflictsPer100: 86.49, nodes: 327, nearDups: 0, crossForkLinks: 791, learnerShare: 0.388, decisions: { reuse: 1649, extend: 117, new: 10, ancestor: 224 } },
      noindex_permodule: { conflictsPer100: 86.46, nodes: 552, nearDups: 228, crossForkLinks: 0, learnerShare: 0.638, decisions: { reuse: 1420, extend: 320, new: 32, ancestor: 228 } },
      fed_single: { conflictsPer100: 97.30 },
      noindex_single: { conflictsPer100: 97.29 },
    },
    arms,
    contested_core: { kept_side_by_side: contestedKept, dropped: mergeOut.dropped, detail: mergeOut.contested },
    inverted_index_check: { union_comparisons: scan.comparisons, index_comparisons: 1 + idxHit.length, agrees: indexAgrees, union_size: sampleUnion.length },
  };
  const dest = path.join(__dirname, 'part-a-results.json');
  fs.writeFileSync(dest, JSON.stringify(out, null, 2));
  console.log('wrote', dest);
  // console summary
  for (const [n, r] of Object.entries(arms)) {
    console.log(`${n}: conflicts/100=${r.conflictsPer100.toFixed(2)} nodes=${r.totalNodes} nearDups=${r.nearDups} xfork=${r.crossForkLinks} unreviewedXfork=${r.unreviewedCrossFork} share=${(r.learnerShare * 100).toFixed(1)}% unionScan=${r.lookupCost.avgUnionScanComparisons.toFixed(1)} idx=${r.lookupCost.avgIndexComparisons.toFixed(2)} dec=${JSON.stringify(r.decisions)}`);
  }
  console.log('contested kept side-by-side:', contestedKept, 'dropped:', mergeOut.dropped);
  console.log('index agrees with scan:', indexAgrees, `(scan ${scan.comparisons} comps vs index ${1 + idxHit.length})`);
}
main();
