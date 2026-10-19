#!/usr/bin/env bash
# Run guide review persona (Miriam Chen).
# Input: fixtures/module-raw.json, fixtures/guide-profile.json
# Output: fixtures/guide-overrides.jsonl, fixtures/module-final.json
# Model: claude-sonnet-4-6
# Requires: ANTHROPIC_API_KEY set

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FIXTURE_DIR="$SCRIPT_DIR/../fixtures"

node - <<'EOF'
const fs = require("fs");
const path = require("path");
const https = require("https");

const fixtureDir = process.env.FIXTURE_DIR || path.join(__dirname, "../fixtures");
const raw = JSON.parse(fs.readFileSync(path.join(fixtureDir, "module-raw.json"), "utf8"));
const profile = JSON.parse(fs.readFileSync(path.join(fixtureDir, "guide-profile.json"), "utf8"));

const itemsText = raw.items.map(it =>
  `Item ${it.item_id} - ${it.title}:\n"${it.body}"`
).join("\n\n");

const prompt = `You are playing the role of ${profile.guide_id.replace("-", " ")}, a nurse-educator with 15 years of post-operative clinical experience. Review each item in the module below for clinical accuracy and safety. Produce override records for any unsafe, incorrect, or misleading items. Return ONLY a JSON object with keys: guide_id, intro_statement, review_minutes_estimated, overrides (array), items_reviewed, items_approved.\n\nMODULE ITEMS:\n${itemsText}`;

// Reproduce: call Claude API with above prompt, parse JSON response.
// Committed output: fixtures/guide-overrides.jsonl, fixtures/module-final.json
console.log("Prompt constructed. Submit to claude-sonnet-4-6 with above prompt.");
console.log("See fixtures/guide-overrides.jsonl for committed run output.");
EOF
