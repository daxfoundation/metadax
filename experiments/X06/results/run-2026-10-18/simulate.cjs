#!/usr/bin/env node
'use strict';
// X06 simulation — same course, every bandwidth.
// Zero-dependency Node stdlib only. All numbers derived from part2-results.json
// node-size distribution; no model calls needed (this is a byte/timing model).
//
// Outputs: run-2026-10-18/results.json

const path = require('path');
const fs   = require('fs');
const crypto = require('crypto');

const TOOLS = path.join(__dirname, '..', 'proposed', 'tools');
const { buildBundle, buildDelta, envelopeBytes } = require(path.join(TOOLS, 'bundle.cjs'));
const { DeferredQueue } = require(path.join(TOOLS, 'deferred-queue.cjs'));
const { buildShardedIndex, shardStats, shardsNeeded, SHARD_COUNT } = require(path.join(TOOLS, 'sharded-index.cjs'));

// ── node-size constants from part2-results.json scale run ────────────────────
const PKG_BYTES  = 1556;   // package bytes per node
const SIDE_BYTES = 5590;   // companion sidecar bytes per node
const IDX_BYTES  = 409;    // index entry bytes per node
const NODE_BYTES = PKG_BYTES + SIDE_BYTES;   // 7146 per node (content only)
const NODE_TOTAL = PKG_BYTES + SIDE_BYTES + IDX_BYTES;  // 7555 per node (with index entry)

// ── course model ─────────────────────────────────────────────────────────────
const NODES_PER_COURSE   = 100;  // one course
const NODES_PER_LESSON   = 10;   // objectives per lesson (10 lessons/course)
const NODES_PER_SESSION  = 2;    // learner advances 2 nodes per 5-min session
const PREFETCH_AHEAD     = 5;    // delta always carries next 5 nodes ahead of learner
const PROGRESS_REC_BYTES = 2000; // progress/session record overhead

// ── library sizes ─────────────────────────────────────────────────────────────
const LIBRARY_SIZES = [1, 10, 100];   // courses in library

// ── tiers (5 min/day except always-on) ───────────────────────────────────────
const TIERS = [
  { name: '9.6 kbps',    bps: 9600,    sessionSec: 300, alwaysOn: false },
  { name: '50 kbps',     bps: 50000,   sessionSec: 300, alwaysOn: false },
  { name: '256 kbps',    bps: 256000,  sessionSec: 300, alwaysOn: false },
  { name: '1 Mbps',      bps: 1000000, sessionSec: 300, alwaysOn: false },
  { name: '10 Mbps',     bps: 10000000, sessionSec: 86400, alwaysOn: true },
];

function bytesPerDay(tier) {
  return Math.floor(tier.bps / 8 * tier.sessionSec);
}

// ── synthetic node id generator ───────────────────────────────────────────────
function nodeId(courseIdx, nodeIdx) {
  return `c${String(courseIdx).padStart(3,'0')}-n${String(nodeIdx).padStart(4,'0')}`;
}

// ── bundle size computation ───────────────────────────────────────────────────

// Flat index entries for all nodes in a library of N courses.
function buildFlatIndex(numCourses) {
  const idx = {};
  for (let c = 0; c < numCourses; c++) {
    for (let n = 0; n < NODES_PER_COURSE; n++) {
      const id = nodeId(c, n);
      idx[id] = {
        id, course: c, seq: n,
        size: NODE_BYTES,
        hash: crypto.createHash('sha256').update(id).digest('hex').slice(0, 16),
      };
    }
  }
  return idx;
}

// Bytes the learner needs for their active course (course 0) with SHARDED index.
// Library size affects the shard file sizes but the learner only loads shards
// that contain their nodes.
function shardedBundleBytes(numCourses) {
  const allIdx = buildFlatIndex(numCourses);
  const shards = buildShardedIndex(allIdx);

  // Which shards does the learner need for course 0?
  const courseNodeIds = Array.from({ length: NODES_PER_COURSE }, (_, n) => nodeId(0, n));
  const needed = new Set(courseNodeIds.map(id => {
    const crypto2 = require('crypto');
    return crypto2.createHash('sha256').update(id).digest('hex').slice(0, 2);
  }));

  let indexBytes = 0;
  for (const key of needed) {
    indexBytes += JSON.stringify(shards[key] || {}).length;
  }

  const contentBytes = NODES_PER_COURSE * NODE_BYTES;
  return { contentBytes, indexBytes, totalBytes: contentBytes + indexBytes, shardsNeeded: needed.size };
}

