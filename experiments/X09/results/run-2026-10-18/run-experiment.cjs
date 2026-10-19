#!/usr/bin/env node
// run-experiment.js — X09: append-log vs edit-in-place (1 000 edits, 100-node course).
// Deterministic; zero-dependency Node (crypto, fs, path only).
// Run: node run-experiment.js
// Outputs: course.json, experiment-results.json (same dir)

'use strict'
const { createHash } = require('crypto')
const { writeFileSync } = require('fs')
const path = require('path')

// ── seeded LCG rng (deterministic) ─────────────────────────────────────────
function mkrng(seed) {
  let s = seed >>> 0
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0x100000000 }
}

// ── generate 100-node course ────────────────────────────────────────────────
const MODULES = ['intro', 'core', 'advanced', 'practice', 'review']
const TOPICS  = ['foundation', 'structure', 'application', 'edge-case',
                 'integration', 'synthesis', 'critique', 'extension', 'transfer', 'mastery']
const rngC = mkrng(42)

const nodes = []
for (let i = 0; i < 100; i++) {
  const mod   = MODULES[Math.floor(rngC() * MODULES.length)]
  const topic = TOPICS[Math.floor(rngC() * TOPICS.length)]
  nodes.push({
    id: `n_${String(i).padStart(3, '0')}`,
    module: mod,
    topic,
    title: `${mod}/${topic} (node ${i})`,
    content: `Base content for node ${i}: covers ${topic} in ${mod}. Version 1.`,
    version: 1
  })
}
writeFileSync(path.join(__dirname, 'course.json'), JSON.stringify(nodes, null, 2))

const nodeIds = nodes.map(n => n.id)

// ── generate 1 000 edit operations (seeded) ─────────────────────────────────
// 930 normal + 50 contested + 20 silent = 1 000
const rngO = mkrng(1337)

const OPS = []
for (let i = 0; i < 930; i++)
  OPS.push({ type: 'normal',    node_id: nodeIds[Math.floor(rngO() * 100)], suffix: `n${i}` })
for (let i = 0; i < 50; i++)
  OPS.push({ type: 'contested', node_id: nodeIds[Math.floor(rngO() * 100)], suffix: `c${i}` })
for (let i = 0; i < 20; i++)
  OPS.push({ type: 'silent',    node_id: nodeIds[Math.floor(rngO() * 100)], suffix: `s${i}` })

// Fisher-Yates shuffle (seeded) — keeps all three types intermixed
for (let i = OPS.length - 1; i > 0; i--) {
  const j = Math.floor(rngO() * (i + 1));
  [OPS[i], OPS[j]] = [OPS[j], OPS[i]]
}

// ── MODE A: edit-in-place ───────────────────────────────────────────────────
function runModeA() {
  const store = {}
  for (const n of nodes) store[n.id] = { ...n }

  const bytesInit = JSON.stringify(store).length
  const tRebuild0 = Date.now()
  // Rebuild view IS just reading the store — O(1)
  void JSON.stringify(store)
  const rebuildMs = Date.now() - tRebuild0

  for (const op of OPS) {
    const cur = store[op.node_id]
    const v = (cur.version || 1) + 1
    store[op.node_id] = {
      ...cur,
      content: `${cur.content.split(' Version')[0]} Version ${v} (${op.suffix}).`,
      version: v
    }
    // Normal, contested, and silent rewrites all look identical in mode A.
    // No record of the type of change; no detection possible.
  }

  const bytesFinal = JSON.stringify(store).length

  return {
    mode: 'a_edit_inplace',
    ops_total: OPS.length,
    ops_normal: 930, ops_contested: 50, ops_silent_attempted: 20,
    silent_rewrites_detected: 0,
    contested_versions_preserved: 0,
    bytes_init: bytesInit,
    bytes_final: bytesFinal,
    storage_growth_factor: +(bytesFinal / bytesInit).toFixed(3),
    compaction_ratio: 1.0,
    rebuild_view_ms: rebuildMs
  }
}

// ── crypto helpers for Mode B ───────────────────────────────────────────────
const GENESIS = '0'.repeat(64)
function sha256(s) { return createHash('sha256').update(s).digest('hex') }
function evtHash(prevH, e) {
  const p = JSON.stringify({ seq: e.seq, node_id: e.node_id, event_type: e.event_type, data: e.data })
  return sha256(prevH + p)
}

