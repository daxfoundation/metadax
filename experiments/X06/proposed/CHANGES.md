Proposed by the runs of 18-19 Oct 2026; not merged into the canonical files.

# X06 proposed changes — 2026-10-18

## tools/bundle.cjs (new)

**What:** Bundle format — a manifest plus content-hash-named objects, delta-encoded
against the learner's last acknowledged manifest.

**Why:** The X06 card lists "bundle format" and "delta-sync protocol" as missing
prerequisites. A content-hash-named object store means identical content sent to
multiple learners collapses to one object; delta encoding against the acknowledged
manifest means only new or changed objects cross the wire on subsequent syncs.

**API:** `buildBundle(objects)` → cold bundle; `buildDelta(prevManifest, newObjects)`
→ delta bundle; `envelopeBytes(bundle)` → wire size.

---

## tools/deferred-queue.cjs (new)

**What:** Deferred queue — items that don't fit in today's bandwidth window wait here;
the learner's next objective (priority 0) is always served before background content
(priority 1). Idempotent: re-enqueueing an existing id is a no-op.

**Why:** The card lists "deferred-question queue" as missing. The ordering guarantee
(next objective first) is what lets a learner on a 9.6 kbps link start their first
lesson in session 1 — the first 71 KB arrive within the first 59 seconds of the
session — while the rest of the course downloads behind them.

**API:** `enqueue(id, bytes, payload, priority)` · `drain(bytesBudget)` ·
`size()` · `pendingBytes()`.

---

## tools/sharded-index.cjs (new)

**What:** Sharded index — splits the node registry by 2-hex-char SHA-256 prefix
(256 shards). Fix for B02 (single `index.json` unusable at 10⁶ nodes / 415 MB).

**Why:** Measured speedup: 866× lookup at 10⁵ entries (0.19 ms vs 160 ms),
495× at 10⁶ (3.19 ms vs 1,579 ms). Max shard size is 255 KB at 10⁶ entries.
With sharding, a learner's bundle includes only the shards that contain their
course's nodes, so library size does not affect per-learner download size at
the current 1–10 course range.

**Known limit (B63):** at 100 courses (10,000 nodes) each shard carries other
courses' overhead; 304 KB downloaded vs 41 KB ideal. Finer sharding resolves this
but increases the number of files to maintain.

**API:** `buildShardedIndex(flatEntries)` · `lookup(shards, nodeId)` ·
`shardStats(shards)` · `shardsNeeded(nodeIds)`.