// Bytes for unsharded index (full index.json must be downloaded).
function unshardedBundleBytes(numCourses) {
  const contentBytes = NODES_PER_COURSE * NODE_BYTES;
  const indexBytes   = numCourses * NODES_PER_COURSE * IDX_BYTES;
  return { contentBytes, indexBytes, totalBytes: contentBytes + indexBytes };
}

// Bytes for the first lesson (deferred-queue priority 0 items delivered first).
function firstLessonBytes(numCourses) {
  // Learner gets first NODES_PER_LESSON content nodes + their index shards.
  const allIdx = buildFlatIndex(numCourses);
  const shards  = buildShardedIndex(allIdx);
  const lessonNodeIds = Array.from({ length: NODES_PER_LESSON }, (_, n) => nodeId(0, n));
  const needed  = new Set(lessonNodeIds.map(id =>
    crypto.createHash('sha256').update(id).digest('hex').slice(0, 2)));
  let indexBytes = 0;
  for (const key of needed) indexBytes += JSON.stringify(shards[key] || {}).length;
  return NODES_PER_LESSON * NODE_BYTES + indexBytes;
}

// Delta bytes per session: PREFETCH_AHEAD new nodes + progress record.
function deltaBytes() {
  return PREFETCH_AHEAD * NODE_BYTES + PROGRESS_REC_BYTES;
}

// ── simulation ────────────────────────────────────────────────────────────────

function simulate(tier, numCourses) {
  const dailyBudget = bytesPerDay(tier);
  const sb = shardedBundleBytes(numCourses);
  const flBytes = firstLessonBytes(numCourses);
  const dBytes  = deltaBytes();

  // Days until learner can start = days to receive first lesson
  // (deferred queue sends lesson 1 nodes first, so these arrive before lesson 2+)
  const daysToStart = tier.alwaysOn ? 0 : Math.ceil(flBytes / dailyBudget);

  // Days to full course (sharded bundle)
  const daysToFull = tier.alwaysOn ? 0 : Math.ceil(sb.totalBytes / dailyBudget);

  // Session model over 30 days:
  // - Before daysToStart: no content, cache miss
  // - From daysToStart: learner has first lesson; delta (dBytes) << dailyBudget
  //   for all tiers, so prefetch always succeeds; 100% hit rate after start
  const OBS_DAYS = 30;
  const startDay = Math.min(daysToStart, OBS_DAYS);
  const sessionsMissed = startDay;  // one session/day
  const sessionsTotal  = OBS_DAYS;
  const cacheHitRate   = (sessionsTotal - sessionsMissed) / sessionsTotal;

  // Bytes used per day (averaged over obs window):
  // Phase 1 (0..daysToFull): downloading bundle at full daily budget
  // Phase 2 (daysToFull..30): delta only
  let totalBytes = 0;
  for (let d = 0; d < OBS_DAYS; d++) {
    if (d < daysToFull) {
      totalBytes += Math.min(dailyBudget, sb.totalBytes - d * dailyBudget > 0 ? dailyBudget : 0);
    } else {
      totalBytes += dBytes;  // ongoing delta per day
    }
  }
  const avgBytesPerDay = Math.round(totalBytes / OBS_DAYS);

  // Kill-line check: can a full week round-trip at 50 kbps?
  // week = initial bundle + 7 session deltas
  const weekBytes = sb.totalBytes + 7 * dBytes;
  const weekBudget50 = 7 * Math.floor(50000 / 8 * 300);  // 13,125,000 B
  const killLinePass = weekBytes <= weekBudget50;

  return {
    tier: tier.name,
    libraryCourses: numCourses,
    dailyBudgetBytes: dailyBudget,
    bundleShardedBytes: sb.totalBytes,
    bundleContentBytes: sb.contentBytes,
    bundleIndexBytes:   sb.indexBytes,
    shardsNeeded:       sb.shardsNeeded,
    firstLessonBytes:   flBytes,
    deltaBytes:         dBytes,
    daysToStart,
    daysToFull,
    cacheHitRate:       +cacheHitRate.toFixed(3),
    avgBytesPerDay,
    weekBytes,
    weekBudget50kbps:   weekBudget50,
    killLinePass,
  };
}

// ── sharded-index benchmark (B02 fix) ────────────────────────────────────────

