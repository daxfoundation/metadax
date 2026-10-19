# E06 results — 2026-10-18-bundle-loop

> Deterministic run; link times computed from byte counts, not measured on a real link.

## Question

Does a week's round-trip of learner output and next-week content fit through a 50 kbps link
using `git bundle`, with no merge conflicts under the append-only layout?

## What ran

- Model: none (fully deterministic script, no model calls)
- Script: `run-2026-10-18/run.cjs` (Node stdlib only, zero external dependencies)
- Fixture course: `fixtures/courses/cell-biology-obsidian` (6 nodes, 2 modules)
- Made-up learner: `lrn-fixture01` / `dev-abcde1` (learner named Aaliya)
- Week of activity: 5 sessions × (5 events + 3 tutor turns) + 5 progress snapshots + 3 private nodes + 1 weekly manifest
- Seeds: n/a (deterministic)

## Numbers table

| Bundle | raw bytes | gzip bytes | 50 kbps + 20% OH | 9.6 kbps + 20% OH | fits 5-min window? |
|--------|-----------|------------|-------------------|--------------------|--------------------|
| A — course week-1 (full) | 17 825 | 17 694 | 3.4 s | 17.7 s | yes |
| B — learner return | 7 094 | 5 940 | 1.1 s | 5.9 s | yes |
| C — course week-2 (incremental) | 1 400 | 1 423 | 0.3 s | 1.4 s | yes |
| **Round-trip total** | **26 319** | **25 057** | **4.8 s** | **25.1 s** | **yes** |

5-minute window at 50 kbps = 1 875 000 B. All three bundles together = 25 057 B gzip — 1.3% of the budget.

## Round-trip verification

- All three tree hashes match source exactly after unbundle.
- `git fsck --no-dangling` clean on all three verify repos.
- Textual conflicts: **0** (append-only per-device layout, no shared files modified).

## Verdict

**PASS** vs the E06 kill line (round-trip > 300 s or any textual conflict).

Round-trip at 50 kbps (gz, 20% overhead): **4.8 s** — 98.4% under the 300-second kill line.
Round-trip at 9.6 kbps (gz, 20% overhead): **25.1 s** — still well inside the window.

## What compounds

- E06 PASS unblocks X06 (same course, every bandwidth) — the bundle format, delta sync, and deferred-queue are now on a confirmed footing.
- X06 → X07 (pocket model) → X12 (capstone) chain can proceed.

## Dead ends kept

- Bundle size is dominated by git metadata overhead (~60% of raw bytes in Bundle A are pack header, object index, and the git bundle header) rather than actual course content. At scale, content will grow faster than overhead; the ratio improves.
- The fixture course (6 nodes) is small; a realistic course of 200–300 nodes would push Bundle A toward ~400–600 kB raw. That still fits the 5-minute window at 50 kbps (400 kB gzip ≈ 77 s with 20% overhead), but leaves less headroom. E10 pre-generated content growth is the bottleneck to watch (B34 below).

## Bottlenecks

- B34: Bundle A grows proportionally to course content. At 300 nodes a realistic full-download could approach 500 kB. Still fits 50 kbps but erodes the margin; E10 content must be measured before claiming the X06 link is safe at full scale.
- B35: Bundle format has no resume/chunking support. A single dropped connection at 9.6 kbps restarts the full transfer. A chunked or resumable bundle protocol is missing.

## Reproduce

```
cd state/metadax/public-staging/experiments/E06/run-2026-10-18
node run.cjs
# outputs: results.json, bundles/
```
