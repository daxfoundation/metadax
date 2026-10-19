#!/usr/bin/env node
// append-log.js — append-only event log for course nodes.
// Nodes stored as hash-chained JSONL events; compacted view rebuilds current state
// without erasing history (B03). Contested edits preserved side-by-side (B21).
// Zero-dependency Node (crypto, fs, path only).
//
// Usage:
//   node append-log.js init    <log-file>
//   node append-log.js append  <log-file> <event-json>
//   node append-log.js verify  <log-file>
//   node append-log.js compact <log-file>  [--json]
//   node append-log.js stats   <log-file>
//
// Event fields: node_id, event_type (create|update|supersede|contested),
//               data (node object), declaration {asserts, changes, must_not_break}
//
// Hash chain: each event's hash = sha256(prev_hash + stable_payload_json).
// A silent rewrite (data changed, hash unchanged) breaks the chain at that event.
//
// Exit: 0 = ok, 1 = error

'use strict'
const { createHash } = require('crypto')
const { readFileSync, writeFileSync, appendFileSync, existsSync, statSync } = require('fs')
const path = require('path')

const GENESIS_HASH = '0'.repeat(64)

function sha256(s) {
  return createHash('sha256').update(s).digest('hex')
}

// --- chain helpers ---
function stablePayload(evt) {
  return JSON.stringify({ seq: evt.seq, node_id: evt.node_id, event_type: evt.event_type, data: evt.data })
}
function computeHash(prevHash, evt) {
  return sha256(prevHash + stablePayload(evt))
}
function tailHash(events) {
  return events.length === 0 ? GENESIS_HASH : events[events.length - 1].hash
}

// --- load / save ---
function loadLog(logFile) {
  if (!existsSync(logFile)) return []
  return readFileSync(logFile, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l))
}

// --- subcommands ---

function cmd_init(logFile) {
  if (existsSync(logFile)) { process.stderr.write(`already exists: ${logFile}\n`); process.exit(1) }
  writeFileSync(logFile, '')
  console.log(`initialized: ${logFile}`)
}

function cmd_append(logFile, eventJson) {
  const input = JSON.parse(eventJson)
  const events = loadLog(logFile)
  const seq = events.length
  const prevHash = tailHash(events)
  const evt = {
    seq,
    node_id: input.node_id,
    event_type: input.event_type,
    data: input.data,
    declaration: input.declaration || null,
    prev_hash: prevHash,
    hash: null
  }
  evt.hash = computeHash(prevHash, evt)
  appendFileSync(logFile, JSON.stringify(evt) + '\n')
  console.log(JSON.stringify({ seq, hash: evt.hash.slice(0, 12) }))
}

function cmd_verify(logFile) {
  const events = loadLog(logFile)
  const errors = []
  let prevHash = GENESIS_HASH
  for (const e of events) {
    const expected = computeHash(prevHash, e)
    if (e.hash !== expected) {
      errors.push({ seq: e.seq, node_id: e.node_id, expected: expected.slice(0, 12), got: (e.hash || '').slice(0, 12) })
    }
    prevHash = e.hash  // follow stored chain so only tampered events error
  }
  const out = { ok: errors.length === 0, total_events: events.length, errors }
  console.log(JSON.stringify(out))
  process.exit(out.ok ? 0 : 1)
}

function buildCompactedView(events) {
  const currentByNode = {}   // node_id → latest non-contested event
  const contestedByNode = {} // node_id → list of contested events
  for (const e of events) {
    if (e.event_type === 'contested') {
      if (!contestedByNode[e.node_id]) contestedByNode[e.node_id] = []
      contestedByNode[e.node_id].push(e)
    } else {
      currentByNode[e.node_id] = e
    }
  }
  const view = {}
  const allIds = new Set([...Object.keys(currentByNode), ...Object.keys(contestedByNode)])
  for (const id of allIds) {
    const cur = currentByNode[id]
    const contested = contestedByNode[id] || []
    if (contested.length > 0) {
      view[id] = {
        current: cur ? { ...cur.data, _seq: cur.seq, _hash: cur.hash.slice(0, 12) } : null,
        contested: contested.map(c => ({ ...c.data, _seq: c.seq, _hash: c.hash.slice(0, 12) })),
        contested_flag: true
      }
    } else {
      view[id] = { ...cur.data, _seq: cur.seq, _hash: cur.hash.slice(0, 12), contested_flag: false }
    }
  }
  return {
    node_count: allIds.size,
    total_events: events.length,
    contested_node_count: Object.keys(contestedByNode).length,
    view
  }
}

function cmd_compact(logFile, asJson) {
  const events = loadLog(logFile)
  const out = buildCompactedView(events)
  if (asJson) {
    console.log(JSON.stringify(out))
  } else {
    console.log(`compacted: ${out.node_count} nodes from ${out.total_events} events (${out.contested_node_count} contested)`)
  }
}

function cmd_stats(logFile) {
  const events = loadLog(logFile)
  const byType = {}
  const byNode = {}
  for (const e of events) {
    byType[e.event_type] = (byType[e.event_type] || 0) + 1
    byNode[e.node_id] = (byNode[e.node_id] || 0) + 1
  }
  const nodeCount = Object.keys(byNode).length
  const totalEvents = events.length
  const logBytes = existsSync(logFile) ? statSync(logFile).size : 0
  console.log(JSON.stringify({
    total_events: totalEvents,
    node_count: nodeCount,
    by_type: byType,
    avg_events_per_node: nodeCount > 0 ? (totalEvents / nodeCount).toFixed(2) : 0,
    log_bytes: logBytes,
    bytes_per_event: totalEvents > 0 ? Math.round(logBytes / totalEvents) : 0
  }))
}

function main() {
  const [,, subcmd, logFileRel, ...rest] = process.argv
  const logFile = logFileRel ? path.resolve(logFileRel) : null
  switch (subcmd) {
    case 'init':    return cmd_init(logFile)
    case 'append':  return cmd_append(logFile, rest[0])
    case 'verify':  return cmd_verify(logFile)
    case 'compact': return cmd_compact(logFile, rest.includes('--json'))
    case 'stats':   return cmd_stats(logFile)
    default:
      process.stderr.write('usage: append-log.js <init|append|verify|compact|stats> <log-file> [...]\n')
      process.exit(2)
  }
}

main()