function benchmarkShardedIndex(N) {
  const t0 = process.hrtime.bigint();

  // Build flat entries (same structure as scale run index entries)
  const flat = {};
  for (let i = 0; i < N; i++) {
    const id = 'node-' + String(i).padStart(8, '0');
    flat[id] = { id, size: NODE_TOTAL, seq: i };
  }

  const t1 = process.hrtime.bigint();
  const shards = buildShardedIndex(flat);
  const t2 = process.hrtime.bigint();

  // Measure one lookup (load the shard for a specific node)
  const lookupId = 'node-' + String(Math.floor(N / 2)).padStart(8, '0');
  const key = crypto.createHash('sha256').update(lookupId).digest('hex').slice(0, 2);
  const lookupShardStr = JSON.stringify(shards[key]);
  const t3 = process.hrtime.bigint();
  const parsed = JSON.parse(lookupShardStr);
  const t4 = process.hrtime.bigint();

  const stats = shardStats(shards);
  const totalJsonBytes = Object.values(shards).reduce((s, shard) =>
    s + JSON.stringify(shard).length, 0);

  // Compare to B02 single-file numbers
  const singleFileBytes   = N === 100000 ? 41300826 : 415008604;
  const singleFileParseMs = N === 100000 ? 160.47   : 1579.02;

  return {
    N,
    shardStats: stats,
    totalJsonBytes,
    buildMs:        Number(t2 - t1) / 1e6,
    oneLookupMs:    Number(t4 - t3) / 1e6,
    singleFileBytes,
    singleFileParseMs,
    speedupVsSingle: +(singleFileParseMs / (Number(t4 - t3) / 1e6)).toFixed(1),
    sizeReductionPct: +((1 - stats.avgShardBytes / singleFileBytes) * 100).toFixed(1),
  };
}

// ── unsharded comparison ──────────────────────────────────────────────────────

function unshardedComparison() {
  const rows = [];
  for (const lib of LIBRARY_SIZES) {
    const un = unshardedBundleBytes(lib);
    for (const tier of TIERS) {
      if (tier.alwaysOn) continue;
      const dailyBudget = bytesPerDay(tier);
      rows.push({
        tier: tier.name,
        libraryCourses: lib,
        unshardedBundleBytes: un.totalBytes,
        daysToFull: Math.ceil(un.totalBytes / dailyBudget),
      });
    }
  }
  return rows;
}

// ── run ───────────────────────────────────────────────────────────────────────

const simResults = [];
for (const tier of TIERS) {
  for (const lib of LIBRARY_SIZES) {
    simResults.push(simulate(tier, lib));
  }
}

const indexBench = [
  benchmarkShardedIndex(100000),
  benchmarkShardedIndex(1000000),
];

const unshardedComp = unshardedComparison();

const out = {
  run: '2026-10-18',
  experiment: 'X06',
  constants: { PKG_BYTES, SIDE_BYTES, IDX_BYTES, NODE_BYTES, NODE_TOTAL,
    NODES_PER_COURSE, NODES_PER_LESSON, NODES_PER_SESSION, PREFETCH_AHEAD,
    PROGRESS_REC_BYTES, SHARD_COUNT },
  simulation: simResults,
  indexBenchmark: indexBench,
  unshardedComparison: unshardedComp,
};

const outPath = path.join(__dirname, 'results.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log('wrote', outPath);

// Print summary table
console.log('\n=== Simulation (sharded index) ===');
console.log('tier            | lib | daysStart | daysFull | hitRate | bytes/day');
for (const r of simResults) {
  if (r.libraryCourses !== 1) continue;  // show lib=1 first
  console.log(
    r.tier.padEnd(15), '|',
    String(r.libraryCourses).padEnd(3), '|',
    String(r.daysToStart).padEnd(9), '|',
    String(r.daysToFull).padEnd(8), '|',
    String((r.cacheHitRate * 100).toFixed(0) + '%').padEnd(7), '|',
    r.avgBytesPerDay.toLocaleString()
  );
}

console.log('\n=== Index Benchmark (B02 fix) ===');
for (const b of indexBench) {
  console.log(`N=${b.N.toLocaleString()}: shard=${b.shardStats.avgShardBytes.toLocaleString()}B avg, lookup=${b.oneLookupMs.toFixed(2)}ms, single=${b.singleFileParseMs}ms → ${b.speedupVsSingle}x faster`);
}

console.log('\n=== Kill line (50 kbps, 7-day round-trip) ===');
const kl = simResults.find(r => r.tier === '50 kbps' && r.libraryCourses === 1);
console.log(`week bytes=${(kl.weekBytes/1024).toFixed(0)}KB, budget=${(kl.weekBudget50kbps/1024/1024).toFixed(1)}MB → ${kl.killLinePass ? 'PASS' : 'FAIL'}`);
