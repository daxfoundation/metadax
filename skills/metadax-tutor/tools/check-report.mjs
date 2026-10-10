#!/usr/bin/env node
// check-report.mjs — word count, banned words (diagnosis terms, vendor names,
// email patterns). Zero dependencies.
//
// Usage: node tools/check-report.mjs <report-file.md>
// Exits 0 if the report passes all checks; exits 1 on any error.
//
// Run this before sending a parent report. See templates/RUBRIC.md for the full
// checklist; this tool covers checks 5 (diagnosis), 7 (vendor), 8 (email) and 9 (length).

import { readFileSync } from "fs";

const [, , reportPath] = process.argv;
if (!reportPath) {
  console.error("Usage: check-report.mjs <report-file.md>");
  process.exit(2);
}

const text = readFileSync(reportPath, "utf8");

const DIAGNOSIS = [
  "dyslexia", "dyslexic",
  "dyscalculia",
  "dysgraphia",
  "adhd", "attention deficit", "attention-deficit",
  "autism", "autistic",
  "asperger", "aspergers",
  "spld",
  "learning disability", "learning disabilities",
  "asd",
  "sensory processing disorder",
  "processing disorder",
];

const VENDORS = [
  "claude",
  "chatgpt",
  "gpt-4", "gpt-3", "gpt4", "gpt3",
  "openai",
  "anthropic",
  "gemini",
  "copilot",
  "grok",
  "llm",
  "large language model",
];

const diagRe = new RegExp("\\b(" + DIAGNOSIS.map(escapeRe).join("|") + ")\\b", "gi");
const vendorRe = new RegExp("\\b(" + VENDORS.map(escapeRe).join("|") + ")\\b", "gi");
const emailRe = /[^\s@]+@[^\s@]+\.[^\s@]+/;

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const words = text.trim().split(/\s+/).filter(Boolean);
const wordCount = words.length;

const errors = [];

if (wordCount > 250) {
  errors.push("Word count is " + wordCount + " (limit: 250 — trim " + (wordCount - 250) + " word" + (wordCount - 250 === 1 ? "" : "s") + ")");
}

const diagMatches = text.match(diagRe);
if (diagMatches) {
  const found = [...new Set(diagMatches.map((m) => m.toLowerCase()))];
  errors.push("Diagnosis term" + (found.length > 1 ? "s" : "") + " found: " + found.join(", ") + " — describe the behaviour instead");
}

const vendorMatches = text.match(vendorRe);
if (vendorMatches) {
  const found = [...new Set(vendorMatches.map((m) => m.toLowerCase()))];
  errors.push("Vendor name" + (found.length > 1 ? "s" : "") + " found: " + found.join(", ") + " — remove before sending");
}

if (emailRe.test(text)) {
  errors.push("Email address found — remove before sending");
}

console.log("Words: " + wordCount + "/250");

if (errors.length) {
  console.error("Errors:");
  for (const e of errors) console.error("  [error] " + e);
  process.exit(1);
} else {
  console.log("OK — ready to send.");
}
