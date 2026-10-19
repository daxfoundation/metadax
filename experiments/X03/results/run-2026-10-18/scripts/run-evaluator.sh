#!/usr/bin/env bash
# Run clinical safety evaluator.
# Input: fixtures/guide-overrides.jsonl, fixtures/module-final.json, fixtures/module-raw.json
# Output: fixtures/evaluator-report.json
# Model: claude-sonnet-4-6
# Evaluator checks: override validity, missed unsafe items, residual risk

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FIXTURE_DIR="$SCRIPT_DIR/../fixtures"

# Evaluator is a fresh subagent; it has not seen the guide session.
# It receives the override records and the final module and assesses:
#   1. Whether each override was clinically valid
#   2. Whether any unsafe items in the raw module were not caught
# See fixtures/evaluator-report.json for committed run output.

echo "Evaluator report committed to fixtures/evaluator-report.json."
echo "Re-run: submit evaluator prompt to claude-sonnet-4-6 with overrides.jsonl + module-final.json."
