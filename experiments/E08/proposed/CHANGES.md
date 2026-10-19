Proposed by the runs of 18-19 Oct 2026; not merged into the canonical files.

# Proposed changes — E08 (2026-10-18)

No changes to existing prompts or schemas are proposed from this run.

## Rationale

E08 (pure-function cores) produced 100% first-try pass rate on both sonnet and haiku.
The specs and oracle tests validate that the generation prompt pattern (plain-text spec
→ ES module with named exports) works without prompt engineering beyond the spec itself.

## What this run implies for future work

The following are observations for the next person to work on Tier-1 assets; they are
NOT committed changes:

1. **Asset-generation prompt template** — the minimal pattern used here (plain-text spec
   with function signature, parameter docs, formula, examples, and an explicit
   "use only Node.js built-ins" line) produced correct output on the first attempt.
   If a formal asset-generation prompt is ever written, this structure is a working
   starting point.

2. **Two-gate pipeline** — a proposed `asset-pipeline.schema.json` would record:
   `{ spec_id, core_oracle_pass, browser_oracle_pass, admitted: boolean }`.
   Currently there is no schema for this.

3. **Playwright harness** — before Tier-1 admission can be certified on the E08 kill
   line, a browser harness is needed (bottleneck B37). The oracle test files in
   `run-2026-10-18/oracles/` serve as a reference for what the harness should verify.
