'use strict';
// Sharded index: splits the node registry by 2-hex-char SHA-256 prefix → 256
// shards. Fix for B02 (single index.json hits 415 MB at 10^6 nodes).
//
// Each shard is a plain object { nodeId: meta, … } serialised to JSON.
// A lookup loads exactly one shard (~1/256 of the index) rather than the whole
// file. Bundles include only the shards that contain the learner's nodes.

const crypto = require('crypto');

const PREFIX_LEN = 2;          // hex chars — 256 shards
const SHARD_COUNT = 16 ** PREFIX_LEN;   // 256

function shardKey(nodeId) {
  return crypto.createHash('sha256').update(nodeId).digest('hex').slice(0, PREFIX_LEN);
}

// Build an in-memory sharded index from a flat { nodeId: meta } map.
// Returns { [shardKey]: { nodeId: meta, … } }
function buildShardedIndex(flatEntries) {
  const shards = {};
  for (const [id, meta] of Object.entries(flatEntries)) {
    const key = shardKey(id);
    if (!shards[key]) shards[key] = {};
    shards[key][id] = meta;
  }
  return shards;
}

// Lookup a single node. shards may be the full in-memory map or a subset
// (only the relevant shard needs to be loaded from disk for real use).
function lookup(shards, nodeId) {
  const key = shardKey(nodeId);
  return shards[key] ? shards[key][nodeId] : undefined;
}

// Summary stats for a sharded index.
function shardStats(shards) {
  const keys = Object.keys(shards);
  const sizes = keys.map(k => JSON.stringify(shards[k]).length);
  const counts = keys.map(k => Object.keys(shards[k]).length);
  const total = sizes.reduce((a, b) => a + b, 0);
  return {
    activeShardsUsed: keys.length,
    totalShards: SHARD_COUNT,
    totalBytes: total,
    avgShardBytes: keys.length ? Math.round(total / keys.length) : 0,
    maxShardBytes: keys.length ? Math.max(...sizes) : 0,
    avgEntriesPerShard: keys.length ? Math.round(counts.reduce((a, b) => a + b, 0) / keys.length) : 0,
  };
}

// How many shards does a learner need to download to cover a set of node ids?
function shardsNeeded(nodeIds) {
  return new Set(nodeIds.map(shardKey)).size;
}

module.exports = { shardKey, buildShardedIndex, lookup, shardStats, shardsNeeded, SHARD_COUNT, PREFIX_LEN };
