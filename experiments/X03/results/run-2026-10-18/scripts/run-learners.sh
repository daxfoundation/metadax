#!/usr/bin/env bash
# Run 4 learner personas in parallel.
# Input: fixtures/module-final.json
# Output: fixtures/learner-sessions.jsonl
# Model: claude-sonnet-4-6
# Learners: alex, jordan, sam, taylor (made-up names, no real people)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FIXTURE_DIR="$SCRIPT_DIR/../fixtures"

# Each learner receives the reviewed module (module-final.json).
# Each persona is a fresh subagent; learners do not see each other's sessions.
# Output appended to learner-sessions.jsonl (one JSON object per line per learner).
# See fixtures/learner-sessions.jsonl for committed run output.

echo "Learner sessions committed to fixtures/learner-sessions.jsonl."
echo "Re-run: submit each persona prompt separately to claude-sonnet-4-6 with module-final.json content."
