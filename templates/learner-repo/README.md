# Meta DAX learner repo

A learner repo is **private by default**. It holds one learner's pseudonymous
profile, their progress snapshots, session records, weekly manifests, and any
private follow-up nodes. It never contains a real name, email, school, address
or diagnosis: the learner is identified only by a pseudonym (`lrn-` + 8
lowercase letters or digits).

**Never fork or merge this repo into a course repo.** The course repo is public
and shared; this one is not. Shared nodes live in the course repo; private nodes
live only here.

## Layout

```
profile.json                     metadax.learner/0.2 (adult, pseudonymous)
progress/<course-id>/<device-id>/<YYYY-MM-DD>.json    daily progress snapshots
sessions/<session-id>/event-<seq>.json                one file per event
sessions/<session-id>/turn-<seq>.json                 one file per tutor turn
manifests/<YYYY>-W<WW>.json      weekly file manifest (tools/stamp.js manifest)
nodes/<id>/node.json             private follow-up nodes (never in the course repo)
```

Nothing here is edited in place: a new state is always a new file (SPEC S-6).
The model writes `"runtime"` for every timestamp, hash, byte count and id; the
client's stamping step (`tools/stamp.js`) fills them in.

## Phase 1: adults only

The Claude Code and Claude Desktop clients are for adults in Phase 1. Set
`age_band` to `adult`. The minor bands in the schema exist for the companion
client and are not used here.

## Config

Copy `metadax.config.example.json` to `metadax.config.json` (which is
gitignored) and fill in your course and learner repo paths, `learner_id` and
`device_id`. The client stores no tokens: git authentication is whatever your
`git` already has.
