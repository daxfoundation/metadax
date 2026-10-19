Proposed by the runs of 18-19 Oct 2026; not merged into the canonical files.

# Proposed changes — X09 (2026-10-18)

## proposed/tools/append-log.cjs

**New file.** Append-only event log for course nodes.

- Nodes stored as hash-chained JSONL events; each event carries a declaration
  (`asserts`, `changes`, `must_not_break`).
- Compacted view rebuilds current node state from the full event history without
  erasing the source log (addresses B03).
- Contested edits stored side-by-side under the `contested` event type; compacted view
  surfaces all contested versions via `contested_flag: true` (addresses B21).
- `verify` subcommand detects silent rewrites: a tampered event's data no longer
  matches its stored hash, breaking the chain at that event only (subsequent events
  are unaffected by the follow-stored-chain design).
- Subcommands: `init`, `append`, `verify`, `compact [--json]`, `stats`.
- Zero-dependency Node; CJS (`.cjs`) to work in repos with `"type": "module"`.

## proposed/tools/verify-chain.cjs

**Copied from E12 (branch xp-1018-e12)** without modification. Verifies SSH-signed
git commit chains and provenance.json files. X09 reuses it as the git-level signing
layer that complements append-log's event-level hash chain.