// ── MODE B: append-log + hash-chain signing ─────────────────────────────────
function runModeB() {
  const log = []  // array of event objects (in-memory JSONL equivalent)

  function append(nodeId, evtType, data, declaration) {
    const prevH = log.length === 0 ? GENESIS : log[log.length - 1].hash
    const evt = { seq: log.length, node_id: nodeId, event_type: evtType, data, declaration, prev_hash: prevH, hash: null }
    evt.hash = evtHash(prevH, evt)
    log.push(evt)
    return evt.seq
  }

  // Create events: one per node (init state)
  const curData = {}
  for (const n of nodes) {
    curData[n.id] = { ...n }
    append(n.id, 'create', { ...n }, {
      asserts: `${n.id} v1 content`, changes: 'initial creation', must_not_break: 'none'
    })
  }

  const bytesInit = log.reduce((s, e) => s + JSON.stringify(e).length + 1, 0)

  // Track most-recent event per node for silent-rewrite targeting
  const lastSeqByNode = {}
  for (const n of nodes) lastSeqByNode[n.id] = n.id.replace('n_', '') | 0  // seq of create event

  // Apply edits
  const silentTargets = []  // { seq, newData }

  for (const op of OPS) {
    const cur = curData[op.node_id]
    const v = (cur.version || 1) + 1
    const newData = {
      ...cur,
      content: `${cur.content.split(' Version')[0]} Version ${v} (${op.suffix}).`,
      version: v
    }

    if (op.type === 'silent') {
      // Adversary tries to quietly overwrite an existing event's data without changing its hash.
      silentTargets.push({ seq: lastSeqByNode[op.node_id], newData: { ...newData } })
      // No legitimate event appended — history is unaware this "edit" happened.
      continue
    }

    curData[op.node_id] = newData
    const evtType = op.type === 'contested' ? 'contested' : 'update'
    const seq = append(op.node_id, evtType, newData, {
      asserts: `${op.node_id} v${v}`, changes: op.suffix, must_not_break: 'hash_chain'
    })
    lastSeqByNode[op.node_id] = seq
  }

  const bytesAfterEdits = log.reduce((s, e) => s + JSON.stringify(e).length + 1, 0)

  // ── Verify clean log ──
  function verifyLog(evts) {
    const errors = []
    let prevH = GENESIS
    for (const e of evts) {
      const expected = evtHash(prevH, e)
      if (e.hash !== expected) errors.push({ seq: e.seq, node_id: e.node_id })
      prevH = e.hash  // follow stored chain; only the tampered event itself errors
    }
    return { ok: errors.length === 0, errors }
  }

  const cleanVerify = verifyLog(log)

  // ── Simulate tamper: copy log, mutate data, leave hash unchanged ──
  const tampered = log.map(e => ({ ...e }))
  let actualTampers = 0
  for (const t of silentTargets) {
    if (t.seq < tampered.length) {
      tampered[t.seq] = { ...tampered[t.seq], data: t.newData }
      actualTampers++
    }
  }
  const tamperedVerify = verifyLog(tampered)

  // ── Compact view + timing ──
  const tC0 = Date.now()
  const view = buildView(log)
  const rebuildMs = Date.now() - tC0

  const withDecl = log.filter(e => e.declaration).length
  const compactionRatio = +(log.length / view.nodeCount).toFixed(2)

  return {
    mode: 'b_append_log',
    ops_total: OPS.length,
    ops_normal: 930, ops_contested: 50, ops_silent_attempted: 20,
    total_events: log.length,
    create_events: 100,
    update_events: log.filter(e => e.event_type === 'update').length,
    contested_events: log.filter(e => e.event_type === 'contested').length,
    clean_verify_ok: cleanVerify.ok,
    silent_tampers_applied: actualTampers,
    silent_rewrites_detected: tamperedVerify.errors.length,
    detection_rate: actualTampers > 0 ? `${tamperedVerify.errors.length}/${actualTampers}` : '0/0',
    contested_versions_preserved: view.contestedNodeCount,
    bytes_init: bytesInit,
    bytes_after_edits: bytesAfterEdits,
    storage_growth_factor: +(bytesAfterEdits / bytesInit).toFixed(3),
    events_per_node_avg: +(log.length / nodeIds.length).toFixed(2),
    compaction_ratio: compactionRatio,
    rebuild_view_ms: rebuildMs,
    declaration_coverage_pct: Math.round(withDecl * 100 / log.length)
  }
}

function buildView(log) {
  const cur = {}, contested = {}
  for (const e of log) {
    if (e.event_type === 'contested') {
      (contested[e.node_id] = contested[e.node_id] || []).push(e)
    } else {
      cur[e.node_id] = e
    }
  }
  const allIds = new Set([...Object.keys(cur), ...Object.keys(contested)])
  return { nodeCount: allIds.size, contestedNodeCount: Object.keys(contested).length }
}

// ── run both modes ──────────────────────────────────────────────────────────
const resultA = runModeA()
const resultB = runModeB()

const out = {
  run_date: '2026-10-18',
  label: 'SIMULATED',
  course_nodes: 100,
  total_ops: 1000,
  mode_a: resultA,
  mode_b: resultB
}

const outFile = path.join(__dirname, 'experiment-results.json')
writeFileSync(outFile, JSON.stringify(out, null, 2))
console.log(JSON.stringify(out, null, 2))
