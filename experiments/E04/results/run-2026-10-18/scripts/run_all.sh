#!/bin/sh
# Reproduce: copy metadax to /tmp/run, apply proposed fixes, build cases, run grade.
# Usage: run from the repo root of the proposed-applied copy.
set -e
cd /tmp/run
node evals/build_cases.js
node evals/grade.js --selftest
# Run cases: pass stack.txt to a model, save output, grade.
# Each case output is saved as run-2026-10-18/passA-<op>-<id>.json
# and graded with: node evals/grade.js --case evals/cases/<op>/<id> --out <output>
