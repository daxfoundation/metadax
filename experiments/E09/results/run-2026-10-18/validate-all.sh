#!/bin/sh
# Validate all E09 record entries.
# Run from the metadax-learner-record clone root.
# Usage: sh /path/to/validate-all.sh /path/to/records/
RECORDS="${1:-records}"
node tools/validate-record.mjs "$RECORDS"/*.json
