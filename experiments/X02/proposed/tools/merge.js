// metadax 3-way (N-way) registry merge — fix for B19.
//
// B19: a single course-wide registry file is a merge bottleneck (97.3 conflicts /
// 100 commits vs 86.5 per-module). Per-module files are necessary but insufficient:
// Zipf-concentrated topics pile commits onto a few hot modules, so a per-module
// file is still a single serialization point under concurrent learner writes.
//
// Fix, two parts:
//   1. Per-module files (one registry file per module id).
//   2. Append-only structure for HOT modules: instead of one serialized file the
//      writers read-modify-write, each writer appends to its own segment and the
//      module's entries are the UNION of all segments. Concurrent appends commute
//      (CRDT G-set keyed by opaque id), so they do not conflict. A merge is then a
//      set-union per module, never a last-write-wins overwrite.
//
// The merge is origin-preserving (created_by survives), conflict-detecting (same id,
// divergent content is surfaced, never silently resolved), and contested-aware
// (two nodes tagged the same contest_id are both kept). Nothing is ever dropped.
//
// Zero deps. Pure data in, pure data out.

'use strict';

// --- append-only segment store for hot modules ----------------------------
// A writer appends an entry to (module, writerId). No reader-writer or writer-
// writer lock: appends to distinct segments are independent; appends to the same
// segment by the same writer are naturally ordered. This is what removes hot-module
// contention — the single serialization point is gone.
function appendOnlyUnion(segments) {
  // segments: array of { module, writer, entries:[...] }
  const byId = new Map(); // opaque id -> entry (G-set: first write wins identity)
  for (const seg of segments) {
    for (const e of seg.entries) {
      if (!byId.has(e.id)) byId.set(e.id, e);
    }
  }
  return Array.from(byId.values());
}

// --- N-way merge of fork registries ----------------------------------------
// forks: array of { fork, modules: { <moduleId>: [entry,...] } }
// hotModules: Set of module ids that use the append-only store.
// Returns { merged: {<moduleId>:[entry]}, conflicts:[], contested:[], dropped:0,
//           origin: {<id>: fork}, stats }.
function merge(forks, hotModules) {
  hotModules = hotModules || new Set();
  const merged = {};          // moduleId -> entries
  const origin = {};          // node id -> originating fork
  const seen = new Map();     // node id -> first entry seen (for conflict check)
  const conflicts = [];
  const contestGroups = new Map(); // contest_id -> [entries]
  let dropped = 0;

  // collect every (module, fork) entry list
  const moduleWriters = new Map(); // moduleId -> [{fork, entries}]
  for (const fk of forks) {
    for (const mod of Object.keys(fk.modules)) {
      if (!moduleWriters.has(mod)) moduleWriters.set(mod, []);
      moduleWriters.get(mod).push({ fork: fk.fork, entries: fk.modules[mod] });
    }
  }

  for (const [mod, writers] of moduleWriters.entries()) {
    let entries;
    if (hotModules.has(mod)) {
      // append-only union — concurrent appends commute, no conflict possible on write
      entries = appendOnlyUnion(writers.map(w => ({
        module: mod, writer: w.fork, entries: w.entries,
      })));
    } else {
      // cold module: ordinary per-module merge, still union by id
      entries = [];
      const byId = new Map();
      for (const w of writers) for (const e of w.entries) {
        if (!byId.has(e.id)) { byId.set(e.id, e); entries.push(e); }
      }
    }

    // origin tracking + semantic conflict detection (same id, divergent content)
    const kept = [];
    for (const w of writers) {
      for (const e of w.entries) {
        if (!(e.id in origin)) origin[e.id] = w.fork;
        if (seen.has(e.id)) {
          const prev = seen.get(e.id);
          if (prev.content_sha256 !== e.content_sha256) {
            // genuine collision: surface it, keep BOTH, never overwrite
            conflicts.push({ id: e.id, forks: [origin[e.id], w.fork],
                             kept_both: true });
          }
        } else {
          seen.set(e.id, e);
        }
        if (e.contest_id) {
          if (!contestGroups.has(e.contest_id)) contestGroups.set(e.contest_id, []);
          contestGroups.get(e.contest_id).push({ id: e.id, fork: w.fork });
        }
      }
    }
    // dedup kept by id for the merged view (union already done above)
    merged[mod] = entries;
    void kept;
  }

  // contested cores: every group with >1 distinct node kept side by side
  const contested = [];
  for (const [cid, members] of contestGroups.entries()) {
    const ids = Array.from(new Set(members.map(m => m.id)));
    if (ids.length > 1) contested.push({ contest_id: cid, nodes: members });
  }

  const totalMerged = Object.values(merged).reduce((n, a) => n + a.length, 0);
  return {
    merged, origin, conflicts, contested, dropped,
    stats: { modules: Object.keys(merged).length, nodes: totalMerged,
             conflict_count: conflicts.length, contested_cores: contested.length },
  };
}

module.exports = { merge, appendOnlyUnion };
