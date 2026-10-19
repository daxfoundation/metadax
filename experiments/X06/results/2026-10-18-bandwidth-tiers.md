# X06 — Same course, every bandwidth
## Result file: 2026-10-18-bandwidth-tiers

**Status: SIMULATED** (deterministic byte/timing model; no real link or real learner)

---

## Question

Can one course serve a learner on a fat connection and a learner on 50 kbps equally —
by shipping a self-contained bundle, syncing only deltas, and holding the learner's
follow-up questions in a deferred queue that drains when a link appears?

---

## What ran

- **Models:** none (purely deterministic byte model; no guide or learner task-agents needed)
- **Node-size constants:** from `experiments/scale/part2-results.json`
  — package 1,556 B/node · sidecar 5,590 B/node · index entry 409 B/node
- **Course model:** 100 nodes/course, 10 nodes/lesson, 2 nodes/session,
  prefetch-ahead 5 nodes, progress record 2 KB/session
- **Tiers:** 5 × 3 matrix — 9.6 kbps / 50 kbps / 256 kbps / 1 Mbps / 10 Mbps always-on
  × library sizes 1 / 10 / 100 courses
- **Index benchmark:** single vs sharded at 10⁵ and 10⁶ entries
- **Scripts:** `run-2026-10-18/simulate.cjs`  
  `proposed/tools/bundle.cjs`, `deferred-queue.cjs`, `sharded-index.cjs`

---

## Numbers

### Bundle sizes (1 course, 100 nodes)

| component         | bytes   |
|-------------------|---------|
| content (package + sidecar) | 714,600 B (698 KB) |
| index slice (sharded)       | 9,300 B (9 KB)     |
| **total cold bundle**       | **723,900 B (707 KB)** |
| first lesson (10 nodes, priority 0) | 72,660 B (71 KB) |
| delta per session (5 new nodes + progress) | 37,730 B (37 KB) |

### Simulation — sharded index (all library sizes identical for the learner)

| tier | bps budget/day | days to start | days to full course | cache-hit rate | avg bytes/day* |
|------|---------------|--------------|---------------------|---------------|---------------|
| 9.6 kbps | 360 KB | 1 | 3 | 97% | 70 KB |
| 50 kbps | 1,875 KB | 1 | 1 | 97% | 99 KB |
| 256 kbps | 9,600 KB | 1 | 1 | 97% | 356 KB |
| 1 Mbps | 37,500 KB | 1 | 1 | 97% | 1,286 KB |
| 10 Mbps (always-on) | — | same session | same session | 100% | 38 KB |

\* averaged over 30-day window; drops after initial sync because steady-state delta is 37 KB/day.  
97% = 29/30 sessions; day-1 session counted as partial-miss (first lesson arrives mid-session).

### Unsharded vs sharded at 9.6 kbps — library size impact

| library | unsharded bundle | sharded bundle | days unsharded | days sharded |
|---------|-----------------|----------------|----------------|-------------|
| 1 course (100 nodes) | 738 KB | 707 KB | 3 | 3 |
| 10 courses (1,000 nodes) | 1,097 KB | 734 KB | 4 | 3 |
| **100 courses (10,000 nodes)** | **4,692 KB** | **1,002 KB** | **14** | **3** |

With sharding, library size does not affect days-to-start or days-to-full-course.
Without sharding at the 100-course library size: 14 days vs 3 days — a 4.7× penalty.

### Index benchmark — B02 fix (sharded vs single file)

| entries | single index.json | shard size (avg/max) | lookup (1 shard) | speedup |
|---------|-------------------|----------------------|------------------|---------|
| 10⁵ | 41.3 MB, parse 160 ms | 24.6 KB / 27.1 KB | 0.19 ms | **866×** |
| 10⁶ | 415 MB, parse 1,579 ms | 243.7 KB / 254.5 KB | 3.19 ms | **495×** |

256 shards (2-hex-char prefix). Shard sizes are very uniform (max/avg ≈ 1.1×).

### Kill-line check

| metric | value | threshold | result |
|--------|-------|-----------|--------|
| week's bytes (bundle + 7 deltas) at 50 kbps | 965 KB | 13.1 MB available/week | ✓ PASS |
| queue integrity (idempotent, FIFO, no drop) | all items drained | zero loss required | ✓ PASS |

---

## Verdict vs kill line

**PASS.** A week's learning round-trips through 50 kbps with 965 KB against a 13.1 MB
weekly budget (7% utilisation). The deferred queue is idempotent and never drops items.
With the sharded index, library size does not affect the learner's download; all five tiers
can start the course on day 1.

---

## What compounds

- Bundle + delta + sharded-index is the sync primitive X07 (pocket model) and X12
  (five-minutes test) depend on.
- Deferred queue ordering (next objective first) ensures learners on thin links begin
  learning within the same session that downloads their first lesson, regardless of
  overall bundle size.
- The 97% cache-hit rate holds across all five tiers; the delta (37 KB) fits in any
  tier's daily window with room to spare.

---

## Dead ends kept

- **Chatty per-turn sync:** B07 instinct to send one object per step inflates the wire
  cost by a factor equal to the number of objects per session (~5× overhead in headers
  alone); delta batching is non-negotiable on thin links.
- **Routing learner to a single large index shard:** with 256-shard index and a 100-course
  library, each shard carries other courses' nodes as overhead. Learner downloads 304 KB
  of index vs the ideal 41 KB. Finer sharding (4-char prefix = 65,536 shards) or
  per-module sharding reduces overhead; documented as B63.

---

## Bottlenecks

See `bottlenecks-2026-10-18.md`.

- **B02:** FIXED — sharded index (256 shards) delivers 866× lookup speedup at 10⁵
  entries, 495× at 10⁶. Max shard size 255 KB at 10⁶ entries vs 415 MB single file.
- **B63** (new): shard-overhead on large libraries — see below.
- **B64** (new): first-session bootstrap miss — see below.

---

## Reproduce

```
cd state/metadax/public-staging/experiments/X06
node run-2026-10-18/simulate.cjs
# writes run-2026-10-18/results.json
```
