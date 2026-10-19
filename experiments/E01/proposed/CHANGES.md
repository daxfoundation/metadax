Proposed by the runs of 18-19 Oct 2026; not merged into the canonical files.

# Proposed changes — E01 run 3

## docs/WALKTHROUGH-CLAUDE-CODE.md

**Why:** Step 5 "Build a course (teacher skill)" does not mention that
`tools/stamp.js registry` requires the module registry file to already exist.
On the first call for a new module, the file must be created first (e.g. by
`tools/assemble.js` or by the guide writing it), then stamped. The current text
implies `stamp.js registry` creates the file.

**Change:** Add a note after the `stamp.js registry` command:
> If this is the first objective in a new module, create the module registry file
> first (`echo '{"schema":"metadax.registry/0.2","module_id":"<id>","nodes":[]}' > registry/<id>.json`),
> then run `stamp.js registry`. The stamp step does not create the file.
